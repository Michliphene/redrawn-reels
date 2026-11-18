#!/usr/bin/env python3
"""Contrôle qualité automatique d'un reel AVANT publication.

Mesure sur le MP4 final (pas sur le code) :
  - format 1080x1920, durée, fps
  - tempo réel détecté vs BPM de la partition
  - synchro : chaque gros changement d'image a-t-il un son au même moment ?
  - événements de la partition : un son est-il bien présent à chaque beat attendu ?
  - "temps morts" : plus de N secondes sans son marquant NI mouvement (tue la rétention)
  - loudness intégrée (cible réseaux sociaux ~ -14 LUFS)

Usage : python3 tools/check_sync.py out/demo.mp4 [scores/demo.json] [--json report.json]
Code de sortie 0 = OK, 1 = à corriger. Dépendances : numpy + ffmpeg.
"""
import json
import re
import subprocess
import sys

import numpy as np

SR = 22050
HOP = 256  # ~11.6 ms


def ff(args, **kw):
    return subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", *args], capture_output=True, check=True, **kw)


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height,r_frame_rate:format=duration", "-of", "json", path],
                         capture_output=True, check=True).stdout
    j = json.loads(out)
    st = j["streams"][0]
    num, den = map(int, st["r_frame_rate"].split("/"))
    return st["width"], st["height"], num / den, float(j["format"]["duration"])


def audio_onsets(path):
    raw = ff(["-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]).stdout
    y = np.frombuffer(raw, dtype=np.float32)
    n_fft = 1024
    frames = 1 + (len(y) - n_fft) // HOP
    idx = np.arange(n_fft)[None, :] + HOP * np.arange(frames)[:, None]
    spec = np.abs(np.fft.rfft(y[idx] * np.hanning(n_fft), axis=1))
    logspec = np.log1p(100 * spec)
    flux = np.maximum(0, np.diff(logspec, axis=0)).sum(axis=1)
    flux = np.concatenate([[0], flux])
    t = np.arange(frames) * HOP / SR
    rms = np.sqrt((y[idx] ** 2).mean(axis=1))
    return t, flux, rms


def video_motion(path, fps):
    w, h = 90, 160
    raw = ff(["-i", path, "-vf", f"scale={w}:{h}:flags=area,format=gray", "-f", "rawvideo", "-"]).stdout
    v = np.frombuffer(raw, dtype=np.uint8).reshape(-1, h, w).astype(np.float32)
    diff = np.concatenate([[0], np.abs(np.diff(v, axis=0)).mean(axis=(1, 2))])
    t = np.arange(len(diff)) / fps
    return t, diff


def peaks(t, x, k=1.5, min_gap=0.1):
    """Pics locaux au-dessus d'un seuil adaptatif (médiane locale + k * MAD)."""
    win = max(3, int(round(1.0 / (t[1] - t[0]))))
    pad = np.pad(x, win, mode="edge")
    med = np.array([np.median(pad[i:i + 2 * win]) for i in range(len(x))])
    mad = np.median(np.abs(x - med)) + 1e-9
    thr = med + k * 1.4826 * mad
    out = []
    for i in range(1, len(x) - 1):
        if x[i] > thr[i] and x[i] >= x[i - 1] and x[i] >= x[i + 1]:
            if not out or t[i] - t[out[-1]] > min_gap:
                out.append(i)
            elif x[i] > x[out[-1]]:
                out[-1] = i
    return np.array(out, dtype=int)


def tempo(t, flux, lo=70, hi=180):
    env = flux - flux.mean()
    dt = t[1] - t[0]
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    best, best_bpm = -1, None
    for bpm in np.arange(lo, hi + 0.5, 0.5):
        lag = 60 / bpm / dt
        # somme sur les multiples du temps (réduit les erreurs d'octave)
        s = sum(ac[int(round(lag * m))] for m in (1, 2, 4) if int(round(lag * m)) < len(ac))
        if s > best:
            best, best_bpm = s, bpm
    return best_bpm


def loudness(path):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", err)
    return float(m[-1]) if m else None


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    json_out = sys.argv[sys.argv.index("--json") + 1] if "--json" in sys.argv else None
    if json_out in args:
        args.remove(json_out)
    path = args[0]
    score = json.load(open(args[1])) if len(args) > 1 else None

    w, h, fps, dur = probe(path)
    frame = 1 / fps
    ta, flux, rms = audio_onsets(path)
    tv, motion = video_motion(path, fps)
    a_pk = ta[peaks(ta, flux, 2.0, 0.08)]
    v_pk = tv[peaks(tv, motion, 2.5, 0.1)]
    # le compresseur peut retarder l'audio d'un échantillon : tolérance = 1,5 frame
    tol = 1.5 * frame

    def nearest(arr, x):
        return arr[np.argmin(np.abs(arr - x))] - x if len(arr) else np.inf

    off = np.array([nearest(a_pk, x) for x in v_pk])
    synced = np.abs(off) <= tol
    rep = {
        "file": path, "size": f"{w}x{h}", "fps": round(fps, 3), "duration_s": round(dur, 2),
        "tempo_detected_bpm": tempo(ta, flux),
        "audio_onsets": int(len(a_pk)), "visual_hits": int(len(v_pk)),
        "visual_hits_with_sound_pct": round(100 * synced.mean(), 1) if len(v_pk) else None,
        "median_offset_ms": round(1000 * float(np.median(off[synced])), 1) if synced.any() else None,
        "unsynced_visual_hits_s": [round(float(x), 2) for x in v_pk[~synced]][:20],
        "loudness_lufs": loudness(path),
    }

    # Temps morts : fenêtres sans onset audio ni mouvement notable
    movement = np.interp(ta, tv, motion) > np.percentile(motion, 60)
    active = np.zeros_like(ta, dtype=bool)
    for x in a_pk:
        active |= np.abs(ta - x) < 0.25
    active |= movement
    longest, run, start, dead = 0, 0, 0, []
    for i, a in enumerate(active):
        if not a:
            if run == 0:
                start = ta[i]
            run += 1
        else:
            if run * (ta[1] - ta[0]) > 2.0:
                dead.append([round(float(start), 2), round(float(ta[i]), 2)])
            run = 0
    rep["dead_air_over_2s"] = dead

    problems = []
    if (w, h) != (1080, 1920):
        problems.append(f"format {w}x{h} (attendu 1080x1920)")
    if score:
        bpm = score["meta"]["bpm"]
        spb = 60 / bpm
        det = rep["tempo_detected_bpm"]
        if det and min(abs(det - bpm), abs(det - 2 * bpm), abs(2 * det - bpm)) > 2:
            problems.append(f"tempo détecté {det} BPM ≠ partition {bpm} BPM")
        sfx_types = {"hit", "split", "boom", "riser", "neutron", "panel"}
        evs = [e for e in score["events"] if e["type"] in sfx_types]
        missing = []
        for e in evs:
            t_exp = e["beat"] * spb + (0.95 * spb if e["type"] == "panel" else 0)
            if t_exp > dur:
                continue
            if e["type"] in ("riser", "neutron"):
                continue  # sons progressifs : pas d'attaque nette attendue
            if not len(a_pk) or np.min(np.abs(a_pk - t_exp)) > tol:
                missing.append(round(t_exp, 2))
        rep["score_events_checked"] = len([e for e in evs if e["type"] not in ("riser", "neutron")])
        rep["score_events_without_sound_s"] = missing
        if missing:
            problems.append(f"{len(missing)} événement(s) de la partition sans son net")
        # silence avant le drop
        for e in score["events"]:
            if e["type"] == "boom":
                b = e["beat"] * spb
                win = 1024 / SR  # la fenêtre d'analyse ne doit pas mordre sur le boom
                pre = rms[(ta > b - 0.25) & (ta + win < b - 0.005)]
                post = rms[(ta > b - 0.01) & (ta < b + 0.3)]
                if len(pre) and len(post):
                    c = 20 * np.log10((post.max() + 1e-9) / (pre.max() + 1e-9))
                    rep["drop_contrast_db"] = round(float(min(c, 60)), 1)
                    if rep["drop_contrast_db"] < 12:
                        problems.append("drop peu marqué : laisse un vrai silence juste avant le boom")
    if rep["visual_hits_with_sound_pct"] is not None and rep["visual_hits_with_sound_pct"] < 70:
        problems.append(f"seulement {rep['visual_hits_with_sound_pct']} % des impacts visuels ont un son")
    if dead:
        problems.append(f"{len(dead)} temps mort(s) > 2 s")
    if rep["loudness_lufs"] is not None and not (-16 <= rep["loudness_lufs"] <= -12):
        problems.append(f"loudness {rep['loudness_lufs']} LUFS (vise -14)")
    rep["problems"] = problems
    rep["verdict"] = "OK" if not problems else "A CORRIGER"

    print(json.dumps(rep, indent=2, ensure_ascii=False))
    if json_out:
        json.dump(rep, open(json_out, "w"), indent=2, ensure_ascii=False)
    sys.exit(0 if not problems else 1)


if __name__ == "__main__":
    main()
