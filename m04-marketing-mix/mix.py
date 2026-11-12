"""Sound for M04 Marketingmix (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 49.1, 51.6
fx = buf(DUR)
for t in [5.74, 11.940000000000001, 20.26, 24.68, 30.16, 35.8, 40.36, 44.32]: add(fx, whoosh(.45, .16), t - .1)
add(fx, shimmer(.12, 1.2), .1); add(fx, whoosh(.6, .14, False), 0.8); add(fx, whoosh(.6, .16), 2.04); add(fx, click(.5), 3.98); add(fx, riser(.5, .25), 4.26); add(fx, impact(.65), 4.76); add(fx, shimmer(.2), 4.859999999999999)
add(fx, pop(.2), 6.84); add(fx, whoosh(.5, .14, False), 8.54); add(fx, whoosh(.7, .2), 9.76); add(fx, impact(.45), 10.78)
for t in [13.84, 14.62, 16.12, 16.52]: add(fx, pop(.18, 400, 1000), t)
add(fx, riser(1.2, .2), 17.66); add(fx, ding(.2, 1760), 19.08)
for k in range(3): add(fx, click(.25), 23.92 + k * .2)
add(fx, coin(.3), 25.68); add(fx, shimmer(.18, 1.0), 26.9); add(fx, whoosh(1.0, .1), 28.54); add(fx, ding(.2, 2093), 29.66)
add(fx, whoosh(.5, .2, False), 30.82); add(fx, impact(.45), 31.76); add(fx, tick(.3), 32.7); add(fx, whoosh(1.2, .12), 34.199999999999996)
add(fx, pop(.2, 300, 700), 36.5); add(fx, shimmer(.16, 1.2), 38.34)
for k in range(4): add(fx, pop(.15), 41.2 + k * .2)
add(fx, whoosh(.5, .14), 42.239999999999995); add(fx, click(.5), 42.96); add(fx, impact(.7), 43.84); add(fx, shimmer(.25, 1.4), 43.940000000000005)
add(fx, ding(.3, 1568), 44.52); add(fx, ding(.2, 1568), 45.46)
PAUSES = [(4.16, 4.76), (10.28, 10.78), (43.24, 43.84)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=0)
