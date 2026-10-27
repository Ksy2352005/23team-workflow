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
STORY = 60.7
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
# —— beds: the lobby (a low hum of people, the air), a film rumbling faintly behind the doors, the machine popping ——
add(fx, fade(bed(STORY, 70, 500, .05), .6, .6), 0, 1)
add(fx, fade(lp(bed(STORY, 40, 160, .03), 200), 1, 1), 0, 1, .4)
add(fx, fade(popping(STORY, 6, .05), .4, .4), 0, 1, .45)
w = np.zeros(int(STORY * SR))
for k, (name, off) in enumerate([('w1', 1), ('w3', 5), ('w5', 11), ('w2', 18), ('w4', 26), ('w6', 33), ('w1', 41), ('w3', 48), ('w5', 54)]): x = vox(name); a = int(off * SR); w[a:a + len(x)] += x[:len(w) - a]
add(fx, fade(lp(w, 1300) * .07, .5, .5), 0, 1, -.3)

# —— footsteps on the carpet: his soft but clear, the others' softer ——
for k, e in enumerate(e for e in EVS if e['type'] == 'step'):
    x = lp(S(pick('footstep_concrete_00', 5, k), .55 if e.get('who') == 'man' else .3), 2200)
    add(fx, x, e['t'], 1, e.get('pan', 0) * .7)

add(fx, sniff(.22), H1('sniff'), 1, -.2)
add(fx, verb(vox('ow_hum'), .3, .08) * .45, H1('mmm'), 1, -.1)   # a craving "mmm"
for k, t in enumerate(HIT['sizes']): add(fx, mx(pop(.25 * (1 + k * .1)), S('impactSoft_medium_001', .25)), t, 1, .2)
for k, t in enumerate(HIT['flips']): add(fx, mx(S(f'bookFlip{k % 3 + 1}', .55), click(.12, 1.2)), t - .04, 1, (k - 1) * .4)
add(fx, pop(.2), H1('think'), 1, -.1)
add(fx, verb(vox('ow_gasp'), .3, .08) * .55, H1('gasp'), 1, -.1)   # he sees it
add(fx, whoosh(.45, .05), H1('arrow'), 1, .2)
add(fx, mx(pop(.3), chime(2093, .08, .8)), H1('chip'), 1, .2)
add(fx, mx(pop(.25), S('impactSoft_medium_000', .3)), H1('big'), 1, .3)
for k, t in enumerate(HIT['eyes']): add(fx, click(.06, 1.0 + .1 * k), t, 1, .2 * (-1) ** k)
add(fx, mx(click(.25, .9), pop(.25)), H1('choose'), 1, .1)
add(fx, S('impactSoft_medium_002', .4), H1('take'), 1, .5)
add(fx, fade(mx(popping(1.3, 70, .35), rustle(1.3, .12)), .1, .3), H1('fill'), 1, .5)
add(fx, S('impactSoft_medium_001', .4), H1('handOff'), 1, -.1)
add(fx, verb(vox('ow_hehe'), .3, .08) * .5, H1('hehe'), 1, -.1)   # joy, the bucket in his arms
add(fx, click(.2, 1.3), H1('key'), 1, .1)
add(fx, mx(verb(chime(1568, .18) + chime(2349, .12), .6, .3), S('handleCoins', .35), lp(bp(noise(.25), 300, 2000) * np.sin(np.pi * t_(.25) / .25) * .15, 3000)), H1('ching'), 1, .1)
add(fx, S('doorOpen_2', .45), H1('door'), 1, .5)
add(fx, lp(whoosh(.9, .05), 900), H1('hush'), 1, 0)
add(fx, pop(.25), H1('qmark'), 1, .3)
add(fx, verb(chime(1319, .05) + chime(1760, .04), .8, .3), H1('decoy'), 1, 0)
add(fx, mx(S('bookPlace1', .4), click(.1, 1.1)), H1('nudge'), 1, 0)
add(fx, mx(pop(.3), verb(chime(2093, .07), .8, .3)), H1('best'), 1, .3)
add(fx, pop(.18), H1('best2'), 1, .3)
add(fx, S('impactSoft_medium_001', .35), H1('give1'), 1, -.1)
add(fx, verb(chime(1760, .05), 1.0, .4), H1('glow'), 1, .2)

# the end (as locked in ANIMATION-STYLE.md): everything fades out with the picture, then only a soft airy swell as the logo appears
_n0, _n1 = int((STORY - .6) * SR), int((STORY + .1) * SR); fx[_n0:_n1] *= np.linspace(1, 0, _n1 - _n0)[:, None]; fx[_n1:] = 0
_d = 2.7; _tt = t_(_d); _env = np.minimum(1, _tt / .7) ** 2 * np.cos(np.clip((_tt - .7) / 2.0, 0, 1) * np.pi / 2) ** 2   # rises, then fades out slowly and smoothly
_air = lp(hp(noise(_d) * .5 + brown(_d) * .5, 400), 4000) * _env
add(fx, verb(norm(_air) * .06, 1.4, .3), STORY - .6, 1, 0)

# —— voice ——
vo_path = os.path.join(HERE, os.environ.get('VO', 'refs/voiceover-hu.mp3'))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.float32).astype(np.float64)
vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = buf(); add(voice, vo, 0, 1)

# —— mix: effects close to the voice (a punchy bus), a step lower in the busy second half; no music ——
fxc = np.stack([compress(fx[:, c] * 2.2, thr=.12, ratio=2.5, att=.002, rel=.06) for c in range(2)], 1)
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
tg = np.arange(len(fxc)) / SR; fxc = fxc * (1 - .3 * np.clip((tg - 30) / 2, 0, 1))[:, None]
mix = voice + fxc * (vr * 2.6 / max(fr, 1e-6))
print('voice rms', round(float(vr), 3), 'fx 99.7%', round(float(fr), 3))
end = int(DUR * SR); mix = mix[:end]; mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)   # a gentle bus squeeze, so the loudness target leaves headroom for the peaks
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
# 3.2 s of silence after the end: the muxer's decode check reads ~2.9 s short (the loudness filter's look-ahead); the mux cuts the audio to the picture (-shortest)
mix = np.concatenate([mix, np.zeros((int(3.2 * SR), 2))])
sf.write(os.path.join(HERE, 'out', os.environ.get('OUT', 'mix.wav')), mix.astype(np.float32), SR)
print('mix.wav', mix.shape[0] / SR, 's, peak', np.abs(mix).max())
