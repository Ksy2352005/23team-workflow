"""The locked 23 Team logo sound (ANIMATION-STYLE.md): a short reverse swell into a deep, soft cinematic boom, low in level, with a long smooth fade-out.
Rendered the same way every time (fixed seed). Each film adds it to its final mix, after the effects bus, so the level is the same in every film:
    place_logo(mix, when the logo starts to appear, SR, the voice's RMS)
"""
import os, sys
import numpy as np
from scipy.signal import fftconvolve
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import t_, lp, hp, noise

LEAD = .45    # seconds of swell before the boom
PEAK = 1.2    # its peak, relative to the voice's RMS: low, about 10 dB under the voice's peaks, the same in every film

def logo_sting(SR):
    rng = np.random.default_rng(23)
    def nz(d): return rng.standard_normal(int(d * SR))
    d = 1.9; tt = np.arange(int(d * SR)) / SR
    sub = np.sin(2 * np.pi * np.cumsum(45 + 30 * np.exp(-tt * 5)) / SR) * np.exp(-tt / .7) * np.minimum(1, tt / .01)
    body = lp(nz(d), 600) * np.exp(-tt / .15) * .35
    rev = lp(hp(nz(LEAD), 300), 4000) * (np.linspace(0, 1, int(LEAD * SR)) ** 3) * .25
    x = np.zeros(int((LEAD + d) * SR)); x[:len(rev)] += rev; a = int(LEAD * SR); x[a:a + len(sub)] += sub + body
    n = int(1.8 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = lp(ir, 6000) * .05
    x = x + .25 * fftconvolve(x, ir)[:len(x)]
    f = int(1.3 * SR); x[-f:] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2   # a long, smooth fade-out
    return x / (np.abs(x).max() + 1e-9)

def place_logo(mix, at, SR, voice_rms, trim_db=0.0):   # trim_db: a per-film match so the finished films all peak at about −11.5 dBFS here
    x = logo_sting(SR) * PEAK * voice_rms * 10 ** (trim_db / 20); a = int((at - LEAD) * SR); n = max(0, min(len(x), len(mix) - a))
    mix[a:a + n] += x[:n, None]
    return mix
