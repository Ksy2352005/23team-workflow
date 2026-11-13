"""Sound for M02 Megerősítés (v4, thin-line style): no music; quiet studio effects (tools/sfx-lib, ElevenLabs) placed on the picture's cues:
a soft light-stroke sound as each drawing draws itself on, a gentle airy whoosh while the orb glides to the next scene, a soft shimmer on
the rays of light, a slow swell on each ripple and on the heart filling with light, a low soft hit when the light turns into a secret (keyhole).
Ends with the spoken call to action, line 1, a little below the voice, then 1.5 s of the logo alone."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 38.8, 43.6
EV = json.load(open(os.path.join(HERE, 'events.json')))['ev']
fx = buf(DUR); k = 0
for e in EV:
    pan = max(-.45, min(.45, (e.get('x', 540) - 540) / 450))
    if e['type'] == 'in': add(fx, draw_on(.085) if k % 2 else draw_on2(.085), e['t'] + .03, pan=pan); k += 1          # a line drawing itself on
    if e['type'] == 'glide': add(fx, lib('whoosh-soft-a' if k % 2 else 'whoosh-soft-b', .13), e['t'] + max(0, e['d'] / 2 - .45), pan=pan)   # the light glides on
    if e['type'] == 'rays': add(fx, lib('reveal-shimmer', .12), e['t'] - .05); add(fx, lib('impact-soft-b', .16), e['t'])
    if e['type'] == 'ripple': add(fx, lib('swell-glow', .16), e['t'] - .3)
    if e['type'] == 'dark': add(fx, lib('impact-soft-a', .32), e['t'] + .05)
    if e['type'] == 'fill': add(fx, lib('swell-glow', .2), e['t'] - .25); add(fx, lib('sparkle-soft', .06), e['t'] + .2)
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, bed_level=0.0, seed=0, cta=1, logo_trim=1.4)
