"""Sound for Branding Secret 1: David's voice (ElevenLabs v3, 1.18x) over a low dark pulse, with risers into the big moments,
impacts on the key words, whooshes on the transitions, a paper flip, a phone ring, a scroll and a stop tick. Writes out/mix.wav."""
import os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve, resample_poly
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, thump, compress, limit, add
DUR, STORY = 30.0, 28.4
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
fx = buf()
bed = pulse(STORY + .5); bed[:int(.8 * SR)] *= np.linspace(0, 1, int(.8 * SR)); bed[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))
add(fx, bed * .22, 0, 1, 0)
# the hook: a hit on "Ezt", a riser into "de én elmondom" and an impact; the phone rings
add(fx, impact(.5), 0.0, 1, 0); add(fx, riser(1.0, .35), 1.36, 1, 0); add(fx, impact(.75), 2.32, 1, 0); add(fx, ring(.12), 2.5, 1, .2)
# page curl into the feed: a real paper flip; the feed scrolling
add(fx, S('bookFlip2', .5), 3.25, 1, -.2); add(fx, whoosh(1.2, .08), 5.6, 1, .2)
# into the dark: riser, gold streak whoosh, impact on "világos"
add(fx, riser(.8, .35), 6.45, 1, 0); add(fx, whoosh(.5, .3), 7.15, 1, -.3); add(fx, impact(.65), 8.3, 1, 0)
# the poster: whoosh in, tick on "kinek"
add(fx, whoosh(.45, .22, False), 9.9, 1, .3); add(fx, tick(.25), 12.44, 1, .2)
# the question mark
add(fx, whoosh(.45, .22, False), 13.0, 1, -.3); add(fx, impact(.4), 13.1, 1, 0)
# the feed flies by and stops on the clear post
add(fx, whoosh(.5, .22), 15.2, 1, .3)
for k in range(4): add(fx, whoosh(.3, .1), 15.45 + k * .5, 1, .3)
add(fx, tick(.35), 17.6, 1, .2); add(fx, shimmer(.25, 1.0), 18.3, 1, .2)
# "és tényleg figyelnek rád": riser, impact on "rád"
add(fx, riser(.7, .35), 18.2, 1, 0); add(fx, whoosh(.5, .3), 18.8, 1, -.3); add(fx, impact(.7), 20.34, 1, 0)
# messy card to clear: whoosh in, riser, impact on "Elég", shimmer
add(fx, whoosh(.5, .25), 21.15, 1, .3); add(fx, riser(.9, .35), 22.6, 1, 0); add(fx, impact(.75), 23.45, 1, 0); add(fx, shimmer(.3), 23.6, 1, 0)
# the 23 logo: whoosh, a deep hit and shimmer
add(fx, whoosh(.6, .3), 25.3, 1, -.3); add(fx, impact(.6), 25.5, 1, 0); add(fx, shimmer(.25, 2.0), 25.6, 1, 0)
n0, n1 = int((DUR - 1.0) * SR), int(DUR * SR); fx[n0:n1] *= np.linspace(1, 0, n1 - n0)[:, None]; fx[n1:] = 0
# voice
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'refs/voiceover-hu-x1.18.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = compress(norm(np.frombuffer(raw, np.float32).astype(np.float64), .9), thr=.3, ratio=3); voice = buf(); add(voice, vo, 0, 1, 0)
# duck the effects a little under the voice
env = np.convolve(np.abs(voice[:, 0]), np.ones(2400) / 2400, 'same'); duck = 1 - .45 * np.clip(env / (env.max() * .25), 0, 1)
fxc = np.stack([compress(fx[:, c] * 2.0, thr=.15, ratio=2.5, att=.002, rel=.08) for c in range(2)], 1) * duck[:, None]
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
mix = voice + fxc * (vr * 2.4 / max(fr, 1e-6)); mix = mix[:int(DUR * SR)]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)
mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - DUR) * SR), 2))])
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix', mix.shape[0] / SR, np.abs(mix).max())
