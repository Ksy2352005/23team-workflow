"""Sound for M01 Tükrözés (v3): no music at all, only elegant sound effects placed exactly on the motions.
The picture writes each motion's start and end into events.json (window.EV in main.js); every sound here is placed on those times:
whooshes peak while a thing moves, a soft thud lands on the frame it lands, a glide follows a thing growing or shrinking. No pops, ticks or dings."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 40.4, 42.9
EVS = {e['type']: (e['t'], e['end']) for e in json.load(open(os.path.join(HERE, 'events.json')))['ev']}
A = lambda k: EVS[k][0]; B = lambda k: EVS[k][1]; D = lambda k: EVS[k][1] - EVS[k][0]
fx = buf(DUR)
def over(k, f, *a, lead=.15, pan=0): add(fx, f(D(k) + 2 * lead, *a), A(k) - lead, pan=pan)   # stretched over a motion, peaking mid-way
over('fill', glide, .08, 220, 440); add(fx, shimmer(1.4, .05), A('fill') + .3)               # the coins fill in
over('drag', swoosh, .2, pan=.4); add(fx, thud(.16, 120), B('drag') - .1, pan=.4)           # the corner is dragged; the grid settles
over('vortex', spin, .55, lead=.12); add(fx, glide(D('vortex') + .3, .16, 520, 260), A('vortex'))   # the grid swirls into a vortex...
for k in range(3): add(fx, thud(.32, 95 + 10 * k), A('gears') + k * .08 + .32, pan=(k - 1) * .4)   # ...and each gear springs up
over('arcs', swoosh, .18, lead=.05)
add(fx, swell(D('squeeze') + .2, .2), A('squeeze') - .2)                                    # the gears squeeze into a line of light...
over('scan', scan, .3, lead=.05); add(fx, bloom(.5, 55), A('scan') + .05)                     # ...which opens out and reveals the word
over('melt', melt, .26, lead=.05)
x = B('drop') - A('drop'); add(fx, swoosh(.6, .2, False), A('drop') - .2)                       # the orb drops...
for f_, v in [(.364, .55), (.727, .22), (.909, .09)]: add(fx, thud(v, 62), A('drop') + f_ * x)   # ...and bounces on the mirror floor
over('slideIn', swoosh, .3, lead=.1, pan=.6); add(fx, thud(.22, 110), B('slideIn') - .05, pan=.3)
over('flip1', swoosh, .16, lead=.05, pan=.3); over('flip2', swoosh, .16, lead=.05, pan=.3)
over('slideOut', swoosh, .26, lead=.05, pan=-.6)
over('shrink', glide, .1, 520, 200)
over('grow', glide, .1, 220, 520); add(fx, bloom(.3, 60), B('grow') - .2)
over('ring', swoosh, .26, lead=.1); add(fx, air(D('ring'), .08), A('ring') + .2)
over('star', scan, .16, lead=.05)
over('person', glide, .09, 260, 520); add(fx, bloom(.4, 58), B('person') - .2)
add(fx, swell(.9, .2), A('zoomIn') - .6); over('zoomIn', spin, .3, lead=.1)
over('zoomOut', swoosh, .34, lead=.1)
add(fx, swoosh(D('split') * .5 + .3, .2), A('split') + .1, pan=-.7); add(fx, swoosh(D('split') * .5 + .3, .2), A('split') + .1, pan=.7)
add(fx, swell(1.0, .22), A('swell') - .8); add(fx, bloom(.6, 52), A('swell') + .2); add(fx, shimmer(1.8, .1), A('swell') + .5)
over('qmark', glide, .1, 300, 520, lead=.05); add(fx, thud(.2, 90), B('qmark') - .15)            # the question mark draws; its dot lands
over('neuron', scan, .22, lead=.05); add(fx, air(D('neuron') + .4, .12), A('neuron') + .1); add(fx, shimmer(2.0, .1), A('neuron') + .4)   # the neuron branches out, lighting up
over('retract', swoosh, .24, False, lead=.05)
for k in range(12): add(fx, swoosh(.5, .05 + .02 * (k % 2 == 0)), A('shapes') + k * .06 + .05, pan=((k % 5) - 2) * .3)   # the shapes drift in
over('pull', glide, .1, 300, 450); add(fx, swell(.8, .14), B('pull') - .8)                     # only the circles are pulled in...
add(fx, bloom(.45, 56), A('lock') + .1); add(fx, shimmer(1.6, .08), A('lock') + .2)              # ...and lock into orbit
over('mirror', scan, .2, lead=.05)                                                             # the orbit closes into a mirror of light
add(fx, swoosh(.6, .16), A('figL') - .05, pan=-.5); add(fx, thud(.16, 100), A('figL') + .3, pan=-.5)
add(fx, swoosh(.6, .16), A('figR') - .05, pan=.5); add(fx, thud(.16, 100), A('figR') + .35, pan=.5)
over('handL', swoosh, .12, lead=.03, pan=-.4); over('handR', swoosh, .12, lead=.03, pan=.4)      # one raises a hand, the other copies it
over('touch', glide, .1, 330, 494); add(fx, swell(.6, .16), B('touch') - .55)                  # the hands reach for the mirror...
add(fx, bloom(.6, 55), A('flash') + .03); add(fx, shimmer(1.8, .12), A('flash') + .1)            # ...and meet in a flash
for k, f_ in enumerate(['c1', 'c2', 'c3']): over(f_, swoosh, .2, lead=.03, pan=(k - 1) * .5); add(fx, chime(.16 + .03 * k, 1568 * 2 ** (k * 2 / 12)), A(f_) + .25, pan=(k - 1) * .5)
add(fx, glide(.8, .08, 330, 660), A('c1') - .1)
add(fx, bloom(.45, 55), A('c3') + .45)
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, bed_level=0.0, seed=0, logo_trim=1.2)
