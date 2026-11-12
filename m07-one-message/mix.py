"""Sound for M07 Egy üzenet (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 34.2, 36.7
fx = buf(DUR)
for t in [2.5, 5.68, 8.08, 12.6, 14.78, 19.06, 26.48, 30.24]: add(fx, whoosh(.45, .15), t - .3)
add(fx, pop(.2), 0.12); add(fx, pop(.15, 600, 1300), 0.12 + .08); add(fx, impact(.55), 1.3); add(fx, pop(.18), 1.54)
add(fx, pop(.18, 450, 1200), 2.78); add(fx, pop(.18, 550, 1400), 2.78 + .3); add(fx, chatter(1.1, .1), 3.7); [add(fx, pop(.1, 500 + k * 60, 1300), 3.7 + k * .05, pan=(k % 3 - 1) * .4) for k in range(8)]; add(fx, whoosh(.7, .18), 4.14 - .1)
add(fx, impact(.6), 5.68); [add(fx, tick(.2), 6.48 + k * .25) for k in range(5)]; add(fx, ding(.18, 1760), 7.08)
add(fx, shimmer(.12, 1.0), 8.08 - .2); add(fx, pop(.2), 8.28); add(fx, pop(.2, 600, 1500), 9.18); add(fx, pop(.22, 400, 1100), 10.16); add(fx, riser(.6, .2), 10.84 - .6); add(fx, impact(.4), 10.84); add(fx, shimmer(.14, 1.4), 10.84)
add(fx, shimmer(.15, 1.4), 13.16)
[add(fx, tick(.14), 15.48 + k * .17) for k in range(12)]; add(fx, ding(.2, 2093), 16.76); add(fx, whoosh(.8, .1, False), 18.12)
[add(fx, pop(.16, 500 + k * 80, 1300 + k * 80), 19.9 + k * .18) for k in range(5)]; add(fx, glitch(.35, .14), 21.66 - .1); add(fx, whoosh(.9, .14), 21.66); add(fx, coin(.12), 22.2)
add(fx, impact(.6), 23.92); add(fx, whoosh(.9, .1, False), 23.92 + .2)
add(fx, riser(1.6, .22), 27.74 - .4); add(fx, whoosh(1.4, .18), 27.74); add(fx, impact(.5), 29.22); add(fx, ding(.15, 1568), 29.22 + .1)
add(fx, pop(.2), 30.8); add(fx, pop(.2, 600, 1500), 31.54); add(fx, pop(.2, 400, 1200), 32.52); add(fx, riser(.8, .2), 32.78 - .4); add(fx, impact(.7), 32.78 + .4); add(fx, shimmer(.12, 1.4), 32.78 + .4)
PAUSES = [(5.68 - .6, 5.68), (12.6 - .7, 12.6), (23.92 - .5, 23.92), (26.48 - .9, 27.74 - .4), (32.78, 32.78 + .4)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=3)
