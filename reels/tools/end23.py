"""The 23 Team end card. In the reels it is `card()`: a still, cut on the beat
as the last shot inside the music (no sting, no fade, no extra length).
The logo size, position and opacity are the ones locked in the 23motion films (ANIMATION-STYLE.md on
the `mere-exposure` branch), with one difference: the colours come from the
fictional brand's palette (background = the brand's darkest colour, logo = its
lightest/soft colour), so the ending matches each reel.

Locked (identical in every reel):
- logo file `brand-assets/logo-23.png`, shape never changed, only recoloured
- width 30% of the frame (324 x 177 px on 1080 x 1920), centred both ways
- the last shot fades into the background colour over 0.7 s
- the logo starts 0.15 s after the fade ends, fades in over 0.9 s to 75% opacity,
  scaling 104% -> 100% while a 6 px blur clears, then holds 1.2 s
- sound: a short reverse swell into a deep, soft boom that lands as the logo
  starts to appear; all other sound fades out with the picture
"""
import os

import numpy as np
from PIL import Image, ImageFilter

W, H = 1080, 1920
FADE, GAP, LOGO_IN, HOLD = 0.7, 0.15, 0.9, 1.2
LOGO_PATH = os.path.join(os.path.dirname(__file__), "..", "brand-assets", "logo-23.png")


def card(bg, logo):
    """The end card as a single still: the brand's darkest colour with the 23
    logo at the locked size and position (30% of width, centred, 75% opacity)
    in the brand's lightest colour. Used as the last shot of the edit, cut on
    the beat inside the music: no separate sound, no extra length."""
    base = Image.new("RGBA", (W, H), bg)
    lg = _logo(logo).copy()
    lg.putalpha(lg.getchannel("A").point(lambda v: int(v * 0.75)))
    base.alpha_composite(lg, ((W - lg.width) // 2, (H - lg.height) // 2))
    return base


def total(fade_start):
    """Video length when the fade into the end card starts at `fade_start`."""
    return fade_start + FADE + GAP + LOGO_IN + HOLD


def ss(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


_logo_cache = {}


def _logo(color):
    if color not in _logo_cache:
        im = Image.open(LOGO_PATH).convert("RGBA")
        w = round(W * 0.30); h = round(w * im.height / im.width)
        im = im.resize((w, h), Image.LANCZOS)
        rgb = Image.new("RGBA", im.size, color)
        rgb.putalpha(im.getchannel("A"))
        _logo_cache[color] = rgb
    return _logo_cache[color]


def frame(t, fade_start, shot_frame, bg, logo):
    """Frame at video time t (>= fade_start). `shot_frame` is the last shot's
    frame at t (RGBA) while it is still fading, else None."""
    base = Image.new("RGBA", (W, H), bg)
    k = ss((t - fade_start) / FADE)
    if k < 1 and shot_frame is not None:
        base = Image.blend(shot_frame.convert("RGBA"), base, k)
    u = ss((t - (fade_start + FADE + GAP)) / LOGO_IN)
    if u > 0:
        lg = _logo(logo)
        sc = 1.04 - 0.04 * u
        lw, lh = max(1, round(lg.width * sc)), max(1, round(lg.height * sc))
        im = lg.resize((lw, lh), Image.LANCZOS)
        pad = 24
        canvas = Image.new("RGBA", (lw + 2 * pad, lh + 2 * pad))
        canvas.paste(im, (pad, pad))
        if u < 1:
            canvas = canvas.filter(ImageFilter.GaussianBlur((1 - u) * 6))
        a = canvas.getchannel("A").point(lambda v: int(v * u * 0.75))
        canvas.putalpha(a)
        base.alpha_composite(canvas, ((W - canvas.width) // 2, (H - canvas.height) // 2))
    return base


# ------------------------------------------------------------------ the sting
LEAD = 0.45   # seconds of swell before the boom


def _lp(x, f, sr):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, f, "low", fs=sr, output="sos"), x)


def _hp(x, f, sr):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, f, "high", fs=sr, output="sos"), x)


def sting(sr=48000):
    """Same recipe and seed as tools/logo_sting.py in the 23motion films."""
    from scipy.signal import fftconvolve
    rng = np.random.default_rng(23)
    nz = lambda d: rng.standard_normal(int(d * sr))
    d = 1.9; tt = np.arange(int(d * sr)) / sr
    sub = np.sin(2 * np.pi * np.cumsum(45 + 30 * np.exp(-tt * 5)) / sr) * np.exp(-tt / .7) * np.minimum(1, tt / .01)
    body = _lp(nz(d), 600, sr) * np.exp(-tt / .15) * .35
    rev = _lp(_hp(nz(LEAD), 300, sr), 4000, sr) * (np.linspace(0, 1, int(LEAD * sr)) ** 3) * .25
    x = np.zeros(int((LEAD + d) * sr)); x[:len(rev)] += rev; a = int(LEAD * sr); x[a:a + len(sub)] += sub + body
    n = int(1.8 * sr); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = _lp(ir, 6000, sr) * .05
    x = x + .25 * fftconvolve(x, ir)[:len(x)]
    f = int(1.3 * sr); x[-f:] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2
    return x / (np.abs(x).max() + 1e-9)


def write_sting(path, peak_dbfs=-11.5, sr=48000):
    import wave
    x = sting(sr) * 10 ** (peak_dbfs / 20)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
    return LEAD
