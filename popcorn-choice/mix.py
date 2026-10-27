"""Sound for The Popcorn Choice: the supplied Hungarian voiceover and sound effects (no music).
Recorded CC0 sounds from sfx/ (see CREDITS) placed on the picture's events, a few synthesized ones (popping corn, the register bell, the lobby hum).
Writes out/mix.wav (48 kHz stereo). Run with the library's Python: $LIB/.venv/bin/python mix.py"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve, resample_poly
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, thump, ding, whoosh, compress, limit, add

ev = json.load(open(os.path.join(HERE, os.environ.get('EVENTS', 'events.json'))))
DUR = ev['dur']; EVS = ev['ev']
HIT = {}
for e in EVS: HIT.setdefault(e['type'], []).append(e['t'])
H1 = lambda k: HIT[k][0]
N = int(DUR * SR) + SR
rng = np.random.default_rng(23)
STORY = 48.7
def buf(): return np.zeros((N, 2))
def verb(x, t60=.7, wet=.25):
    n = int(t60 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = lp(ir, 5000) * .06
    return x + wet * fftconvolve(x, ir)[:len(x)]
def mx(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def fade(x, a=.3, b=.3): n = len(x); e = np.ones(n); ia, ib = min(n, int(a * SR)), min(n, int(b * SR)); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return x * e
def bed(d, lo, hi, v): return norm(bp(brown(d) * .5 + noise(d) * .5, lo, hi)) * v
def pitch(x, r): n = int(len(x) / r); return resample_poly(x, 100, int(100 * r)) if n > 10 else x

_cache = {}
def S(name, level=1.0, lowpass=None):
    if name not in _cache:
        a, sr = sf.read(os.path.join(HERE, 'sfx', name + ('' if '.' in name else '.ogg'))); a = a if a.ndim == 1 else a.mean(1)
        if sr != SR: a = resample_poly(a, SR, sr)
        _cache[name] = a / (np.abs(a).max() + 1e-9)
    x = _cache[name]; x = lp(x, lowpass) if lowpass else x
    return x * level
def vox(name):
    a, sr = sf.read(os.path.join(HERE, 'vox', name + '.wav')); a = a if a.ndim == 1 else a.mean(1)
    return resample_poly(a, SR, sr) if sr != SR else a
pick = lambda base, n, i: f'{base}{i % n}'

# —— synthesized pieces ——
def click(v=1.0, p=1.0): d = .05; return norm(hp(noise(d), 2000) * env_exp(d, .003) + np.sin(2 * np.pi * 1800 * p * t_(d)) * env_exp(d, .008)) * v
def pop(v=1.0): d = .12; return norm(np.sin(2 * np.pi * np.cumsum(np.linspace(500, 1400, int(d * SR))) / SR) * env_exp(d, .04)) * v
def kernel(v=1.0):   # one kernel popping: a short dry "pok"
    d = .06; tt = t_(d); f = 700 + 900 * rng.random()
    return norm(bp(noise(d), f, f * 3) * env_exp(d, .006) + .4 * np.sin(2 * np.pi * f * .6 * tt) * env_exp(d, .01)) * v
def popping(d, rate, v):   # a machine full of corn popping away
    out = np.zeros(int(d * SR) + SR // 10); t = 0.0
    while t < d: k = kernel(v * (.5 + .5 * rng.random())); a = int(t * SR); out[a:a + len(k)] += k[:len(out) - a]; t += rng.exponential(1 / rate)
    return out[:int(d * SR)]
def rustle(d, v): tt = t_(d); return norm(bp(noise(d), 1200, 6000) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 7 * tt)))) * np.sin(np.pi * tt / d) ** .5 * v
def sniff(v=1.0): d = .55; tt = t_(d); return norm(bp(noise(d), 900, 5000) * np.sin(np.pi * tt / d) ** 2 * (1 + .5 * np.sin(2 * np.pi * 5 * tt))) * v
def chime(f=1760, v=1.0, d=1.2):   # a small bright bell (the register, the "best" star)
    tt = t_(d); return sum(a * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt / tau) for m, a, tau in [(1, 1, .5), (2.01, .35, .25), (3.02, .12, .12)]) * np.minimum(1, tt / .003) * v

fx = buf()
# —— motion-graphics sound: no room, no chatter; every move has its own sound ——
def boing(v=1.0, f0=220, f1=520, d=.35): tt = t_(d); return np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * (1 - np.exp(-tt * 9))) / SR) * np.exp(-tt * 6) * np.minimum(1, tt / .005) * v
def stamp(v=1.0): return norm(mx(lp(thump(.25, 70), 400) * 1.0, bp(noise(.06), 600, 3000) * env_exp(.06, .01) * .7)) * v
def swish(d=.28, v=1.0, up=True):
    tt = t_(d); f = np.linspace(800, 4000, len(tt)) if up else np.linspace(4000, 800, len(tt)); x = noise(d); y = np.zeros_like(x)
    for k in range(0, len(x), 480): y[k:k + 480] = bp(x[k:k + 480], f[k] * .6, f[k] * 1.6)
    return norm(lp(y, 9000)) * np.sin(np.pi * tt / d) ** 1.5 * v
def roll(d=.36, v=1.0):   # the price counting up: fast rising ticks
    out = np.zeros(int(d * SR) + 2400); k = 0
    while k * .045 < d: c = click(1, 1 + k * .08); a = int(k * .045 * SR); out[a:a + len(c)] += c; k += 1
    return out * v
add(fx, fade(bed(STORY, 50, 300, .02), .5, .5), 0, 1)
for t in HIT['whips']: add(fx, swish(.3, .5), t - .08, 1, .3)
for t in HIT['punches']: add(fx, mx(lp(thump(.18, 90), 300) * .7, swish(.2, .25, False)), t - .02, 1, 0)
add(fx, mx(pop(.4), lp(thump(.12, 120), 400) * .4), H1('manIn'), 1, 0)
add(fx, mx(swish(.3, .35), pop(.3)), H1('ticket') - .05, 1, -.4)
add(fx, mx(pop(.4), boing(.2, 300, 700)), H1('bucketIn'), 1, .4)
for k, t in enumerate(HIT['kernels']): add(fx, popping(.5, 40, .4), t, 1, .4)
add(fx, sniff(.3), H1('sniff'), 1, .1)
for k, t in enumerate(HIT['slams']): add(fx, mx(stamp(.8), S(pick('impactWood_medium_00', 3, k), .5), popping(.25, 40, .2)), t, 1, (k - 1) * .5)
for k, t in enumerate(HIT['counts']): add(fx, roll(.36, .35), t, 1, 0)
for k, t in enumerate(HIT['stamps']): add(fx, mx(stamp(.9), chime(1568 + 300 * k, .08, .6)), t, 1, 0)
add(fx, mx(pop(.3), chime(2093, .1, .8)), H1('check'), 1, .3)
add(fx, verb(vox('ow_gasp'), .3, .08) * .6, H1('gasp'), 1, 0); add(fx, pop(.35), H1('bang'), 1, .3)
add(fx, swish(.4, .4), H1('arrow'), 1, .2); add(fx, mx(stamp(.6), pop(.3)), H1('chip'), 1, 0)
add(fx, boing(.5, 160, 640, .5), H1('grow'), 1, .3)
for k, t in enumerate(HIT['pulses']): add(fx, mx(pop(.16 * (1 + .15 * (k % 2))), click(.06, 1 + .3 * (k % 2))), t, 1, -.3 if k % 2 == 0 else .3)   # his eyes going small, large, small, large
add(fx, mx(pop(.4), S('impactSoft_medium_001', .5), boing(.25, 400, 250)), H1('drop'), 1, .2)
add(fx, fade(mx(popping(1.6, 90, .55), rustle(1.6, .15)), .05, .5), H1('burst'), 1, .2)
add(fx, verb(vox('ow_hehe'), .3, .08) * .55, H1('hehe'), 1, 0)
add(fx, click(.3, 1.3), H1('key'), 1, -.3)
add(fx, mx(verb(chime(1568, .3) + chime(2349, .2), .6, .3), S('handleCoins', .5), stamp(.5)), H1('ching'), 1, -.3)
for e in EVS:
    if e['type'] == 'step': add(fx, lp(S('footstep_concrete_001', .45), 3500), e['t'], 1, e.get('pan', 0) * .7)
add(fx, mx(swish(.5, .3), chime(1175, .05, 1.0)), H1('door'), 1, .5)
add(fx, mx(lp(thump(.4, 60), 250), boing(.35, 300, 140, .6)), H1('qdrop'), 1, 0)
add(fx, mx(S('creak1', .4), swish(.3, .2)), H1('strings'), 1, 0)
add(fx, mx(S('creak2', .5), click(.2, .8)), H1('tug'), 1, 0)
add(fx, verb(chime(1319, .08) + chime(1760, .06), .8, .3), H1('decoy'), 1, 0)
add(fx, boing(.45, 180, 560, .45), H1('big'), 1, .4)
add(fx, mx(stamp(.6), chime(2093, .12, .8)), H1('star'), 1, .4)
for k, t in enumerate(HIT['people']): add(fx, pop(.35 * (1 + .05 * k)), t, 1, -.6 + .4 * k)
for k, t in enumerate(HIT['buckets']): add(fx, mx(pop(.3), popping(.15, 50, .25)), t, 1, -.6 + .4 * k)
for k, t in enumerate(HIT['rise']): add(fx, mx(stamp(.55), boing(.15, 200 + 60 * k, 420 + 80 * k)), t, 1, -.5 + .5 * k)
add(fx, click(.2, 1.2), H1('point'), 1, -.3)
add(fx, mx(verb(chime(1568, .2) + chime(2093, .15) + chime(2637, .1), .9, .35), stamp(.6)), H1('win'), 1, .4)

# the end (as locked in ANIMATION-STYLE.md): everything fades out with the picture, then only the locked logo sound
_n0, _n1 = int((STORY - .6) * SR), int((STORY + .1) * SR); fx[_n0:_n1] *= np.linspace(1, 0, _n1 - _n0)[:, None]; fx[_n1:] = 0
sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from logo_sting import place_logo

# —— voice ——
vo_path = os.path.join(HERE, os.environ.get('VO', 'refs/voiceover-hu-x1.25.mp3'))   # the voice at 1.25×, pitch kept
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.float32).astype(np.float64)
vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = buf(); add(voice, vo, 0, 1)

# —— mix: effects close to the voice (a punchy bus); no music ——
fxc = np.stack([compress(fx[:, c] * 2.2, thr=.12, ratio=2.5, att=.002, rel=.06) for c in range(2)], 1)
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
mix = voice + fxc * (vr * 2.6 / max(fr, 1e-6))
mix = place_logo(mix, STORY + .2, SR, vr)   # the locked logo sound, after the effects bus so it is the same level in every film
print('voice rms', round(float(vr), 3), 'fx 99.7%', round(float(fr), 3))
end = int(DUR * SR); mix = mix[:end]; mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)   # a gentle bus squeeze, so the loudness target leaves headroom for the peaks
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
# 3.2 s of silence after the end: the muxer's decode check reads ~2.9 s short (the loudness filter's look-ahead); the mux cuts the audio to the picture (-shortest)
mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - DUR) * SR), 2))])   # short films: enough silence that the check's 5% tolerance covers the look-ahead
sf.write(os.path.join(HERE, 'out', os.environ.get('OUT', 'mix.wav')), mix.astype(np.float32), SR)
print('mix.wav', mix.shape[0] / SR, 's, peak', np.abs(mix).max())
