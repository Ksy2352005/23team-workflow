"""Sound for Story 23 (A nyugalom bőröndje): the supplied Hungarian voiceover and sound effects (no music).
Recorded CC0 sounds from sfx/ (see CREDITS) placed on the picture's events, a few synthesized ones (swipes, pops, a bell, a rising tone, chimes).
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
STORY = 51.2
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
def scribble(d, v=1.0, rate=9):   # a marker on the cup: squeaky strokes
    tt = t_(d); am = np.abs(np.sin(np.pi * rate * tt + rng.random())) ** 1.5 * (.6 + .4 * rng.random(len(tt)) ** 4)
    return norm(bp(noise(d), 1800, 6500) * np.convolve(am, np.ones(240) / 240, 'same') + .15 * np.sin(2 * np.pi * (2400 + 300 * np.sin(2 * np.pi * 3 * tt)) * tt) * am) * v
def coin_spin(d, v):   # a coin spinning through the air: a fast shimmering ring
    tt = t_(d); return np.sin(2 * np.pi * 3300 * tt) * (.5 + .5 * np.sin(2 * np.pi * 22 * tt)) * np.exp(-tt * 2) * v
def shimmer(v=1.0, d=.9): return mx(chime(2637, .5, d), chime(3136, .35, d)) * v
def shopbell(v=1.0): return verb(mx(chime(2349, 1, 1.2), chime(2793, .6, 1.0), chime(3136, .35, .8)), .9, .35) * v   # the little bell over the door
def chalk(d, v):   # chalk squeaking on the board, in short strokes
    tt = t_(d); am = (np.sin(2 * np.pi * 5 * tt) > -.2).astype(float) * (.6 + .4 * rng.random(len(tt)) ** 4); am = np.convolve(am, np.ones(400) / 400, 'same')
    return norm(bp(noise(d), 2500, 9000) * am + .2 * np.sin(2 * np.pi * (3200 + 400 * np.sin(2 * np.pi * 4 * tt)) * tt) * am) * v
def wipe(d, v): tt = t_(d); return norm(bp(noise(d), 600, 4000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 3 * tt)))) * np.sin(np.pi * tt / d) ** .5 * v   # a cloth rubbing the board
def sizzle(d, v): tt = t_(d); return norm(hp(noise(d), 3500) * (rng.random(len(tt)) < .3)) * np.exp(-tt * 3) * v   # the chili's heat: a little fizz
def crinkle(d, v): tt = t_(d); am = (rng.random(len(tt)) < .02).astype(float); am = np.convolve(am, np.exp(-np.arange(300) / 60), 'same'); return norm(bp(noise(d), 1500, 8000) * (.3 + am)) * np.sin(np.pi * tt / d) ** .5 * v   # brown paper folding
def spider(d, v): tt = t_(d); return np.sin(2 * np.pi * np.cumsum(2400 - 900 * tt / d) / SR) * .15 * np.sin(np.pi * tt / d) * v   # a thin thread spinning down
def fire(d, v):   # the oven's fire: a soft roar with crackles
    tt = t_(d); cr = (rng.random(len(tt)) < .004).astype(float); cr = np.convolve(cr, np.exp(-np.arange(200) / 30), 'same')
    return norm(lp(brown(d), 500) * .8 + bp(noise(d), 2000, 7000) * cr * 1.5) * np.minimum(1, tt / .4) * np.minimum(1, (d - tt) / .4) * v
def rise(d, v): tt = t_(d); return np.sin(2 * np.pi * np.cumsum(np.linspace(330, 880, len(tt))) / SR) * np.sin(np.pi * tt / d) * v   # a rising tone as the line draws
def tick(v=1.0, p=1.0): d = .04; return norm(bp(noise(d), 2500 * p, 6000 * p) * env_exp(d, .004)) * v
def tap(v=1.0): return mx(click(v, 1.4), lp(thump(.05, 200), 900) * v * .3)   # a finger tapping the screen
add(fx, fade(bed(STORY, 50, 300, .02), .5, .5), 0, 1)
for t in HIT['whips']: add(fx, lp(swish(.7, .16), 3500), t - .05, 1, 0)   # a soft whoosh under each change of shot
for t in HIT['kicks']: add(fx, lp(thump(.12, 80), 300) * .1, t, 1, 0)
def steps(t0, n, gap=.27, v=.09, pan=0, kind='footstep_wood_00'):
    for k in range(n): add(fx, lp(S(pick(kind, 5, k), v), 3500), t0 + k * gap, 1, pan)
def beep(v=1.0, f=1320): tt = t_(.12); return np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / .005) * np.exp(-tt * 18) * v
def ping(v=1.0): return verb(mx(beep(1, 1760), np.concatenate([np.zeros(int(.09 * SR)), beep(.8, 2349)])), .6, .3) * v   # the tracker app finding the case
def hall(d, v): return fade(lp(bp(noise(d), 200, 2500), 2500) * v, .4, .6)   # the airport hall's murmur
def engine(d, v): tt = t_(d); return fade(lp(brown(d), 300) * (1 + .2 * np.sin(2 * np.pi * .7 * tt)) * v, .5, .5)
def rolling(d, v): tt = t_(d); return fade(norm(lp(bp(noise(d), 100, 900), 900) * (1 + .5 * np.sin(2 * np.pi * 9 * tt))) * v, .2, .3)   # suitcase wheels / the belt rumbling
# airport: the hall; questions pop over the travellers
add(fx, hall(5.9, .02), 0, 1, 0); add(fx, rolling(2.0, .025), .2, 1, .4)
for k, t in enumerate(HIT['again']): add(fx, mx(pop(.08), boing(.05, 260, 380, .3)), t, 1, -.5 + k)
add(fx, mx(pop(.1), boing(.06, 240, 360, .35)), H1('fear'), 1, 0)
# the hold: engine drone; cases slide and bump; a crack; a question
add(fx, engine(5.4, .05), 5.9, 1, 0)
for k in range(5): add(fx, S(pick('impactSoft_medium_00', 3, k), .07), H1('cases') + k * .7, 1, -.4 + .2 * k)
add(fx, mx(S('impactPlate_light_003', .1), stamp(.08)), H1('hold'), 1, -.3); add(fx, mx(S('impactGlass_light_002', .07), boing(.05, 280, 170, .35)), H1('safe'), 1, .2); add(fx, mx(pop(.08), boing(.06, 260, 380, .3)), H1('safe') + .1, 1, .2)
# the new case: lands; a question; something different lights up
add(fx, mx(S('impactWood_light_002', .09), pop(.06)), H1('decide') - .3, 1, 0); add(fx, mx(pop(.08), boing(.05, 260, 380, .3)), H1('different') - .2, 1, 0); add(fx, verb(mx(shimmer(.1, 1.2), chime(2093, .05, 1.0)), .9, .35), H1('different'), 1, 0)
# track: the chip clicks in; the signal pulses; the phone; the pin drops on the map
add(fx, mx(S('metalClick', .1), swish(.3, .05)), H1('built') + .4, 1, -.4)
for k in range(4): add(fx, beep(.04, 1320), H1('system') + k * 1.1, 1, -.4)
add(fx, pop(.1), H1('phone') - .2, 1, .4); add(fx, mx(ping(.07), pop(.06)), H1('where'), 1, .4)
# the ad idea: the icons crossed; a clapper; the screen opens
add(fx, mx(swish(.25, .05), click(.06, .8)), H1('notonly'), 1, -.3); add(fx, mx(swish(.25, .05), click(.06, .8)), H1('notonly') + .2, 1, .3)
add(fx, mx(S('impactWood_light_000', .12), click(.08, .7)), H1('familiar') - .2, 1, -.5); add(fx, lp(swish(.6, .1), 4000), H1('familiar'), 1, 0)
# the baggage belt: it rumbles; cases go by; the clock ticks; the worry
add(fx, rolling(4.3, .035), 26.9, 1, .2); add(fx, hall(4.3, .015), 26.9, 1, 0)
for k in range(10): add(fx, tick(.05, .8 + .1 * (k % 2)), H1('belt') + k * .3, 1, .5)
add(fx, mx(pop(.1), boing(.06, 260, 360, .4)), H1('notyet'), 1, -.3)
# the phone: out of the pocket; the map; found
add(fx, mx(S('cloth2', .08), pop(.06)), H1('takeout'), 1, .2); add(fx, mx(tap(.05), beep(.03, 1100)), H1('check'), 1, .3); add(fx, mx(ping(.08), chime(2349, .04, .6)), H1('whereis'), 1, .3)
# not the material or the wheels: crossed; the worry shrinks; the gold case
for k, key in enumerate(['material', 'wheels']): add(fx, pop(.08), H1(key) - .2, 1, -.4 + .8 * k); add(fx, mx(swish(.25, .05), click(.06, .8)), H1(key) + .15, 1, -.4 + .8 * k)
add(fx, mx(pop(.08), lp(thump(.2, 70), 300) * .3), H1('butabout') - .2, 1, 0); add(fx, mx(swish(.8, .08, False), rise(.6, .02)), H1('smaller') - .2, 1, 0); add(fx, mx(pop(.1), chime(1568, .04, .5)), H1('smaller') + .4, 1, 0)
# the lesson: the feature list crossed; "+ Ft"; the worry flies off; a heart
add(fx, hall(9.9, .012), 41.3, 1, 0); add(fx, mx(pop(.08), S('bookFlip3', .06)), H1('features') - .4, 1, .3); add(fx, mx(swish(.25, .05), click(.06, .8)), H1('features') + .3, 1, .3)
add(fx, mx(pop(.1), S('handleCoins', .08)), H1('pay') - .2, 1, .3); add(fx, mx(swish(.6, .1), pop(.08)), H1('rid') + .2, 1, 0); add(fx, verb(mx(shimmer(.12, 1.3), chime(1319, .06, 1.3)), 1.0, .4), H1('rid') + .6, 1, -.2)
add(fx, mx(pop(.1), chime(2349, .05, .6)), H1('end'), 1, -.3)

# the end (as locked in ANIMATION-STYLE.md): everything fades out with the picture, then only the locked logo sound
_n0, _n1 = int((STORY - .6) * SR), int((STORY + .1) * SR); fx[_n0:_n1] *= np.linspace(1, 0, _n1 - _n0)[:, None]; fx[_n1:] = 0
sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from logo_sting import place_logo

# —— voice ——
vo_path = os.path.join(HERE, os.environ.get('VO', 'refs/voiceover-hu-x1.15.mp3'))   # the voice at 1.15×, pitch kept
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.float32).astype(np.float64)
vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = buf(); add(voice, vo, 0, 1)

# —— mix: effects close to the voice (a punchy bus); no music ——
fxc = np.stack([compress(fx[:, c] * 2.2, thr=.12, ratio=2.5, att=.002, rel=.06) for c in range(2)], 1)
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
mix = voice + fxc * (vr * 2.1 / max(fr, 1e-6))   # effects a touch under the voice, so the voice leads
mix = place_logo(mix, STORY + .2, SR, vr, 1.4)   # the locked logo sound, after the effects bus so it is the same level in every film
print('voice rms', round(float(vr), 3), 'fx 99.7%', round(float(fr), 3))
end = int(DUR * SR); mix = mix[:end]; mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)   # a gentle bus squeeze, so the loudness target leaves headroom for the peaks
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
# 3.2 s of silence after the end: the muxer's decode check reads ~2.9 s short (the loudness filter's look-ahead); the mux cuts the audio to the picture (-shortest)
mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - DUR) * SR), 2))])   # short films: enough silence that the check's 5% tolerance covers the look-ahead
sf.write(os.path.join(HERE, 'out', os.environ.get('OUT', 'mix.wav')), mix.astype(np.float32), SR)
print('mix.wav', mix.shape[0] / SR, 's, peak', np.abs(mix).max())
