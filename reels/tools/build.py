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
        print(f"  {t0 - start:5.2f}s -> {t1 - start:5.2f}s  {s.get('type', s.get('bg')):<12} {s.get('logo') or ''}")
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
    frames_dir = rel(plan["frames"])
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
        if s.get("type") == "bento":
            bg = render_bento(s, local, period, frames_dir)
        elif s.get("type") == "screen":
            bg = render_screen(s, local, frames_dir)
        else:
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


# ---------------------------------------------------------------- special shots
_tile_cache = {}


def _cover(name, w, h, focus, frames_dir):
    """Crop a frame image to fill w x h (like CSS object-fit: cover)."""
    key = (name, w, h, tuple(focus))
    if key not in _tile_cache:
        im = Image.open(os.path.join(frames_dir, name + ".png")).convert("RGBA")
        s = max(w / im.width, h / im.height)
        im = im.resize((max(w, round(im.width * s)), max(h, round(im.height * s))), Image.LANCZOS)
        x0 = round((im.width - w) * focus[0]); y0 = round((im.height - h) * focus[1])
        im = im.crop((x0, y0, x0 + w, y0 + h))
        mask = Image.new("L", (w, h), 0)
        from PIL import ImageDraw
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=22, fill=255)
        im.putalpha(Image.composite(im.getchannel("A"), mask, mask))
        _tile_cache[key] = im
    return _tile_cache[key]


def render_bento(s, local, period, frames_dir):
    """Brand board that builds tile by tile. Each tile pops in at `at` beats."""
    frame = Image.new("RGBA", (W, H), s.get("color", "#F5EEDF"))
    for t in s["tiles"]:
        appear = t.get("at", 0) * period
        if local < appear:
            continue
        x, y, w, h = t["rect"]
        if "fill" in t:
            tile = Image.new("RGBA", (w, h), t["fill"])
            from PIL import ImageDraw
            m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=22, fill=255)
            tile.putalpha(m)
        else:
            tile = _cover(t["src"], w, h, t.get("focus", (0.5, 0.5)), frames_dir)
        p = ease_out((local - appear) / 0.22)
        k = 0.86 + 0.14 * p
        tw, th = max(1, round(w * k)), max(1, round(h * k))
        im = tile.resize((tw, th), Image.BICUBIC) if k < 0.999 else tile
        if p < 1:
            a = im.getchannel("A").point(lambda v: int(v * p))
            im = im.copy(); im.putalpha(a)
        frame.alpha_composite(im, (x + (w - tw) // 2, y + (h - th) // 2))
    return frame


def _perspective_coeffs(dst, src):
    """Coefficients for PIL PERSPECTIVE mapping output quad `dst` back to `src`."""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()


def render_screen(s, local, frames_dir):
    """A monitor photo whose screen shows the logo sliding in, like a designer
    dragging it onto an artboard; then a selection box appears around it."""
    from PIL import ImageDraw
    photo = _cover(s["photo"], W, H, (0.5, 0.5), frames_dir).copy()
    sw, sh = s.get("screen_size", (1600, 1000))
    scr = Image.new("RGBA", (sw, sh), s.get("color", "#F3D35B"))
    logo = Image.open(os.path.join(frames_dir, s["logo_png"] + ".png")).convert("RGBA")
    logo = logo.crop(logo.getbbox())
    lw = round(sw * s.get("logo_width", 0.62)); logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    slide = s.get("slide", 0.7)
    p = min(max(local / slide, 0), 1)
    back = 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2          # ease-out with a small overshoot
    cx = round((sw - lw) / 2 - (1 - back) * (sw * 0.75))
    cy = (sh - logo.height) // 2
    scr.alpha_composite(logo, (cx, cy))
    if local > slide + 0.1:                                      # selection box + handles
        d = ImageDraw.Draw(scr)
        bx = ((sw - lw) // 2 - 18, cy - 18, (sw + lw) // 2 + 18, cy + logo.height + 18)
        d.rectangle(bx, outline="#2F7BFF", width=4)
        for hx in (bx[0], bx[2]):
            for hy in (bx[1], bx[3]):
                d.rectangle((hx - 9, hy - 9, hx + 9, hy + 9), fill="white", outline="#2F7BFF", width=3)
    quad = s["quad"]   # screen corners in the 1080x1920 frame: TL, TR, BR, BL
    coeffs = _perspective_coeffs(quad, [(0, 0), (sw, 0), (sw, sh), (0, sh)])
    warped = scr.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon([tuple(q) for q in quad], fill=255)
    photo.paste(warped, (0, 0), m)
    return photo


if __name__ == "__main__":
    main(sys.argv[1])
