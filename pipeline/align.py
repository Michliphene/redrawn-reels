"""Listen to a voice take with WhisperX: check what was said, or re-time the words.

Usage: python3 pipeline/align.py <episode_id> [--check] [--retime] [--dry-run] [--force] [--model small.en]

  --check   (default) transcribe voice.wav and compare it to the script, word by word.
            Writes public/episodes/<id>/asr.json, which the pre-flight reads (`!` lines):
            a name the voice mangled, a skipped or doubled word. The report carries the
            take's say_hash, so it is redone only when the voice is re-recorded.
  --retime  forced alignment of the known script on the audio (wav2vec2): exact word times
            for a Kokoro take, which has none (tts.py runs this after a Kokoro fallback).
            ElevenLabs takes already have exact times and are left alone unless --force.
  --dry-run with --retime: print how far the new times are from the current ones, write nothing.

Runs on CPU. Needs `pip install whisperx` (scripts/setup.sh --asr). Models are downloaded
on first use (Hugging Face + download.pytorch.org) and cached.
"""
import difflib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import parse  # noqa: E402  (same `say` markup as the voice)

ASR_MODEL = "small.en"


# ---------- pure helpers (tested without whisperx) ----------

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
ORD = {"one": "first", "two": "second", "three": "third", "five": "fifth", "eight": "eighth", "nine": "ninth", "twelve": "twelfth"}
MONTHS = set("january february march april may june july august september october november december".split())
ABBR = {"st": "saint", "mr": "mister", "mrs": "missus", "dr": "doctor", "vs": "versus", "ok": "okay"}
LIGHT = {"a", "an", "the", "and", "of", "to", "in", "on", "is", "it", "that"}  # a swap among these is not worth a look


def cardinal(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    for size, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand"), (100, "hundred")):
        if n >= size:
            rest = n % size
            return cardinal(n // size) + " " + name + ("" if not rest else " " + cardinal(rest))


def ordinal(n):
    words = cardinal(n).split()
    last = words[-1]
    words[-1] = ORD.get(last) or (last[:-1] + "ieth" if last.endswith("y") else last + "th")
    return " ".join(words)


def say_number(tok, prev=""):
    """How a TTS voice reads a bare number left in the script: 49th, March 30, 1867, 4,000."""
    m = re.fullmatch(r"(\d[\d,]*)(st|nd|rd|th)?", tok)
    if not m:
        return tok
    n = int(m.group(1).replace(",", ""))
    if m.group(2) or (prev in MONTHS and n <= 31):
        return ordinal(n)
    if 1100 <= n <= 1999 and "," not in m.group(1):
        hi, lo = divmod(n, 100)
        return cardinal(hi) + " " + ("hundred" if lo == 0 else ("oh " + ONES[lo]) if lo < 10 else cardinal(lo))
    return cardinal(n)


def norm(w, prev=""):
    """Comparable form of a text: lower case, letters/digits/apostrophes only, hyphens split, numbers spelled out."""
    w = w.lower().replace("’", "'").replace("-", " ").replace("—", " ")
    out = []
    for x in w.split():
        t = re.sub(r"[^a-z0-9',]", "", x).strip("',")
        if not t:
            continue
        t = ABBR.get(t, t)
        out += say_number(t, out[-1] if out else prev).split() if re.match(r"\d", t) else [t.replace(",", "")]
    return out


def expected_words(ep, timings=None):
    """Words the voice should say, in order: (norm word, beat id, caption token, start s)."""
    resp = ep.get("voice", {}).get("respell", {})
    out = []
    for bi, b in enumerate(ep["beats"]):
        tokens, _ = parse(b["say"])
        tw = (timings or {}).get("beats", [{}] * (bi + 1))[bi].get("words", []) if timings else []
        for ti, (disp, spoken) in enumerate(tokens):
            for a, r in resp.items():
                spoken = spoken.replace(a, r)
            start = tw[ti]["start"] if ti < len(tw) else None
            for n in norm(spoken, out[-1][0] if out else ""):
                out.append((n, b["id"], disp, start))
    return out


def compare(expected, heard, min_ratio=0.75):
    """Word diff of the script against the transcription. Returns (word error rate, issues).
    A mismatch is ignored when the letters match once spaces are removed ("every one"/"everyone")
    or are close enough (ASR spelling of a correctly said name)."""
    exp = [e[0] for e in expected]
    hw = [h[0] for h in heard]
    sm = difflib.SequenceMatcher(a=exp, b=hw, autojunk=False)
    issues, errors = [], 0
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == "equal":
            continue
        said, got = " ".join(exp[a0:a1]), " ".join(hw[b0:b1])
        ratio = difflib.SequenceMatcher(a=said.replace(" ", ""), b=got.replace(" ", "")).ratio()
        if said.replace(" ", "") == got.replace(" ", "") or (said and got and ratio >= min_ratio):
            continue
        if set(exp[a0:a1]) | set(hw[b0:b1]) <= LIGHT:
            continue
        errors += max(a1 - a0, b1 - b0)
        ref = expected[a0] if a0 < len(expected) else expected[-1]
        at = heard[b0][1] if b0 < len(heard) else ref[3]
        kind = "missing" if op == "delete" else "extra" if op == "insert" else "heard"
        script_words = []
        for e in expected[a0:a1]:
            if not script_words or script_words[-1] != e[2]:
                script_words.append(e[2])
        issues.append({"beat": ref[1], "kind": kind, "script": " ".join(script_words) or None,
                       "heard": got or None, "at": round(at, 2) if at is not None else None})
    return round(errors / max(1, len(exp)), 3), issues


def fill_gaps(words, lo, hi):
    """Aligned words without a time (digits, symbols) get one interpolated from their neighbours."""
    n = len(words)
    for i, w in enumerate(words):
        if w.get("start") is not None:
            continue
        prev = next((words[j]["end"] for j in range(i - 1, -1, -1) if words[j].get("end") is not None), lo)
        k = next((j for j in range(i + 1, n) if words[j].get("start") is not None), None)
        nxt = words[k]["start"] if k is not None else hi
        run = (k if k is not None else n) - i
        step = (nxt - prev) / (run + 1)
        w["start"], w["end"] = prev + step * 0.5, prev + step
    return words


# ---------- whisperx ----------

def take_key(timings):
    """Which voice take a report belongs to (older takes have no fingerprint: their length stands in)."""
    return timings.get("say_hash") or f"dur:{timings['duration']}"


def _wx():
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")  # plain CDN downloads go through the cloud proxy
    try:
        import whisperx
    except ImportError:
        sys.exit("!! whisperx is not installed: scripts/setup.sh --asr (or pip install whisperx)")
    return whisperx


def paths(ep_id):
    ep_dir = os.path.join(ROOT, "public", "episodes", ep_id)
    ep = json.load(open(os.path.join(ep_dir, "episode.json")))
    a_dir = os.path.join(ROOT, "public", "episodes", ep.get("audio") or ep_id)
    if ep.get("audio"):  # a remaster: the script of the original is what was recorded
        ep = json.load(open(os.path.join(a_dir, "episode.json")))
    return ep, a_dir


def check(ep_id, model_name, force):
    ep, a_dir = paths(ep_id)
    tp, vp, rp = (os.path.join(a_dir, f) for f in ("timings.json", "voice.wav", "asr.json"))
    if not (os.path.exists(tp) and os.path.exists(vp)):
        sys.exit(f"!! no voice yet for {os.path.basename(a_dir)}: run pipeline/tts.py first")
    timings = json.load(open(tp))
    h = take_key(timings)
    if not force and os.path.exists(rp):
        old = json.load(open(rp))
        if old.get("say_hash") == h and old.get("model") == model_name:
            print(f"asr check up to date ({len(old['issues'])} issue(s), WER {old['wer']:.1%})")
            return old
    wx = _wx()
    audio = wx.load_audio(vp)
    m = wx.load_model(model_name, "cpu", compute_type="int8", language="en",
                      asr_options={"suppress_numerals": True})  # numbers spelled out, like the script
    segs = m.transcribe(audio, batch_size=8, language="en")["segments"]
    a_model, meta = wx.load_align_model(language_code="en", device="cpu")
    al = wx.align(segs, a_model, meta, audio, "cpu", return_char_alignments=False)
    heard = []
    for s in al["segments"]:
        for w in s.get("words", []):
            for n in norm(w["word"]):
                heard.append((n, w.get("start", s["start"])))
    wer, issues = compare(expected_words(ep, timings), heard)
    rep = {"say_hash": h, "model": model_name, "wer": wer, "heard": " ".join(x[0] for x in heard), "issues": issues}
    json.dump(rep, open(rp, "w"), indent=1, ensure_ascii=False)
    print(f"asr check: WER {wer:.1%}, {len(issues)} issue(s) -> {os.path.relpath(rp, ROOT)}")
    for i in issues:
        print(f"  ! {i['beat']:10s} {i['at'] if i['at'] is not None else '?':>6}s  {i['kind']:7s} script: {i['script'] or '—'}  heard: {i['heard'] or '—'}")
    return rep


def retime(ep_id, force, dry):
    ep, a_dir = paths(ep_id)
    tp, vp = os.path.join(a_dir, "timings.json"), os.path.join(a_dir, "voice.wav")
    timings = json.load(open(tp))
    if timings.get("engine") == "elevenlabs" and not (force or dry):
        print("elevenlabs take: word times are already exact (use --force to re-time anyway)")
        return
    resp = ep.get("voice", {}).get("respell", {}) if timings.get("engine") == "elevenlabs" else {}
    wx = _wx()
    audio = wx.load_audio(vp)
    a_model, meta = wx.load_align_model(language_code="en", device="cpu")
    beats, tok_spoken = [], []
    for b, tb in zip(ep["beats"], timings["beats"]):
        tokens, _ = parse(b["say"])
        sp = []
        for _, s in tokens:
            for a, r in resp.items():
                s = s.replace(a, r)
            sp.append(s.split())
        tok_spoken.append(sp)
        # a little slack around the beat: Kokoro beats are exact, ElevenLabs ones are word edges
        beats.append({"text": " ".join(w for t in sp for w in t), "start": max(0, tb["start"] - 0.1), "end": tb["end"] + 0.1})
    al = wx.align(beats, a_model, meta, audio, "cpu", return_char_alignments=False)
    flat = [w for seg in al["segments"] for w in seg.get("words", [])]  # whisperx re-splits beats into sentences
    want = sum(len(t) for sp in tok_spoken for t in sp)
    if len(flat) != want:
        sys.exit(f"!! {len(flat)} aligned words for {want} spoken: timings left as they were")
    errs, wi = [], 0
    for tb, sp, src in zip(timings["beats"], tok_spoken, beats):
        n = sum(len(t) for t in sp)
        words = fill_gaps(flat[wi:wi + n], src["start"], src["end"]); wi += n
        k = 0
        for tw, t in zip(tb["words"], sp):
            s, e = words[k]["start"], words[k + len(t) - 1]["end"]; k += len(t)
            errs.append(abs(s - tw["start"]))
            if not dry:
                tw["start"], tw["end"] = round(s, 3), round(e, 3)
        if not dry:
            tb["start"], tb["end"] = tb["words"][0]["start"], tb["words"][-1]["end"]
    errs.sort()
    if errs:
        print(f"word starts moved: median {errs[len(errs) // 2] * 1000:.0f} ms, p90 {errs[int(len(errs) * 0.9)] * 1000:.0f} ms, max {errs[-1] * 1000:.0f} ms")
    if not dry:
        timings["aligned"] = "whisperx"
        json.dump(timings, open(tp, "w"), indent=1, ensure_ascii=False)
        print(f"re-timed -> {os.path.relpath(tp, ROOT)}")


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        sys.exit(__doc__)
    ep_id = args[0]
    model = args[args.index("--model") + 1] if "--model" in args else ASR_MODEL
    if "--retime" in args:
        retime(ep_id, "--force" in args, "--dry-run" in args)
    if "--check" in args or "--retime" not in args:
        check(ep_id, model, "--force" in args)


if __name__ == "__main__":
    main()
