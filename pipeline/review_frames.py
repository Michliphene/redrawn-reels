"""Contact sheets for reviewing a rendered reel, beat by beat.

Usage: python3 pipeline/review_frames.py <episode_id> [--video out/<id>.mp4]
Writes out/review/<id>/beat_XX_<beatid>.jpg (3 frames per beat: start / middle / end, with the spoken text)
and out/review/<id>/cues.md (every cue resolved to its time, for checking sync).
"""
import json, os, subprocess, sys, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ep_id = sys.argv[1]
video = sys.argv[sys.argv.index("--video") + 1] if "--video" in sys.argv else os.path.join(ROOT, "out", f"{ep_id}.mp4")
ep = json.load(open(os.path.join(ROOT, "public/episodes", ep_id, "episode.json")))
tm = json.load(open(os.path.join(ROOT, "public/episodes", ep_id, "timings.json")))
out = os.path.join(ROOT, "out/review", ep_id); os.makedirs(out, exist_ok=True)
for f in os.listdir(out):  # never leave sheets from a previous render behind
    if f.startswith(("beat_", "hook_", "loop_")) or f in ("cues.md", "virality_metrics.json"): os.remove(os.path.join(out, f))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
lines = [f"# Cue timeline — {ep_id} (video {tm['duration']:.2f}s)\n"]
for i, (b, bt) in enumerate(zip(ep["beats"], tm["beats"])):
    s, e = bt["start"], bt["end"]
    times = [s + 0.15, (s + e) / 2, max(s + 0.2, e - 0.1)]
    files = []
    for k, t in enumerate(times):
        f = os.path.join(out, f"_f{k}.jpg")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1", "-vf", "scale=360:-1", f], check=True)
        files.append(f)
    text = " ".join(w["w"] for w in bt["words"]).replace("'", "’").replace(":", "\\:")
    sheet = os.path.join(out, f"beat_{i:02d}_{b['id']}.jpg")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *sum([["-i", f] for f in files], []), "-filter_complex",
        f"hstack=inputs=3,pad=iw:ih+90:0:0:black,drawtext=text='{i:02d} {b['id']} {s:.1f}-{e:.1f}s  {text[:120]}':fontcolor=white:fontsize=18:x=10:y=h-80",
        sheet], check=True)
    lines.append(f"## {i:02d} `{b['id']}` {s:.2f}–{e:.2f}s\n> {' '.join(w['w'] for w in bt['words'])}\n")
    for a in b.get("actions", []):
        t = s
        if a.get("atWord"):
            pool = [w for w in bt["words"] if w["w"].lower() == a["atWord"].lower()] or [w for w in bt["words"] if norm(w["w"]).startswith(norm(a["atWord"]))]
            w = pool[a.get("occurrence", 1) - 1] if len(pool) >= a.get("occurrence", 1) else None
            t = w["start"] if w else float("nan")
        desc = {k: v for k, v in a.items() if k not in ("type", "atWord", "coords")}
        lines.append(f"- {t:6.2f}s **{a['type']}** @'{a.get('atWord', '')}' {json.dumps(desc, ensure_ascii=False)[:160]}")
    lines.append("")
for f in os.listdir(out):
    if f.startswith("_f"): os.remove(os.path.join(out, f))
open(os.path.join(out, "cues.md"), "w").write("\n".join(lines))
print(f"wrote {len(ep['beats'])} sheets + cues.md in {out}")
