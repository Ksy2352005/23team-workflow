"""Inspect a song: tempo, beat times and a loudness bar chart.

Usage: python3 beats.py <audio-or-video file> [--json out.json]
Accepts mp3/m4a/wav or a screen recording (the audio track is used).
"""
import json
import subprocess
import sys
import tempfile

import librosa
import numpy as np


def load(path):
    """Decode any audio/video file to mono 22.05 kHz with ffmpeg, then load it."""
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-ac", "1",
                        "-ar", "22050", tmp.name], check=True)
        y, sr = librosa.load(tmp.name, sr=22050)
    return y, sr


def analyse(path):
    y, sr = load(path)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    ot = librosa.times_like(onset, sr=sr)
    # strength of each beat = onset strength at that time (used to place accents)
    strength = [float(onset[np.argmin(abs(ot - b))]) for b in beats]
    rms = librosa.feature.rms(y=y)[0]
    rt = librosa.times_like(rms, sr=sr)
    return {
        "duration": float(len(y) / sr),
        "tempo": float(np.atleast_1d(tempo)[0]),
        "beats": [round(float(b), 3) for b in beats],
        "beat_strength": [round(s, 2) for s in strength],
        "loudness": [(round(float(t), 2), float(r)) for t, r in zip(rt, rms)],
    }


if __name__ == "__main__":
    a = analyse(sys.argv[1])
    print(f"duration {a['duration']:.2f}s  tempo {a['tempo']:.1f} BPM  beats {len(a['beats'])}")
    print("beats:", " ".join(f"{b:.2f}" for b in a["beats"]))
    t = np.array([x[0] for x in a["loudness"]]); r = np.array([x[1] for x in a["loudness"]])
    peak = r.max() or 1
    for s in np.arange(0, a["duration"], 0.5):
        m = (t >= s) & (t < s + 0.5)
        if m.any():
            print(f"{s:6.1f}s {'#' * int(r[m].mean() / peak * 60)}")
    if "--json" in sys.argv:
        out = sys.argv[sys.argv.index("--json") + 1]
        json.dump({k: v for k, v in a.items() if k != "loudness"}, open(out, "w"), indent=1)
