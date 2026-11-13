"""Sound for M02 Megerősítés: no music, only elegant effects placed exactly on the motions (the locked M01 method, tools/motion_sound2.py).
The picture writes each motion's start and end into events.json; every sound below sits on those times."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 38.8, 41.3
EVS = {e['type']: (e['t'], e['end']) for e in json.load(open(os.path.join(HERE, 'events.json')))['ev']}
A = lambda k: EVS[k][0]; B = lambda k: EVS[k][1]; D = lambda k: EVS[k][1] - EVS[k][0]
fx = buf(DUR)
def over(k, f, *a, lead=.15, pan=0): add(fx, f(D(k) + 2 * lead, *a), A(k) - lead, pan=pan)
over('sats', spin, .22); [add(fx, thud(.14, 110), A('sats') + .55, pan=p) for p in (-.6, .6)]   # four rings swing out and settle
over('links', glide, .07, 330, 494)                                                              # dotted links draw in
add(fx, swell(.9, .18), A('eclipse') - .8); add(fx, bloom(.5, 50), A('eclipse') + .1)           # the orb turns into a dark eclipse
over('chains', scan, .14, lead=.05); add(fx, thud(.25, 80), B('chains') - .05)                   # chains cross over it
over('lightup', swoosh, .26, lead=.1); add(fx, shimmer(1.4, .07), A('lightup') + .2)             # light sweeps the eclipse open...
over('eyeOpen', glide, .08, 260, 440)                                                            # ...into an eye
over('blink', swoosh, .1, lead=.03)
over('beam', scan, .2, lead=.05); over('sweep', spin, .16, lead=.05)                             # the beam swings round
add(fx, shimmer(D('dots') + .8, .09), A('dots') - .1)   # the dots light up one after another (one soft shimmer, no dings)
over('gather', swoosh, .24, False, lead=.1)                                                      # the dots gather in
over('petals', swoosh, .2, lead=.05); add(fx, thud(.35, 70), B('align') - .25)                   # the shapes swing in... and click into line
over('align', glide, .1, 330, 440, lead=.05)
add(fx, swell(.7, .16), A('rays') - .6); add(fx, bloom(.55, 52), A('rays')); add(fx, air(1.4, .1), A('rays') + .1)   # rays burst out
over('rise', swoosh, .2, lead=.05); over('figure', glide, .08, 220, 440)                          # the orb rises; the figure draws
over('leaf', glide, .08, 440, 660, lead=.05); add(fx, shimmer(1.2, .06), A('leaf') + .2)          # leaves grow
over('world', swoosh, .2, lead=.1); add(fx, thud(.2, 65), B('world') - .2)                        # the world ring spreads
over('cone', scan, .2, lead=.05); add(fx, bloom(.35, 58), A('cone') + .3)                         # a cone of light
over('arms', swoosh, .14, lead=.05); over('gem', glide, .09, 660, 440); add(fx, chime(.08, 1760), B('gem') - .05)   # the diamond floats into the hands
over('pulse', swoosh, .12, lead=.03); add(fx, swell(.6, .14), A('taste') - .5); add(fx, bloom(.45, 55), A('taste') + .1)   # a ring of light opens
over('mirrorIn', scan, .2, lead=.05); add(fx, thud(.16, 120), B('mirrorIn') - .1, pan=.4)        # the mirror stands up
over('reflectIn', shimmer, .07, lead=.05)                                                        # the reflection forms
over('stepOut', swoosh, .22, lead=.05); add(fx, thud(.2, 90), B('stepOut') - .1)                  # it steps out to meet the orb
over('orbit', spin, .22, lead=.1); add(fx, bloom(.4, 55), A('orbit') + .3)                       # they circle together
add(fx, swell(.7, .16), A('merge') - .5); over('merge', swoosh, .2, False, lead=.05); add(fx, bloom(.4, 50), B('merge') - .1)   # they merge into an eclipse
over('lid', glide, .07, 330, 440); over('eyeOpen2', swoosh, .18, lead=.05)                        # the eye opens
over('drop', swoosh, .16, False, lead=.05); add(fx, thud(.28, 70), B('drop') - .1)                # the pupil drops
over('pull', glide, .09, 300, 450); over('pull', swoosh, .14, lead=.05); add(fx, shimmer(D('pull') + .6, .07), A('pull') + .2)   # coloured dots are drawn in
add(fx, swell(.6, .14), A('tunnel') - .5); over('tunnel', spin, .3, lead=.1)                      # the tunnel of frames
add(fx, bloom(.5, 55), A('settle') + .1); add(fx, shimmer(1.8, .09), A('settle') + .2)            # it settles into one warm glow
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, bed_level=0.0, seed=0)
