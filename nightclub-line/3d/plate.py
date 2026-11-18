"""2.5D version (user 2026-11-18: "between 2D and 3D", "exactly like the example"): each shot's background is a 3D set built to copy
the reference frame (layout, materials, light), rendered once as a still plate without characters; our mascots are drawn on top in
the canvas film (../2d/).

    W=1080 H=1920 SPP=64 /root/blender-venv/bin/python plate.py <name>     -> ../2d/plates/<name>.png
"""
import bpy, sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
os.environ['ENGINE'] = 'CYCLES'
from nc import *

def dof(cam, focus, fstop=2.0):
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = focus; cam.data.dof.aperture_fstop = fstop

def door_set():
    """The reference's opening frame: on the left a strip of red brick and a square concrete pillar; a recessed dark frame with a
    concrete lintel; two padded red doors with gold studs in columns, long gold pull handles, a gold-framed cream panel high on each
    door and dark bronze kick plates; a red velvet rope across in front; a red carpet on grey paving; warm light from above-front."""
    brick = brick_mat('brick', c1='#9a3f2e', c2='#87382a', mortar='#5a4a42', scale=4.)
    conc = mat('concrete', '#7d746c', rough=.85); dark = mat('recess', '#2a1a16', rough=.7)
    red = mat('door_red', '#b0121a', rough=.5); gold = mat('gold', '#d9ab48', rough=.28, metal=1.)
    cream = mat('panel', '#e8d9b4', rough=.6); bronze = mat('kick', '#3e2a14', rough=.35, metal=.7)
    box('ground', (0, -4, -.05), (20, 10, .1), mat('paving', '#8a837c', rough=.75))
    box('wall', (-3, .3, 3), (6, .4, 6), brick)                     # brick to the left
    box('wallTop', (0, .3, 5.0), (8, .4, 4.4), brick)               # brick above the lintel
    box('pillar', (-1.06, -.2, 2.0), (.3, .5, 4.0), conc, bevel=.02)
    box('lintel', (0, -.14, 3.1), (4.0, .5, 1.34), conc, bevel=.02)
    box('pillarR', (1.06, -.2, 2.0), (.3, .5, 4.0), conc, bevel=.02)
    box('recess', (0, .12, 1.3), (1.9, .1, 2.6), dark)
    for s in (-1, 1):
        cx = s * .45
        box(f'door{s}', (cx, -.02, 1.22), (.86, .12, 2.4), red, bevel=.03)
        for c in range(4):
            for r in range(5):
                sphere(f'stud{s}{c}{r}', (cx + (c - 1.5) * .2, -.09, .5 + r * .2), .016, m=gold, seg=10)
        box(f'pframe{s}', (cx + s * .06, -.09, 1.68), (.52, .03, .6), gold, bevel=.008)
        box(f'panel{s}', (cx + s * .06, -.105, 1.68), (.45, .02, .53), cream)
        box(f'kick{s}', (cx, -.085, .24), (.74, .02, .3), bronze, bevel=.005)
        cyl(f'handle{s}', (s * .1, -.13, 1.15), .016, .7, gold)
        for z in (.82, 1.48): box(f'hmount{s}{z}', (s * .1, -.105, z), (.03, .05, .03), gold)
    # the velvet rope across the frame in front of the doors, from posts just outside the picture
    rope = mat('rope', '#c3162a', rough=.65)
    tube('rope', [(-2.4, -1.0, 1.0), (-1.2, -1.0, .86), (0, -1.0, .8), (1.2, -1.0, .86), (2.4, -1.0, 1.0)], .035, rope)
    for x in (-2.4, 2.4): cyl(f'post{x}', (x, -1.0, .5), .045, 1.0, gold); sphere(f'pball{x}', (x, -1.0, 1.05), .07, m=gold)
    box('carpet', (0, -.75, .015), (3.0, 1.5, .03), mat('carpet', '#c9262c', rough=.95), bevel=.01)
    box('step', (0, -2.2, -.02), (20, 1.4, .06), mat('paving2', '#9a938b', rough=.8))
    # light: a big warm soft key from above and in front (the marquee), a warm fill, the top of the frame falling into shadow
    light('AREA', (-.3, -3.2, 1.9), 260, '#ffd2a0', 3, rot=(math.radians(80), 0, 0), name='key')
    light('AREA', (0, -6, 1.2), 60, '#ffe6cc', 4, rot=(math.radians(88), 0, 0), name='fill')
    light('AREA', (-2.5, -1.5, 2.5), 60, '#ffb070', 1.5, rot=(math.radians(60), 0, math.radians(-50)), name='side')
    world('#1a1210', 1.)

name = sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = render_setup(int(os.environ.get('W', 1080)), int(os.environ.get('H', 1920)), int(os.environ.get('SPP', 64)))
sc.view_settings.look = 'AgX - Punchy'; sc.view_settings.exposure = float(os.environ.get('EXP', 0))
if name == 'door':      # the reference's first frame: straight on, a little above eye level of the characters
    door_set(); cam = camera((-.34, -5.7, 1.6), (-.34, 0, .95), lens=36); dof(cam, 4.2, 2.4)
out = os.path.join(HERE, '..', '2d', 'plates', name + '.png'); os.makedirs(os.path.dirname(out), exist_ok=True)
sc.render.filepath = out; bpy.ops.render.render(write_still=True); print('plate', out)
