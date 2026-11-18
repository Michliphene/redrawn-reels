import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


# Simulate only the inspection boundary, including stale inputs and a manifest that changes.
INSPECT_FIXTURE = """
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
const [command, id, flag, ref] = process.argv.slice(2);
assert.equal(command, 'inspect');
assert.equal(id, 'test-episode');
assert.equal(flag, '--manifest');
const data = fs.readFileSync(ref);
const manifest = JSON.parse(data);
if (manifest.fixture === 'stale') {
  console.error('Captured inputs are stale');
  process.exit(1);
}
const countFile = 'inspect-calls';
const calls = (fs.existsSync(countFile) ? Number(fs.readFileSync(countFile, 'utf8')) : 0) + 1;
fs.writeFileSync(countFile, String(calls));
const inputsSha256 = (manifest.fixture === 'changed' && calls > 1 ? 'b' : 'a').repeat(64);
const renderSha256 = createHash('sha256').update(data).digest('hex');
console.log(JSON.stringify({
  episodeId: id, engine: manifest.recipe.engine, videoSha256: manifest.video.sha256,
  renderSha256, inputsSha256,
  effectiveDa: manifest.fixture === "wrong-da" ? 2 : manifest.recipe.effectiveDa,
}));
"""


@unittest.skipUnless(all(shutil.which(tool) for tool in ("ffmpeg", "ffprobe", "node")),
                     "requires FFmpeg, FFprobe and Node")
class ReviewEvidenceTests(unittest.TestCase):
    def setUp(self):
        (ROOT / "out").mkdir(exist_ok=True)
        workspace = tempfile.TemporaryDirectory(prefix="review-fixture-", dir=ROOT / "out")
        self.addCleanup(workspace.cleanup)
        self.root = Path(workspace.name)
        (self.root / "pipeline").mkdir()
        for name in ("review_evidence", "review_frames", "virality_metrics"):
            shutil.copyfile(ROOT / "pipeline" / f"{name}.py", self.root / "pipeline" / f"{name}.py")
        self.scripts = self.root / "scripts"
        self.scripts.mkdir()
        (self.scripts / "delivery.mjs").write_text(INSPECT_FIXTURE, encoding="utf-8")
        self.video = self.root / "exports" / "variant with spaces.mp4"
        self.video.parent.mkdir()
        subprocess.run([
            "ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=black:s=64x96:r=10:d=3.2",
            "-f", "lavfi", "-i", "sine=frequency=440:duration=3.2",
            "-vf", "negate=enable='eq(n,31)'", "-c:v", "mpeg4", "-c:a", "aac",
            str(self.video),
        ], check=True, capture_output=True)
        self.sha = hashlib.sha256(self.video.read_bytes()).hexdigest()
        self.manifest = self.root / "exports" / "render.json"
        self.evidence = self.root / "out" / "review" / "test-episode" / self.sha
        self.write_manifest("raea")

    def write_manifest(self, engine, sha=None, fixture=None):
        recipe = {"engine": engine}
        if engine == "remotion":
            recipe["effectiveDa"] = 1
        self.manifest.write_text(json.dumps({
            "episodeId": "test-episode",
            "video": {"path": self.video.relative_to(self.root).as_posix(), "sha256": sha or self.sha},
            "recipe": recipe, "fixture": fixture,
        }), encoding="utf-8")

    def run_review(self, tool, *args, versioned=True):
        return subprocess.run([
            sys.executable, str(self.root / "pipeline" / f"{tool}.py"), "test-episode",
            *(("--manifest", str(self.manifest)) if versioned else ()), *args,
        ], cwd=self.root, capture_output=True, encoding="utf-8")

    def assert_success(self, result):
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_raea_images_and_viral_metrics_coexist_and_use_final_frame(self):
        result = self.run_review("virality_metrics", "--video", str(self.video))
        self.assert_success(result)
        metrics = json.loads(result.stdout)
        self.assertEqual(metrics["videoSha256"], self.sha)
        self.assertEqual(metrics["timeline"]["status"], "incomplete")
        self.assertEqual(metrics["measured"]["decoded_video_frames"], 32)
        self.assertIsNotNone(metrics["measured"]["integrated_lufs"])
        self.assertNotIn("visual_cues", metrics["estimated"])
        self.assertLess(metrics["measured"]["loop_ssim_first_vs_last"], 0.6)
        self.assertTrue((self.evidence / "loop_first_vs_last.jpg").is_file())

        result = self.run_review("review_frames")
        self.assert_success(result)
        status = json.loads((self.evidence / "frames_status.json").read_text(encoding="utf-8"))
        self.assertEqual(status["status"], "incomplete")
        self.assertEqual(status["extractionStatus"], "complete")
        self.assertEqual(status["kind"], "technical")
        self.assertEqual(status["videoSha256"], self.sha)
        self.assertTrue(status["versioned"])
        self.assertEqual(status["renderSha256"], hashlib.sha256(self.manifest.read_bytes()).hexdigest())
        self.assertEqual(status["inputsSha256"], "a" * 64)
        self.assertEqual(status["missingMeasurements"], [])
        self.assertTrue(status["images"])
        for artifact in status["artifacts"]:
            digest = hashlib.sha256((self.evidence / artifact["path"]).read_bytes()).hexdigest()
            self.assertEqual(artifact["sha256"], digest)
        for image in status["images"]:
            self.assertTrue((self.evidence / image).is_file())
        self.assertTrue((self.evidence / "virality_metrics.json").is_file())
        self.assertTrue((self.evidence / "hook_0_0.0s.jpg").is_file())

    def test_hash_mismatch_fails_before_writing_evidence(self):
        self.write_manifest("raea", "a" * 64)
        result = self.run_review("virality_metrics")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("SHA-256 mismatch", result.stderr)
        self.assertFalse((self.root / "out" / "review").exists())

    def test_failed_probe_writes_incomplete_status_and_exits_nonzero(self):
        self.video.write_bytes(b"corrupt mp4")
        self.sha = hashlib.sha256(self.video.read_bytes()).hexdigest()
        self.write_manifest("raea")
        result = self.run_review("virality_metrics")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("ffprobe", result.stderr)
        status = self.root / "out" / "review" / "test-episode" / self.sha / "virality_status.json"
        self.assertEqual(json.loads(status.read_text(encoding="utf-8"))["status"], "incomplete")

    def test_remotion_uses_runtime_cues_and_keeps_caption_punctuation(self):
        self.write_manifest("remotion")
        episode = self.root / "public" / "episodes" / "test-episode"
        episode.mkdir(parents=True)
        (episode / "episode.json").write_text(json.dumps({
            "title": "Test", "da": 2, "beats": [{"id": "hook", "actions": [
                {"type": "pulse", "atTime": 1.34, "atWord": "It's:"}
            ]}],
        }), encoding="utf-8")
        (episode / "timings.json").write_text(json.dumps({
            "duration": 2.6, "beats": [{"id": "hook", "start": 0.1, "end": 2.6, "words": [
                {"w": "It's: 50%,", "start": 0.1, "end": 0.5}
            ]}],
        }), encoding="utf-8")
        for name in ("scripts/resolve-cues.mjs", "scripts/validate.mjs", "src/lib/media.ts",
                     "src/lib/schedule.ts", "public/studio.json"):
            destination = self.root / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / name, destination)
        result = self.run_review("review_frames")
        self.assert_success(result)
        cues = (self.evidence / "cues.md").read_text(encoding="utf-8")
        self.assertIn("1.34s", cues)
        self.assertIn("It's: 50%,", cues)
        self.assertTrue((self.evidence / "beat_00_hook.jpg").is_file())
        status = json.loads((self.evidence / "frames_status.json").read_text(encoding="utf-8"))
        self.assertTrue(status["timeline"]["renderInputsVerified"])
        self.assertEqual(status["effectiveDa"], 1)
        self.assertEqual(status["status"], "complete")
        self.assertEqual((self.root / "inspect-calls").read_text(), "2")

    def test_inspect_rejects_stale_captured_inputs_before_extraction(self):
        self.write_manifest("raea", fixture="stale")
        result = self.run_review("review_frames")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Captured inputs are stale", result.stderr)
        self.assertFalse(self.evidence.exists())

    def test_inspection_rejects_effective_da_mismatch(self):
        self.write_manifest("remotion", fixture="wrong-da")
        result = self.run_review("review_frames")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("effectiveDa", result.stderr)
        self.assertFalse(self.evidence.exists())

    def test_second_inspection_rejects_changed_identity(self):
        self.write_manifest("raea", fixture="changed")
        result = self.run_review("review_frames")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("identity changed", result.stderr)
        self.assertFalse((self.evidence / "overview.jpg").exists())
        status = json.loads((self.evidence / "frames_status.json").read_text(encoding="utf-8"))
        self.assertEqual(status["status"], "incomplete")
        self.assertEqual(status["extractionStatus"], "incomplete")

    def test_legacy_explicit_video_samples_as_unversioned(self):
        result = self.run_review("virality_metrics", "--video", str(self.video), versioned=False)
        self.assert_success(result)
        metrics = json.loads(result.stdout)
        self.assertEqual(metrics["status"], "incomplete")
        self.assertFalse(metrics["versioned"])
        self.assertIsNone(metrics["renderSha256"])
        self.assertTrue((self.evidence / "loop_first_vs_last.jpg").is_file())
        self.assertFalse((self.root / "inspect-calls").exists())
