"""Sound for M03 Halo-hatás: dark music with dramatic pauses, effects on the animation, David's voice on top (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 57.9, 60.4
fx = buf(DUR)
for t in [4.3, 20.080000000000002, 26.48, 40.32, 45.94, 49.879999999999995]: add(fx, whoosh(.45, .16), t - .1)
add(fx, whoosh(.7, .12, False), .0); add(fx, riser(.8, .2), 0.66); add(fx, pop(.2), 1.94)
add(fx, impact(.65), 2.26); add(fx, shimmer(.25, 1.4), 2.61)
for k in range(6): add(fx, tick(.12), 4.859999999999999 + k * .12)
add(fx, ding(.25, 2093), 8.92); add(fx, riser(1.6, .25), 9.88); add(fx, impact(.45), 11.74)
add(fx, whoosh(.6, .1, False), 12.82); add(fx, whoosh(.5, .12), 14.06)
for k, t in enumerate([15.68] + [17.36 + j * .45 for j in range(4)]): add(fx, click(.3), t)
add(fx, whoosh(.6, .22), 19.610000000000003)
add(fx, whoosh(.5, .14), 20.639999999999997); add(fx, pop(.2, 300, 800), 21.26); add(fx, ding(.2, 1760), 22.14); add(fx, click(.35), 25.04); add(fx, ding(.18, 2349), 25.56)
add(fx, whoosh(.5, .12), 26.68); [add(fx, tick(.18), t) for t in [27.34, 28.06, 29.16, 30.04]]
for k in range(6): add(fx, ding(.07, 2093 + k * 120), 31.32 + k * .25)
for k in range(8): add(fx, pop(.1, 500, 1200), 32.56 + k * .12)
add(fx, impact(.4), 41.24); add(fx, riser(.9, .3), 41.660000000000004); add(fx, impact(.75), 42.56); add(fx, shimmer(.2), 43.76)
add(fx, chatter(.9, .06), 46.14); add(fx, ding(.2, 1568), 47.38); add(fx, pop(.2), 48.26); add(fx, ding(.18, 2093), 48.76)
add(fx, whoosh(1.0, .12), 50.76); add(fx, click(.4), 52.06); add(fx, impact(.5), 52.96)
for k in range(8): add(fx, pop(.1, 600, 1300), 53.6 + k * .06)
add(fx, whoosh(.8, .16, False), 56.040000000000006); add(fx, shimmer(.22, 1.4), 56.42)
PAUSES = [(1.6599999999999997, 2.26), (11.24, 11.74), (41.86, 42.56), (52.46, 52.96)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=3)
