"""Sound for Whitespace Game: David's Hungarian voice (ElevenLabs v3, 1.18x) over the reference video's own sound design.
The reference's sound design (measured from its music-and-effects stem) is recreated with our own synthesized booms, swooshes and digital ticks,
each placed on the same sentence moment of the Hungarian voice, with the same silences in between.
The soundtrack sits at the same level under the voice as in the reference. Then the locked 23 logo sound. Writes out/mix.wav."""
import os, subprocess, sys
import numpy as np
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import SR, compress, limit, norm
sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from logo_sting import place_logo
DUR, STORY = 59.4, 56.9
# (time in the reference, time in the Hungarian voice): the start of each sentence, and a few key words inside them
PAIRS = [(0.0, 0.0), (1.82, 1.58), (4.12, 3.44), (5.32, 4.56), (7.50, 6.76), (10.20, 9.14), (11.62, 10.32), (14.32, 12.52), (18.22, 15.36), (20.46, 17.46),
         (21.90, 18.92), (28.04, 23.66), (29.47, 24.56), (32.47, 26.30), (36.99, 30.60), (38.85, 33.06), (43.73, 36.74), (45.39, 38.60), (47.05, 40.68),
         (48.37, 41.64), (49.77, 42.30), (51.53, 44.10), (54.95, 46.40), (57.53, 48.96), (59.99, 51.26), (62.65, 54.26), (64.27, 55.90), (65.60, 57.23)]
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
# —— the recreated sound design: every event of the reference soundtrack (start, length, peak dB, spectral centre, low share, attack),
# measured from its music-and-effects stem, rebuilt with our own synthesized sounds and moved to the same moment of the Hungarian timeline ——
EVENTS = [(0.25,0.3,-8.8,238,.83,.1),(1.35,.15,-28.2,5429,.01,0),(1.8,.35,-35.4,7575,.02,0),(2.5,.05,-35.5,6805,.06,0),(2.65,.05,-35.4,6910,.07,0),(2.95,.05,-35.8,6496,.07,0),(3.05,.1,-35.9,7205,.04,0),(3.2,.2,-31.7,7131,.01,0),
  (4.2,1.65,-7.2,351,.73,.25),(6.25,.25,-18.7,557,.16,.15),(8.1,.25,-18.1,1355,.05,.05),(8.85,.45,-28.1,1642,.05,.1),(11.85,.25,-19.0,1212,.05,.05),(12.8,.25,-19.3,776,.11,.15),(15.4,.2,-19.0,544,.12,.1),(16.75,.5,-26.9,2266,.04,.1),
  (19.9,3.05,-9.7,296,.65,2.1),(23.35,.55,-19.9,1274,.52,.15),(24.65,.3,-22.1,905,.29,.15),(26.35,.3,-19.0,1221,.42,.2),(26.9,.1,-34.5,1067,.43,0),(28.35,.05,-35.2,6638,.08,0),(28.5,.05,-35.7,7069,.06,0),(28.6,.1,-35.6,7223,.03,0),
  (28.75,.35,-35.0,7570,.02,.3),(29.2,.05,-35.1,7464,.02,0),(29.3,.25,-27.4,7049,.01,.15),(30.35,.4,-28.7,7067,.01,.1),(34.1,.25,-28.1,6274,.02,.15),(34.55,.1,-24.4,4756,.01,0),(35.7,.05,-32.5,6478,.03,0),(37.7,.3,-27.8,6598,.02,.25),
  (39.55,.55,-25.0,2353,.3,.2),(40.35,.45,-24.5,740,.49,.2),(43.4,3.65,-9.7,310,.63,.55),(47.8,3.6,-6.3,274,.71,.15),(51.45,.15,-34.8,449,.84,0),(54.75,.75,-11.0,364,.78,.4),(55.55,.85,-10.3,519,.76,.45),(56.5,.05,-35.0,5476,.09,0),
  (56.65,.05,-28.2,7070,.01,0),(58.0,1.35,-8.4,749,.76,.35),(60.45,.8,-8.6,326,.78,.3),(61.4,.35,-15.4,576,.12,.05),(62.65,1.05,-8.9,569,.79,.5)]
from sfx import t_, env_exp, bp, lp, hp, noise
from scipy.signal import fftconvolve
rng = np.random.default_rng(7)
def to_hu(t):   # the reference time → our time (piecewise linear between the sentence anchors)
    for (o0, h0), (o1, h1) in zip(PAIRS, PAIRS[1:]):
        if o0 <= t <= o1: return h0 + (t - o0) * (h1 - h0) / (o1 - o0)
    return PAIRS[-1][1]
def verb(x, t60=1.6, wet=.35):
    n = int(t60 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = lp(ir, 5000) * .05
    return x + wet * fftconvolve(x, ir)[:len(x)]
def sub_boom(dur, att, cen):   # a deep cinematic boom: optional swell (the long attack), a falling sub, a little body, a long tail
    tail = max(1.2, dur + .8); d = att + tail; tt = t_(d); y = np.zeros(len(tt)); a = int(att * SR)
    if att > .3: sw = t_(att); y[:a] += bp(noise(att), 60, 900) * (sw / att) ** 3 * .6 + np.sin(2 * np.pi * np.cumsum(30 + 60 * sw / att) / SR) * (sw / att) ** 2 * .7
    bt = t_(tail); f0 = min(70, 40 + cen * .05); boom = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.2 * np.exp(-bt * 9))) / SR) * np.exp(-bt * 2.4 / tail) + .35 * lp(noise(tail), 220) * np.exp(-bt * 3.5)
    y[a:a + len(boom)] += boom[:len(y) - a]; return verb(y, 2.0, .3)
def swoosh(dur, cen):   # a soft mid whoosh or UI pop
    d = max(.12, dur + .15); tt = t_(d); f = np.linspace(cen * .5, cen * 1.6, len(tt)); x = noise(d); y = np.zeros_like(x)
    for k in range(0, len(x), 256): y[k:k + 256] = bp(x[k:k + 256], max(60, f[k] * .6), min(10000, f[k] * 1.5))
    y = y * np.sin(np.pi * tt / d) ** 1.3 + .3 * np.sin(2 * np.pi * cen * .5 * tt) * np.exp(-tt * 18); return verb(y, .8, .25)
def digital(dur, cen):   # tiny digital ticks and glitch
    d = max(.04, dur); tt = t_(d); x = hp(noise(d), 3500) * (np.sin(2 * np.pi * (25 + 40 * rng.random()) * tt) > -.2) * np.exp(-tt * (6 / d))
    return x + .25 * np.sin(2 * np.pi * min(6000, cen * .6) * tt) * np.exp(-tt * 60)
N = int(DUR * SR) + SR
music = np.zeros((N, 2))
for (st, dur, pk, cen, low, att) in EVENTS:
    if low > .5: x = sub_boom(dur, att, cen); at = st
    elif cen > 4000: x = digital(dur, cen); at = st
    else: x = swoosh(dur, cen); at = st
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (pk / 20); h = to_hu(at + (att if low > .5 else 0)) - (att if low > .5 else 0)   # a boom's hit lands where the reference's hit was
    a = int(max(0, h) * SR); n = min(len(x), N - a); pan = (rng.random() - .5) * .4 if low <= .5 else 0
    music[a:a + n, 0] += x[:n] * (1 - pan); music[a:a + n, 1] += x[:n] * (1 + pan)
f0, f1 = int((STORY - .7) * SR), int((STORY + .05) * SR); music[f0:f1] *= np.linspace(1, 0, f1 - f0)[:, None]; music[f1:] = 0   # the sound design fades with the picture into the end card
# the voice
vo = load(os.path.join(HERE, 'refs/voiceover-hu-x1.18.mp3')).mean(1); vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = np.zeros((N, 2)); voice[:len(vo), 0] = vo[:N]; voice[:len(vo), 1] = vo[:N]
# the reference's balance: its soundtrack sits 4.5 dB (RMS) under its voice; the same here
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); mr = np.sqrt(np.mean(music[:int(STORY * SR)] ** 2))
mix = voice + music * (vr * 0.599 / max(mr, 1e-9))
mix = place_logo(mix, STORY + .2, SR, vr, 0.9)   # the locked 23 logo sound on the end card
mix = mix[:int(DUR * SR)]; mix[-int(.5 * SR):] *= np.linspace(1, 0, int(.5 * SR))[:, None]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)
mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - DUR) * SR), 2))])
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix', mix.shape[0] / SR, np.abs(mix).max())
