"""Sets for the nightclub film: the club front on a dark-blue brick street at night (the reference's club, in our dark-blue world)."""
import bpy, math
from nc import *

def facade(rope_x=(1.5, 9.0)):
    # the street: cobbles, a kerb, the brick front of the club (wall faces -Y at y = 0)
    g = box('ground', (0, -6, -.05), (60, 20, .1), cobble_mat()); 
    box('pavement', (0, -1.8, .02), (60, 3.6, .08), mat('pave', '#1c1f36', rough=.6))
    box('kerb', (0, -3.62, .05), (60, .2, .14), mat('kerb', '#2a2e4a', rough=.6))
    box('wall', (0, .25, 4), (60, .5, 8.5), brick_mat())
    box('plinth', (0, -.02, .25), (60, .1, .5), mat('plinth', '#141628', rough=.7))
    # the door: a dark frame, two red padded doors with gold handles, a little window on each
    red = mat('door_red', '#a5161e', rough=.6); frame = mat('frame', '#2a0a12', rough=.4); gold = mat('gold', '#e8c35a', rough=.25, metal=.9)
    box('doorframe', (0, -.05, 1.7), (2.9, .2, 3.4), frame)
    for s in (-1, 1):
        box(f'door{s}', (s * .66, -.17, 1.55), (1.26, .08, 3.0), red, bevel=.03)
        for r in range(4):
            for c in range(2): sphere(f'stud{s}{r}{c}', (s * .66 + (c - .5) * .6, -.22, .6 + r * .62), .025, m=gold, seg=10)
        cyl(f'handle{s}', (s * .12, -.26, 1.4), .025, .6, gold)
        box(f'dwin{s}', (s * .66, -.22, 2.45), (.5, .02, .5), mat('dwin', '#d9b35c', rough=.3, emit='#ffcf7a', estr=1.2))
    # the red carpet
    box('carpet', (0, -1.6, .07), (2.6, 3.2, .02), mat('carpet', '#b0141c', rough=.9))
    # the marquee over the door: a box with a row of warm bulbs
    box('marquee', (0, -.55, 3.75), (4.2, 1.1, .45), mat('marq', '#3a0e1a', rough=.5), bevel=.02)
    bulb = emissive('bulb', '#ffd890', 18.)
    for k in range(17): sphere(f'bulb{k}', (-2 + k * .25, -1.12, 3.75), .06, m=bulb, seg=12)
    for k in range(6): sphere(f'bulbs{k}', (-2.1, -.95 + k * .17, 3.75), .05, m=bulb, seg=12); sphere(f'bulbt{k}', (2.1, -.95 + k * .17, 3.75), .05, m=bulb, seg=12)
    light('POINT', (0, -1.6, 3.3), 260, '#ffcf8a', .6, name='marqlight')
    # the vertical neon sign above: a dark panel with three turquoise stars and an arrow
    box('signpanel', (0, -.2, 5.9), (1.25, .2, 3.6), mat('signp', '#1a1240', rough=.4))
    for k in range(3): neon_poly(f'star{k}', star_pts(0, 7.2 - k * 1.05, .38, -.32), .028, '#2ED3C6', 22.)
    neon_poly('signedge', [(-.62, -.31, 4.1), (.62, -.31, 4.1), (.62, -.31, 7.7), (-.62, -.31, 7.7)], .02, '#ff4fa0', 10.)
    light('AREA', (0, -1.6, 6.2), 30, '#2ED3C6', 1.5, rot=(math.radians(90), 0, 0), name='neonlight')
    # wall lamps and posters
    for x in (-4.5, 4.5, 11, -11):
        box(f'lampar{x}', (x, -.3, 4.2), (.06, .5, .06), mat('iron', '#0c0d18', rough=.4))
        sphere(f'lamp{x}', (x, -.55, 4.05), .16, m=emissive('lampglow', '#ffd28a', 10.)); light('POINT', (x, -.8, 3.9), 320, '#ffc77a', .3, name=f'lamplight{x}')
    for x, c in ((-2.6, '#2ED3C6'), (3.0, '#f2c14e'), (7.5, '#e0567a')):
        box(f'poster{x}', (x, -.02, 2.0), (1.0, .04, 1.4), mat('pframe' + c, '#c9a24a', rough=.3, metal=.6))
        box(f'posterin{x}', (x, -.05, 2.0), (.85, .02, 1.25), mat('pin' + c, c, rough=.5, emit=c, estr=.3))
    # the rope line: gold posts and sagging red velvet ropes along the wall
    xs = [rope_x[0] + i * 1.5 for i in range(int((rope_x[1] - rope_x[0]) / 1.5) + 1)]; y = -1.25
    for i, x in enumerate(xs):
        cyl(f'post{i}', (x, y, .5), .045, 1.0, gold); cyl(f'postbase{i}', (x, y, .04), .2, .08, gold); sphere(f'postball{i}', (x, y, 1.05), .08, m=gold)
        if i: tube(f'rope{i}', [(xs[i - 1], y, .95), ((xs[i - 1] + x) / 2, y, .62), (x, y, .95)], .04, mat('rope', '#c0182a', rough=.7))
    # the far side of the street: dark buildings with a few lit windows (out of focus behind the camera mostly)
    for k in range(8):
        h = 7 + (k * 37 % 5); box(f'bld{k}', (-14 + k * 4.2, -15, h / 2), (3.8, 3, h), mat('bld', '#0d1024', rough=.8))
    # the night: moonlight (cool blue) and a warm fill from the club
    world('#04060f', 1.)
    light('SUN', (0, 0, 10), 1.6, '#8fa8ff', rot=(math.radians(55), 0, math.radians(-25)), name='moon')
    light('AREA', (-3, -6, 4), 520, '#6f86ff', 6, rot=(math.radians(70), 0, math.radians(-30)), name='bluefill')
