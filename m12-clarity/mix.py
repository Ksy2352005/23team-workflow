"""Sound for M12 Érthetőség (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 42.9, 45.4
fx = buf(DUR)
for t in [3.6199999999999997, 8.4, 13.06, 18.54, 24.18, 26.88, 30.88, 38.08]: add(fx, whoosh(.45, .15), t - .1)
[add(fx, pop(.15, 500 + k * 100, 1300), .1 + k * .15) for k in range(3)]; add(fx, whoosh(.8, .1), 1.08-.2); add(fx, impact(.4), 1.4)
add(fx, riser(.5, .18), 4.54-.5); add(fx, impact(.5), 4.54); add(fx, pop(.16), 5.0); add(fx, whoosh(.5, .12), 6.62-.1); add(fx, impact(.4), 6.62+.4); add(fx, glitch(.3, .1), 7.4)
add(fx, pop(.14, 600, 300), 9.54); add(fx, impact(.55), 10.44); add(fx, shimmer(.1, 1.0), 10.82); [add(fx, pop(.12, 700 + k * 80, 1500), 11.1 + k * .15) for k in range(4)]
add(fx, pop(.16), 13.96); add(fx, whoosh(1.0, .08), 14.42); add(fx, glitch(.4, .12), 15.12); add(fx, pop(.16), 16.78); add(fx, riser(.5, .18), 17.34-.4); add(fx, impact(.55), 17.34+.1)
add(fx, pop(.12), 19.04); [add(fx, click(.14), 19.74 + k * .12) for k in range(3)]; add(fx, whoosh(.4, .08, False), 20.68); add(fx, riser(.8, .2), 22.32-.8); add(fx, impact(.55), 22.32); add(fx, ding(.16, 2093), 22.32+.05)
add(fx, shimmer(.12, 1.0), 25.56); add(fx, impact(.6), 26.64); add(fx, ding(.14, 1568), 26.64+.1)
add(fx, pop(.15), 27.08); add(fx, whoosh(.5, .08), 27.5); [add(fx, tick(.1), 28.68 + k * .06) for k in range(10)]; add(fx, riser(.5, .18), 30.04-.5); add(fx, ding(.18, 2349), 30.04)
add(fx, pop(.15), 32.56); add(fx, whoosh(.3, .1), 33.04); add(fx, shimmer(.12, 1.2), 34.84); add(fx, impact(.5), 35.6)
add(fx, pop(.16), 38.84); [add(fx, click(.1), 39.52 - .2 + k * .06) for k in range(8)]; add(fx, riser(.6, .2), 41.06-.6); add(fx, impact(.65), 41.06); add(fx, shimmer(.14, 1.4), 41.64+.3)
PAUSES = [(4.54-.5, 4.54), (10.44-.4, 10.44), (22.32-.8, 22.32), (30.04-.5, 30.04), (41.06-.6, 41.06)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=8)
