"""Sound for The Lemonade Sign: the supplied Hungarian voiceover and sound effects (no music).
Recorded CC0 sounds from sfx/ (see CREDITS) placed on the picture's events, a few synthesized ones (marker, pour, birds, cicadas, crickets).
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
STORY = 54.3
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
def chirp(v=1.0, f0=3600, d=.12):
    tt = t_(d); f = f0 + f0 * .5 * np.sin(np.pi * tt / d); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2 * v
def bird(v=.05):   # a little phrase of 2–5 chirps
    out = np.zeros(int(1.2 * SR)); f0 = 2800 + rng.random() * 2200
    for k in range(rng.integers(2, 6)): c = chirp(1, f0 * (1 + .15 * rng.standard_normal()), .06 + .06 * rng.random()); a = int(k * (.1 + .08 * rng.random()) * SR); out[a:a + len(c)] += c[:len(out) - a]
    return out * v
def cicadas(d, v):
    tt = t_(d); am = (.6 + .4 * np.sin(2 * np.pi * 47 * tt)) * (.7 + .3 * np.sin(2 * np.pi * .23 * tt + 1))
    return norm(bp(noise(d), 4200, 7600) * am) * v
def crickets(d, v):
    out = np.zeros(len(t_(d)))
    for k in range(3):
        f = 4300 + k * 450; per = .55 + .2 * k; tt = t_(d); gate = ((tt + k * .17) % per < .09) * (np.sin(2 * np.pi * 30 * tt) > 0)
        out += np.sin(2 * np.pi * f * tt) * gate * (.6 + .4 * k / 2)
    return lp(out, 7000) * v
def scribble(d, v=1.0, rate=9):   # a felt marker on paper: squeaky, in strokes
    tt = t_(d); am = np.abs(np.sin(np.pi * rate * tt + rng.random())) ** 1.5 * (.6 + .4 * rng.random(len(tt)) ** 4)
    return norm(bp(noise(d), 1800, 6500) * np.convolve(am, np.ones(240) / 240, 'same') + .15 * np.sin(2 * np.pi * (2400 + 300 * np.sin(2 * np.pi * 3 * tt)) * tt) * am) * v
def brush(v=1.0, d=.28): return lp(hp(noise(d), 1500), 7000) * np.sin(np.pi * t_(d) / d) ** 1.5 * v
def pour(d=.6, v=1.0):   # lemonade from the pitcher into a plastic cup, rising in pitch as it fills
    tt = t_(d); gl = (np.sin(2 * np.pi * (14 + 8 * tt / d) * tt) > .2).astype(float); gl = np.convolve(gl, np.ones(200) / 200, 'same')
    body = bp(noise(d), 500, 2600) * (.5 + .5 * gl) + .3 * np.sin(2 * np.pi * np.cumsum(500 + 700 * tt / d) / SR) * gl
    return norm(body) * np.minimum(1, tt / .04) * np.minimum(1, (d - tt) / .08) * v
def squeak(v=1.0, d=.38):   # a bicycle brake
    tt = t_(d); f = 2100 + 250 * np.sin(np.pi * tt / d) + 40 * np.sin(2 * np.pi * 23 * tt)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * bp(noise(d), 1500, 4000)) * np.sin(np.pi * tt / d) ** .7 * v
def plip(v=1.0): d = .18; tt = t_(d); return np.sin(2 * np.pi * np.cumsum(700 + 2200 * tt / d) / SR) * env_exp(d, .03) * v
def pop(v=1.0): d = .12; return norm(np.sin(2 * np.pi * np.cumsum(np.linspace(500, 1400, int(d * SR))) / SR) * env_exp(d, .04)) * v
def fizz(d, v): tt = t_(d); return hp(noise(d), 5000) * (rng.random(len(tt)) > .985) * v

fx = buf()
# —— beds: the summer afternoon (birds, cicadas, a breeze), the evening (crickets), the glass, the hot day ——
add(fx, fade(bed(37.6, 80, 600, .05), .6, .6), 0, 1)
add(fx, fade(cicadas(37.5, .022), 1.0, 1.2), 0, 1, .3)
t = .3
while t < 37:
    if not (3.1 <= t < 6.7 or 21.66 <= t < 23.45): add(fx, bird(.045 + .03 * rng.random()), t, 1, rng.random() * 1.4 - .7)
    t += .9 + rng.random() * 1.6
add(fx, fade(bed(45.85 - 37.6, 80, 500, .04), .5, .5), 37.6, 1)
add(fx, fade(crickets(45.85 - 38.6, .03), 1.2, .6), 38.6, 1, -.2)
add(fx, fade(bed(50.5 - 45.85, 60, 300, .035), .6, .2), 45.85, 1)
add(fx, fade(cicadas(STORY - 50.5, .04), .4, .6), 50.5, 1, .2)
add(fx, fade(fizz(52.36 - 50.5, .2), .1, .2), 50.5, 1)
add(fx, fade(bed(STORY - 52.36, 80, 600, .05), .2, .6), 52.36, 1)
for t in (52.6, 53.3): add(fx, bird(.06), t, 1, .4)
walla = np.zeros(int((STORY - 52.36) * SR))
for name, off in [('w2', 0), ('w5', .4)]: x = vox(name); a = int(off * SR); walla[a:a + len(x)] += x[:len(walla) - a]
add(fx, fade(lp(walla, 1500), .2, .5) * .12, 52.36, 1, -.1)

# —— footsteps: the boy's light and clear, the dad's heavier, the customers' soft ——
for k, e in enumerate(e for e in EVS if e['type'] == 'step'):
    who = e.get('who')
    if who == 'dad': x = mx(hp(S(pick('footstep_concrete_00', 5, k), 1.0), 120), lp(thump(.2, 90), 300) * .45)
    elif who == 'boy': x = hp(S(pick('footstep_concrete_00', 5, k), .7), 250)
    else: x = S(pick('footstep_concrete_00', 5, k), .38 * e.get('v', 1))
    add(fx, x, e['t'], 1, e.get('pan', 0) * .7)

# —— A–B: cups set down, the paper, the marker ——
for k, t in enumerate(HIT['cupDown']): add(fx, mx(S(pick('impactWood_light_00', 5, k), .4, 3000), click(.12, 1.2)), t, 1, .1)
add(fx, S('bookFlip2', .55), H1('paper'), 1, 0)
add(fx, mx(pop(.35), click(.3, .7)), H1('uncap'), 1, .2)
for a, b in (HIT['write1'], HIT['write2']): add(fx, scribble(b - a, .5, 9 if b - a > .9 else 7), a, 1, 0)
# —— C: the afternoon passing ——
add(fx, whoosh(4.2, .05), H1('timelapse'), 1, 0)
# —— D–E: the cups into the box, the door, the gate, a tap on the paper ——
add(fx, S('cloth2', .35), H1('sigh'), 1, 0)
add(fx, mx(S('impactSoft_medium_000', .4), click(.15, 1.1)), H1('stack'), 1, .2)
add(fx, mx(S('impactSoft_medium_002', .6), S('impactWood_light_002', .25, 1500)), H1('intoBox'), 1, .3)
add(fx, S('doorOpen_1', .55), H1('door'), 1, -.4)
add(fx, mx(S('creak2', .5), S('metalLatch', .45)), H1('gate'), 1, -.3)
add(fx, S('impactSoft_medium_001', .3), H1('tap'), 1, 0)
# —— F–H: the idea, the brush, the price tapped ——
add(fx, pop(.25), H1('bang'), 1, .1)
for k, t in enumerate(HIT['brush']): add(fx, mx(brush(.5), S(f'cloth{k % 4 + 1}', .25)), t, 1, 0)
add(fx, S('impactWood_light_003', .45, 3500), H1('tapPrice'), 1, .2)
# —— I: the cyclist, the pour, the drink, the coin ——
sp = S('bike_spokes', .3); add(fx, fade(np.tile(sp, 2)[:int(1.3 * SR)], .2, .3), H1('spokes'), 1, .5)
add(fx, fade(bp(noise(1.8), 150, 900) * .05, .3, .3), 30.5, 1, .4)
add(fx, S('bike_bell', .55), H1('bell'), 1, .4)
add(fx, squeak(.22), H1('brake'), 1, .2)
add(fx, S('footstep_concrete_002', .5), H1('footDown'), 1, .1)
add(fx, S('impactGlass_light_001', .35), H1('lift'), 1, -.1)
add(fx, mx(pour(.55, .5), S('bottle-shake-07', .25, 3000)), H1('pour'), 1, 0)
for k in range(2): add(fx, S(pick('impactGlass_light_00', 5, k + 2), .35), H1('ice') + k * .09, 1, 0)
add(fx, mx(S('impactGlass_light_000', .35), S('impactWood_light_001', .3, 2500)), H1('setDown'), 1, -.1)
add(fx, click(.12, 1.1), H1('cupPick'), 1, .1)
add(fx, S('impactSoft_medium_000', .25), H1('handOff'), 1, .2)
for k, t in enumerate(HIT['gulp']): add(fx, S(f'swallow-0{k * 2 + 1}', .55), t, 1, .2)
add(fx, verb(vox('g_ahh'), .3, .08) * .55, H1('ahh'), 1, .2)
add(fx, S('chip-lay-1', .4), H1('coinGive'), 1, .1)
add(fx, mx(S('handleCoins', .45), S('impactGlass_light_004', .15)), H1('coinTin'), 1, .1)
# —— J: the evening rush: pour after pour, coins, the last drop ——
for k, t in enumerate(HIT['pours']): add(fx, mx(pour(.42, .4), click(.08, 1.2)), t - .05, 1, 0)
for k, t in enumerate(HIT['tins']): add(fx, S('handleCoins2' if k % 2 else 'handleCoins', .35), t, 1, .2)
add(fx, plip(.25), H1('lastDrop'), 1, 0)
# —— K: counting the money, the boy's giggle ——
for k, t in enumerate(HIT['count']): add(fx, mx(S('chip-lay-1' if k % 2 else 'chips-collide-1', .45), click(.05, 2.2)), t, 1, .1)
add(fx, verb(pitch(vox('ow_hehe'), 1.28), .3, .06) * .55, H1('giggle'), 1, 0)
# —— L–N: the split, the glass becoming a cold drink, the hot day, the bloom ——
add(fx, whoosh(.6, .05), H1('split') - .1, 1, 0)
add(fx, mx(whoosh(.9, .08), verb(ding(.08), 1.2, .5)), H1('magic') - .05, 1, 0)
for k, t in enumerate(HIT['ices']): add(fx, verb(S(pick('impactGlass_light_00', 5, k), .5), .4, .2), t, 1, (k - 1) * .3)
add(fx, S('impactSoft_medium_001', .35), H1('lemon'), 1, -.3)
add(fx, click(.18, .8), H1('straw'), 1, .3)
add(fx, verb(pitch(vox('g_ahh'), .94), .3, .1) * .5, H1('finalAhh'), 1, -.2)
# the end (as locked in ANIMATION-STYLE.md): everything fades out with the picture, then only a soft airy swell as the logo appears
_n0, _n1 = int((STORY - .6) * SR), int((STORY + .1) * SR); fx[_n0:_n1] *= np.linspace(1, 0, _n1 - _n0)[:, None]; fx[_n1:] = 0
_d = 2.7; _tt = t_(_d); _env = np.minimum(1, _tt / .7) ** 2 * np.cos(np.clip((_tt - .7) / 2.0, 0, 1) * np.pi / 2) ** 2   # rises, then fades out slowly and smoothly
_air = lp(hp(noise(_d) * .5 + brown(_d) * .5, 400), 4000) * _env
add(fx, verb(norm(_air) * .06, 1.4, .3), STORY - .6, 1, 0)
# the time-lapse: the wall clock ticking fast under the whoosh
for k in range(int(4.4 / .1)): add(fx, mx(click(.07, 1.0 + (k % 2) * .25), lp(thump(.03, 900), 2500) * .2), H1('timelapse') + k * .1, 1, -.2)

# —— voice ——
vo_path = os.path.join(HERE, os.environ.get('VO', 'refs/voiceover-hu.mp3'))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.float32).astype(np.float64)
vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = buf(); add(voice, vo, 0, 1)

# —— mix: effects nearly as loud as the voice (a punchy bus), no music ——
fxc = np.stack([compress(fx[:, c] * 2.2, thr=.12, ratio=2.5, att=.002, rel=.06) for c in range(2)], 1)
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
mix = voice + fxc * (vr * 2.6 / max(fr, 1e-6))
print('voice rms', round(float(vr), 3), 'fx 99.7%', round(float(fr), 3))
end = int(DUR * SR); mix = mix[:end]; mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)   # a gentle bus squeeze, so the loudness target leaves headroom for the peaks
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
# 3.2 s of silence after the end: the muxer's decode check reads ~2.9 s short (the loudness filter's look-ahead); the mux cuts the audio to the picture (-shortest)
mix = np.concatenate([mix, np.zeros((int(3.2 * SR), 2))])
sf.write(os.path.join(HERE, 'out', os.environ.get('OUT', 'mix.wav')), mix.astype(np.float32), SR)
print('mix.wav', mix.shape[0] / SR, 's, peak', np.abs(mix).max())
