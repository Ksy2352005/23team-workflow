"""Sound for M11 Veszteségkerülés (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 32.4, 34.9
fx = buf(DUR)
for t in [2.5599999999999996, 8.040000000000001, 12.82, 17.060000000000002, 22.46, 25.96]: add(fx, whoosh(.45, .15), t - .1)
add(fx, whoosh(1.4, .14), 0); add(fx, impact(.4), .1); add(fx, whoosh(.6, .1, False), 1.26); add(fx, pop(.2), 2.38)
add(fx, pop(.16), 3.0); [add(fx, ding(.1, 1319 + k * 200), 3.0 + k * .35) for k in range(4)]; add(fx, glitch(.3, .12), 5.34-.1); add(fx, whoosh(.6, .12, False), 5.34); add(fx, impact(.45), 6.04)
add(fx, pop(.16, 600, 300), 8.24); add(fx, pop(.16), 8.94); add(fx, riser(.6, .18), 9.58-.2); add(fx, impact(.55), 9.58+.4); add(fx, pop(.14, 700, 1500), 10.78); add(fx, ding(.12, 2093), 11.84)
add(fx, whoosh(.4, .1, False), 13.02+.2); add(fx, click(.25), 13.66+.2); add(fx, riser(.7, .2), 14.54-.6); add(fx, impact(.5), 14.54+.1); add(fx, shimmer(.12, 1.2), 15.52)
add(fx, whoosh(2.4, .1), 17.72); add(fx, ding(.14, 1568), 18.92); [add(fx, pop(.1, 600 + k * 80, 1500), 19.7 + k * .12) for k in range(5)]; add(fx, glitch(.25, .12), 21.08-.1); add(fx, impact(.45), 21.08); add(fx, whoosh(.5, .1, False), 21.5)
[add(fx, pop(.1, 500 - k * 30, 250), 23.9 + k * .14) for k in range(5)]; add(fx, riser(.6, .2), 25.58-.6); add(fx, impact(.7), 25.58)
add(fx, whoosh(.8, .08), 27.14); add(fx, whoosh(.5, .1), 30.02-.3); add(fx, click(.3), 30.78+.1); add(fx, impact(.55), 30.78+.15); add(fx, shimmer(.14, 1.3), 31.36+.2)
PAUSES = [(4.86-.5, 4.86), (13.02-.4, 13.02), (25.58-.6, 25.58), (30.78-.3, 30.78+.1)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=7)
