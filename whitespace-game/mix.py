"""Sound for Whitespace Game: David's voice (ElevenLabs v3, 1.18x) over a low dark pulse, with risers into the big moments,
impacts on the key words, whooshes on the transitions, a paper flip, a phone ring, a scroll and a stop tick. Writes out/mix.wav."""
import os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve, resample_poly
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, thump, compress, limit, add
DUR, STORY = 59.4, 56.9
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
def pulse(d, bpm=96):   # the dark bed: a soft low kick on every beat and a deep drone, filtered
    out = np.zeros(int(d * SR)); step = 60 / bpm; k = lp(thump(.35, 50), 180)
    for i in range(int(d / step)): a = int(i * step * SR); out[a:a + len(k)] += k[:len(out) - a] * (1 if i % 2 == 0 else .55)
    tt = t_(d); drone = lp(np.sign(np.sin(2 * np.pi * 55 * tt)) * .3 + np.sign(np.sin(2 * np.pi * 55.4 * tt)) * .3, 220) * (.7 + .3 * np.sin(2 * np.pi * .25 * tt))
    return norm(out * .8 + drone * .5)

def click(v): d = .04; return norm(bp(noise(d), 3000, 9000) * env_exp(d, .003) + np.sin(2 * np.pi * 2400 * t_(d)) * env_exp(d, .004)) * v
def scramble(d, v):   # data chatter while a headline decodes
    out = np.zeros(int(d * SR) + 2400); k = 0
    while k * .035 < d: c = tick(.6 + .4 * rng.random()); a = int(k * .035 * SR); out[a:a + len(c)] += c[:len(out) - a]; k += 1
    return out * v
def ding(v, f=1568): tt = t_(1.2); return verb(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) + .4 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 5), 1.0, .35) * v
def glitch(d, v): tt = t_(d); return norm(bp(noise(d), 800, 6000) * (np.sin(2 * np.pi * 37 * tt) > .2)) * v
fx = buf()
# —— the music: a soft lo-fi groove at 90 BPM in A minor (Am9 – Fmaj7 – Cmaj7 – G6): electric piano, round bass, light drums, a quiet arpeggio ——
BPM = 90; BEAT = 60 / BPM; BAR = 4 * BEAT
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 59, 64, 67], [55, 59, 62, 64, 67]]   # Am9, Fmaj7, Cmaj7, G6
ROOTS = [45, 41, 48, 43]
def epiano(f, d, v):   # a warm FM electric piano note
    tt = t_(d); I = 1.6 * np.exp(-tt * 6); y = np.sin(2 * np.pi * f * tt + I * np.sin(2 * np.pi * f * tt)) + .2 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 3)
    env = np.minimum(1, tt / .006) * np.exp(-tt * 1.6) * np.minimum(1, (d - tt) / .08); return y * env * v
def bassn(f, d, v): tt = t_(d); y = np.tanh(1.6 * np.sin(2 * np.pi * f * tt)) + .3 * np.sin(2 * np.pi * 2 * f * tt); return lp(y, 400) * np.minimum(1, tt / .01) * np.exp(-tt * 1.4) * np.minimum(1, (d - tt) / .05) * v
def kick(v): d = .45; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(120 * np.exp(-tt * 22) + 46) / SR) * np.exp(-tt * 7) * v
def snare(v): d = .3; tt = t_(d); return verb(lp(bp(noise(d), 1200, 7000) * np.exp(-tt * 16) * .8 + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 22) * .5, 6000), .6, .25) * v
def hat(v): d = .06; return hp(noise(d), 7000) * env_exp(d, .015) * v
def pluck(f, v): d = .5; tt = t_(d); return (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 9) * np.minimum(1, tt / .003) * v
def song(d):
    out = np.zeros(int(d * SR) + SR); put = lambda x, t: (lambda a: out.__setitem__(slice(a, a + len(x)), out[a:a + len(x)] + x[:len(out) - a]))(int(t * SR))
    nbars = int(d / BAR) + 1
    for b in range(nbars):
        t0 = b * BAR; ch = CHORDS[b % 4]; rt = ROOTS[b % 4]; groove = b >= 2
        for m in ch: put(epiano(mtof(m), BAR * .62, .16), t0); 
        for m in ch[1:4]: put(epiano(mtof(m + 12), BEAT * 1.2, .06), t0 + BEAT * 2.5)
        if groove:
            put(bassn(mtof(rt), BEAT * 1.6, .55), t0); put(bassn(mtof(rt), BEAT * .7, .4), t0 + BEAT * 2); put(bassn(mtof(rt + 7), BEAT * .6, .35), t0 + BEAT * 3.5)
            for k in (0, 2.5): put(kick(.75), t0 + k * BEAT)
            for k in (1, 3): put(snare(.32), t0 + k * BEAT)
            for k in range(8): put(hat(.10 if k % 2 == 0 else .06), t0 + k * BEAT / 2 + (0.03 if k % 2 else 0))
            if b % 4 in (2, 3):
                for k in range(8): put(pluck(mtof([69, 72, 76, 79, 81, 79, 76, 72][k] + (0 if b % 4 == 2 else -2)), .05), t0 + k * BEAT / 2)
    return out[:int(d * SR)]
music = song(STORY + 1.0); fi, fo = int(1.0 * SR), int(2.2 * SR); music[:fi] *= np.linspace(0, 1, fi); music[-fo:] *= np.linspace(1, 0, fo)
music = lp(music, 9000)
for t in [1.5, 3.35, 9.1, 15.3, 18.9, 24.45, 32.9, 40.78, 46.3, 51.16]: add(fx, whoosh(.45, .18), t - .1, 1, 0)
# the game: click on play; the question decodes
add(fx, click(.5), 0.62, 1, 0); add(fx, impact(.35), 0.67, 1, 0); add(fx, scramble(.6, .12), 1.55, 1, 0); add(fx, scramble(.6, .12), 2.26, 1, 0)
# brand 1 or 2: a soft tick on each, a riser into the answer, a ding with the check
for t in [5.20, 6.00, 11.08, 11.68]: add(fx, click(.35), t, 1, .2)
for tp in [8.42, 14.54]: add(fx, riser(.6, .25), tp - .6, 1, 0); add(fx, ding(.35), tp, 1, 0); add(fx, impact(.4), tp, 1, 0)
# design principle: decode; WHITESPACE lands; the frame draws
add(fx, scramble(.5, .1), 15.55, 1, 0); add(fx, riser(.9, .3), 16.56, 1, 0); add(fx, impact(.7), 17.46, 1, 0); add(fx, shimmer(.2, 1.2), 17.86, 1, 0)
# the wireframe spreads out; breathing
add(fx, whoosh(1.2, .12), 21.10, 1, .2); add(fx, shimmer(.18, 1.2), 23.66, 1, 0)
# the ring of light moves; the flood of information falls away
for t in [25.08, 29.42, 30.60, 31.86]: add(fx, whoosh(.35, .12), t - .4, 1, .3)
add(fx, whoosh(.8, .15, False), 31.86, 1, 0)
# the 3D card; into the tunnel; the market stall fills up
add(fx, riser(1.0, .3), 35.8, 1, 0); add(fx, impact(.55), 36.74, 1, 0)
for k in range(8): add(fx, click(.18), 38.60 + k * .18, 1, -.4 + .1 * k)
# the watch shop: a soft shimmer, the carousel turns, spotlights
add(fx, shimmer(.22, 1.4), 40.98, 1, 0); add(fx, whoosh(1.0, .1), 42.66, 1, 0)
for k in range(3): add(fx, ding(.12, 1319 * 2 ** (k * 2 / 12)), 44.38 + k * .7, 1, -.3 + .3 * k)
# whitespace glitches in; the dotted lines; the cubes orbit
add(fx, glitch(.5, .25), 46.64, 1, 0); add(fx, scramble(.6, .08), 47.48, 1, 0); add(fx, impact(.35), 48.26, 1, 0); add(fx, whoosh(1.2, .1), 48.96, 1, 0)
# the shop; the star of value; the bars climb
add(fx, impact(.4), 51.26, 1, 0); add(fx, ding(.3, 2093), 53.10, 1, .3); add(fx, riser(1.4, .35), 54.86, 1, 0); add(fx, shimmer(.25, 1.0), 55.68, 1, 0)
n0, n1 = int((STORY - .6) * SR), int((STORY + .1) * SR); fx[n0:n1] *= np.linspace(1, 0, n1 - n0)[:, None]; fx[n1:] = 0
sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from logo_sting import place_logo
# voice
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'refs/voiceover-hu-x1.18.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = compress(norm(np.frombuffer(raw, np.float32).astype(np.float64), .9), thr=.3, ratio=3); voice = buf(); add(voice, vo, 0, 1, 0)
# duck the effects a little under the voice
env = np.convolve(np.abs(voice[:, 0]), np.ones(2400) / 2400, 'same'); duck = 1 - .45 * np.clip(env / (env.max() * .25), 0, 1)
fxc = np.stack([compress(fx[:, c] * 2.0, thr=.15, ratio=2.5, att=.002, rel=.08) for c in range(2)], 1) * duck[:, None]
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
mus = np.zeros(N); mus[:len(music)] = music[:N]; mr = np.sqrt(np.mean(mus[int(4 * SR):int(STORY * SR)] ** 2)); mus *= (vr * .22 / max(mr, 1e-9)) * (1 - .35 * np.clip(env / (env.max() * .25), 0, 1))
mix = voice + fxc * (vr * 2.0 / max(fr, 1e-6)) + np.stack([mus, mus], 1); mix = place_logo(mix, STORY + .2, SR, vr, 0.9); mix = mix[:int(DUR * SR)]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)
mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - DUR) * SR), 2))])
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix', mix.shape[0] / SR, np.abs(mix).max())
