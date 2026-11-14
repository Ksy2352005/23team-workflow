"""Sound for Más márka (brand-difference): an original comedic music track (ElevenLabs music, refs/music.mp3, made for this video) under
cartoon effects on the picture's cues (tools/sfx-lib): coins on each sale, a sour wobble on each „FÚJ!”, a camera shutter on each photo,
a megaphone squawk when the cheap seller shouts, a slap for each bigger sale sign, a bonk when it falls on his head, a sad deflate when he
turns grey, a sparkle for the price rise and the second shop, and a fly buzzing at the end. No voice, no end card; ends where it loops."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import lib, add, buf, SR
DUR = 22.0
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'refs', 'music.mp3'), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
L = int(15.0 * SR); xf = int(.35 * SR); body = mus[:L]   # loop the track (made as a seamless loop) to the new length with a short crossfade
out = body.copy()
while len(out) < int(DUR * SR) + xf:
    w = np.linspace(0, 1, xf)[:, None]; tail = out[-xf:] * (1 - w) + body[:xf] * w; out = np.concatenate([out[:-xf], tail, body[xf:]])
mus = out[:int(DUR * SR)]
mus = mus / np.abs(mus).max() * .42
EV = json.load(open(os.path.join(HERE, 'events.json')))['ev']
fx = buf(DUR); k = 0
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'saleB': add(fx, lib('cash-coins', .16), t, pan=-.1)
    if ty == 'saleG': add(fx, lib('cash-coins', .2), t, pan=.1)
    if ty == 'yuck': k += 1; add(fx, lib('sour-wobble', .3 if k % 2 else .22), t)
    if ty == 'shout': add(fx, lib('megaphone-blare', .4), t)
    if ty == 'zoom': add(fx, lib('whoosh-soft-a', .3), t - .1)
    if ty == 'sign': add(fx, lib('sign-slap', .45), t)
    if ty == 'month': add(fx, lib('pop-soft', .25), t)
    if ty == 'fall': add(fx, lib('whoosh-soft-b', .35), t)
    if ty == 'bonk': add(fx, lib('bonk', .9), t); add(fx, lib('impact-soft-b', .4), t)
    if ty == 'grey': add(fx, lib('sad-deflate', .45), t)
    if ty in ('raise', 'shop2'): add(fx, lib('upgrade-shine', .4), t)
    if ty == 'fly': add(fx, lib('fly-buzz', .25), t)
n = int(DUR * SR); mix = mus[:n] + fx[:n] * .6   # v4: effects a bit quieter (user)
mix[-int(.02 * SR):] *= np.linspace(1, 0, int(.02 * SR))[:, None]
mix /= max(1.0, np.abs(mix).max() / .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix', round(len(mix) / SR, 2), 's')
