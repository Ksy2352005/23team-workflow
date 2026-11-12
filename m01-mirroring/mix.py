"""Sound for M01 Tükrözés, redone: smooth and continuous (tools/motion_sound2.py). A soft ambient bed under the voice; long airy swooshes carry
every morph and camera move; soft swells lead into the big reveals and a gentle low bloom lands on them. No pops, ticks or dings."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 40.4, 42.9
fx = buf(DUR)
add(fx, glide(1.6, .07, 220, 440), .1)                                    # the grid fills in
add(fx, swoosh(1.4, .16), 1.02-.5, pan=.3)                               # the corner is dragged; the grid grows
add(fx, swell(.9, .12), 3.6-.9); add(fx, swoosh(1.8, .22), 3.6-.2, pan=-.2)   # the grid turns away; arcs sweep in
add(fx, glide(2.0, .06, 260, 390), 4.3-.1)                               # the gears turn together
add(fx, air(1.6, .07), 7.48-.5); add(fx, swell(1.2, .14), 8.14-1.2); add(fx, bloom(.5, 55), 8.14-.05); add(fx, shimmer(1.8, .06), 8.14)   # light gathers into the word
add(fx, swoosh(1.2, .14, False), 10.13-.4); add(fx, bloom(.25, 62), 10.13+.2)        # the word folds into the orb
add(fx, swoosh(1.0, .14), 12.46-.4, pan=.6)                               # the frame slides in
for t in [13.68, 14.3]: add(fx, swoosh(.6, .1), t - .3, pan=.3)            # the frame flips to the next picture
add(fx, glide(1.2, .07, 520, 260), 14.3+.5)                               # the orb sinks to a point
add(fx, glide(1.0, .07, 260, 520), 15.48-.2); add(fx, swoosh(2.2, .12), 16.54-.2)   # it swells; a calm ring breathes out
add(fx, shimmer(1.2, .06), 18.16-.2); add(fx, swoosh(1.0, .1), 19.02); add(fx, bloom(.3, 58), 19.66)   # star; the suited person
add(fx, swell(.8, .1), 20.36-.8); add(fx, swoosh(3.0, .18), 20.36); add(fx, swoosh(1.0, .1, False), 22.34-.3)   # the frames spin out; they fall away, the core splits
add(fx, swell(1.0, .14), 24.98-1.0); add(fx, bloom(.5, 52), 24.98); add(fx, shimmer(1.6, .06), 25.26)   # trust grows
add(fx, swoosh(1.4, .14, False), 26.52-.3); add(fx, glide(2.4, .05, 300, 360), 27.12)   # the brain and its waves
add(fx, swell(.9, .14), 28.92-.9); add(fx, air(2.0, .1), 28.92); add(fx, bloom(.45, 60), 30.0-.2)   # it shatters into light
add(fx, glide(2.0, .06, 330, 440), 31.56-.4); add(fx, swoosh(1.4, .12), 32.42-.3)   # the discs drift together and overlap
add(fx, swoosh(1.2, .12, False), 33.06)                                    # the light fades
for k, t in enumerate([34.3, 34.84, 36.32]): add(fx, swoosh(.5, .08), t - .25, pan=(k - 1) * .5)   # the faces flip
add(fx, shimmer(1.4, .06), 36.32+.2)
for k, t in enumerate([37.92, 38.68, 39.18]): add(fx, swoosh(.5, .09), t - .25, pan=(k - 1) * .5); add(fx, shimmer(1.2, .05 + .01 * k), t, pan=(k - 1) * .5)
add(fx, bloom(.4, 55), 39.18+.3)
DIPS = [(8.14-1.2, 8.14-.1), (24.98-1.0, 24.98), (30.0-1.1, 30.0-.2)]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, dips=DIPS, seed=0)
