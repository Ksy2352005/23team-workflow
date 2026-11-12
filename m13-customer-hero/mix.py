"""Sound for M13 A vásárló a főszereplő (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 30.5, 33.0
fx = buf(DUR)
for t in [3.1199999999999997, 7.22, 10.760000000000002, 17.36, 23.080000000000002]: add(fx, whoosh(.45, .15), t - .1)
add(fx, pop(.18), .05); [add(fx, pop(.1, 500 + k * 80, 1300), .6 + k * .2, pan=(k % 3 - 1) * .5) for k in range(6)]; add(fx, whoosh(1.4, .12, False), 1.56+.3)
add(fx, impact(.4), 3.96); add(fx, whoosh(1.4, .12), 5.74-.2); add(fx, whoosh(.8, .1), 6.58-.3)
add(fx, riser(.6, .18), 7.42-.6); add(fx, impact(.5), 7.42); [add(fx, pop(.1, 600 + k * 60, 1400), 8.32 + k * .18) for k in range(6)]
[add(fx, coin(.1), 11.6 + k * .2) for k in range(3)]; add(fx, riser(1.6, .16), 12.86); add(fx, impact(.45), 14.32); add(fx, riser(1.6, .14), 15.12); add(fx, ding(.16, 2093), 16.58+.2)
add(fx, pop(.16), 18.36-.2); add(fx, ding(.14, 1760), 18.94); add(fx, whoosh(.3, .14), 20.24-.2); add(fx, impact(.5), 20.24+.1); add(fx, riser(.7, .2), 21.44-.6); add(fx, impact(.6), 21.44); add(fx, shimmer(.16, 1.5), 21.44+.1)
add(fx, whoosh(1.0, .08), 23.88); add(fx, riser(.8, .2), 25.46-.6); add(fx, impact(.55), 26.02); add(fx, shimmer(.12, 1.2), 26.02+.2); add(fx, pop(.18), 27.46); add(fx, whoosh(.7, .1, False), 28.3); add(fx, impact(.65), 29.32+.4)
PAUSES = [(7.42-.6, 7.42), (21.44-.6, 21.44), (26.02-.6, 26.02), (29.32, 29.32+.4)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=9)
