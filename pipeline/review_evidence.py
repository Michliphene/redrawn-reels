"""Shared inputs and artifact handling for the review commands."""

import argparse
from dataclasses import dataclass, replace
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import re
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False, allow_nan=False) + "\n",
                    encoding="utf-8", newline="\n")


def sha256(path):
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def episode_id(value):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", value):
        raise ValueError(f"Invalid episode ID: {value!r}")
    return value


@dataclass(frozen=True)
class ReviewInput:
    episode: str
    video: Path
    digest: str
    engine: str
    manifest: Path | None
    effective_da: int | None = None
    render_digest: str | None = None
    inputs_digest: str | None = None

    @property
    def versioned(self):
        return self.render_digest is not None

    @property
    def output(self):
        return ROOT / "out" / "review" / self.episode / self.digest

    def identity(self):
        return {
            "episodeId": self.episode,
            "video": str(self.video),
            "videoSha256": self.digest,
            "engine": self.engine,
            "effectiveDa": self.effective_da,
            "renderManifest": str(self.manifest) if self.manifest else None,
            "versioned": self.versioned,
            "renderSha256": self.render_digest,
            "inputsSha256": self.inputs_digest,
        }


def review_input(args):
    episode = episode_id(args.episode)
    video = Path(args.video).resolve() if args.video else None
    manifest = Path(args.manifest).resolve() if args.manifest else None
    engine = "unknown"
    effective_da = None
    expected = None
    if manifest:
        data = read_json(manifest)
        if data["episodeId"] != episode:
            raise ValueError("Manifest episodeId does not match the requested episode")
        declared = (ROOT / data["video"]["path"]).resolve()
        if video is not None and video != declared:
            raise ValueError("--video does not match video.path in the manifest")
        video = declared
        expected = data["video"]["sha256"]
        if not isinstance(expected, str) or not re.fullmatch(r"[a-fA-F0-9]{64}", expected):
            raise ValueError("Manifest video.sha256 must be a SHA-256 digest")
        engine = data["recipe"]["engine"]
        if engine not in ("remotion", "raea"):
            raise ValueError(f"Unsupported manifest recipe.engine: {engine!r}")
        if engine == "remotion":
            effective_da = data["recipe"].get("effectiveDa")
            if type(effective_da) is not int or effective_da not in (1, 2):
                raise ValueError("Manifest Remotion recipe.effectiveDa must be 1 or 2")
    video = video or (ROOT / "out" / f"{episode}.mp4").resolve()
    digest = sha256(video)
    if expected is not None and digest != expected.lower():
        raise ValueError(f"Video SHA-256 mismatch: expected {expected}, got {digest}")
    return ReviewInput(episode, video, digest, engine, manifest, effective_da)


def run(*args):
    result = subprocess.run(args, cwd=ROOT, capture_output=True, encoding="utf-8", errors="replace")
    if result.returncode:
        detail = (result.stderr or result.stdout).strip()
        raise ValueError(f"{args[0]} exited with code {result.returncode}: {detail}")
    return result


def inspect_render(inputs):
    ref = inputs.manifest.relative_to(ROOT).as_posix()
    result = json.loads(run("node", "scripts/delivery.mjs", "inspect", inputs.episode,
                            "--manifest", ref).stdout)
    expected = {"episodeId": inputs.episode, "videoSha256": inputs.digest, "engine": inputs.engine}
    if any(result[key] != value for key, value in expected.items()):
        raise ValueError("Delivery inspect identity does not match the requested render")
    if inputs.engine == "remotion":
        effective_da = result.get("effectiveDa")
        if type(effective_da) is not int or effective_da != inputs.effective_da:
            raise ValueError("Delivery inspect effectiveDa does not match the Remotion manifest")
    digests = (result["renderSha256"], result["inputsSha256"])
    if any(not isinstance(digest, str) or not re.fullmatch(r"[a-f0-9]{64}", digest)
           for digest in digests):
        raise ValueError("Delivery inspect returned an invalid render or input SHA-256")
    return digests


def ffmpeg(*args, level="error"):
    return run("ffmpeg", "-nostdin", "-hide_banner", "-loglevel", level, "-xerror", "-y", *args)


def probe(video):
    data = json.loads(run("ffprobe", "-v", "error", "-show_streams", "-show_format",
                          "-of", "json", video).stdout)
    stream = next((s for s in data["streams"] if s["codec_type"] == "video"
                   and not s.get("disposition", {}).get("attached_pic")), None)
    if stream is None:
        raise ValueError("ffprobe found no video stream")
    return data["format"], stream, next((s for s in data["streams"] if s["codec_type"] == "audio"), None)


def duration(value):
    seconds = float(value)
    if not math.isfinite(seconds) or seconds <= 0:
        raise ValueError("ffprobe reported an invalid duration")
    return seconds


def frame_interval(stream):
    rate = Fraction(stream.get("avg_frame_rate", "0/1").replace("0/0", "0/1"))
    return float(1 / rate) if rate > 0 else 0


def require_image(path):
    if not path.is_file() or path.stat().st_size == 0:
        raise ValueError(f"ffmpeg produced no image for {path.name}")


def sample_frame(video, stream, t, path):
    ffmpeg("-ss", f"{t:.6f}", "-i", video, "-map", f"0:{stream['index']}",
           "-frames:v", "1", "-vf", "scale=360:-2", "-update", "1", path)
    require_image(path)


def timeline(inputs):
    if not inputs.versioned:
        return {
            "status": "incomplete",
            "reason": "Unversioned evidence: a delivery render manifest is required to verify the timeline",
            "renderInputsVerified": False,
        }, None, [], {}
    if inputs.engine == "raea":
        return {
            "status": "incomplete",
            "reason": "No exact raea timeline adapter is available",
            "renderInputsVerified": True,
        }, None, [], {}

    spec = read_json(ROOT / "public" / "episodes" / inputs.episode / "episode.json")
    audio = episode_id(spec.get("audio") or inputs.episode)
    timings = read_json(ROOT / "public" / "episodes" / audio / "timings.json")["beats"]
    by_id = {item.get("id"): item for item in timings}
    beats = [(beat, by_id[beat["id"]] if beat["id"] in by_id else timings[i])
             for i, beat in enumerate(spec["beats"])]
    if not beats:
        raise ValueError("No beats available for review")
    resolved = json.loads(run("node", "scripts/resolve-cues.mjs", inputs.episode,
                              "--da", str(inputs.effective_da)).stdout)
    if resolved.get("da") != inputs.effective_da:
        raise ValueError("resolve-cues.mjs did not resolve the manifest effectiveDa")
    known_beats = {beat["id"] for beat, _ in beats}
    for action in resolved["actions"]:
        if (action["beat"] not in known_beats or not isinstance(action["type"], str)
                or not math.isfinite(action["t"]) or action["t"] < 0):
            raise ValueError("resolve-cues.mjs returned an invalid action")
    return {
        "status": "complete",
        "source": "Authored schedule resolved against verified render inputs",
        "visualObservation": False,
        "renderInputsVerified": True,
    }, spec, beats, resolved


def review_cli(description, kind, index_name, generate, *, print_metrics=False):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("episode")
    parser.add_argument("--video", help="MP4 path (defaults to the manifest or out/<episode>.mp4)")
    parser.add_argument("--manifest", help="Delivery render manifest with a repo-relative video.path")
    args = parser.parse_args()
    try:
        inputs = review_input(args)
        if inputs.manifest:
            render_digest, inputs_digest = inspect_render(inputs)
            inputs = replace(inputs, render_digest=render_digest, inputs_digest=inputs_digest)
        output = inputs.output
        output.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=f".{index_name}-", dir=output) as temp:
            temp = Path(temp)
            index_path = temp / index_name

            def save_index(data):
                write_json(index_path, {**inputs.identity(), "kind": kind, **data})
                index_path.replace(output / index_name)

            save_index({"status": "incomplete", "extractionStatus": "incomplete",
                        "reason": "Extraction in progress"})
            try:
                metrics, files = generate(inputs, temp)
                if inputs.versioned and inspect_render(inputs) != (inputs.render_digest, inputs.inputs_digest):
                    raise ValueError("Delivery inspect identity changed during evidence extraction")
                if sha256(inputs.video) != inputs.digest:
                    raise ValueError("Video SHA-256 changed during evidence extraction")
                artifacts = [{"path": p.name, "sha256": sha256(p)} for p in files]
                for path in files:
                    path.replace(output / path.name)
                save_index({
                    "status": metrics["status"],
                    "extractionStatus": "complete",
                    "timeline": metrics["timeline"],
                    "missingMeasurements": metrics.get("missingMeasurements", []),
                    "images": [p.name for p in files if p.suffix == ".jpg"],
                    "artifacts": artifacts,
                })
            except (OSError, ValueError, KeyError, TypeError, IndexError) as exc:
                save_index({"status": "incomplete", "extractionStatus": "incomplete",
                            "reason": str(exc)})
                raise
        if print_metrics:
            print(json.dumps(metrics, indent=2, ensure_ascii=True, allow_nan=False))
        else:
            print(f"Evidence ({metrics['status']}): {output / index_name}")
    except (OSError, ValueError, KeyError, TypeError, IndexError) as exc:
        print(f"Review evidence: {exc}", file=sys.stderr)
        return 1
    return 0
