"""Sound for M08 Az utána érzés (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 40.1, 42.6
fx = buf(DUR)
for t in [4.46, 6.34, 11.16, 17.2, 22.720000000000002, 29.3, 35.699999999999996]: add(fx, whoosh(.45, .15), t - .1)
add(fx, whoosh(1.2, .14), 0); add(fx, riser(.8, .2), 1.4-.8); add(fx, impact(.5), 1.4); add(fx, shimmer(.12, 1.2), 4.28)
add(fx, pop(.18), 4.66); add(fx, whoosh(.4, .12), 4.98-.1); add(fx, ding(.16, 1760), 4.98+.1); add(fx, impact(.35), 5.58+.3)
add(fx, riser(1.4, .18), 6.54); add(fx, ding(.16, 2093), 7.52); add(fx, shimmer(.1, 1.0), 7.84); add(fx, pop(.2, 400, 1000), 9.5); add(fx, shimmer(.14, 1.2), 9.76)
add(fx, pop(.18), 12.12); add(fx, whoosh(.5, .1, False), 14.22); add(fx, riser(.7, .2), 15.06-.7); add(fx, impact(.6), 15.06); add(fx, glitch(.25, .1), 16.64)
add(fx, pop(.2), 18.1); [add(fx, ding(.14, 1568 + k * 300), 19.58 + k * .2) for k in range(3)]; [add(fx, pop(.08, 600 + k * 50, 1500), 20.76 + k * .07, pan=(k % 3 - 1) * .5) for k in range(10)]
add(fx, tick(.2), 23.7); [add(fx, tick(.14), 23.7 + k * .15) for k in range(1, 4)]; add(fx, whoosh(.6, .1), 24.24); add(fx, whoosh(.5, .1, False), 25.16)
add(fx, riser(2.6, .18), 25.84); [add(fx, click(.12), 25.84 + k * .45) for k in range(7)]; add(fx, impact(.45), 28.42)
add(fx, whoosh(.7, .12), 30.1); add(fx, pop(.2), 31.56); add(fx, riser(.8, .2), 33.42-.8); add(fx, impact(.6), 33.42); add(fx, shimmer(.14, 1.3), 35.26)
[add(fx, coin(.16), 36.34 + k * .15) for k in range(3)]; add(fx, whoosh(.8, .1, False), 38.2); add(fx, pop(.16, 700, 1300), 38.78); add(fx, impact(.7), 38.9+.5)
PAUSES = [(3.64-.6, 3.64), (15.06-.7, 15.06), (22.92-.6, 22.92), (33.42-.8, 33.42), (38.9, 38.9+.5)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=4)
