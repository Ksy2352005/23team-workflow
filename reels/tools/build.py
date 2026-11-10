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
import end23  # noqa: E402

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
        if "at" in s:   # exact song time for this cut (overrides the beat grid)
            t0 = s["at"]
            if shots:
                shots[-1]["t1"] = t0 - start
        if not shots:  # first shot always starts the video
            t0 = start
        shots.append({**s, "t0": t0 - start, "t1": t1 - start})
        print(f"  {t0 - start:5.2f}s -> {t1 - start:5.2f}s  {s.get('type', s.get('bg')):<12} {s.get('logo') or ''}")
    duration = end - start + plan.get("tail", 0)   # tail: seconds the last picture holds after the song
    if plan.get("tail"):
        shots[-1]["t1"] = duration
    E = plan.get("end23")   # colours for the 23 end card shot ("bg": "end23")

    cache = {}
    def img(name):
        if name == "end23" and name not in cache:
            cache[name] = end23.card(E["bg"], E["logo"])
        if name not in cache:
            im = Image.open(os.path.join(rel(plan["frames"]), name + ".png")).convert("RGBA")
            cache[name] = im.resize((W, H)) if im.size != (W, H) else im
        return cache[name]

    out = rel(plan["out"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    fade = plan.get("fade", 0.05)   # keep tiny so the last beat is not swallowed
    song_len = plan.get("audio_end", end) - start   # audio_end: stop the song before a hit we don't want
    fade_from = plan.get("fade_from", end - fade) - start   # song fades out from here (song time)
    audio_in = ["-ss", str(start), "-t", str(song_len), "-i", rel(plan["audio"])]
    amap = ["-map", "0:v", "-map", "1:a",
            "-af", f"afade=t=out:st={fade_from}:d={max(song_len - fade_from, 0.01)},apad"]
    T = plan.get("echo_tail")   # {"from": song time, "fade": s, "delays_ms": [...], "decays": [...]}
    if T:
        x0 = T["from"] - start
        dl = "|".join(str(d) for d in T["delays_ms"]); dc = "|".join(str(d) for d in T["decays"])
        afilter = (f"[1:a]aresample=48000,asplit=2[d][w];"
                   f"[d]afade=t=out:st={x0}:d=0.06,apad[dry];"
                   f"[w]apad=pad_dur={duration},aecho=0.9:0.9:{dl}:{dc},"
                   f"afade=t=in:st={x0}:d=0.06,afade=t=out:st={x0 + 0.12}:d={duration - x0 - 0.15}[wet];"
                   f"[dry][wet]amix=inputs=2:normalize=0:duration=longest,atrim=0:{duration}[a]")
        amap = ["-filter_complex", afilter, "-map", "0:v", "-map", "[a]"]
    ff = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        *audio_in, *amap,
        "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(duration), out,
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
        if "view" in s:          # zoom into part of the image: [centre x, centre y (0-1), zoom]
            key = ("view", s.get("bg"), tuple(s["view"]))
            if key not in cache:
                vx, vy, z = s["view"]
                cw, ch = W / z, H / z
                x0 = min(max(vx * W - cw / 2, 0), W - cw); y0 = min(max(vy * H - ch / 2, 0), H - ch)
                cache[key] = bg.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((W, H), Image.LANCZOS)
            bg = cache[key]
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


def _cursor(scale=1.0):
    """macOS-style arrow cursor (white with black outline), tip at (0, 0)."""
    from PIL import ImageDraw
    pts = [(0, 0), (0, 34), (8, 26), (14, 40), (20, 37), (14, 24), (25, 24)]
    S = 3 * scale
    im = Image.new("RGBA", (int(34 * S), int(48 * S)))
    d = ImageDraw.Draw(im)
    poly = [(x * S + 3, y * S + 3) for x, y in pts]
    d.polygon(poly, fill="white", outline="black")
    d.line(poly + [poly[0]], fill="black", width=max(2, int(1.6 * S)))
    return im


def _lerp(a, b, t):
    return a + (b - a) * t


def render_screen(s, local, frames_dir):
    """A monitor photo whose screen shows a designer at work: the cursor drags
    the logo onto the artboard, it gets selected, the cursor grabs the corner
    handle and scales it down a little, then clicks away. The screen's own
    light is kept on top so it looks like it is really on the display."""
    from PIL import ImageDraw
    photo = _cover(s["photo"], W, H, (0.5, 0.5), frames_dir).copy()
    sw, sh = s.get("screen_size", (1600, 1000))
    scr = Image.new("RGBA", (sw, sh), s.get("color", "#F3D35B"))
    key = ("logo", s["logo_png"], sw)
    if key not in _tile_cache:
        lg = Image.open(os.path.join(frames_dir, s["logo_png"] + ".png")).convert("RGBA")
        _tile_cache[key] = lg.crop(lg.getbbox())
    logo0 = _tile_cache[key]
    t = local - s.get("delay", 0)
    cx0, cy0 = sw / 2, sh / 2
    base_w = sw * s.get("logo_width", 0.5)
    # timeline (seconds after delay)
    T_DRAG, T_SEL, T_TO_HANDLE, T_SCALE, T_AWAY, T_DESEL = 0.75, 0.85, 1.35, 2.05, 2.45, 2.6
    end_scale = s.get("end_scale", 0.82)
    # logo position and scale
    if t < T_DRAG:
        e = ease_out(max(t, 0) / T_DRAG)
        lx = _lerp(-base_w * 0.6, cx0, e); sc = 1.0
    else:
        lx = cx0
        sc = 1.0 if t < T_TO_HANDLE else _lerp(1.0, end_scale, ease_out((t - T_TO_HANDLE) / (T_SCALE - T_TO_HANDLE)))
    lw = base_w * sc; lh = lw * logo0.height / logo0.width
    if t >= 0:
        lg = logo0.resize((max(1, round(lw)), max(1, round(lh))), Image.LANCZOS)
        scr.alpha_composite(lg, (round(lx - lw / 2), round(cy0 - lh / 2)))
    pad = 22
    box = (lx - lw / 2 - pad, cy0 - lh / 2 - pad, lx + lw / 2 + pad, cy0 + lh / 2 + pad)
    d = ImageDraw.Draw(scr)
    if T_SEL <= t < T_DESEL:
        d.rectangle(box, outline="#2F7BFF", width=4)
        for hx in (box[0], (box[0] + box[2]) / 2, box[2]):
            for hy in (box[1], (box[1] + box[3]) / 2, box[3]):
                if hx == (box[0] + box[2]) / 2 and hy == (box[1] + box[3]) / 2:
                    continue
                d.rectangle((hx - 9, hy - 9, hx + 9, hy + 9), fill="white", outline="#2F7BFF", width=3)
    # cursor path
    grab = (cx0 + base_w * 0.18, cy0 + 10)                 # where the cursor holds the logo
    handle_start = (cx0 + base_w / 2 + pad, cy0 + base_w * logo0.height / logo0.width / 2 + pad)
    if t < T_DRAG:
        cur = (lx + base_w * 0.18, cy0 + 10)
    elif t < T_SEL:
        cur = grab
    elif t < T_TO_HANDLE:
        e = ease_out((t - T_SEL) / (T_TO_HANDLE - T_SEL)); cur = (_lerp(grab[0], handle_start[0], e), _lerp(grab[1], handle_start[1], e))
    elif t < T_SCALE:
        cur = (box[2], box[3])
    elif t < T_AWAY:
        e = ease_out((t - T_SCALE) / (T_AWAY - T_SCALE)); cur = (_lerp(box[2], sw * 0.86, e), _lerp(box[3], sh * 0.84, e))
    else:
        cur = (sw * 0.86, sh * 0.84)
    if t >= -0.3:
        scr.alpha_composite(_cursor(sw / 1600 * s.get("cursor_scale", 1.0)), (round(cur[0]) - 3, round(cur[1]) - 3))
    quad = s["quad"]   # screen corners in the 1080x1920 frame: TL, TR, BR, BL
    coeffs = _perspective_coeffs(quad, [(0, 0), (sw, 0), (sw, sh), (0, sh)])
    warped = scr.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon([tuple(q) for q in quad], fill=255)
    # keep the photo's own screen light (reflections, falloff) on top of the content
    pa = np.asarray(photo.convert("RGB")).astype(float)
    wa = np.asarray(warped.convert("RGB")).astype(float)
    lum = pa.mean(2, keepdims=True)
    ma = np.asarray(m)[..., None] > 0
    ref = np.median(lum[ma[..., 0]]) if ma.any() else 1
    shade = np.clip(lum / max(ref, 1), 0.85, 1.6)
    out = np.where(ma, np.clip(wa * shade, 0, 255), pa)
    return Image.fromarray(out.astype(np.uint8)).convert("RGBA")


if __name__ == "__main__":
    main(sys.argv[1])
