"""Sound for M01 Tükrözés (v2): smooth and continuous, every sound placed on its motion. The picture writes each motion's start and end
into events.json (window.EV in main.js); this file reads them, so a whoosh peaks while a thing moves and a soft thud lands on the frame it lands.
A soft ambient bed underneath (tools/motion_sound2.py); no pops, ticks or dings; effects about level with the voice's peaks."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 40.4, 42.9
EVS = {e['type']: (e['t'], e['end']) for e in json.load(open(os.path.join(HERE, 'events.json')))['ev']}
A = lambda k: EVS[k][0]; B = lambda k: EVS[k][1]; D = lambda k: EVS[k][1] - EVS[k][0]
fx = buf(DUR)
def over(k, f, *a, lead=.15, pan=0):   # a sound stretched over a motion: it starts a touch before and peaks mid-way
    add(fx, f(D(k) + 2 * lead, *a), A(k) - lead, pan=pan)
over('fill', glide, .08, 220, 440)
over('drag', swoosh, .22, pan=.4)
over('sweep', spin, .3, lead=.25)                                   # the arc sweeps round and wipes the grid
over('gears', glide, .07, 260, 390); [add(fx, thud(.18, 90), A('gears') + k * .22 + .35, pan=(k - 1) * .4) for k in range(3)]   # each gear settles
add(fx, swell(D('squeeze') + .2, .2), A('squeeze') - .2)          # the gears squeeze into a line of light...
over('scan', scan, .3, lead=.05); add(fx, bloom(.55, 55), A('scan') + .05)   # ...which opens outward and reveals the word
over('melt', melt, .26, lead=.05)
x = B('drop') - A('drop'); add(fx, swoosh(.6, .22, False), A('drop') - .2)   # the orb drops...
for f_, v in [(.364, .55), (.727, .22), (.909, .09)]: add(fx, thud(v, 62), A('drop') + f_ * x)   # ...and bounces on the mirror floor
over('slideIn', swoosh, .3, lead=.1, pan=.6); add(fx, thud(.22, 110), B('slideIn') - .05, pan=.3)
over('flip1', swoosh, .16, lead=.05, pan=.3); over('flip2', swoosh, .16, lead=.05, pan=.3)
over('slideOut', swoosh, .26, lead=.05, pan=-.6)
over('shrink', glide, .1, 520, 200)
over('grow', glide, .1, 220, 520); add(fx, bloom(.3, 60), B('grow') - .2)
over('ring', swoosh, .26, lead=.1); add(fx, air(D('ring'), .08), A('ring') + .2)
over('star', scan, .16, lead=.05)
over('person', glide, .09, 260, 520); add(fx, bloom(.4, 58), B('person') - .2)
add(fx, swell(.9, .2), A('zoomIn') - .6); over('zoomIn', spin, .3, lead=.1)        # into the tunnel
over('zoomOut', swoosh, .34, lead=.1)                                              # the frames rush past
add(fx, swoosh(D('split') * .5 + .3, .2), A('split') + .1, pan=-.7); add(fx, swoosh(D('split') * .5 + .3, .2), A('split') + .1, pan=.7)
add(fx, swell(1.0, .22), A('swell') - .8); add(fx, bloom(.6, 52), A('swell') + .2); add(fx, shimmer(1.8, .1), A('swell') + .5)
over('morph', glide, .08, 400, 300); add(fx, air(D('morph') + .6, .08), A('morph'))
add(fx, swell(.8, .2), A('shatter') - .7); add(fx, air(1.6, .2), A('shatter')); add(fx, thud(.4, 55), A('shatter'))   # the brain shatters...
over('iris', swoosh, .3, lead=.05); add(fx, bloom(.35, 60), A('iris') + .3)        # ...into light that opens out
over('pull', glide, .08, 330, 440); add(fx, swell(.8, .14), B('pull') - .8); add(fx, bloom(.35, 56), B('pull') - .1)
over('irisOut', swoosh, .26, False, lead=.05)
for k in range(3): add(fx, thud(.16, 120), A('faces') + k * .12 + .25, pan=(k - 1) * .5)   # the faces settle in
for k, f_ in enumerate(['f1', 'f2', 'f3']): over(f_, swoosh, .2, lead=.03, pan=(.0, -.5, .5)[k])
for k, f_ in enumerate(['c1', 'c2', 'c3']): over(f_, swoosh, .2, lead=.03, pan=(k - 1) * .5); add(fx, chime(.16 + .03 * k, 1568 * 2 ** (k * 2 / 12)), A(f_) + .2, pan=(k - 1) * .5)
add(fx, bloom(.45, 55), A('c3') + .4)
DIPS = [(A('squeeze') - .2, A('scan')), (A('swell') - .8, A('swell') + .2), (A('shatter') - .7, A('shatter'))]
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, dips=DIPS, seed=0)
