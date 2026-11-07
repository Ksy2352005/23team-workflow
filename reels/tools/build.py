"""Build a beat-synced 9:16 reel with a centre-locked logo.

Usage: python3 build.py <plan.json>

plan.json (paths relative to the plan file):
{
  "audio": "../../music/song.mp4",   # song file or screen recording
  "start": 3.45,                      # where in the song the video starts (s)
  "end": 12.86,                       # where it ends (s); last shot runs to here
  "frames": "frames",                 # folder of rendered PNGs (1080x1920)
  "out": "out/reel.mp4",
  "shots": [
    {"bg": "bg-intro", "logo": null, "beats": 1, "fx": "drift"},
    {"bg": "bg-intro", "logo": "logo-cream", "beats": 2, "fx": "punch", "flash": true, "pop": true},
    ...
    {"bg": "end", "logo": null, "fx": "punch", "flash": true}   # no "beats" -> runs to "end"
  ]
}

How it works: the song's beats are detected, every cut lands exactly on a beat,
the background of each shot moves (punch-in or slow drift) while the logo layer
stays perfectly still in the centre: the "locked logo" look.
"""
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from beats import analyse  # noqa: E402

W, H, FPS = 1080, 1920, 30


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def beat_grid(beats, start, end):
    """Detected beats, extended backwards/forwards with the median period so
    shots can start before the first detected beat (e.g. a lead-in)."""
    b = np.array(beats)
    period = float(np.median(np.diff(b)))
    before = np.arange(b[0] - period, start - period, -period)[::-1]
    after = np.arange(b[-1] + period, end + period, period)
    g = np.concatenate([before, b, after])
    return g[(g >= start - 0.02) & (g <= end + 0.02)], period


def main(plan_path):
    base = os.path.dirname(os.path.abspath(plan_path))
    plan = json.load(open(plan_path))
    rel = lambda p: os.path.join(base, p)
    start, end = plan["start"], plan["end"]
    info = analyse(rel(plan["audio"]))
    grid, period = beat_grid(info["beats"], start, end)
    # half-beat grid so shots can be 0.5, 1.5 ... beats long
    half = np.empty(len(grid) * 2 - 1)
    half[0::2] = grid
    half[1::2] = (grid[:-1] + grid[1:]) / 2
    grid = half
    print(f"tempo {info['tempo']:.1f} BPM, beat every {period:.3f}s")

    # assign each shot its [t0, t1) on the beat grid (video time = song time - start)
    shots, k = [], 0
    for s in plan["shots"]:
        t0 = grid[k] if k < len(grid) else end
        if "beats" in s:
            k += int(round(s["beats"] * 2))
            t1 = grid[k] if k < len(grid) else end
        else:
            t1 = end
        if not shots:  # first shot always starts the video
            t0 = start
        shots.append({**s, "t0": t0 - start, "t1": t1 - start})
        print(f"  {t0 - start:5.2f}s -> {t1 - start:5.2f}s  {s['bg']:<12} {s.get('logo') or ''}")
    duration = end - start

    cache = {}
    def img(name):
        if name not in cache:
            im = Image.open(os.path.join(rel(plan["frames"]), name + ".png")).convert("RGBA")
            cache[name] = im.resize((W, H)) if im.size != (W, H) else im
        return cache[name]

    out = rel(plan["out"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    fade = 0.35
    ff = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-ss", str(start), "-t", str(duration), "-i", rel(plan["audio"]),
        "-map", "0:v", "-map", "1:a",
        "-af", f"afade=t=out:st={duration - fade}:d={fade}",
        "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out,
    ], stdin=subprocess.PIPE)

    white = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    for f in range(int(round(duration * FPS))):
        t = f / FPS
        s = next((x for x in shots if x["t0"] <= t < x["t1"]), shots[-1])
        local = t - s["t0"]
        fx = s.get("fx", "punch")
        if fx == "punch":        # quick zoom-in that settles on the beat
            scale = 1.0 + 0.07 * (1 - ease_out(local / 0.28))
        elif fx == "drift":      # slow push-in across the shot
            scale = 1.0 + 0.04 * (local / max(s["t1"] - s["t0"], 0.01))
        else:
            scale = 1.0
        bg = img(s["bg"])
        if scale != 1.0:
            w, h = int(W * scale), int(H * scale)
            bg = bg.resize((w, h), Image.BICUBIC).crop(((w - W) // 2, (h - H) // 2, (w - W) // 2 + W, (h - H) // 2 + H))
        frame = bg.copy()
        if s.get("logo"):
            logo = img(s["logo"])
            if s.get("pop") and local < 0.3:   # logo reveal: tiny scale-up into place
                k2 = 0.9 + 0.1 * ease_out(local / 0.3)
                lw, lh = int(W * k2), int(H * k2)
                small = logo.resize((lw, lh), Image.BICUBIC)
                logo = Image.new("RGBA", (W, H)); logo.paste(small, ((W - lw) // 2, (H - lh) // 2))
            frame.alpha_composite(logo)
        if s.get("flash") and local < 0.16:
            frame = Image.blend(frame, white, 0.85 * (1 - local / 0.16))
        ff.stdin.write(frame.convert("RGB").tobytes())
    ff.stdin.close()
    ff.wait()
    print("wrote", out)


if __name__ == "__main__":
    main(sys.argv[1])
