"""23 Team motion-reel sound engine (shared by the neon motion-design reels).
Our own soundtrack built around the animation: dark cinematic music under the voice (D minor, low piano + pad, deep sliding sub, a quiet tension motif,
a soft ticking pulse), dramatic pauses (the music drops to silence just before each big moment and returns on the hit), sound effects on the
on-screen events, the voice always on top, then the locked 23 logo sound.

Use from a reel's mix.py:
    sys.path.insert(0, '<repo>/tools'); from motion_sound import *
    fx = buf(DUR); add(fx, impact(.6), 3.2); ...
    write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=[(a, b), ...])"""
import os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve
import soundfile as sf
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, thump, compress, limit, add as _add
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from logo_sting import place_logo
rng = np.random.default_rng(23)
def buf(dur): return np.zeros((int(dur * SR) + SR, 2))
def add(b, x, t, v=1, pan=0): _add(b, x, max(0, t), v, pan)
def verb(x, t60=1.2, wet=.3):
    n = int(t60 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = lp(ir, 6000) * .05
    return x + wet * fftconvolve(x, ir)[:len(x)]
# —— effects ——
def riser(d, v):   # noise sweeping up plus a rising tone, swelling into the hit
    tt = t_(d); x = noise(d); y = np.zeros_like(x); f = 300 * (12 ** (tt / d))
    for k in range(0, len(x), 480): y[k:k + 480] = bp(x[k:k + 480], f[k] * .7, f[k] * 1.5)
    return norm(y + np.sin(2 * np.pi * np.cumsum(120 * (8 ** (tt / d))) / SR) * .35) * (tt / d) ** 2.2 * v
def impact(v):   # a deep cinematic hit: sub drop, body thump, a crack, a long tail
    d = 2.2; tt = t_(d); x = np.sin(2 * np.pi * np.cumsum(70 - 35 * (1 - np.exp(-tt * 4))) / SR) * np.exp(-tt * 1.6)
    cr = hp(noise(.25), 1500) * env_exp(.25, .03); x[:len(cr)] += cr * .5; th = lp(thump(.4, 55), 300); x[:len(th)] += th * .8
    return verb(norm(x), 1.6, .35) * v
def whoosh(d, v, up=True):
    tt = t_(d); f = np.linspace(500, 5000, len(tt)) if up else np.linspace(5000, 500, len(tt)); x = noise(d); y = np.zeros_like(x)
    for k in range(0, len(x), 480): y[k:k + 480] = bp(x[k:k + 480], f[k] * .6, f[k] * 1.6)
    return norm(y) * np.sin(np.pi * tt / d) ** 1.4 * v
def tick(v): d = .05; return norm(bp(noise(d), 2500, 7000) * env_exp(d, .004) + np.sin(2 * np.pi * 1900 * t_(d)) * env_exp(d, .006)) * v
def click(v): d = .04; return norm(bp(noise(d), 3000, 9000) * env_exp(d, .003) + np.sin(2 * np.pi * 2400 * t_(d)) * env_exp(d, .004)) * v
def pop(v, f0=500, f1=1400): d = .12; return norm(np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, int(d * SR))) / SR) * env_exp(d, .04)) * v
def ding(v, f=1568): tt = t_(1.2); return verb(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) + .4 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 5), 1.0, .35) * v
def shimmer(v, d=1.4): tt = t_(d); return verb(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / (.5 + .2 * i)) for i, f in enumerate([2093, 2637, 3136, 4186])) * np.minimum(1, tt / .01), 1.2, .4) * v / 3
def glitch(d, v): tt = t_(d); return norm(bp(noise(d), 800, 6000) * (np.sin(2 * np.pi * 37 * tt) > .2)) * v
def chatter(d, v):   # data chatter while text decodes
    out = np.zeros(int(d * SR) + 2400); k = 0
    while k * .035 < d: c = tick(.6 + .4 * rng.random()); a = int(k * .035 * SR); out[a:a + len(c)] += c[:len(out) - a]; k += 1
    return out * v
def shatter(v):   # glass-like shards flying
    d = 1.2; tt = t_(d); out = np.zeros(len(tt))
    for k in range(18): a = int(rng.random() * .5 * SR); f = 2500 + rng.random() * 5000; x = np.sin(2 * np.pi * f * t_(.25)) * np.exp(-t_(.25) * 22) + hp(noise(.25), 3000) * env_exp(.25, .02) * .6; out[a:a + len(x)] += x[:len(out) - a]
    return verb(norm(out), 1.0, .3) * v
def coin(v): d = .6; tt = t_(d); return verb((np.sin(2 * np.pi * 2637 * tt) + .6 * np.sin(2 * np.pi * 3951 * tt)) * np.exp(-tt * 7) * np.minimum(1, tt / .002), .8, .3) * v
# —— music ——
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
CHORDS = [[50, 53, 57, 62], [46, 50, 53, 58], [43, 50, 55, 58], [45, 49, 52, 57]]; ROOTS = [38, 34, 31, 33]
def _pad(f, d, v): tt = t_(d); y = sum(np.sin(2 * np.pi * f * (1 + dt) * tt + p) for dt, p in [(-.003, 0), (.003, 1.7), (0, 3.1)]) / 3 + .25 * np.sin(4 * np.pi * f * tt); return y * np.minimum(1, tt / .6) * np.minimum(1, (d - tt) / .8) * v
def _piano(f, d, v): tt = t_(d); y = np.sin(2 * np.pi * f * tt) + .45 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 3) + .15 * np.sin(6 * np.pi * f * tt) * np.exp(-tt * 5); return lp(y, 2200) * np.minimum(1, tt / .004) * np.exp(-tt * 1.1) * np.minimum(1, (d - tt) / .1) * v
def _sub(f, d, v, to=None):
    tt = t_(d); fq = np.full(len(tt), f)
    if to: n = int(.18 * SR); fq[-n:] = np.linspace(f, to, n)
    return lp(np.tanh(1.4 * np.sin(2 * np.pi * np.cumsum(fq) / SR)), 180) * np.minimum(1, tt / .01) * np.exp(-tt * .55) * np.minimum(1, (d - tt) / .06) * v
def dark_song(d, seed=0):
    out = np.zeros(int(d * SR) + 2 * SR)
    def put(x, t): a = int(t * SR); n = min(len(x), len(out) - a); out[a:a + n] += x[:n]
    rot = seed % 4
    for b in range(int(d / BAR) + 1):
        t0 = b * BAR; k = (b + rot) % 4; ch = CHORDS[k]
        for m in ch: put(_pad(mtof(m), BAR + .4, .10), t0)
        put(_piano(mtof(ch[0] + 12), BAR, .11), t0); put(_piano(mtof(ch[2] + 12), BEAT * 2, .07), t0 + BEAT * 2)
        if b >= 1:
            put(_sub(mtof(ROOTS[k]), BEAT * 2.4, .9), t0); put(_sub(mtof(ROOTS[k]), BEAT * 1.4, .7, to=mtof(ROOTS[(k + 1) % 4])), t0 + BEAT * 2.6)
            for q in range(8): put(bp(noise(.03), 3000, 6000) * env_exp(.03, .006) * (.05 if q % 2 else .08), t0 + q * BEAT / 2)
        if b >= 2 and k in (0, 2):
            for q, m in enumerate([74, 73, 74]): put(_piano(mtof(m), BEAT * 1.6, .05), t0 + BEAT * (1 + q))
    return verb(out[:int(d * SR)], 1.8, .3)
# —— the mix ——
def load_mono(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def write_mix(here, voice, fx, story, dur, pauses=(), music_level=.26, logo_trim=0.0, seed=0, out='out/mix.wav'):
    N = int(dur * SR) + SR
    music = dark_song(story + 1.0, seed); g = np.ones(len(music))
    for a, b in pauses:
        ia, ib = int(a * SR), int(b * SR); fd = int(.15 * SR); g[ia:ia + fd] = np.minimum(g[ia:ia + fd], np.linspace(1, 0, fd)); g[ia + fd:ib] = 0
    music *= g; fi, fo = int(1.0 * SR), int(1.2 * SR); music[:fi] *= np.linspace(0, 1, fi); music[-fo:] *= np.linspace(1, 0, fo)
    n0, n1 = int((story - .6) * SR), int((story + .1) * SR); fx = fx[:N].copy(); fx[n0:n1] *= np.linspace(1, 0, n1 - n0)[:, None]; fx[n1:] = 0
    vo = compress(norm(load_mono(os.path.join(here, voice)), .9), thr=.3, ratio=3); voice_b = np.zeros((N, 2)); n = min(len(vo), N); voice_b[:n, 0] = vo[:n]; voice_b[:n, 1] = vo[:n]
    env = np.convolve(np.abs(voice_b[:, 0]), np.ones(2400) / 2400, 'same'); duckv = np.clip(env / (env.max() * .25), 0, 1)
    fxc = np.stack([compress(fx[:, c] * 2.0, thr=.15, ratio=2.5, att=.002, rel=.08) for c in range(2)], 1) * (1 - .45 * duckv)[:, None]
    vr = np.sqrt(np.mean(voice_b[np.abs(voice_b[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
    mus = np.zeros(N); mus[:min(N, len(music))] = music[:N]; mr = np.sqrt(np.mean(mus[int(4 * SR):int(story * SR)] ** 2)); mus *= (vr * music_level / max(mr, 1e-9)) * (1 - .35 * duckv)
    mix = voice_b + fxc * (vr * 2.0 / max(fr, 1e-6)) + np.stack([mus, mus], 1); mix = place_logo(mix, story + .2, SR, vr, logo_trim); mix = mix[:int(dur * SR)]
    mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
    mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)
    mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - dur) * SR), 2))])
    os.makedirs(os.path.join(here, 'out'), exist_ok=True); sf.write(os.path.join(here, out), mix.astype(np.float32), SR); print('mix', round(mix.shape[0] / SR, 1), 's')
