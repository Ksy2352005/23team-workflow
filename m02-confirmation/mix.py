"""Sound for M02 Megerősítés: dark music with dramatic pauses, effects on the animation, David's voice on top (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 38.8, 41.3
fx = buf(DUR)
for t in [8.90, 30.40, 35.68]: add(fx, whoosh(.45, .16), t - .1)
add(fx, shimmer(.12, 1.4), .2); add(fx, pop(.18, 300, 700), 1.50); add(fx, impact(.55), 2.30); add(fx, glitch(.3, .2), 3.06)
add(fx, whoosh(.6, .2), 4.22); add(fx, tick(.25), 5.80); add(fx, tick(.2), 6.05); add(fx, whoosh(1.2, .14), 6.68)
for k in range(16): add(fx, tick(.08), 7.54 + k * .05)
add(fx, pop(.2, 400, 900), 9.10); add(fx, whoosh(.8, .12), 11.82); add(fx, impact(.5), 13.92); add(fx, shimmer(.18), 14.02)
add(fx, whoosh(.6, .14, False), 15.56); add(fx, tick(.2), 17.10); add(fx, riser(1.2, .25), 18.78); add(fx, ding(.2, 1760), 20.10)
add(fx, whoosh(.5, .14, False), 21.70); add(fx, impact(.4), 24.14); add(fx, pop(.2), 26.00); add(fx, ding(.15, 2093), 26.64); add(fx, whoosh(1.4, .12), 27.70)
add(fx, pop(.2, 600, 300), 31.26); add(fx, whoosh(.5, .14), 32.04); add(fx, impact(.45), 33.14)
for k in range(8): add(fx, ding(.07, 1047 * 2 ** (k * 2 / 12)), 33.88 + k * .08)
add(fx, impact(.5), 35.38); add(fx, whoosh(1.6, .15), 35.88); add(fx, shimmer(.22, 1.4), 37.38)
PAUSES = [(1.70, 2.30), (13.42, 13.92), (30.00, 31.26), (36.88, 37.38)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=2)
