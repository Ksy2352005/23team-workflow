"""Sound for Más főnök (boss-difference): no voice and no music during the film (like the reference, whose audio is never reused); soft cartoon
effects from the studio library (tools/sfx-lib, ElevenLabs) on the picture's cues: each room's bikes whir and machine hums (quieter as workers
leave, louder and faster on „GYORSABBAN!”), a small clink as each coin reaches the bad boss's mouth or drops onto a rider, a warm thump on each
big word, a soft pop for each month and each „FELMONDOK” bubble, footsteps as workers leave or the new hire arrives, the sign slapping onto the
wall, an upgrade sparkle, a deflating wobble as the bad boss turns grey. Then the spoken call to action (line 2) over the end card."""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 15.0, 19.8
QUIT, HIRE, FASTER, GLIDE, UPGRADE = [10.4, 9.35, 8.25], 9.1, 3.6, 5.0, 10.05
EV = json.load(open(os.path.join(HERE, 'events.json')))['ev']
fx = buf(DUR); N = fx.shape[0]; tt = np.arange(N) / SR
def loop(name, gain, pan=0, v=1.0):   # a library loop tiled across the film with soft crossfades, shaped by a gain curve over time
    x = lib(name, v); L = len(x); f = int(.25 * SR); out = np.zeros(N); pos = 0; w = np.ones(L); w[:f] = np.linspace(0, 1, f); w[-f:] = np.linspace(1, 0, f)
    while pos < N: n = min(L, N - pos); out[pos:pos + n] += (x * w)[:n]; pos += L - f
    out *= gain; fx[:, 0] += out * (1 - pan) * .7; fx[:, 1] += out * (1 + pan) * .7
bad_n = sum((tt < q).astype(float) for q in QUIT); good_n = 3 + (tt > HIRE + .75)
fast = 1 + .8 * ((tt > FASTER) & (tt < GLIDE))
loop('bike-whir', smooth(bad_n / 3 * .06 * fast, .4), pan=-.15); loop('bike-whir', smooth(good_n / 4 * .055, .4), pan=.15)
loop('machine-hum', smooth((bad_n > 0) * .035, .5), pan=-.1); loop('machine-hum', smooth(.03 * (1 + .5 * (tt > UPGRADE)), .5), pan=.1)
rng2 = np.random.default_rng(5)
for k, e in enumerate(EV):
    ty, t = e['type'], e['t']; pan = max(-.4, min(.4, (e.get('x', 540) - 540) / 600))
    if ty == 'eat' and k % 2 == 0: add(fx, lib('coin-clink', .05 + .02 * rng2.random()), t, pan=.3)
    if ty == 'catch' and k % 2 == 1: add(fx, lib('coin-collect', .035 + .015 * rng2.random()), t, pan=pan)
    if ty == 'bill': add(fx, lib('coin-collect', .08), t, pan=pan); add(fx, lib('sparkle-soft', .05), t)
    if ty == 'zoom': add(fx, lib('whoosh-long', .16), t - .2)
    if ty == 'stamp': add(fx, lib('stamp-thud', .3), t)
    if ty == 'month': add(fx, lib('pop-soft', .12), t)
    if ty == 'quit': add(fx, lib('pop-soft', .16), t, pan=pan)
    if ty == 'leave': add(fx, lib('footsteps-leave', .14), t, pan=pan)
    if ty == 'jump': add(fx, lib('impact-soft-b', .22), t + .1)
    if ty == 'hire': add(fx, lib('footsteps-leave', .12), t, pan=-.3)
    if ty == 'upgrade': add(fx, lib('upgrade-shine', .22), t)
    if ty == 'sign': add(fx, lib('sign-slap', .3), t + .02)
    if ty == 'grey': add(fx, lib('sad-deflate', .2), t)
write_mix(HERE, voice='refs/silence.wav', fx=fx, story=STORY, dur=DUR, bed_level=0.0, seed=0, cta=2, logo_trim=-5.2)
