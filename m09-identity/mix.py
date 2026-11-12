"""Sound for M09 Identitás (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 37.4, 39.9
fx = buf(DUR)
for t in [4.06, 7.02, 8.760000000000002, 17.720000000000002, 24.18, 29.04, 31.88]: add(fx, whoosh(.45, .15), t - .1)
add(fx, shimmer(.12, 1.4), .2); [add(fx, tick(.12), .3 + k * .2) for k in range(8)]; add(fx, riser(.7, .18), 1.4-.7); add(fx, impact(.45), 1.4); add(fx, whoosh(.6, .1), 1.7)
add(fx, impact(.4), 4.9); add(fx, glitch(.3, .12), 5.8-.1); [add(fx, click(.12), 5.8 + .2 + k * .18) for k in range(5)]
add(fx, riser(.6, .2), 7.22-.6); add(fx, impact(.6), 7.22); [add(fx, tick(.1), 7.22 + .3 + k * .1) for k in range(8)]
[add(fx, tick(.12), 9.6 + k * .12) for k in range(8)]; add(fx, whoosh(.9, .12), 12.02); add(fx, riser(1.4, .16), 13.48-.6); add(fx, ding(.16, 1760), 15.4); add(fx, shimmer(.12, 1.0), 16.12); add(fx, impact(.6), 16.98); add(fx, whoosh(1.2, .14, False), 16.98)
[add(fx, pop(.16, 500 + k * 100, 1300), 17.92 + k * .15) for k in range(3)]; [add(fx, click(.12), 20.72 + k * .2) for k in range(3)]; add(fx, pop(.2), 21.92); add(fx, whoosh(.5, .1), 22.98-.2)
add(fx, riser(1.2, .16), 25.16-.2); add(fx, ding(.16, 2093), 25.98+.2); add(fx, whoosh(.6, .1, False), 26.46); add(fx, shimmer(.12, 1.3), 26.74); add(fx, ding(.14, 2637), 27.72)
add(fx, riser(.8, .22), 31.22-.8); add(fx, impact(.7), 31.22); add(fx, shimmer(.14, 1.4), 31.22+.1)
add(fx, pop(.2), 33.58); add(fx, riser(1.2, .2), 34.5); add(fx, click(.25), 35.86+.15); add(fx, impact(.6), 35.86+.3); add(fx, shimmer(.16, 1.6), 35.86+.3)
PAUSES = [(1.4-.7, 1.4), (7.22-.6, 7.22), (16.98-.4, 16.98), (31.22-.8, 31.22), (35.86-.1, 35.86+.3)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=5, logo_trim=0.4)
