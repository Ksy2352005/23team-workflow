"""Sound for Whitespace Game (v6): David's voice (ElevenLabs v3, 1.18x) over a low dark pulse, with risers into the big moments,
impacts on the key words, whooshes on the transitions, a paper flip, a phone ring, a scroll and a stop tick. Writes out/mix.wav."""
import os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve, resample_poly
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, thump, compress, limit, add
TS = 1.18 / 1.1   # the voice at 1.1x: every time below is on the 1.18x clock and is stretched by TS
DUR, STORY = 59.4 * TS, 56.9 * TS
N = int(DUR * SR) + SR; rng = np.random.default_rng(23)
buf = lambda: np.zeros((N, 2))
def verb(x, t60=1.2, wet=.3):
    n = int(t60 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = lp(ir, 6000) * .05
    return x + wet * fftconvolve(x, ir)[:len(x)]
def S(name, v=1.0):
    a, sr = sf.read(os.path.join(HERE, '..', 'supermarket-route', 'sfx', name + '.ogg')); a = a if a.ndim == 1 else a.mean(1)
    if sr != SR: a = resample_poly(a, SR, sr)
    return a / (np.abs(a).max() + 1e-9) * v
def riser(d, v):   # noise sweeping up plus a rising tone, swelling into the hit
    tt = t_(d); x = noise(d); y = np.zeros_like(x); f = 300 * (12 ** (tt / d))
    for k in range(0, len(x), 480): y[k:k + 480] = bp(x[k:k + 480], f[k] * .7, f[k] * 1.5)
    tone = np.sin(2 * np.pi * np.cumsum(120 * (8 ** (tt / d))) / SR) * .35
    return norm(y + tone) * (tt / d) ** 2.2 * v
def impact(v):   # a deep cinematic hit: sub drop, body thump, a crack of noise, a long tail
    d = 2.2; tt = t_(d); sub = np.sin(2 * np.pi * np.cumsum(70 - 35 * (1 - np.exp(-tt * 4))) / SR) * np.exp(-tt * 1.6)
    crack = hp(noise(.25), 1500) * env_exp(.25, .03)
    x = np.zeros(len(tt)); x += sub; x[:len(crack)] += crack * .5; th = lp(thump(.4, 55), 300); x[:len(th)] += th * .8
    return verb(norm(x), 1.6, .35) * v
def whoosh(d, v, up=True):
    tt = t_(d); f = np.linspace(500, 5000, len(tt)) if up else np.linspace(5000, 500, len(tt)); x = noise(d); y = np.zeros_like(x)
    for k in range(0, len(x), 480): y[k:k + 480] = bp(x[k:k + 480], f[k] * .6, f[k] * 1.6)
    return norm(y) * np.sin(np.pi * tt / d) ** 1.4 * v
def tick(v): d = .05; return norm(bp(noise(d), 2500, 7000) * env_exp(d, .004) + np.sin(2 * np.pi * 1900 * t_(d)) * env_exp(d, .006)) * v
def ring(v):   # an old phone bell trill
    d = .9; tt = t_(d); am = (np.sin(2 * np.pi * 22 * tt) > 0).astype(float); am = np.convolve(am, np.ones(200) / 200, 'same')
    return verb(norm((np.sin(2 * np.pi * 1500 * tt) + .6 * np.sin(2 * np.pi * 2260 * tt)) * am * np.exp(-tt * 2.2)), .8, .25) * v
def shimmer(v, d=1.4):
    tt = t_(d); return verb(sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / (.5 + .2 * i)) for i, f in enumerate([2093, 2637, 3136, 4186])) * np.minimum(1, tt / .01), 1.2, .4) * v / 3
def click(v): d = .04; return norm(bp(noise(d), 3000, 9000) * env_exp(d, .003) + np.sin(2 * np.pi * 2400 * t_(d)) * env_exp(d, .004)) * v
def scramble(d, v):   # data chatter while a headline decodes
    out = np.zeros(int(d * SR) + 2400); k = 0
    while k * .035 < d: c = tick(.6 + .4 * rng.random()); a = int(k * .035 * SR); out[a:a + len(c)] += c[:len(out) - a]; k += 1
    return out * v
def ding(v, f=1568): tt = t_(1.2); return verb(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) + .4 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 5), 1.0, .35) * v
def glitch(d, v): tt = t_(d); return norm(bp(noise(d), 800, 6000) * (np.sin(2 * np.pi * 37 * tt) > .2)) * v
fx = buf()
_add = add
def add(buf_, x, t, *a): return _add(buf_, x, t * TS, *a)
# —— the music: dark and cinematic, never happy: D minor (Dm – B♭ – Gm – A), low piano and pad chords, a deep sliding sub, a quiet D–C♯ tension motif, a soft ticking pulse ——
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
CHORDS = [[50, 53, 57, 62], [46, 50, 53, 58], [43, 50, 55, 58], [45, 49, 52, 57]]
ROOTS = [38, 34, 31, 33]
def padn(f, d, v):
    tt = t_(d); y = sum(np.sin(2 * np.pi * f * (1 + dt) * tt + p) for dt, p in [(-.003, 0), (.003, 1.7), (0, 3.1)]) / 3 + .25 * np.sin(4 * np.pi * f * tt)
    return y * np.minimum(1, tt / .6) * np.minimum(1, (d - tt) / .8) * v
def piano(f, d, v):
    tt = t_(d); y = np.sin(2 * np.pi * f * tt) + .45 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 3) + .15 * np.sin(6 * np.pi * f * tt) * np.exp(-tt * 5)
    return lp(y, 2200) * np.minimum(1, tt / .004) * np.exp(-tt * 1.1) * np.minimum(1, (d - tt) / .1) * v
def subn(f, d, v, slide_to=None):
    tt = t_(d); fq = np.full(len(tt), f)
    if slide_to: n = int(.18 * SR); fq[-n:] = np.linspace(f, slide_to, n)
    return lp(np.tanh(1.4 * np.sin(2 * np.pi * np.cumsum(fq) / SR)), 180) * np.minimum(1, tt / .01) * np.exp(-tt * .55) * np.minimum(1, (d - tt) / .06) * v
def tickp(v): d = .03; return bp(noise(d), 3000, 6000) * env_exp(d, .006) * v
def song(d):
    out = np.zeros(int(d * SR) + 2 * SR)
    def put(x, t): a = int(t * SR); n = min(len(x), len(out) - a); out[a:a + n] += x[:n]
    for b in range(int(d / BAR) + 1):
        t0 = b * BAR; k = b % 4; ch = CHORDS[k]
        for m in ch: put(padn(mtof(m), BAR + .4, .10), t0)
        put(piano(mtof(ch[0] + 12), BAR, .11), t0); put(piano(mtof(ch[2] + 12), BEAT * 2, .07), t0 + BEAT * 2)
        if b >= 1:
            put(subn(mtof(ROOTS[k]), BEAT * 2.4, .9), t0); put(subn(mtof(ROOTS[k]), BEAT * 1.4, .7, slide_to=mtof(ROOTS[(k + 1) % 4])), t0 + BEAT * 2.6)
            for q in range(8): put(tickp(.05 if q % 2 else .08), t0 + q * BEAT / 2)
        if b >= 2 and k in (0, 2):
            for q, m in enumerate([74, 73, 74]): put(piano(mtof(m), BEAT * 1.6, .05), t0 + BEAT * (1 + q))
    return verb(out[:int(d * SR)], 1.8, .3)
music = song(STORY + 1.0)
# dramatic pauses: the music drops to silence just before each big moment and comes back on the hit
PAUSES = [(7.75, 8.42), (13.85, 14.54), (16.75, 17.46), (36.05, 36.74), (40.05, 40.66), (46.0, 46.64), (54.15, 54.86)]
g = np.ones(len(music))
for a, b in PAUSES:
    ia, ib = int(a * TS * SR), int(b * TS * SR); fd = int(.15 * SR); g[ia:ia + fd] = np.minimum(g[ia:ia + fd], np.linspace(1, 0, fd)); g[ia + fd:ib] = 0
music *= g; fi, fo = int(1.0 * SR), int(1.2 * SR); music[:fi] *= np.linspace(0, 1, fi); music[-fo:] *= np.linspace(1, 0, fo)

# —— sound effects, each on its own moment of the animation ——
fx = buf()
for t in [1.5, 3.35, 9.1, 15.3, 18.9, 24.45, 46.3, 51.16]: add(fx, whoosh(.45, .16), t - .1, 1, 0)   # the blur-zoom changes of scene
# the game: the cursor clicks play, a ring goes out; the question decodes letter by letter
add(fx, click(.5), 0.62, 1, 0); add(fx, impact(.35), 0.67, 1, 0); add(fx, scramble(.6, .12), 1.55, 1, 0); add(fx, scramble(.6, .12), 2.26, 1, 0)
# brand 1 or 2: a tick as each page lights up; silence; then the check mark draws: a hit and a ding
for t in [5.20, 6.00, 11.08, 11.68]: add(fx, click(.35), t, 1, .2)
for tp in [8.42, 14.54]: add(fx, riser(.65, .22), tp - .65, 1, 0); add(fx, impact(.55), tp, 1, 0); add(fx, ding(.35), tp + .05, 1, 0); add(fx, whoosh(.5, .1, False), tp + .25, 1, .2)
# design principle decodes; silence; WHITESPACE lands; the frame draws round it
add(fx, scramble(.5, .1), 15.55, 1, 0); add(fx, riser(.7, .3), 16.76, 1, 0); add(fx, impact(.8), 17.46, 1, 0); add(fx, whoosh(.7, .12), 17.86, 1, 0); add(fx, shimmer(.18, 1.2), 18.4, 1, 0)
# the wireframe spreads out, then becomes the page and breathes
add(fx, whoosh(1.3, .12), 21.10, 1, .2); add(fx, shimmer(.2, 1.4), 23.6, 1, 0)
# the ring of light moves over the page
for t in [25.0, 29.42, 30.60]: add(fx, whoosh(.4, .12), t - .4, 1, .3)
# the page tilts away and flips into a card (a swoosh with the ghost trail); the ideas pop up over the head
add(fx, whoosh(.8, .25, False), 32.06, 1, -.2); add(fx, whoosh(.6, .22), 32.76, 1, .2); add(fx, impact(.3), 33.9, 1, 0)
for k in range(3): add(fx, ding(.12, 1568 * 2 ** (k * 4 / 12)), 34.6 + k * .3, 1, -.3 + .3 * k)
# into the tunnel: a rising rush; silence; out into the stall with a hit; products pop in one by one
add(fx, riser(.9, .4), 35.2, 1, 0); add(fx, whoosh(.9, .3), 35.95, 1, 0); add(fx, impact(.6), 36.74, 1, 0)
for k in range(12): add(fx, click(.16 + .04 * (k % 3)), 38.5 + k * .13, 1, -.5 + .09 * k)
# silence; the ROLEX logo with a deep hit; the camera dives into it; one watch appears; the row slides past, each one lit with a soft ding
add(fx, impact(.75), 40.66, 1, 0); add(fx, shimmer(.15, 1.4), 40.9, 1, 0); add(fx, riser(.5, .3), 41.6, 1, 0); add(fx, whoosh(.7, .35), 42.05, 1, 0); add(fx, impact(.4), 42.35, 1, 0)
add(fx, whoosh(.8, .12), 43.1, 1, .3)
for k in range(3): add(fx, ding(.14, 1319 * 2 ** (k * 2 / 12)), 44.1 + k * .69, 1, -.3 + .3 * k)
# silence; WHITESPACE glitches in; dotted lines run down; FIZIKAI TÉR lands; the cubes orbit
add(fx, glitch(.55, .35), 46.64, 1, 0); add(fx, impact(.45), 46.64, 1, 0); add(fx, scramble(.7, .08), 47.48, 1, 0); add(fx, impact(.35), 48.26, 1, 0); add(fx, whoosh(1.4, .1), 48.96, 1, 0)
# the shop comes in; a gold star lands; silence; the bars climb to the end
add(fx, impact(.4), 51.26, 1, 0); add(fx, ding(.3, 2093), 53.1, 1, .3); add(fx, riser(1.2, .35), 54.86, 1, 0); add(fx, impact(.5), 55.9, 1, 0); add(fx, shimmer(.25, 1.2), 55.95, 1, 0)
n0, n1 = int((STORY - .6) * SR), int((STORY + .1) * SR); fx[n0:n1] *= np.linspace(1, 0, n1 - n0)[:, None]; fx[n1:] = 0
sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from logo_sting import place_logo
# voice
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'refs/voiceover-hu-x1.10.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = compress(norm(np.frombuffer(raw, np.float32).astype(np.float64), .9), thr=.3, ratio=3); voice = buf(); add(voice, vo, 0, 1, 0)
# duck the effects a little under the voice
env = np.convolve(np.abs(voice[:, 0]), np.ones(2400) / 2400, 'same'); duck = 1 - .45 * np.clip(env / (env.max() * .25), 0, 1)
fxc = np.stack([compress(fx[:, c] * 2.0, thr=.15, ratio=2.5, att=.002, rel=.08) for c in range(2)], 1) * duck[:, None]
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
mus = np.zeros(N); mus[:len(music)] = music[:N]; mr = np.sqrt(np.mean(mus[int(4 * SR):int(STORY * SR)] ** 2)); mus *= (vr * .26 / max(mr, 1e-9)) * (1 - .35 * np.clip(env / (env.max() * .25), 0, 1))
mix = voice + fxc * (vr * 2.0 / max(fr, 1e-6)) + np.stack([mus, mus], 1); mix = place_logo(mix, STORY + .2, SR, vr, 0.0); mix = mix[:int(DUR * SR)]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)
mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - DUR) * SR), 2))])
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix', mix.shape[0] / SR, np.abs(mix).max())
