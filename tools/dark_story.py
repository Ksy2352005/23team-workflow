#!/usr/bin/env python3
"""Move an old blue-world story film into the dark story-film world (brand/23team.md -> "Story-film world").

    python3 tools/dark_story.py <film>      # rewrites <film>/main.js in place

What it does (the same steps used by hand on kitchen-bundles/ and vacuum-test/):
- sky / caption area / end card: TOP and END_BLUE -> #050916, NAVY -> #0f131e
- the bg() centre glow: #163A8C / #2d4596 -> #0d2463 (a soft dark-blue glow, never flat black)
- floors -> #0a1022 / #070b18
- every other blue surface colour (hue 195-265, saturation > .12, lightness < .5): hue 226, 42% lightness, 70% saturation
- caption key words turquoise #2ED3C6, the end-card logo white #F4F7FF
- words drawn in the pictures in Montserrat Bold (Lilita One broke Ő/Ű), captions 50 px / line height 64
The mascots live in char2d.js and keep their colours.
"""
import colorsys, re, sys, os

film = sys.argv[1]
p = os.path.join(film, 'main.js')
s = open(p, encoding='utf-8').read()

FIXED = {
    "TOP = '#00113F'": "TOP = '#050916'", "END_BLUE = '#00113F'": "END_BLUE = '#050916'", "NAVY = '#1c2450'": "NAVY = '#0f131e'",
    "'#163A8C'": "'#0d2463'", "col = '#2d4596'": "col = '#0d2463'",
    "'#0d1d5c'": "'#0a1022'", "'#071341'": "'#070b18'",
    "col = hot || w.key ? GOLD : CREAM;": "col = hot || w.key ? '#2ED3C6' : CREAM;   // dark story world: turquoise key words",
    "c.font = `${size}px \"Lilita One\"`": "c.font = `700 ${Math.round(size * .84)}px \"Montserrat\"`",
    "size: 56, lh: 72,": "size: 50, lh: 64,",
}
for a, b in FIXED.items():
    s = s.replace(a, b)
s = re.sub(r"(x\.globalCompositeOperation = 'source-in'; x\.fillStyle = )'#[0-9a-fA-F]{6}'", r"\1'#F4F7FF'", s)

KEEP = {'#050916', '#0f131e', '#0d2463', '#0a1022', '#070b18', '#2ED3C6', '#F4F7FF'}
def dark(m):
    h = m.group(1)
    if '#' + h in KEEP or '#' + h.upper() in KEEP: return m.group(0)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    H, L, S = colorsys.rgb_to_hls(r, g, b)
    if not (195 / 360 <= H <= 265 / 360 and S > .12 and L < .5): return m.group(0)
    r, g, b = colorsys.hls_to_rgb(226 / 360, L * .42, S * .7)
    return "'#%02x%02x%02x'" % tuple(round(v * 255) for v in (r, g, b))
s = re.sub(r"'#([0-9a-fA-F]{6})'", dark, s)
open(p, 'w', encoding='utf-8').write(s)
print('dark world:', p)
