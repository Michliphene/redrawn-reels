"""Voice-over + word timings for an episode.

Usage: python3 pipeline/tts.py <episode_id> [--synthesize | --status]
       [--engine kokoro|elevenlabs] [--allow-fallback] [--force]
Without --synthesize, inspect the existing pair without changing it.
Reads  public/episodes/<id>/episode.json
Writes public/episodes/<id>/voice.wav and timings.json

`say` markup: "{Display|spoken}" shows Display in captions but speaks `spoken`.
Kokoro has no word alignment for this model, so each beat is synthesised separately
(exact beat boundaries) and word times inside a beat are spread by phoneme count,
snapped to detected pauses. ElevenLabs (/with-timestamps) gives exact alignment.
"""
import argparse
from copy import deepcopy
import hashlib
from importlib.metadata import version
import json
import math
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import wave

# Loaded only by a real synthesizer, never during inspection or cache lookup.
np = sf = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 24000
GAP_AFTER_BEAT = 0.14  # seconds of silence between beats

def parse(say):
    """-> list of (display_word, spoken_text) tokens, and the full spoken string."""
    tokens, spoken_parts = [], []
    for m in re.finditer(r"\{([^|}]+)\|([^}]+)\}([^\s{]*)|(\S+)", say):
        if m.group(4):
            tokens.append((m.group(4), m.group(4))); spoken_parts.append(m.group(4))
        else:
            disp, sp, tail = m.group(1), m.group(2), m.group(3) or ""
            dw, sw = disp.split(), sp.split()
            # spread display words across spoken words (e.g. "March 1990" / "March, nineteen ninety")
            if len(dw) == 1:
                tokens.append((dw[0] + tail, sp + tail))
            else:
                tokens.append((dw[0], sw[0]))
                tokens.append((" ".join(dw[1:]) + tail, " ".join(sw[1:]) + tail))
            spoken_parts.append(sp + tail)
    return tokens, " ".join(spoken_parts)

def kokoro_beat(k, ep, text):
    v = ep["voice"]
    ph = k.tokenizer.phonemize(text, "en-us")
    for word, ipa in ep.get("lexicon", {}).items():
        bad = k.tokenizer.phonemize(word, "en-us")
        ph = ph.replace(bad, ipa)
    audio, sr = k.create(ph, voice=v["voice"], speed=v.get("speed", 1.0), is_phonemes=True)
    assert sr == SR
    return audio.astype(np.float32), ph

def word_times(k, tokens, audio):
    """Phoneme-weighted word spans inside one beat, nudged to energy pauses."""
    w = []
    for _, sp in tokens:
        n = len(re.sub(r"[ˈˌː\s]", "", k.tokenizer.phonemize(sp, "en-us")))
        pause = 4 if re.search(r"[,:;]$", sp) else 7 if re.search(r"[.!?…]$", sp) else 0
        w.append((max(n, 2), pause))
    # speech region (trim edges)
    env = np.convolve(np.abs(audio), np.ones(240) / 240, mode="same")
    thr = env.max() * 0.04
    voiced = np.where(env > thr)[0]
    s0, s1 = (voiced[0], voiced[-1]) if len(voiced) else (0, len(audio))
    total = sum(a + b for a, b in w)
    t, out = s0 / SR, []
    span = (s1 - s0) / SR
    for (n, p) in w:
        d = span * n / total
        out.append([t, t + d]); t += d + span * p / total
    return out

def elevenlabs(ep, ep_dir):
    """One request for the whole script (continuous prosody) + exact character alignment.
    The API key is injected by the environment's network proxy; a placeholder header is sent."""
    import base64, subprocess, urllib.request
    load_audio_modules()
    v = ep["voice"]
    parsed = [parse(b["say"]) for b in ep["beats"]]
    # spoken-text respellings for ElevenLabs (no phoneme tags on multilingual v2)
    resp = v.get("respell", {})
    def sp(t):
        for a, b in resp.items(): t = t.replace(a, b)
        return t
    full = " ".join(sp(spoken) for _, spoken in parsed)
    body = {"text": full, "model_id": v.get("model", "eleven_multilingual_v2"),
            "voice_settings": v.get("settings", {"stability": 0.45, "similarity_boost": 0.8, "style": 0.2, "use_speaker_boost": True, "speed": 1.0})}
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}/with-timestamps?output_format=mp3_44100_192",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"},
    )
    with urllib.request.urlopen(req, timeout=180) as response:
        d = json.load(response)
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-f", "mp3", "-i", "pipe:0",
         "-f", "f32le", "-ac", "1", "-ar", "48000", "-"],
        input=base64.b64decode(d["audio_base64"]), check=True, capture_output=True,
    ).stdout
    audio, R = np.frombuffer(raw, np.float32), 48000
    al = d["alignment"]; chars, cs, ce = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    assert "".join(chars) == full, "alignment text mismatch"
    spans = [[cs[m.start()], ce[m.end() - 1]] for m in re.finditer(r"\S+", full)]
    # compress long pauses between words (keeps pacing tight without speeding the voice up)
    max_gap = v.get("maxPause", 0.3)
    src = [list(x) for x in spans]          # source-time spans (for cutting audio)
    pieces, cursor, removed = [], 0.0, 0.0
    for i in range(1, len(src)):
        gap = src[i][0] - src[i - 1][1]
        if gap > max_gap:
            cut0, cut1 = src[i - 1][1] + max_gap / 2, src[i][0] - max_gap / 2
            pieces.append(audio[int(cursor * R):int(cut0 * R)]); cursor = cut1
            removed += cut1 - cut0
        spans[i] = [src[i][0] - removed, src[i][1] - removed]
    pieces.append(audio[int(cursor * R):])
    lead = 0.25
    out = np.concatenate([np.zeros(int(lead * R), np.float32)] + [p.copy() for p in pieces])
    spans = [[a + lead, b + lead] for a, b in spans]
    tmp = os.path.join(ep_dir, "voice_raw.wav"); sf.write(tmp, out, R)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "48000", os.path.join(ep_dir, "voice.wav")], check=True)
    os.remove(tmp)
    beats, wi = [], 0
    for b, (tokens, _) in zip(ep["beats"], parsed):
        words = []
        for disp, spoken in tokens:
            n = len(sp(spoken).split())
            words.append({"w": disp, "start": round(spans[wi][0], 3), "end": round(spans[wi + n - 1][1], 3)}); wi += n
        beats.append({"id": b["id"], "start": words[0]["start"], "end": words[-1]["end"], "words": words})
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(ep_dir, "voice.wav")]))
    write_json(Path(ep_dir) / "timings.json", {"duration": round(dur, 3), "engine": "elevenlabs", "beats": beats})
    return {"engine": "elevenlabs", "model": body["model_id"], "voiceId": v["voice_id"],
            "settings": body["voice_settings"], "respell": resp, "maxPause": max_gap}


def say_hash(ep):
    """Fingerprint of everything that decides the voice: the script and the voice settings."""
    import hashlib
    return hashlib.sha1(json.dumps([ep.get("voice"), ep.get("lexicon"), [[b["id"], b["say"], b.get("gapAfter")] for b in ep["beats"]]], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]

def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def request_inputs(ep):
    return {
        "voice": ep.get("voice"), "lexicon": ep.get("lexicon"),
        "beats": [[b["id"], b["say"], b.get("gapAfter")] for b in ep["beats"]],
    }


PAIR = ("voice.wav", "timings.json")
PROVENANCE = "voice.provenance.json"


def pair_hashes(directory):
    # Git may materialize timings.json with either line ending.
    timing_bytes = (directory / "timings.json").read_bytes().replace(b"\r\n", b"\n")
    return {"voice.wav": digest(directory / "voice.wav"),
            "timings.json": hashlib.sha256(timing_bytes).hexdigest()}


def voice_status(ep, ep_dir):
    ep_dir = Path(ep_dir)
    if not all((ep_dir / name).is_file() for name in PAIR):
        return {"status": "missing"}
    provenance = ep_dir / PROVENANCE
    if not provenance.exists():
        # Historical say_hash values can describe a different engine or a migrated take.
        return {"status": "legacy-unverified"}
    try:
        record = read_json(provenance)
        if record["schemaVersion"] != 1 or record["sha256"] != pair_hashes(ep_dir):
            return {"status": "invalid"}
        if record["request"]["inputs"] != request_inputs(ep):
            status = "stale"
        elif record["effective"]["engine"] != record["request"]["engine"]:
            status = "fallback"
        else:
            status = "verified"
        return {**record, "status": status}
    except (ValueError, TypeError, KeyError):
        return {"status": "invalid"}


def load_audio_modules():
    global np, sf
    if np is None:
        import numpy as np
        import soundfile as sf


def validate_take(ep, directory):
    with wave.open(str(directory / "voice.wav"), "rb") as wav:
        duration = wav.getnframes() / wav.getframerate()
    timings = read_json(directory / "timings.json")
    declared = timings["duration"]
    if not math.isfinite(declared) or duration <= 0 or abs(duration - declared) > 0.01:
        raise ValueError("recorded WAV and timings disagree on duration")
    if [beat["id"] for beat in timings["beats"]] != [beat["id"] for beat in ep["beats"]]:
        raise ValueError("recorded timings do not match the requested beats")
    previous_end = 0
    for beat in timings["beats"]:
        start, end = beat["start"], beat["end"]
        if not (previous_end <= start <= end <= declared + 0.01) or not beat["words"]:
            raise ValueError(f"invalid timing span for beat {beat['id']}")
        word_start = start
        for word in beat["words"]:
            if not (word_start <= word["start"] <= word["end"] <= end + 0.01):
                raise ValueError(f"invalid word timing for beat {beat['id']}")
            word_start = word["start"]
        previous_end = end


def promote_take(stage, destination):
    # A rename is atomic per file. A lock protects writers, and the sidecar hashes
    # let readers detect an incomplete promotion. Roll back recoverable errors.
    files = (*PAIR, PROVENANCE)
    backup = stage / "previous"
    backup.mkdir()
    for name in files:
        old = destination / name
        if old.exists():
            shutil.copy2(old, backup / name)
    replaced = []
    try:
        for name in files:
            (stage / name).replace(destination / name)
            replaced.append(name)
    except OSError:
        for name in reversed(replaced):
            old = backup / name
            if old.exists():
                old.replace(destination / name)
            else:
                (destination / name).unlink()
        raise


def prepare_voice(ep, ep_dir, *, engine=None, allow_fallback=False, force=False):
    if ep.get("audio"):
        raise ValueError("this episode uses shared audio; record the source episode explicitly")
    ep_dir = Path(ep_dir)
    requested = engine or ep["voice"].get("engine", "kokoro")
    if requested not in {"elevenlabs", "kokoro"}:
        raise ValueError(f"unsupported synthesis engine: {requested}")
    request = {"engine": requested, "sayHash": say_hash(ep), "inputs": request_inputs(ep)}
    lock = ep_dir / ".voice.lock"
    lock.mkdir()
    try:
        existing = voice_status(ep, ep_dir)
        if not force and existing["status"] == "verified" and existing["request"] == request:
            print(f"voice up to date ({requested})")
            return existing

        with tempfile.TemporaryDirectory(prefix=".voice-take-", dir=ep_dir) as temporary:
            stage = Path(temporary)
            if requested == "elevenlabs":
                try:
                    effective = elevenlabs(ep, stage)
                    validate_take(ep, stage)
                except Exception:
                    if not allow_fallback:
                        raise
                    print("ElevenLabs failed; recording an explicitly allowed Kokoro fallback", file=sys.stderr)
                    effective = kokoro(ep, stage)
            else:
                effective = kokoro(ep, stage)
            validate_take(ep, stage)
            record = {
                "schemaVersion": 1, "request": request, "effective": effective,
                "sha256": pair_hashes(stage),
            }
            write_json(stage / PROVENANCE, record)
            promote_take(stage, ep_dir)
        return voice_status(ep, ep_dir)
    finally:
        lock.rmdir()


def kokoro(ep, ep_dir):
    load_audio_modules()
    from kokoro_onnx import Kokoro

    ep = deepcopy(ep)
    if ep["voice"].get("engine") == "elevenlabs":
        ep["voice"] = ep["voice"].get("kokoro_fallback", {"voice": "am_michael", "speed": 1.1})
    model = Path(ROOT) / "models/kokoro-v1.0.onnx"
    voices = Path(ROOT) / "models/voices-v1.0.bin"
    model_hashes = {p.name: digest(p) for p in (model, voices)}
    k = Kokoro(str(model), str(voices))
    chunks, beats, cursor = [], [], 0.25
    chunks.append(np.zeros(int(0.25 * SR), np.float32))
    for b in ep["beats"]:
        tokens, spoken = parse(b["say"])
        audio, ph = kokoro_beat(k, ep, spoken)
        wt = word_times(k, tokens, audio)
        dur = len(audio) / SR
        beats.append({
            "id": b["id"], "start": round(cursor, 3), "end": round(cursor + dur, 3), "phonemes": ph,
            "words": [{"w": d, "start": round(cursor + s, 3), "end": round(cursor + e, 3)} for (d, _), (s, e) in zip(tokens, wt)],
        })
        chunks.append(audio); cursor += dur
        gap = b.get("gapAfter", GAP_AFTER_BEAT)
        chunks.append(np.zeros(int(gap * SR), np.float32)); cursor += gap
    full = np.concatenate(chunks)
    full = full / max(1e-6, np.abs(full).max()) * 0.89
    sf.write(os.path.join(ep_dir, "voice.wav"), full, SR)
    write_json(Path(ep_dir) / "timings.json", {
        "duration": round(len(full) / SR, 3), "engine": "kokoro", "beats": beats,
    })
    return {"engine": "kokoro", "model": model.name, "packageVersion": version("kokoro-onnx"),
            "modelSha256": model_hashes,
            "settings": {"voice": ep["voice"]["voice"], "speed": ep["voice"].get("speed", 1.0)}}


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("episode_id")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--synthesize", action="store_true")
    mode.add_argument("--status", action="store_true", help="inspect the existing voice without writing (default)")
    parser.add_argument("--engine", choices=("elevenlabs", "kokoro"))
    parser.add_argument("--allow-fallback", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_-]*", args.episode_id):
        parser.error("invalid episode ID")
    if not args.synthesize and (args.engine or args.allow_fallback or args.force):
        parser.error("--engine, --allow-fallback and --force require --synthesize")
    folder = Path(ROOT) / "public" / "episodes" / args.episode_id
    try:
        ep = read_json(folder / "episode.json")
        if args.synthesize:
            status = prepare_voice(ep, folder, engine=args.engine, allow_fallback=args.allow_fallback, force=args.force)
        else:
            if ep.get("audio"):
                if not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9_-]*", ep["audio"]):
                    raise ValueError("invalid audio episode ID")
                folder = folder.parent / ep["audio"]
                ep = read_json(folder / "episode.json")
            status = voice_status(ep, folder)
    except (OSError, ValueError, KeyError, ImportError, RuntimeError) as error:
        parser.exit(1, f"voice: {error}\n")
    print(f"voice: {status['status']} ({folder.name})")
    return 1 if status["status"] in {"missing", "stale", "invalid"} else 0


if __name__ == "__main__":
    sys.exit(main())
