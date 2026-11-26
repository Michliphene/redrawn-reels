"""Synthesises the kit's drop sound (no licence question): a short falling sine 'plip' with a soft tail.
python raea/sillage-kit/tools/drop.py OUT.wav
"""
import math
import struct
import sys
import wave

SR = 48000
out = sys.argv[1] if len(sys.argv) > 1 else "drop.wav"
n = int(SR * 0.55)
frames = bytearray()
phase = 0.0
for i in range(n):
    t = i / SR
    f = 1500 * math.exp(-t * 18) + 380          # pitch falls fast: the drop's "plip"
    phase += 2 * math.pi * f / SR
    env = min(1.0, t / 0.003) * math.exp(-t * 11)
    body = math.sin(phase) * env
    ring = math.sin(2 * math.pi * 620 * t) * 0.18 * math.exp(-t * 6) * min(1.0, t / 0.02)  # the small ring after
    v = max(-1.0, min(1.0, 0.7 * (body + ring)))
    s = int(v * 32767)
    frames += struct.pack("<hh", s, s)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))
print(f"drop -> {out}")
