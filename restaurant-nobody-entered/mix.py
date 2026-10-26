"""Sound for The Restaurant Nobody Entered: the supplied Hungarian voiceover, an original cimbalom + guitar score, and foley.
Writes out/mix.wav (48 kHz stereo). Run with the library's Python: $LIB/.venv/bin/python mix.py"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar')), 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, creak, thump, ding, compress, limit, add

ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; HIT = {e['type']: e['t'] for e in ev['ev']}
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
add(music, cimbalom(mid('A5'), .32, 3.4), HIT['bell1'] + .55, 1, .2)
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
vo_path = os.path.join(HERE, 'refs', 'voiceover-hu.mp3')
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo_path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.float32).astype(np.float64)
vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = buf(); add(voice, vo, 0, 1)
venv = np.convolve(np.abs(vo), np.ones(int(.12 * SR)) / int(.12 * SR), 'same'); venv = np.minimum(1, venv / (np.percentile(venv, 90) + 1e-9))
duck = np.ones(N); duck[:len(venv)] = 1 - .55 * np.clip(venv * 1.6, 0, 1)
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

# scene 1: dawn street
add(fx, fade(bed(5.4, 60, 400, .12), .5, .4), 0, 1); add(fx, fade(bed(5.4, 800, 3000, .03), .5, .4), 0, 1)
for t in (1.0, 1.25, 2.3, 2.45): add(fx, chirp(.06), t, 1, -.4)
add(fx, lp(ding(.06), 2500), 1.8, 1, -.6); add(fx, lp(ding(.06), 2500), 2.05, 1, -.6)
for i in range(7): add(fx, clink(.05 + rng.random() * .04, 1.4 + rng.random() * .5), HIT['keyJingle'] + i * .07 + rng.random() * .04, 1, .1)
add(fx, click(.35, .5), HIT['lockClick'], 1); add(fx, thump(.12, 90), HIT['lockClick'] + .03, 1)
# scene 2: the room in the morning
room = fade(bed(DUR - 5, 80, 500, .025), .4, .5); add(fx, room, 5, 1)
for t in (HIT['wipe1'], HIT['wipe1'] + .95, HIT['wipe3'], HIT['wipe3'] + 1.1): add(fx, squeak(.09), t, 1, -.1)
add(fx, scrape(.12, .45), 9.35, 1); add(fx, thump(.08, 120), 9.8, 1)
for t in np.arange(10.0, 12.2, .42): add(fx, soft_step(.07), t, 1, -.2)
add(fx, creak(.12), HIT['doorCreak'], 1, -.3); add(fx, fade(bed(1.4, 300, 2500, .05), .3, .5), 12.4, 1, -.3)
# scene 3: muffled street outside
add(fx, fade(bed(2.9, 80, 600, .05), .3, .3), 13.2, 1, .2)
for t in np.arange(13.4, 16, .5): add(fx, lp(soft_step(.035), 700), t, 1, .4 - (t - 13.4) * .3)
# scene 4/5/6: rain (J-cut in), the near-silence, the first bell
rain_d = 31.5 - 15.5; rain = bp(noise(rain_d), 900, 7000) * .045
ticks = (rng.random(len(rain)) > .9993) * rng.random(len(rain)); rain += hp(np.convolve(ticks, np.exp(-np.arange(200) / 30), 'same'), 2000) * .5
renv = np.ones(len(rain)); tt = np.arange(len(rain)) / SR + 15.5
renv *= np.clip((tt - 15.5) / .5, 0, 1); renv *= np.where(tt > 20.3, np.where(tt < HIT['bell1'] - .05, .45, 1.0), 1.0)
renv *= 1 + 1.2 * np.exp(-((tt - 23.6) / 1.2) ** 2); renv *= np.where(tt > 25.4, .55, 1.0); renv *= np.clip((31.5 - tt) / .4, 0, 1)
add(fx, rain * renv, 15.5, 1, .25)
add(fx, lp(thump(.05, 45), 200), 18.4, 1); add(fx, lp(noise(.25), 3000) * env_exp(.25, .05) * .02, 19.5, 1)
add(fx, verb(ding(.55), 1.1, .5), HIT['bell1'], 1, -.3)
add(fx, creak(.08), HIT['bell1'] - .1, 1, -.3)
for t in np.arange(HIT['guestSteps'], 24.4, .38): add(fx, soft_step(.07), t, 1, -.3)
add(fx, thump(.1, 80), HIT['doorShut1'], 1, -.3); add(fx, click(.12, .6), HIT['doorShut1'] + .04, 1, -.3)
# scene 6
for t in np.arange(26.6, 27.5, .22): add(fx, soft_step(.08), t, 1, -.1)
add(fx, scrape(.13, .5), HIT['chairPull'] + .2, 1, .2); add(fx, lp(noise(.2), 900) * env_exp(.2, .06) * .08, HIT['sit'] + .4, 1, .2)
add(fx, verb(clink(.12), .5, .3), HIT['cupClink'], 1, .2)
# scene 7–9: the wet street at night
add(fx, fade(bed(42.6 - 31.5, 80, 600, .07), .3, .4), 31.5, 1); add(fx, fade(bed(42.6 - 31.5, 2000, 7000, .015), .3, .4), 31.5, 1)
for i, t in enumerate(np.arange(31.6, HIT['ystop'], .4)): add(fx, wet_step(.09 * (1 - i * .03)), t, 1, -.5 + i * .12)
add(fx, fade(lp(murmur(42.6 - 31.5, .03, 3), 900), .4, .1), 31.5, 1, .1)
add(fx, lp(clink(.05), 1500), HIT['sip'], 1, .1)
for t in np.arange(36.95, 37.45, .3): add(fx, wet_step(.08), t, 1, -.3)
add(fx, creak(.08), HIT['bell2'] - .08, 1, -.3); add(fx, verb(ding(.4) , 1.0, .45), HIT['bell2'], 1, -.3)
for t in np.arange(38.95, 39.45, .28): add(fx, wet_step(.06), t, 1, -.4)
for t in np.arange(38.95, 40.7, .4): add(fx, wet_step(.05), t, 1, .3)
add(fx, verb(ding(.3), 1.0, .45), HIT['bell3'], 1, -.35); add(fx, verb(lp(ding(.3), 6000), 1.0, .45) * .95, HIT['bell4'], 1, -.25)
# scene 10–11: the full room
crowd = murmur(DUR - 42.6, .09, 8); cenv = np.ones(len(crowd)); tc = np.arange(len(crowd)) / SR + 42.6
cenv *= np.clip((tc - 42.6) / .4, 0, 1); cenv *= np.where((tc > 50.85) & (tc < 53.3), .5, 1.0); cenv *= np.where(tc > 55.2, np.clip(1 - (tc - 55.2) / 1.5, .25, 1), 1.0)
add(fx, verb(crowd * cenv, .8, .3), 42.6, 1)
for t in sorted(42.8 + rng.random(14) * 7.8): add(fx, verb(clink(.04 + rng.random() * .03, .8 + rng.random() * .5), .6, .3), t, 1, rng.random() - .5)
add(fx, verb(clink(.12, 1.0), .5, .3), HIT['trayDown'], 1); add(fx, verb(clink(.1, 1.15), .5, .3), HIT['trayDown'] + .18, 1)
for i in range(5): add(fx, bp(noise(.11), 500, 1800) * np.sin(np.pi * t_(.11) / .11) * .05, HIT['laugh'] + i * .16, 1, -.3)
add(fx, fade(bed(DUR - 55.2, 80, 600, .06), 1.2, .5), 55.2, 1)
add(fx, verb(ding(.3), 1.3, .5), HIT['bell5'], 1, -.3)

# —— mix ——
music = verb(music, 1.2, .3) * duck[:, None]
mix = voice * 1.0 + music * .55 + fx * .9
end = int(DUR * SR); mix = mix[:end]; mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', mix.shape[0] / SR, 's, peak', np.abs(mix).max())
