"""Sound for M14 Segíts nekik nyerni (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 28.0, 30.5
fx = buf(DUR)
for t in [2.46, 4.58, 5.58, 7.359999999999999, 11.06, 17.3]: add(fx, whoosh(.45, .15), t - .1)
add(fx, whoosh(1.0, .1), .1); add(fx, riser(.5, .16), 0.84-.5); add(fx, impact(.4), 0.84); [add(fx, pop(.1, 600 + k * 100, 1500), 0.84 + .2 + k * .15) for k in range(3)]
[add(fx, tick(.14), 3.4 - .3 + k * .12) for k in range(7)]; add(fx, ding(.14, 1760), 4.36)
add(fx, impact(.35), 4.78); add(fx, pop(.2, 400, 1200), 5.1); add(fx, whoosh(.5, .1), 5.1+.3)
[add(fx, click(.14), 5.78 + k * .9) for k in range(4)]; add(fx, riser(.5, .18), 6.3-.5); add(fx, impact(.5), 6.3); add(fx, shimmer(.12, 1.0), 6.3)
add(fx, impact(.45), 7.56); [add(fx, whoosh(.4, .14), t) for t in [8.72-.2, 9.8-.2, 10.38-.2]]
add(fx, whoosh(1.2, .06), 11.26); add(fx, riser(2.0, .16), 14.84-.3); [add(fx, click(.12), 14.84 + k * .3) for k in range(7)]; add(fx, ding(.16, 2093), 16.1+.3)
add(fx, whoosh(.6, .1), 18.1); add(fx, riser(3.0, .16), 19.08); add(fx, ding(.16, 2349), 21.44+.3); add(fx, whoosh(1.2, .08), 23.26); add(fx, riser(.6, .2), 26.16-.6); add(fx, impact(.6), 26.16); add(fx, shimmer(.16, 1.5), 26.16+.1)
PAUSES = [(7.56-.4, 7.56), (11.26-.4, 11.26), (26.16-.6, 26.16)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=10)
