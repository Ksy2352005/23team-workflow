"""Sound for M02 Megerősítés (v3): no music; studio-quality effects from the library (tools/sfx-lib, ElevenLabs) placed on the picture's cues:
each icon drawing itself in gets a soft light-stroke sound, each change of picture a gentle whoosh, the accents (the lock springing open,
a fill, a glow) a soft swell or a warm low hit. Ends with the spoken call to action, line 1, as loud as the voice, then 1 s of the logo alone."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 38.8, 43.1
EV = json.load(open(os.path.join(HERE, 'events.json')))['ev']
fx = buf(DUR)
for k, e in enumerate(e for e in EV if e['type'] == 'in'):   # an icon draws itself in with light; a soft whoosh carries the change of picture
    pan = max(-.5, min(.5, (e['x'] - 540) / 400)); add(fx, draw_on(.11) if k % 2 else draw_on2(.11), e['t'] + .02, pan=pan); add(fx, lib('whoosh-soft-b' if k % 2 else 'whoosh-soft-a', .16), e['t'] - .35, pan=pan)
for e in EV:
    if e['type'] == 'burst': add(fx, lib('impact-soft-a', .5), e['t'] - .05); add(fx, lib('reveal-shimmer', .14), e['t'])   # the lock springs open, light pours out
    if e['type'] == 'fill': add(fx, lib('swell-glow', .22), e['t'] - .25); add(fx, lib('sparkle-soft', .08), e['t'] + .15)    # a soft fill of colour
    if e['type'] == 'glow': add(fx, lib('reveal-shimmer', .13), e['t'] - .1); add(fx, lib('impact-soft-b', .22), e['t'])    # a warm glow on the key word
write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, bed_level=0.0, seed=0, cta=1, logo_trim=1.4)
