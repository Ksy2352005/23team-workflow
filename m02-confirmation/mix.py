"""Sound for M02 Megerősítés (concrete version): no music, only elegant effects placed exactly on the motions (locked M01 method,
tools/motion_sound2.py); the picture writes each motion's start and end into events.json. Ends with the spoken call to action, line 1."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 38.8, 42.9
EVS = {e['type']: (e['t'], e['end']) for e in json.load(open(os.path.join(HERE, 'events.json')))['ev']}
A = lambda k: EVS[k][0]; B = lambda k: EVS[k][1]; D = lambda k: EVS[k][1] - EVS[k][0]
fx = buf(DUR)
def over(k, f, *a, lead=.15, pan=0): add(fx, f(D(k) + 2 * lead, *a), A(k) - lead, pan=pan)
over('brain', glide, .08, 220, 440); add(fx, shimmer(1.4, .06), A('brain') + .4)               # the brain draws in light
add(fx, thud(.3, 90), B('lockOn') - .15)                                                         # the padlock clamps on
over('keyIn', swoosh, .24, lead=.05, pan=.5); add(fx, thud(.18, 140), B('keyIn') - .05, pan=.2)    # the key flies in and slots
over('turn', glide, .1, 300, 520, lead=.03); add(fx, thud(.26, 110), B('turn') - .05)              # it turns; the lock springs open
add(fx, bloom(.55, 52), A('burst')); add(fx, air(1.2, .1), A('burst') + .05)                      # light pours out
over('split', swoosh, .2, lead=.05)
over('shop', glide, .07, 330, 494, pan=-.5); add(fx, thud(.2, 100), B('shop') - .2, pan=-.5)      # the shop builds
over('house', glide, .07, 330, 494, pan=.5); add(fx, thud(.2, 100), B('house') - .2, pan=.5)      # the home builds
over('links', swoosh, .16, lead=.05)                                                             # light runs to the middle
over('shake', glide, .08, 260, 390); add(fx, thud(.3, 80), B('shake') - .15); add(fx, shimmer(1.2, .07), B('shake') - .1)   # the rings link
over('headIn', swoosh, .2, lead=.1)
over('starIn', shimmer, .08, lead=.05)                                                           # the belief star glows
over('cardIn', swoosh, .26, lead=.05, pan=.6)                                                    # the message card flies in...
add(fx, thud(.32, 75), B('snap') - .1); add(fx, bloom(.45, 55), B('snap') - .1)                   # ...and snaps into the head: the star flares
over('check', glide, .1, 440, 660, lead=.03, pan=.4)                                             # the check mark draws
add(fx, thud(.2, 120), A('heart') + .25, pan=.4); add(fx, shimmer(1.2, .06), A('heart') + .3)     # a heart
over('bottle', swoosh, .2, lead=.05); add(fx, thud(.2, 110), B('bottle') - .15)                    # the eco bottle lands
over('take', swoosh, .14, lead=.05, pan=-.4)
over('flow', glide, .09, 330, 494, lead=.05)                                                     # light flows to the globe...
add(fx, swell(.7, .14), A('heal') - .5); add(fx, bloom(.45, 58), A('heal') + .1); add(fx, shimmer(1.6, .08), A('heal') + .3)   # ...which turns bright and green
over('gem', glide, .09, 660, 440); add(fx, chime(.07, 1760), B('gem') - .1)                        # the diamond appears
over('badge', swoosh, .18, lead=.05, pan=-.4); add(fx, thud(.28, 90), B('badge') - .1, pan=-.4)   # the gold badge lands on his chest
add(fx, shimmer(1.4, .07), A('proud') + .1)
over('mirror', scan, .18, lead=.05)                                                              # a mirror stands up
over('echo', glide, .08, 440, 660, lead=.05)                                                     # his star appears in it
over('shield', swoosh, .2, lead=.05); add(fx, thud(.28, 80), B('shield') - .1)                    # a shield appears...
over('fill', glide, .1, 220, 440, lead=.05); add(fx, bloom(.45, 55), B('fill') - .2)             # ...and fills with light
over('keyMorph', swoosh, .18, lead=.05); add(fx, thud(.22, 100), B('keyMorph') - .1)              # the key
over('flagL', glide, .08, 260, 520, pan=-.5); over('flagR', glide, .08, 330, 660, pan=.5)         # the flags rise
over('walk', swoosh, .14, lead=.05)                                                              # the two walk together...
add(fx, thud(.22, 110), A('join') + .15); add(fx, shimmer(1.2, .07), A('join') + .2)               # ...and join hands
add(fx, swell(.6, .14), A('bigHeart') - .4); add(fx, bloom(.55, 52), A('bigHeart') + .1); add(fx, shimmer(1.8, .08), A('glow'))   # a big warm heart
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, bed_level=0.0, seed=0, cta=1)
