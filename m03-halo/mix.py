"""Sound for M03 Halo-hatás (thin-line orb style, like M02 v4): no music; quiet studio effects (tools/sfx-lib) on the picture's cues.
The hook: a rushing zoom through the tunnel of rings, a deep impact as it hits the light, a short riser as the sales chart shoots up.
Then a soft draw-on for each drawing, a whoosh for each glide of the light, a shimmer on rays, a swell on ripples.
Ends with the spoken call to action (line 2), a little below the voice, then 1.5 s of the logo alone."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import *
STORY, DUR = 52.1, 56.9
EV = json.load(open(os.path.join(HERE, 'events.json')))['ev']
fx = buf(DUR); k = 0
for e in EV:
    ty, t = e['type'], e['t']; pan = max(-.45, min(.45, (e.get('x', 540) - 540) / 450))
    if ty == 'rush': add(fx, lib('zoom-through', .3), 0)
    if ty == 'impact': add(fx, lib('impact-soft-a', .55), t - .02); add(fx, lib('reveal-shimmer', .14), t + .05)
    if ty == 'rise': add(fx, lib('riser-short', .16), t)
    if ty == 'in': add(fx, draw_on(.085) if k % 2 else draw_on2(.085), t + .03, pan=pan); k += 1
    if ty == 'glide': add(fx, lib('whoosh-soft-a' if k % 2 else 'whoosh-soft-b', .13), t + max(0, e['d'] / 2 - .45), pan=pan)
    if ty == 'rays': add(fx, lib('reveal-shimmer', .12), t - .05); add(fx, lib('impact-soft-b', .14), t)
    if ty == 'ripple': add(fx, lib('swell-glow', .15), t - .3)
write_mix(HERE, voice='refs/voiceover-hu-x1.10-tight.mp3', fx=fx, story=STORY, dur=DUR, bed_level=0.0, seed=0, cta=2)
