"""Voice-over + word timings for an episode.

Usage: python3 pipeline/tts.py <episode_id> [--engine kokoro|elevenlabs]
Reads  public/episodes/<id>/episode.json
Writes public/episodes/<id>/voice.wav and timings.json

`say` markup: "{Display|spoken}" shows Display in captions but speaks `spoken`.
Kokoro has no word alignment for this model, so each beat is synthesised separately
(exact beat boundaries) and word times inside a beat are spread by phoneme count,
snapped to detected pauses. ElevenLabs (/with-timestamps) gives exact alignment.
"""
import json, re, sys, os
import numpy as np, soundfile as sf

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
    import base64, hashlib, subprocess, urllib.request
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
    key = hashlib.sha1(json.dumps([v.get("voice_id"), body], sort_keys=True).encode()).hexdigest()[:12]
    cache = os.path.join(ep_dir, f".el_{key}.json")
    if not os.path.exists(cache):
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}/with-timestamps?output_format=mp3_44100_192",
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
        open(cache, "w").write(urllib.request.urlopen(req, timeout=180).read().decode())
    d = json.load(open(cache))
    mp3 = os.path.join(ep_dir, "voice.mp3"); open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", mp3, "-f", "f32le", "-ac", "1", "-ar", "48000", "-"], check=True, capture_output=True).stdout
    os.remove(mp3)
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
    json.dump({"duration": round(dur, 3), "engine": "elevenlabs", "beats": beats}, open(os.path.join(ep_dir, "timings.json"), "w"), indent=1, ensure_ascii=False)
    print(f"elevenlabs voice {dur:.2f}s ({len(full)} chars, cache {os.path.basename(cache)})")
    for b in beats: print(f"  {b['id']:10s} {b['start']:6.2f}-{b['end']:6.2f}")

def main():
    ep_id = sys.argv[1]
    ep_dir = os.path.join(ROOT, "public", "episodes", ep_id)
    ep = json.load(open(os.path.join(ep_dir, "episode.json")))
    force_kokoro = "--engine" in sys.argv and sys.argv[sys.argv.index("--engine") + 1] == "kokoro"
    if ep["voice"].get("engine") == "elevenlabs" and not force_kokoro:
        try:
            return elevenlabs(ep, ep_dir)
        except Exception as e:  # quota, network, auth -> local fallback so the pipeline never blocks
            print(f"ElevenLabs failed ({e}); falling back to Kokoro")
    if ep["voice"].get("engine") == "elevenlabs":
        ep["voice"] = ep["voice"].get("kokoro_fallback", {"voice": "am_michael", "speed": 1.1})
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(ROOT, "models/kokoro-v1.0.onnx"), os.path.join(ROOT, "models/voices-v1.0.bin"))
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
    json.dump({"duration": round(len(full) / SR, 3), "beats": beats}, open(os.path.join(ep_dir, "timings.json"), "w"), indent=1, ensure_ascii=False)
    print(f"voice {len(full)/SR:.2f}s, {len(beats)} beats")
    for b in beats: print(f"  {b['id']:10s} {b['start']:6.2f}-{b['end']:6.2f}  {b['phonemes'][:90]}")

if __name__ == "__main__":
    main()
