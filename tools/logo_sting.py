"""The locked 23 Team logo sound (ANIMATION-STYLE.md): a short reverse swell into a deep, soft cinematic boom, low in level, with a long smooth fade-out.
Rendered the same way every time (fixed seed). Each film adds it so the boom lands as the logo starts to appear:
    x = logo_sting(SR)   →  add it at (logo appears) − LEAD
"""
import os, sys
import numpy as np
from scipy.signal import fftconvolve
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import t_, lp, hp, noise

LEAD = .45    # seconds of swell before the boom
LEVEL = .14   # its peak in a film's effects bus: low, it sits under everything else in the film

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
