"""Offline TTS cache and promotion regressions."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import wave

from pipeline import tts


class VoiceTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.folder = Path(temp.name)
        self.spec = {
            "voice": {"engine": "elevenlabs", "voice_id": "fixture"},
            "beats": [{"id": "a", "say": "Hi."}],
        }

    def fake_take(self, engine):
        def synthesize(spec, output):
            output = Path(output)
            with wave.open(str(output / "voice.wav"), "wb") as wav:
                wav.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                wav.writeframes(bytes(48000))
            (output / "timings.json").write_text(json.dumps({
                "duration": 1, "beats": [{"id": "a", "start": 0, "end": 0.5,
                                         "words": [{"w": "Hi.", "start": 0, "end": 0.5}]}],
            }, indent=2), encoding="utf-8")
            return {"engine": engine, "model": f"{engine}-test", "settings": {}}
        return synthesize

    def test_inspection_does_not_stamp_legacy_pair(self):
        self.fake_take("elevenlabs")(self.spec, self.folder)
        timing_file = self.folder / "timings.json"
        original = timing_file.read_bytes()
        self.assertEqual(tts.voice_status(self.spec, self.folder)["status"], "legacy-unverified")
        self.assertEqual(timing_file.read_bytes(), original)
        self.assertFalse((self.folder / "voice.provenance.json").exists())

    def test_fallback_requires_opt_in_and_never_satisfies_elevenlabs(self):
        with (patch.object(tts, "elevenlabs", side_effect=RuntimeError("offline")),
              patch.object(tts, "kokoro", create=True, side_effect=self.fake_take("kokoro")) as fallback):
            with self.assertRaisesRegex(RuntimeError, "offline"):
                tts.prepare_voice(self.spec, self.folder)
            fallback.assert_not_called()
            tts.prepare_voice(self.spec, self.folder, allow_fallback=True)
        stored = tts.voice_status(self.spec, self.folder)
        self.assertEqual(stored["status"], "fallback")
        self.assertEqual(stored["request"]["engine"], "elevenlabs")
        self.assertEqual(stored["effective"]["engine"], "kokoro")
        self.assertEqual(stored["sha256"]["voice.wav"], hashlib.sha256((self.folder / "voice.wav").read_bytes()).hexdigest())
        with patch.object(tts, "elevenlabs", side_effect=RuntimeError("offline")) as provider:
            with self.assertRaisesRegex(RuntimeError, "offline"):
                tts.prepare_voice(self.spec, self.folder)
            provider.assert_called_once()
        self.assertEqual(tts.voice_status(self.spec, self.folder), stored)

    def test_matching_take_is_reused_but_changed_request_and_bytes_are_detected(self):
        with patch.object(tts, "elevenlabs", side_effect=self.fake_take("elevenlabs")) as provider:
            tts.prepare_voice(self.spec, self.folder)
            tts.prepare_voice(self.spec, self.folder)
            provider.assert_called_once()
        changed = {**self.spec, "beats": [{"id": "a", "say": "Bye."}]}
        self.assertEqual(tts.voice_status(changed, self.folder)["status"], "stale")
        with (self.folder / "voice.wav").open("ab") as wav:
            wav.write(b"tampered")
        self.assertEqual(tts.voice_status(self.spec, self.folder)["status"], "invalid")

    def test_voice_provenance_survives_a_crlf_checkout(self):
        with patch.object(tts, "elevenlabs", side_effect=self.fake_take("elevenlabs")):
            tts.prepare_voice(self.spec, self.folder)
        timings = self.folder / "timings.json"
        raw = timings.read_bytes().replace(b"\r\n", b"\n")
        timings.write_bytes(raw)
        self.assertEqual(tts.voice_status(self.spec, self.folder)["status"], "verified")
        timings.write_bytes(raw.replace(b"\n", b"\r\n"))
        self.assertEqual(tts.voice_status(self.spec, self.folder)["status"], "verified")

    def test_partial_failed_recording_leaves_existing_pair_untouched(self):
        self.fake_take("elevenlabs")(self.spec, self.folder)
        before = {p.name: p.read_bytes() for p in self.folder.iterdir()}

        def partial(_spec, output):
            (Path(output) / "voice.wav").write_bytes(b"unfinished")
            raise RuntimeError("interrupted")

        with patch.object(tts, "elevenlabs", side_effect=partial):
            with self.assertRaisesRegex(RuntimeError, "interrupted"):
                tts.prepare_voice(self.spec, self.folder)
        self.assertEqual({p.name: p.read_bytes() for p in self.folder.iterdir()}, before)
