"""Sound for The Restaurant Nobody Entered: the supplied Hungarian voiceover, an original cimbalom + guitar score, and foley.
Writes out/mix.wav (48 kHz stereo). Run with the library's Python: $LIB/.venv/bin/python mix.py"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, creak, thump, ding, whoosh, compress, limit
from sfx import add as _add
from scipy.signal import resample as _resample
def add(buf, x, at, gain=1.0, pan=0.0, raw=False):
    if raw or not _wp: return _add(buf, x, at, gain, pan)
    a, d = W(at), len(x) / SR
    if d > 1.5: n = int((W(at + d) - a) * SR); x = _resample(x, max(n, 1)) if abs(n - len(x)) > SR * .05 else x
    _add(buf, x, a, gain, pan)

ev = json.load(open(os.path.join(HERE, os.environ.get('EVENTS', 'events.json'))))
DUR = ev['dur']; EVS = [e for e in ev['ev'] if e['type'] != 'warp']
# a retimed version: every sound is placed in story time and moved to the voice's time; long beds are stretched to fit
_wp = next((e['pairs'] for e in ev['ev'] if e['type'] == 'warp'), None)
def W(th):
    if not _wp: return th
    xs = [b for a, b in _wp]; ys = [a for a, b in _wp]; return float(np.interp(th, xs, ys))
HIT = {}
for e in EVS: HIT.setdefault(e['type'], []).append(e['t'])
H1 = lambda k: HIT[k][0]
N = int(DUR * SR) + SR
rng = np.random.default_rng(23)

def buf(): return np.zeros((N, 2))
def verb(x, t60=.7, wet=.25):
    n = int(t60 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = lp(ir, 5000) * .06
    if x.ndim == 1: return x + wet * fftconvolve(x, ir)[:len(x)]
    return np.stack([x[:, c] + wet * fftconvolve(x[:, c], ir if c == 0 else np.roll(ir, 37))[:len(x)] for c in range(2)], 1)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def mid(s): return NOTE[s[:-1]] + 12 * (int(s[-1]) + 1)

# —— instruments (modal synthesis) ——
def cimbalom(m, v=1.0, d=3.0):
    f = hz(m); tt = t_(d); x = np.zeros_like(tt)
    for det in (-.0009, .0009):
        for k in range(1, 8):
            fk = k * f * np.sqrt(1 + .00035 * k * k) * (1 + det)
            if fk > 16000: break
            x += np.sin(2 * np.pi * fk * tt + rng.random() * 6) * (1 / k ** .85) * np.exp(-tt / (2.4 / (1 + .7 * (k - 1))))
    hit = bp(noise(d), 1500, 6000) * env_exp(d, .004) * .25
    return norm(x + hit) * v * .5
def tremolo(m, t0, t1, v, out, pan=0):
    t = t0; i = 0
    while t < t1:
        u = (t - t0) / max(1e-3, t1 - t0); g = v * (.75 + .25 * rng.random()) * min(1, u * 4 + .2) * min(1, (t1 - t) * 3 + .1)
        add(out, cimbalom(m, g, 1.2), t, 1, pan); t += .075 + .01 * rng.random(); i += 1
def guitar(m, v=1.0, d=2.4):
    f = hz(m); tt = t_(d); x = np.zeros_like(tt)
    for k in range(1, 12):
        if k * f > 12000: break
        x += np.sin(2 * np.pi * k * f * tt) * abs(np.sin(k * np.pi * .19)) / k * np.exp(-tt / (1.7 / k ** .75))
    x += lp(noise(d), 3000) * env_exp(d, .003) * .15
    return norm(lp(x, 4500)) * v * .45
def pizz(m, v=1.0):
    d = .9; f = hz(m); tt = t_(d)
    x = sum(np.sin(2 * np.pi * k * f * tt) / k ** 1.3 * np.exp(-tt / (.32 / k ** .5)) for k in range(1, 7))
    return norm(lp(x, 3000)) * v * .45
def bass(m, v=1.0, d=1.6):
    f = hz(m); tt = t_(d)
    x = np.sin(2 * np.pi * f * tt) + .45 * np.sin(4 * np.pi * f * tt) + .2 * np.sin(6 * np.pi * f * tt)
    return x * np.exp(-tt / .7) * np.minimum(1, tt / .01) * v * .35
def brush(v=1.0, d=.28):
    return lp(hp(noise(d), 2500), 9000) * np.sin(np.pi * t_(d) / d) ** 1.5 * v * .12

CH = {'D': ['D3', 'A3', 'D4', 'F#4', 'A4'], 'A': ['C#3', 'A3', 'C#4', 'E4', 'A4'], 'Bm': ['B2', 'F#3', 'B3', 'D4', 'F#4'], 'G': ['G2', 'D3', 'G3', 'B3', 'D4'],
      'Em': ['E3', 'B3', 'E4', 'G4', 'B4'], 'F#m': ['F#3', 'C#4', 'F#4', 'A4', 'C#5'], 'D/F#': ['F#2', 'A3', 'D4', 'F#4', 'A4']}
ROOT = {'D': 'D2', 'A': 'A2', 'Bm': 'B1', 'G': 'G2', 'Em': 'E2', 'F#m': 'F#2', 'D/F#': 'F#2'}
def arpeggio(out, t0, chord, bar=3.0, step=.375, v=.5, pan=-.25):
    notes = [mid(n) for n in CH[chord]]; pat = [0, 2, 3, 4, 3, 2, 1, 2]
    for i in range(int(bar / step)):
        add(out, guitar(notes[pat[i % 8]], v * (1 if i % 4 == 0 else .75)), t0 + i * step + rng.random() * .008, 1, pan)

music = buf()
# 0–13.2 hope: a cimbalom roll on D, then guitar under a sparse cimbalom line
tremolo(mid('D5'), .2, 2.6, .35, music, .2)
for i, c in enumerate(['D', 'A', 'Bm', 'G']): arpeggio(music, 1.4 + i * 3, c, v=.42)
for t, n in [(4.4, 'F#5'), (5.9, 'E5'), (7.4, 'D5'), (8.9, 'C#5'), (10.4, 'B4'), (11.9, 'A4')]: add(music, cimbalom(mid(n), .4), t, 1, .25)
# 13.2–20.2 thinning out, then silence before the door
for t, n, v in [(13.3, 'B4', .38), (15.0, 'A4', .3), (16.8, 'F#4', .24), (18.6, 'G4', .18)]: add(music, cimbalom(mid(n), v, 3.2), t, 1, .15)
add(music, bass(mid('B1'), .5, 3), 13.3, 1); add(music, bass(mid('G1'), .35, 3), 18.6, 1)
# the answer to the first bell
add(music, cimbalom(mid('A5'), .32, 3.4), H1('bell1') + .55, 1, .2)
# 26.1–31.5 warmth returns
for i, c in enumerate(['D', 'G']): arpeggio(music, 26.1 + i * 3, c, step=.75, v=.4)
for t, n in [(26.4, 'D5'), (27.9, 'F#5'), (29.4, 'G5'), (30.6, 'F#5')]: add(music, cimbalom(mid(n), .34), t, 1, .25)
# 31.5–38.9 curiosity: steadier eighths
for i, c in enumerate(['G', 'D/F#', 'Em', 'A']): arpeggio(music, 31.5 + i * 1.85, c, bar=1.85, step=.3083, v=.38)
for t, n in [(33.1, 'B4'), (34.9, 'D5'), (36.6, 'E5')]: add(music, cimbalom(mid(n), .3), t, 1, .25)
# 36.9 → pizzicato pulse; 38.9 → brushes; 42.6 → full
B = .5
for i in range(int((50.85 - 36.9) / B)):
    t = 36.9 + i * B; bar = int((t - 36.9) // 2); ch = ['D', 'A', 'Bm', 'G', 'D', 'A', 'G'][bar % 7]
    add(music, pizz(mid(ROOT[ch]) + 12 * (i % 2), .5 if t < 42.6 else .6), t, 1, .3)
    if t >= 38.9 and i % 2 == 1: add(music, brush(.9 if t >= 42.6 else .6), t - .02, 1, -.1)
    if t >= 42.6 and i % 4 == 0: add(music, bass(mid(ROOT[ch]), .55), t, 1)
for k, (t, c) in enumerate([(38.9, 'D'), (40.75, 'A'), (42.6, 'D'), (44.6, 'A'), (46.6, 'Bm'), (48.6, 'G')]):
    arpeggio(music, t, c, bar=2.0 if t >= 42.6 else 1.85, step=.25, v=.36)
for t, n in [(38.95, 'F#5'), (40.75, 'A5'), (42.6, 'D6'), (43.6, 'C#6'), (44.6, 'A5'), (45.6, 'B5'), (46.6, 'A5'), (47.6, 'F#5'), (48.6, 'G5'), (49.6, 'E5')]:
    add(music, cimbalom(mid(n), .36), t, 1, .25)
# 50.85 held note (the second silence), 53.3 resolution on D
tremolo(mid('A4'), 50.9, 53.2, .2, music, .1)
for i, n in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']): add(music, cimbalom(mid(n), .5, 5.5), 53.3 + i * .06, 1, -.3 + i * .12)
for i, n in enumerate(CH['D']): add(music, guitar(mid(n), .45, 5), 53.32 + i * .025, 1, -.2)
add(music, bass(mid('D2'), .7, 5), 53.3, 1)
tremolo(mid('F#5'), 55.0, 57.6, .22, music, .25)
for i, n in enumerate(['D4', 'A4', 'D5', 'F#5']): add(music, cimbalom(mid(n), .4, 3.5), 57.0 + i * .08, 1, -.2 + i * .15)

# —— voice ——
vo_path = os.path.join(HERE, os.environ.get('VO', 'refs/voiceover-hu.mp3'))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.float32).astype(np.float64)
vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = buf(); add(voice, vo, 0, 1, raw=True)
venv = np.convolve(np.abs(vo), np.ones(int(.12 * SR)) / int(.12 * SR), 'same'); venv = np.minimum(1, venv / (np.percentile(venv, 90) + 1e-9))
duck = np.ones(N); duck[:len(venv)] = 1 - .7 * np.clip(venv * 1.8, 0, 1)
duck = np.convolve(duck, np.ones(int(.08 * SR)) / int(.08 * SR), 'same')

# —— foley ——
fx = buf()
def squeak(v=1.0):
    d = .32; tt = t_(d); f = 1100 + 300 * np.sin(np.pi * tt / d)
    return norm(bp(noise(d), 600, 4000) * .5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .25) * np.sin(np.pi * tt / d) * v
def scrape(v=1.0, d=.4): return norm(bp(noise(d), 300, 1800) * (np.abs(np.sin(2 * np.pi * 31 * t_(d))) ** 2) * np.sin(np.pi * t_(d) / d)) * v
def soft_step(v=1.0): d = .12; return norm(lp(noise(d), 500) * env_exp(d, .025) + np.sin(2 * np.pi * 110 * t_(d)) * env_exp(d, .03)) * v
def wet_step(v=1.0): d = .16; return norm(soft_step(1)[:len(t_(d))] if False else (lp(noise(d), 600) * env_exp(d, .02) + hp(noise(d), 3000) * env_exp(d, .05) * .6)) * v
def clink(v=1.0, p=1.0):
    d = .5; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * p * tt) * env_exp(d, tau) for f, a, tau in [(3200, 1, .08), (5100, .5, .05), (7400, .3, .03)])) * v
def click(v=1.0, p=1.0): d = .05; return norm(hp(noise(d), 2000) * env_exp(d, .003) + np.sin(2 * np.pi * 1800 * p * t_(d)) * env_exp(d, .008)) * v
def chirp(v=1.0):
    d = .14; tt = t_(d); f = 3600 + 1800 * np.sin(np.pi * tt / d) ; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2 * v
def bed(d, lo, hi, v): return norm(bp(brown(d) * .5 + noise(d) * .5, lo, hi)) * v
def fade(x, a=.3, b=.3): n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return x * e
def murmur(d, v=1.0, voices=6):
    out = np.zeros(len(t_(d)))
    for k in range(voices):
        syl = (rng.random(len(out) // 2400 + 2) > .45).astype(float); am = np.repeat(syl, 2400)[:len(out)]; am = np.convolve(am, np.ones(1200) / 1200, 'same')
        lo = 250 + rng.random() * 300; out += bp(noise(d), lo, lo * 3.2) * am
    return norm(lp(out, 2500)) * v

# beds: dawn street, the room, rain, the night street, the full room
add(fx, fade(bed(5.2, 60, 400, .12), .5, .4), 0, 1); add(fx, fade(bed(5.2, 800, 3000, .03), .5, .4), 0, 1)
for t in (.8, 1.05, 2.0, 2.15): add(fx, chirp(.05), t, 1, -.4)
add(fx, fade(bed(DUR - 5, 80, 500, .025), .4, .5), 5, 1)
add(fx, fade(bed(3.0, 80, 600, .05), .3, .3), 13.2, 1, .2)
rain_d = 31.5 - 15.5
_r, _sr = __import__('soundfile').read(os.path.join(HERE, 'sfx', 'amb_rain_loop_1.ogg')); _r = _r if _r.ndim == 1 else _r.mean(1)
from scipy.signal import resample_poly as _rp0
_r = _rp0(_r, SR, _sr) if _sr != SR else _r
rain = _r[int(5 * SR):int(5 * SR) + int(round(rain_d * SR))]; rain = rain / (np.abs(rain).max() + 1e-9) * .09
tt = np.arange(len(rain)) / SR + 15.5; renv = np.clip((tt - 15.5) / .5, 0, 1) * np.where(tt > 20.3, np.where(tt < H1('bell1') - .05, .45, 1.0), 1.0)
renv *= 1 + 1.2 * np.exp(-((tt - 23.6) / 1.2) ** 2); renv *= np.where(tt > 25.4, .55, 1.0); renv *= np.clip((31.5 - tt) / .4, 0, 1)
add(fx, rain * renv, 15.5, 1, .25)
add(fx, fade(bed(42.6 - 31.5, 80, 600, .07), .3, .4), 31.5, 1); add(fx, fade(bed(42.6 - 31.5, 2000, 7000, .015), .3, .4), 31.5, 1)
add(fx, fade(lp(murmur(42.6 - 31.5, .025, 3), 900), .4, .1), 31.5, 1, .1)
crowd = murmur(DUR - 42.6, .085, 8); tc = np.arange(len(crowd)) / SR + 42.6
cenv = np.clip((tc - 42.6) / .4, 0, 1) * np.where((tc > 50.85) & (tc < 53.3), .5, 1.0) * np.where(tc > 54.6, np.clip(1 - (tc - 54.6) / 1.2, .25, 1), 1.0)
add(fx, verb(crowd * cenv, .8, .3), 42.6, 1)
add(fx, fade(bed(DUR - 54.6, 80, 600, .06), 1.0, .5), 54.6, 1)

def mx(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

# —— recorded CC0 sounds (Kenney, OpenGameArt; see sfx/ and CREDITS), placed on the picture's events ——
import soundfile as _sf
from scipy.signal import resample_poly as _rp
_cache = {}
def S(name, level=1.0, lowpass=None):
    if name not in _cache:
        a, sr = _sf.read(os.path.join(HERE, 'sfx', name + ('' if '.' in name else '.ogg'))); a = a if a.ndim == 1 else a.mean(1)
        if sr != SR: a = _rp(a, SR, sr)
        _cache[name] = a / (np.abs(a).max() + 1e-9)
    x = _cache[name]; x = lp(x, lowpass) if lowpass else x
    return x * level
pick = lambda base, n, i: f'{base}{i % n}'
STEP = {'wood': ('footstep_wood_00', 5, .42), 'stone': ('footstep_concrete_00', 5, .36), 'wet': ('footstep_concrete_00', 5, .38)}
for k, e in enumerate(e for e in EVS if e['type'] == 'step'):
    base, n, lv = STEP[e.get('surf', 'wood')]; x = S(pick(base, n, k), lv * e.get('v', 1))
    if e.get('surf') == 'wet': x = mx(x, hp(noise(.12), 2500) * env_exp(.12, .03) * .06)
    add(fx, x, e['t'], 1, e.get('pan', 0) * .7)
# 1: coins into the glass jar, calendar pages, the key, the latch, the sign coming on
for k, t in enumerate(HIT['coins']): add(fx, verb(mx(S(pick('impactGlass_light_00', 5, k), .55), S('chips-collide-1', .35)), .4, .2), t, 1, -.2)
for k, t in enumerate(HIT['pages']): add(fx, S(f'bookFlip{k % 3 + 1}', .5), t - .05, 1, .3)
add(fx, S('handleCoins2', .55), H1('keyJingle'), 1, .1); add(fx, S('metalClick', .6), H1('keyIn'), 1, .1); add(fx, S('metalLatch', .8), H1('lockClick'), 1, .1)
buzz = np.sin(2 * np.pi * 100 * t_(.5)) * .3 + np.sin(2 * np.pi * 200 * t_(.5)) * .2; buzz *= (rng.random(len(buzz)) > .5) * .5 + .5
add(fx, lp(buzz, 1500) * env_exp(.5, .2) * .06, H1('signOn'), 1, .2)
for i in range(5): add(fx, click(.08, 2 + i * .2), H1('signOn') + i * .07, 1, -.3 + i * .15)
# 2a: the alarm clock, the blanket thrown back, the stretch
ring_d = H1('alarmOff') - H1('alarm'); rt = t_(ring_d)
ring = (np.sin(2 * np.pi * 2200 * rt) + .5 * np.sin(2 * np.pi * 3300 * rt)) * (np.sin(2 * np.pi * 24 * rt) > 0) * .12
add(fx, ring, H1('alarm'), 1, .2); add(fx, S('impactGeneric_light_000' if False else 'impactWood_light_001', .5), H1('alarmOff'), 1, .2)
add(fx, S('cloth3', .6), H1('popUp') - .05, 1, 0); add(fx, S('cloth1', .35), H1('stretch'), 1, 0)
# 2b: the knife on the board, a pot boiling
for k, t in enumerate(HIT['chops']): add(fx, mx(S('chop' if k % 2 == 0 else 'knifeSlice', .7), S(pick('impactWood_light_00', 5, k), .3)), t, 1, 0)
add(fx, fade(S('water_boiling', .25)[:int(1.95 * SR)], .2, .3), 6.95, 1, .5)
# 2c/2d: the cloth on the tables, the plaque
for k, t in enumerate(HIT['wipes']): add(fx, S(f'cloth{k % 4 + 1}', .45), t - .12, 1, -.1)
add(fx, S('bookPlace1', .55), H1('flip'), 1, -.4)
# 3: the calendar, the time-lapse, the page torn off, the coins in the near-empty jar
add(fx, S('bookPlace1', .3), H1('calendar1'), 1, -.5)
for k in range(int(2.0 / .09)): add(fx, click(.05, 1.5 + (k % 2) * .4), H1('timelapse') + k * .09, 1, .3)
add(fx, whoosh(1.9, .06), H1('timelapse'), 1, 0)
add(fx, mx(S('bookFlip2', .6), lp(hp(noise(.35), 1200), 7000) * (np.abs(np.sin(2 * np.pi * 40 * t_(.35))) ** 2) * np.sin(np.pi * t_(.35) / .35) * .1), H1('tear'), 1, -.4)
add(fx, S('impactGlass_light_002', .4), H1('jarLook'), 1, -.2)
# 5: the door opens: the bell; it closes
add(fx, S('doorOpen_1', .6), H1('bell1') - .2, 1, -.4); add(fx, verb(ding(.55), 1.1, .5), H1('bell1'), 1, -.4)
add(fx, S('doorClose_1', .7), H1('doorShut1'), 1, -.4)
# 6: the welcome: the chair, the handshake, the chair pulled and pushed, the guest sits, the menu
add(fx, mx(S('impactWood_medium_000', .5), S('cloth2', .3)), H1('standUp'), 1, .3)
for k, t in enumerate(HIT['handshake']): add(fx, S(pick('impactSoft_medium_00', 3, k), .25), t, 1, -.1)
add(fx, mx(S('creak2', .45), scrape(.08, .45)), H1('chairPull'), 1, .1); add(fx, S('impactSoft_medium_001', .5), H1('sit'), 1, .1); add(fx, mx(S('creak1', .35), scrape(.06, .35)), H1('chairPush'), 1, .1)
add(fx, S('bookPlace1', .5), H1('menuDown'), 1, .2)
# 7: through the glass: the plate, a little applause, the fork; the "!"
add(fx, S('impactPlate_light_001', .55, 2500), H1('plateDown1'), 1, .2)
add(fx, fade(S('applause', .3, 2500)[:int(.8 * SR)], .05, .3), HIT['clap1'][0], 1, .2)
for k, t in enumerate(HIT['forks']): add(fx, S(pick('impactMetal_light_00', 5, k), .3, 2500), t, 1, .2)
pp = np.sin(2 * np.pi * np.cumsum(np.linspace(500, 1400, int(.12 * SR))) / SR) * env_exp(.12, .04) * .12; add(fx, pp, H1('bang'), 1, .3)
# 8–9: each new guest: the handle, the door, the bell
for k, b in (('handle2', 'bell2'), ('handle3', 'bell3'), ('handle4', 'bell4')):
    add(fx, S('metalClick', .55), H1(k), 1, -.3); add(fx, S('doorOpen_2', .4), H1(k) + .03, 1, -.3); add(fx, verb(ding(.35), 1.0, .45), H1(b), 1, -.3)
# 10: the full room: plates down, applause, cutlery all around
for k, n in (('plateDown2', 'impactPlate_medium_000'), ('plateDown3', 'impactPlate_medium_002')): add(fx, verb(S(n, .8), .5, .25), H1(k), 1, 0)
add(fx, verb(fade(S('applause', .65)[:int(1.3 * SR)], .05, .4), .5, .3), HIT['clap2'][0] - .05, 1, 0)
for k, t in enumerate(sorted(42.8 + rng.random(24) * 11.5)): add(fx, verb(S(pick('impactMetal_light_00' if k % 2 else 'impactGlass_light_00', 5, k), .18 + .1 * rng.random()), .6, .3), t, 1, rng.random() - .5)
# cars passing (engine hum and tyres on cobbles, panned across)
for e in EVS:
    if e['type'] != 'car': continue
    d = 2.6; tt = t_(d); env = np.exp(-((tt - d / 2) / .45) ** 2)
    eng = lp(np.sin(2 * np.pi * (70 + 8 * np.sin(2 * np.pi * 3 * tt)) * tt) + .5 * np.sin(2 * np.pi * 140 * tt), 400) + bp(noise(d), 300, 2500) * .6
    eng = norm(eng) * env * (.16 if e.get('lane', 0) == 0 else .11)
    half = len(eng) // 2; dirn = e.get('dir', 1)
    add(fx, eng[:half], e['t'] - d / 2, 1, -.8 * dirn); add(fx, eng[half:], e['t'], 1, .8 * dirn)
# —— the characters' own sounds (no words): hums, yawns, gasps, laughs, "mmm", cheers; placed in the gaps of the narration ——
import soundfile as sf
from scipy.signal import resample_poly
def vox(name):
    a, sr = sf.read(os.path.join(HERE, 'vox', name + '.wav')); a = a if a.ndim == 1 else a.mean(1)
    return resample_poly(a, SR, sr) if sr != SR else a
VOX = [('ow_ooh', 4.62, .9, 0), ('ow_gasp', 22.85, 1.0, .3), ('p_oh', 34.38, 1.0, .2), ('c_yay', 45.2, .75, -.2), ('c_wow', 45.5, .6, .25)]   # strong emotions only
for name, at, g, pan in VOX:
    x = vox(name); inside = at > 5 and not (31.5 <= at < 42.6 or at > 54.6)
    if 35.3 <= at < 36.3: x = lp(x, 2200)   # heard through the glass
    add(fx, verb(x, .5 if inside else .3, .18 if inside else .08) * g * .5, at, 1, pan)
# a room full of people: soft, overlapping chatter (low-passed so no words come through), then the queue outside
walla = np.zeros(int((54.6 - 42.6) * SR))
for k, (name, off) in enumerate([('w1', 0), ('w2', 1.3), ('w3', 2.7), ('w4', 4.1), ('w5', 5.2), ('w6', 6.6), ('w1', 7.9), ('w3', 9.0), ('w2', 10.0)]):
    x = vox(name); a = int(off * SR); walla[a:a + len(x)] += x[:len(walla) - a] * (.6 + .4 * (k % 2))
walla = lp(walla, 1600); tw = np.arange(len(walla)) / SR + 42.6
walla *= np.clip((tw - 42.6) / .5, 0, 1) * np.where((tw > 50.85) & (tw < 53.3), .5, 1.0) * np.clip((54.6 - tw) / .4, 0, 1)
add(fx, verb(walla, .7, .35) * .22, 42.6, 1, -.1)
qw = np.zeros(int((DUR - 54.6) * SR))
for name, off in [('w3', 0.3), ('w5', 1.4), ('w6', 2.6)]: x = vox(name); a = int(off * SR); qw[a:a + len(x)] += x[:len(qw) - a]
add(fx, lp(qw, 1400) * .14, 54.6, 1, .3)
# 11: the queue outside: a low happy chatter, the door, the bell
add(fx, fade(lp(murmur(DUR - H1('queue'), .04, 4), 1400), .6, .3), H1('queue'), 1, .2)
add(fx, click(.15, .8), H1('bell5') - .08, 1, -.3); add(fx, verb(ding(.3), 1.3, .5), H1('bell5'), 1, -.3)

# —— mix ——
music = music * 0   # no music in this cut: voice and sound effects only
# effects nearly as loud as the voice: a punchy bus (fast compression lifts the hits), then a level just under the voice
fxc = np.stack([compress(fx[:, c] * 2.2, thr=.12, ratio=2.5, att=.002, rel=.06) for c in range(2)], 1)
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); fr = np.percentile(np.abs(fxc[:, 0]), 99.7)
mix = voice + fxc * (vr * 2.6 / max(fr, 1e-6))
print('voice rms', round(float(vr), 3), 'fx 99.7%', round(float(fr), 3))
end = int(DUR * SR); mix = mix[:end]; mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf
sf.write(os.path.join(HERE, 'out', os.environ.get('OUT', 'mix.wav')), mix.astype(np.float32), SR)
print('mix.wav', mix.shape[0] / SR, 's, peak', np.abs(mix).max())
