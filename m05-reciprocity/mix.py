"""Sound for M05 Kölcsönösség (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 30.8, 33.3
fx = buf(DUR)
for t in [5.08, 11.46, 17.32, 22.0, 24.580000000000002]: add(fx, whoosh(.45, .16), t - .1)
add(fx, shimmer(.12, 1.2), .1); add(fx, riser(.6, .2), 0.4); add(fx, impact(.4), 1.6)
for k in range(8): add(fx, tick(.14), 2.58 + k * .09)
add(fx, whoosh(.5, .12), 6.0600000000000005); add(fx, pop(.15), 7.86); add(fx, impact(.35), 9.1); add(fx, ding(.22, 2093), 10.2)
add(fx, shatter(.4), 11.88); add(fx, pop(.18, 600, 300), 13.1); add(fx, whoosh(1.0, .12), 13.84); add(fx, click(.45), 15.64); add(fx, ding(.2, 1760), 15.690000000000001)
add(fx, click(.4), 18.64); add(fx, whoosh(.5, .12), 19.24); add(fx, impact(.5), 20.1); add(fx, shimmer(.18), 20.200000000000003)
add(fx, riser(.7, .3), 22.68); add(fx, impact(.75), 23.38); add(fx, whoosh(1.0, .14), 23.68)
add(fx, whoosh(1.2, .12), 25.94); add(fx, shimmer(.16, 1.0), 27.24); add(fx, ding(.25, 2349), 28.9)
PAUSES = [(1.1, 1.6), (11.48, 11.88), (22.78, 23.38)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=1)
