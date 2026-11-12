"""Sound for M01 Tükrözés: dark music with dramatic pauses, effects on the animation, David's voice on top (tools/motion_sound.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound import *
STORY, DUR = 40.4, 42.9
fx = buf(DUR)
for t in [3.3, 9.88, 15.00, 26.32, 33.40]: add(fx, whoosh(.45, .16), t - .1)   # scene changes
# dots become coins; the cursor drags the frame bigger; the grid lights
add(fx, pop(.2), 0.22); add(fx, click(.4), 0.80); add(fx, riser(.5, .25), 0.82); add(fx, coin(.3), 1.44); add(fx, impact(.45), 1.44)
# the cogs appear in the ring; they fold into two slivers; TÜKRÖZÉS mirrors into place
for t in [4.30, 4.80, 5.46]: add(fx, pop(.18, 400, 900), t)
add(fx, whoosh(.6, .2, False), 7.48); add(fx, impact(.7), 8.14); add(fx, chatter(.5, .1), 8.14); add(fx, shimmer(.18, 1.2), 8.44)
# the cards change above the mirror sphere
for t in [13.06, 13.68, 14.30]: add(fx, whoosh(.35, .14), t - .25); add(fx, tick(.25), t)
# casual: a soft ring breathes out; formal: points, then the suit
add(fx, pop(.2, 300, 700), 15.48); add(fx, whoosh(1.0, .12), 16.54); add(fx, glitch(.25, .15), 18.16); add(fx, impact(.4), 19.02)
# squares turn; the core splits into three; trust swells
add(fx, whoosh(1.6, .12), 20.36); add(fx, pop(.18), 23.34); add(fx, riser(.9, .3), 24.28); add(fx, impact(.6), 25.26); add(fx, shimmer(.2), 25.36)
# the brain; sparks inside
add(fx, impact(.35), 27.38); [add(fx, ding(.12, f), t) for f, t in [(1568, 28.22), (1760, 28.62), (2093, 28.92)]]
# shatter; the pale world; the circles pull together and merge; the dark oval
add(fx, shatter(.45), 29.85); add(fx, whoosh(1.2, .1), 31.26); add(fx, pop(.2, 300, 600), 33.06); add(fx, whoosh(.6, .2, False), 33.11)
# the faces flick; all smile; coins
for k in range(5): add(fx, tick(.12), 33.90 + k * .32)
add(fx, ding(.25, 2093), 36.32); [add(fx, coin(.3), t) for t in [38.54, 38.68, 39.14]]
PAUSES = [(7.52, 8.14), (24.18, 25.26), (29.50, 29.90), (35.82, 36.32)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, pauses=PAUSES, seed=1)
