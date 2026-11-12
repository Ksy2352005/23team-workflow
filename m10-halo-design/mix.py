"""Sound for M10 Halo-hatás a designban (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 42.2, 44.7
fx = buf(DUR)
for t in [4.7, 9.56, 12.66, 17.62, 20.78, 24.66, 31.48, 35.0]: add(fx, whoosh(.45, .15), t - .1)
add(fx, impact(.35), .1); add(fx, whoosh(.5, .1), 1.8-.3); add(fx, ding(.16, 1760), 2.44); add(fx, whoosh(.4, .1), 2.72); add(fx, pop(.18, 600, 300), 3.26)
add(fx, whoosh(.6, .1), 5.68); add(fx, pop(.18), 6.04+.2); add(fx, pop(.18, 500, 1200), 7.76)
add(fx, riser(.9, .22), 10.78-.9); add(fx, impact(.7), 10.78); add(fx, chatter(.7, .08), 10.78-.2); add(fx, shimmer(.14, 1.4), 10.78+.1)
add(fx, riser(.6, .2), 13.48-.6); add(fx, impact(.55), 13.48); add(fx, ding(.15, 2093), 14.76); add(fx, pop(.18, 500, 250), 15.32); add(fx, whoosh(1.6, .12), 16.18-.2)
add(fx, impact(.45), 18.7); add(fx, shatter(.22), 19.18); add(fx, pop(.16), 20.08); add(fx, whoosh(.5, .08, False), 20.08+.5)
add(fx, pop(.18), 22.1-.2); add(fx, glitch(.6, .12), 21.72+.2); add(fx, pop(.16), 22.88); add(fx, glitch(.4, .12), 23.52)
add(fx, pop(.15), 25.48); add(fx, pop(.15, 600, 1500), 26.2); add(fx, whoosh(.5, .1), 28.06-.1); add(fx, riser(1.6, .14), 29.3-.1); [add(fx, tick(.14), 29.3 + k * .25) for k in range(6)]
add(fx, whoosh(.6, .1), 32.02-.1); add(fx, riser(.8, .2), 34.54-.8); add(fx, impact(.55), 34.54); add(fx, shimmer(.16, 1.4), 34.54)
add(fx, pop(.15), 35.2); add(fx, riser(.9, .16), 39.52-.9); add(fx, ding(.14, 1568), 39.52); add(fx, glitch(.3, .1), 40.68); add(fx, impact(.6), 41.16+.4)
PAUSES = [(10.78-.9, 10.78), (18.7-.5, 18.7), (34.54-.8, 34.54), (41.16, 41.16+.4)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=6)
