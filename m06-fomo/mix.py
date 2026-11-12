"""Sound for M06 FOMO (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 38.6, 41.1
fx = buf(DUR)
for t in [3.8199999999999994, 9.56, 14.120000000000001, 17.04, 21.32, 25.080000000000002, 30.080000000000002, 36.339999999999996]: add(fx, whoosh(.45, .16), t - .1)
add(fx, whoosh(.9, .2, False), 0); add(fx, impact(.4), .85); add(fx, riser(.9, .2), 1.52)
add(fx, pop(.2), 4.7); add(fx, impact(.35), 5.66); add(fx, whoosh(1.4, .1), 7.38)
add(fx, shimmer(.15, 1.2), 10.879999999999999); add(fx, pop(.2, 500, 1100), 12.7); add(fx, ding(.18, 1760), 13.5)
add(fx, whoosh(.6, .14), 15.200000000000001); add(fx, impact(.6), 16.64)
add(fx, riser(1.6, .25), 18.52); add(fx, impact(.55), 20.08)
add(fx, impact(.75), 21.98); add(fx, chatter(1.0, .08), 23.04)
add(fx, whoosh(1.0, .12, False), 27.240000000000002); [add(fx, coin(.18), 29.04 + k * .2) for k in range(5)]
add(fx, whoosh(.5, .12), 30.6); add(fx, impact(.4), 31.24); [add(fx, ding(.1, 2093 + k * 150), 31.24 + .2 + k * .2) for k in range(4)]; add(fx, riser(.8, .18), 32.1)
add(fx, pop(.2), 34.28); add(fx, pop(.15, 700, 1300), 35.3)
add(fx, riser(.7, .3), 35.839999999999996); add(fx, impact(.8), 36.54); add(fx, glitch(.3, .15), 37.36)
PAUSES = [(5.26, 5.66), (16.14, 16.64), (21.38, 21.98), (35.839999999999996, 36.54)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=2)
