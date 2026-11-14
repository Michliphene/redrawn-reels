"""Objective, measurable signals for the virality agent.

Usage: python3 pipeline/virality_metrics.py <episode_id>
Prints JSON + writes out/review/<id>/virality_metrics.json and hook frames out/review/<id>/hook_*.jpg
(0.0, 0.5, 1.0, 1.5, 2.0, 3.0 s) + first/last frame pair for the loop check.
"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ep_id = sys.argv[1]
V = os.path.join(ROOT, "out", f"{ep_id}.mp4")
ep = json.load(open(os.path.join(ROOT, "public/episodes", ep_id, "episode.json")))
tm = json.load(open(os.path.join(ROOT, "public/episodes", ep_id, "timings.json")))
out = os.path.join(ROOT, "out/review", ep_id); os.makedirs(out, exist_ok=True)
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
sh = lambda *a: subprocess.run(a, capture_output=True, text=True)

dur = float(sh("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", V).stdout)
words = [w for b in tm["beats"] for w in b["words"]]
speech = sum(b["end"] - b["start"] for b in tm["beats"])
first_word = words[0]["start"] if words else None
hook = tm["beats"][0]

# cue times (visual "news")
cues = []
for b, bt in zip(ep["beats"], tm["beats"]):
    if b.get("camera"): cues.append(bt["start"])
    for a in b.get("actions", []):
        t = bt["start"]
        if a.get("atWord"):
            w = next((w for w in bt["words"] if norm(w["w"]).startswith(norm(a["atWord"]))), None)
            if w: t = w["start"]
        cues.append(t)
cues = sorted(set(round(c, 2) for c in cues)) + [dur]
gaps = [(round(cues[i], 2), round(cues[i + 1] - cues[i], 2)) for i in range(len(cues) - 1)]
longest = sorted(gaps, key=lambda g: -g[1])[:3]
per2s = [sum(1 for c in cues if k <= c < k + 2) for k in range(0, int(dur), 2)]

# scene cuts (pixel-level), loudness, loop similarity
sc = sh("ffmpeg", "-i", V, "-vf", "select='gt(scene,0.25)',showinfo", "-f", "null", "-").stderr
cuts = len(re.findall(r"pts_time:", sc))
lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", sh("ffmpeg", "-i", V, "-af", "ebur128", "-f", "null", "-").stderr)
for k, t in enumerate([0.0, 0.5, 1.0, 1.5, 2.0, 3.0]):
    sh("ffmpeg", "-y", "-loglevel", "error", "-ss", str(t), "-i", V, "-frames:v", "1", "-vf", "scale=360:-1", os.path.join(out, f"hook_{k}_{t:.1f}s.jpg"))
sh("ffmpeg", "-y", "-loglevel", "error", "-i", V, "-frames:v", "1", os.path.join(out, "_first.png"))
sh("ffmpeg", "-y", "-loglevel", "error", "-sseof", "-0.2", "-i", V, "-frames:v", "1", os.path.join(out, "_last.png"))
ssim = re.findall(r"All:([\d.]+)", sh("ffmpeg", "-i", os.path.join(out, "_first.png"), "-i", os.path.join(out, "_last.png"), "-lavfi", "ssim", "-f", "null", "-").stderr)
sh("ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(out, "_first.png"), "-i", os.path.join(out, "_last.png"), "-filter_complex", "hstack,scale=720:-1", os.path.join(out, "loop_first_vs_last.jpg"))

m = {
  "duration_s": round(dur, 2),
  "words": len(words), "words_per_sec": round(len(words) / speech, 2) if speech else None,
  "first_word_at_s": first_word, "hook_text": " ".join(w["w"] for w in hook["words"]), "hook_len_s": round(hook["end"] - hook["start"], 2),
  "beats": len(tm["beats"]), "avg_beat_s": round(speech / len(tm["beats"]), 2),
  "visual_cues": len(cues) - 1, "cues_per_10s": round((len(cues) - 1) / dur * 10, 1),
  "longest_gaps_without_new_cue": [{"at_s": a, "gap_s": g} for a, g in longest],
  "two_second_windows_without_cue": sum(1 for n in per2s if n == 0), "two_second_windows_total": len(per2s),
  "scene_cuts_pixel_level": cuts,
  "integrated_lufs": float(lufs[-1]) if lufs else None,
  "loop_ssim_first_vs_last": float(ssim[0]) if ssim else None,
  "has_question_or_number_in_hook": bool(re.search(r"\d|\?|\$", " ".join(w["w"] for w in hook["words"]))),
  "title": ep.get("title"),
}
for f in ("_first.png", "_last.png"): os.remove(os.path.join(out, f))
json.dump(m, open(os.path.join(out, "virality_metrics.json"), "w"), indent=1, ensure_ascii=False)
print(json.dumps(m, indent=1, ensure_ascii=False))
