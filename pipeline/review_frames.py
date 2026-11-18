"""Generate beat contact sheets and a runtime cue transcript for a rendered reel."""

import json
import re

from review_evidence import (
    duration, ffmpeg, frame_interval, probe, require_image, review_cli, sample_frame, timeline,
)


def generate(inputs, temp):
    container, video, _ = probe(inputs.video)
    length = duration(video.get("duration", container.get("duration")))
    last_seek = max(0, length - frame_interval(video))
    timing, _, beats, resolved = timeline(inputs)
    lines = [
        f"# Cue timeline — {inputs.episode}",
        f"\n- Video SHA-256: {inputs.digest}",
        f"- Engine: {inputs.engine}",
        f"- Render SHA-256: {inputs.render_digest or 'unversioned'}",
        f"- Render inputs SHA-256: {inputs.inputs_digest or 'unversioned'}",
        f"- Measured video stream duration: {length:.3f}s",
        "- Sheet times are seek targets. Images show decoded frames at or after those targets.",
    ]
    samples = []
    if beats:
        lines.append(f"\nAuthored Remotion cue and caption schedule for DA {inputs.effective_da}. "
                     "Verify appearance and sync in the MP4.\n")
        for i, (beat, timing_beat) in enumerate(beats):
            beat_id = beat["id"]
            start, end = timing_beat["start"], timing_beat["end"]
            safe_id = re.sub(r"[^A-Za-z0-9_-]", "_", beat_id)
            name = f"beat_{i:02d}_{safe_id}.jpg"
            targets = [start, (start + end) / 2, max(start, end - 0.1)]
            samples.append((name, targets))
            lines.extend([
                f"## {i:02d} {beat_id} ({start:.2f}–{end:.2f}s)",
                f"> {' '.join(word['w'] for word in timing_beat['words'])}\n",
                f"Sheet: {name} (seek targets: {format_targets(targets, last_seek)})\n",
            ])
            for action in resolved["actions"]:
                if action["beat"] == beat_id:
                    details = {k: v for k, v in action.items() if k not in ("t", "type", "beat")}
                    lines.append(f"- {action['t']:.2f}s **{action['type']}** "
                                 f"{json.dumps(details, ensure_ascii=False)}")
            lines.append("")
    else:
        targets = [0, last_seek / 2, last_seek]
        name = "overview.jpg"
        samples.append((name, targets))
        lines.append(f"\n**Timeline incomplete.** {timing['reason']}. "
                     f"{name} provides image samples at {format_targets(targets, last_seek)}.\n")

    files = []
    for name, targets in samples:
        frames = [temp / f"{name}.frame_{i}.jpg" for i in range(3)]
        for t, path in zip(targets, frames):
            sample_frame(inputs.video, video, min(max(0, t), last_seek), path)
        sheet = temp / name
        ffmpeg("-i", frames[0], "-i", frames[1], "-i", frames[2],
               "-filter_complex", "hstack=inputs=3", "-frames:v", "1", "-update", "1", sheet)
        require_image(sheet)
        files.append(sheet)

    cues = temp / "cues.md"
    cues.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    files.append(cues)
    return {"status": timing["status"], "timeline": timing}, files


def format_targets(targets, last_seek):
    return ", ".join(f"{min(max(0, t), last_seek):.2f}s" for t in targets)


if __name__ == "__main__":
    raise SystemExit(review_cli(__doc__, "technical", "frames_status.json", generate))
