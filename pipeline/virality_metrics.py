"""Measure decoded-media signals and report runtime-based pacing estimates."""

import json
import math
import re

from review_evidence import (
    duration, ffmpeg, probe, require_image, review_cli, run, sample_frame, timeline, write_json,
)


def cue_estimates(resolved, beats, length):
    actions = [a["t"] for a in resolved["actions"]]
    cameras = [c["t"] for c in resolved.get("cameras", [])]
    dates = [d["t"] for d in resolved.get("dates", [])]
    # Scene and kicker changes depend on the renderer. Beat starts are pacing proxies.
    transitions = [t["start"] for beat, t in beats if beat.get("scene") or beat.get("kicker")]
    cues = sorted({t for t in actions + cameras + dates + transitions if 0 <= t < length})
    boundaries = sorted({0, *cues, length})
    gaps = [(a, b - a) for a, b in zip(boundaries, boundaries[1:])]
    windows = range(0, math.ceil(length), 2)
    return {
        "visual_cues": len(cues),
        "cues_per_10s": round(len(cues) / length * 10, 1),
        "longest_gaps_without_new_cue": [
            {"at_s": round(start, 2), "gap_s": round(gap, 2)}
            for start, gap in sorted(gaps, key=lambda pair: -pair[1])[:3]
        ],
        "two_second_windows_without_cue": sum(not any(k <= c < k + 2 for c in cues) for k in windows),
        "two_second_windows_total": len(windows),
    }


def media_endpoints(video, stream, temp):
    counted = json.loads(run("ffprobe", "-v", "error", "-select_streams", str(stream["index"]),
                             "-count_frames", "-show_entries", "stream=nb_read_frames",
                             "-of", "json", video).stdout)
    count = int(counted["streams"][0]["nb_read_frames"])
    if count < 1:
        raise ValueError("ffprobe counted no decoded video frames")
    ffmpeg("-i", video, "-map", f"0:{stream['index']}", "-vf",
           f"select='eq(n,0)+eq(n,{count - 1})',scale=360:-2",
           "-frames:v", str(min(count, 2)), "-fps_mode", "passthrough", temp / "endpoint_%d.png")
    first = temp / "endpoint_1.png"
    last = temp / f"endpoint_{min(count, 2)}.png"
    require_image(first)
    require_image(last)
    return first, last, count


def generate(inputs, temp):
    container, video, audio = probe(inputs.video)
    length = duration(container.get("duration"))
    video_length = duration(video.get("duration", length))
    timing, spec, beats, resolved = timeline(inputs)

    first, last, count = media_endpoints(inputs.video, video, temp)
    comparison = ffmpeg("-i", first, "-i", last, "-lavfi", "ssim", "-f", "null", "-",
                        level="info").stderr
    ssim = re.search(r"\bAll:([\d.]+)", comparison)
    if not ssim:
        raise ValueError("ffmpeg did not report loop SSIM")
    loop = temp / "loop_first_vs_last.jpg"
    ffmpeg("-i", first, "-i", last, "-filter_complex", "hstack",
           "-frames:v", "1", "-update", "1", loop)
    require_image(loop)
    files = [loop]
    for i, t in enumerate((0., 0.5, 1., 1.5, 2., 3.)):
        if t >= video_length:
            break
        frame = temp / f"hook_{i}_{t:.1f}s.jpg"
        sample_frame(inputs.video, video, t, frame)
        files.append(frame)

    scenes = ffmpeg("-i", inputs.video, "-map", f"0:{video['index']}", "-an", "-vf",
                    "select='gt(scene,0.25)',showinfo", "-f", "null", "-", level="info").stderr
    measured = {
        "duration_s": round(length, 3),
        "video_duration_s": round(video_length, 3),
        "decoded_video_frames": count,
        "loop_ssim_first_vs_last": float(ssim[1]),
        "video_stream": {key: video.get(key) for key in ("codec_name", "width", "height", "avg_frame_rate")},
        "audio_codec": audio["codec_name"] if audio else None,
        "integrated_lufs": None,
    }
    missing = []
    if audio:
        log = ffmpeg("-i", inputs.video, "-map", f"0:{audio['index']}", "-vn",
                     "-af", "ebur128=peak=true", "-f", "null", "-", level="info").stderr
        lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", log)
        peak = re.findall(r"Peak:\s+(-?[\d.]+|-inf) dBFS", log)
        if not lufs or not peak:
            raise ValueError("ffmpeg did not report integrated loudness and true peak")
        measured["integrated_lufs"] = float(lufs[-1])
        measured["true_peak_dbtp"] = float(peak[-1]) if peak[-1] != "-inf" else None
        if measured["true_peak_dbtp"] is None:
            missing.append("No finite true peak (silent audio)")
    else:
        measured["true_peak_dbtp"] = None
        missing.append("No audio stream for loudness or true-peak measurement")

    estimates = {
        "scene_cuts_pixel_level": len(re.findall(r"pts_time:", scenes)),
        "scene_cut_threshold": 0.25,
    }
    if beats:
        words = [w for _, b in beats for w in b["words"]]
        speech = sum(b["end"] - b["start"] for _, b in beats)
        hook = beats[0][1]
        hook_text = " ".join(w["w"] for w in hook["words"])
        estimates.update({
            **cue_estimates(resolved, beats, video_length),
            "title": spec.get("title"),
            "words": len(words),
            "words_per_sec": round(len(words) / speech, 2) if speech else None,
            "first_word_at_s": min((w["start"] for w in words), default=None),
            "hook_text": hook_text,
            "hook_len_s": round(hook["end"] - hook["start"], 2),
            "beats": len(beats),
            "avg_beat_s": round(speech / len(beats), 2),
            "has_question_or_number_in_hook": bool(re.search(r"\d|\?|\$", hook_text)),
        })

    metrics = {
        **inputs.identity(),
        "status": "incomplete" if missing else timing["status"],
        "timeline": timing,
        "measured": measured,
        "estimated": estimates,
        "missingMeasurements": missing,
    }
    report = temp / "virality_metrics.json"
    write_json(report, metrics)
    files.append(report)
    return metrics, files


if __name__ == "__main__":
    raise SystemExit(review_cli(__doc__, "virality", "virality_status.json", generate, print_metrics=True))
