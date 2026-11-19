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
        sphere(f'lamp{x}', (x, -.55, 4.05), .16, m=emissive('lampglow', '#ffd28a', 10.)); light('POINT', (x, -.8, 3.9), 120, '#ffc77a', .3, name=f'lamplight{x}')
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
        for i in range(2):   # their windows, facing the club, some lit warm (user 2026-11-19: the taxi shot looked fake against black slabs)
            for j in range(1, int(h / 2.2)):
                lit_ = (k * 3 + i * 5 + j * 7) % 5 < 2
                box(f'bw{k}_{i}_{j}', (-14 + k * 4.2 - .9 + i * 1.8, -13.47, j * 2.2 + .4), (.9, .06, 1.2),
                    mat('bwlit', '#ffd9a0', emit='#ffc878', estr=3.0) if lit_ else mat('bwdark', '#141c40', rough=.3))
    # the night: moonlight (cool blue) and a warm fill from the club
    world('#04060f', 1.)
    # the characters' own light (user 2026-11-17: more light on the characters than on the wall): a soft warm key from the front at body height,
    # falling off before the wall, and a cool rim from above behind them
    light('AREA', (0, -5.5, 1.9), 650, '#fff1dc', 5, rot=(math.radians(88), 0, 0), name='charkey')
    light('AREA', (0, -2.6, 4.6), 260, '#9fdcff', 6, rot=(math.radians(-20), 0, 0), name='charrim')
    # the same character light all along the street (the line, the couple, the taxi, the back door are lit like the club front)
    for x in (-16, -12, -8, 6, 12, 18, 24, 30):
        light('AREA', (x, -5.5, 2.0), 520, '#fff1dc', 5, rot=(math.radians(88), 0, 0), name=f'streetkey{x}')
        light('AREA', (x, -2.6, 4.6), 200, '#9fdcff', 6, rot=(math.radians(-20), 0, 0), name=f'streetrim{x}')
    light('AREA', (10.5, -8.5, 2.5), 500, '#fff1dc', 5, rot=(math.radians(80), 0, 0), name='taxikey')
    light('SUN', (0, 0, 10), 1.6, '#8fa8ff', rot=(math.radians(55), 0, math.radians(-25)), name='moon')
    light('AREA', (-3, -6, 4), 260, '#6f86ff', 6, rot=(math.radians(70), 0, math.radians(-30)), name='bluefill')

def backdoor(x=-12.):   # the club's back door further down the same wall: a dark steel door, a caged lamp above
    steel = mat('steel', '#3a3f52', rough=.45, metal=.6)
    box('bdframe', (x, -.05, 1.35), (1.5, .16, 2.7), mat('bdf', '#14161f', rough=.5))
    door = box('bdoor', (x, -.15, 1.3), (1.25, .08, 2.55), steel, bevel=.02)
    for r in range(5):
        for c in range(4): box(f'bdplate{r}{c}', (x - .45 + c * .3, -.2, .4 + r * .45), (.12, .015, .12), mat('plate', '#4a5066', rough=.4, metal=.7), rot=(0, .785, 0))
    cyl('bdbar', (x + .45, -.24, 1.25), .03, .5, steel, rot=(0, 0, 0))
    sphere('bdlamp', (x, -.4, 2.95), .14, m=emissive('bdlampg', '#ffd8a0', 12.)); light('POINT', (x, -.9, 2.7), 220, '#ffd8a0', .3, name='bdlight')
    box('bin', (x + 1.6, -.5, .55), (.9, .7, 1.1), mat('binm', '#1f3a2e', rough=.6))
    return door

def taxi(x, y, rot=0.):   # a classic yellow cab (user 2026-11-19: "make it look real"): rounded glossy body, cabin with glass, chrome bumpers, hubcaps, lights, checker band, roof sign
    yel = mat('taxi', '#f2bf2e', rough=.22, coat=.6); glass = mat('glass', '#14203a', rough=.05, metal=.3); tyre = mat('tyre', '#0c0c10', rough=.85)
    chrome = mat('chrome', '#d8dce6', rough=.12, metal=1.); dark = mat('trim', '#15151c', rough=.4)
    root = empty('taxi', (x, y, 0)); root.rotation_euler = (0, 0, rot)
    box('tbody', (x, y, .62), (4.4, 1.8, .62), yel, bevel=.22, parent=root)                       # the lower body
    box('thood', (x + 1.45, y, .9), (1.4, 1.74, .12), yel, bevel=.06, parent=root)                 # hood
    box('tcab', (x - .25, y, 1.22), (2.3, 1.62, .62), yel, bevel=.2, parent=root)                  # the cabin
    for sy in (-1, 1):
        box(f'twin{sy}a', (x + .3, y + sy * .815, 1.24), (.95, .02, .42), glass, bevel=.04, parent=root)
        box(f'twin{sy}b', (x - .8, y + sy * .815, 1.24), (.95, .02, .42), glass, bevel=.04, parent=root)
        box(f'tpill{sy}', (x - .25, y + sy * .82, 1.24), (.06, .025, .46), dark, parent=root)
        for dx in (.35, -.8): box(f'tdoor{sy}{dx}', (x + dx - .5, y + sy * .905, .68), (.015, .015, .62), dark, parent=root)   # door seams
        for k in range(14): box(f'tchk{sy}{k}', (x - 2.0 + k * .3, y + sy * .905, .86), (.15, .012, .08), mat('chk', '#151018'), parent=root)
        box(f'tmirror{sy}', (x + .9, y + sy * .98, 1.05), (.1, .12, .08), yel, parent=root)
    box('twinf', (x + .9, y, 1.24), (.02, 1.45, .44), glass, bevel=.03, parent=root); box('twinr', (x - 1.38, y, 1.24), (.02, 1.4, .4), glass, parent=root)
    for sx in (-1, 1):
        box(f'tbump{sx}', (x + sx * 2.24, y, .42), (.12, 1.84, .16), chrome, bevel=.05, parent=root)
        for sy in (-1, 1):
            cyl(f'tw{sx}{sy}', (x + sx * 1.4, y + sy * .82, .36), .36, .26, tyre, rot=(1.5708, 0, 0), parent=root)
            cyl(f'thub{sx}{sy}', (x + sx * 1.4, y + sy * .96, .36), .19, .02, chrome, rot=(1.5708, 0, 0), parent=root)
    for sy in (-1, 1):
        sphere(f'thead{sy}', (x + 2.2, y + sy * .6, .66), .11, m=emissive('hl', '#fff6d8', 8.), parent=root)
        box(f'ttail{sy}', (x - 2.2, y + sy * .65, .7), (.04, .22, .12), mat('tail', '#c01820', emit='#ff2a2a', estr=3.), parent=root)
    box('tgrille', (x + 2.21, y, .62), (.02, .9, .2), chrome, parent=root)
    box('tsign', (x - .25, y, 1.62), (.55, .22, .2), mat('tsg', '#fff1c0', emit='#ffe9a0', estr=2.), bevel=.03, parent=root)
    light('AREA', (x, y - 3.5, 3.0), 400, '#fff1dc', 4, rot=(math.radians(60), 0, 0), name='taxikey2')
    return root

def block(x1=34., depth=30.):   # for the view from above: the club's block, its roof, and the side street round the corner
    box('roof', (x1 / 2 - 15, depth / 2 + .5, 8.4), (x1 + 30, depth, .4), mat('roofm', '#1a2250', rough=.8))
    box('sidewall', (x1 + .25, depth / 2, 4), (.5, depth, 8.5), brick_mat())
    box('sidepave', (x1 + 1.8, depth / 2 - 2, .02), (3.6, depth + 4, .08), mat('pave', '#1c1f36', rough=.6))
    for k in range(6):
        box(f'chim{k}', (x1 - 6 - k * 7, 6 + (k % 3) * 7, 9.2), (1.2, 1.2, 1.4), mat('chimm', '#1a1e38', rough=.8))
        sphere(f'slamp{k}', (x1 - 2 - k * 6, -3.4, 4.0), .18, m=emissive('lampglow', '#ffd28a', 10.)); cyl(f'spole{k}', (x1 - 2 - k * 6, -3.4, 2), .05, 4, mat('iron', '#0c0d18', rough=.4))
        light('POINT', (x1 - 2 - k * 6, -3.4, 3.6), 300, '#ffc77a', .3, name=f'sl{k}')
    light('AREA', (x1 - 8, -6, 26), 30000, '#c9d6ff', 40, name='blocktop')
    # windows on the upper floors of the club's block and round the corner, some lit warm (user 2026-11-19: the aerial shot must look real)
    lit, dim = mat('winlit', '#ffd9a0', emit='#ffcf8a', estr=2.2), mat('windim', '#18234a', rough=.15, metal=.2)
    frame = mat('winframe', '#d9d6cc', rough=.6)
    for r, z in enumerate((5.0, 6.9)):
        for k in range(26):
            wx = -28 + k * 2.4
            if abs(wx) < 2.6: continue
            box(f'wf{r}_{k}', (wx, -.03, z), (1.0, .04, 1.25), frame); box(f'wg{r}_{k}', (wx, -.06, z), (.82, .04, 1.07), lit if (k * 7 + r * 3) % 5 < 2 else dim)
        for k in range(11):
            wy = 1.5 + k * 2.6
            box(f'sf{r}_{k}', (x1 + .53, wy, z), (.04, 1.0, 1.25), frame); box(f'sg{r}_{k}', (x1 + .56, wy, z), (.04, .82, 1.07), lit if (k * 5 + r) % 4 < 2 else dim)
    for k in range(6): light('POINT', (x1 - 2 - k * 6, -3.0, .6), 120, '#ffc77a', 2., name=f'pool{k}')
    # a real city round it (user 2026-11-19: the aerial shot "looks fake"): the street and the side street paved all the way, the wall closed up to the corner,
    # lamps down the side street too, and buildings with lit windows across both streets and behind the block
    box('bground', (x1, depth / 2 - 10, -.06), (120, depth + 60, .1), cobble_mat())
    box('bwallfill', (x1 - 2, .25, 4), (4, .5, 8.5), brick_mat()); box('bpavefill', (x1 - 2, -1.8, .02), (4, 3.6, .08), mat('pave', '#2c3560'))   # butt-joined at x 30 (an overlap flickered black)
    box('bkerbfill', (x1 - 2, -3.62, .05), (4, .2, .14), mat('kerb', '#3a4472'))
    for k in range(5):
        y = 3 + k * 6
        sphere(f'sslamp{k}', (x1 + 3.4, y, 4.0), .18, m=emissive('lampglow', '#ffd28a', 10.)); cyl(f'sspole{k}', (x1 + 3.4, y, 2), .05, 4, mat('iron', '#0c0d18', rough=.4))
        light('POINT', (x1 + 3.2, y, 3.6), 300, '#ffc77a', .3, name=f'ssl{k}')
    import random; rnd = random.Random(23)
    lit2 = mat('winlit2', '#ffd9a0', emit='#ffc878', estr=3.0); dark2 = mat('windark2', '#141c40', rough=.3)
    def city(name, cx, cy, sx, sy, h, face):   # one building block, windows on the face turned to the camera ('-y' or '-x' or '+y')
        box(name, (cx, cy, h / 2), (sx, sy, h), mat('bld' + name, rnd.choice(['#1a2150', '#202a5e', '#161c46', '#242c62']), rough=.8))
        n = int((sx if face != '-x' else sy) / 2.2); fl = int(h / 2.6)
        for i in range(n):
            for j in range(1, fl):
                m = lit2 if rnd.random() < .35 else dark2; z = j * 2.6 + .6
                if face == '-y': box(f'{name}w{i}_{j}', (cx - sx / 2 + 1.1 + i * 2.2, cy - sy / 2 - .03, z), (1.0, .06, 1.3), m)
                elif face == '-x': box(f'{name}w{i}_{j}', (cx - sx / 2 - .03, cy - sy / 2 + 1.1 + i * 2.2, z), (.06, 1.0, 1.3), m)
    for k in range(5): city(f'cs{k}', x1 + 17, 2 + k * 9, 9, 8.4, rnd.choice([10, 13, 16, 20]), '-x')        # across the side street
    for k in range(6): city(f'cb{k}', x1 - 34 + k * 11, depth + 7, 10.4, 10, rnd.choice([16, 20, 24, 28]), '-y')   # behind the block, taller
    for k in range(3): city(f'cc{k}', x1 + 17 + k * 11, depth + 9, 10.4, 10, rnd.choice([18, 24]), '-x')   # warm pools on the pavement under the lamps   # seen from above: the night street lit softly from above

def chair(name='chair'):   # one red velvet armchair (instanced for the 300 seats)
    col = bpy.data.collections.get(name)
    if col: return col
    col = bpy.data.collections.new(name); prev = bpy.context.view_layer.active_layer_collection
    bpy.context.scene.collection.children.link(col); bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[name]
    v = mat('velvet', '#b3121c', rough=.85)
    box('seat', (0, 0, .42), (.62, .6, .2), v, bevel=.06); box('back', (0, .27, .8), (.62, .14, .6), v, bevel=.06)
    box('armL', (-.33, .02, .55), (.1, .58, .3), v, bevel=.04); box('armR', (.33, .02, .55), (.1, .58, .3), v, bevel=.04)
    box('legs', (0, 0, .15), (.5, .48, .3), mat('chairbase', '#3a0a10', rough=.6))
    bpy.context.view_layer.active_layer_collection = prev; bpy.context.view_layer.layer_collection.children[name].exclude = True
    return col

def hall(seated=None):   # inside the club: a dark-blue hall, a curtained stage with a neon star and the band, 300 red velvet seats, little lamp tables, a bar on the left
    navy = mat('hallwall', '#121838', rough=.8)
    box('hfloor', (0, 4, -.05), (40, 40, .1), mat('hfloorm', '#0e1124', rough=.5))
    box('hback', (0, 16, 5), (40, .5, 10), navy); box('hleft', (-12, 4, 5), (.5, 40, 10), navy); box('hright', (12, 4, 5), (.5, 40, 10), navy)
    box('hceil', (0, 4, 9.5), (40, 40, .3), mat('hceilm', '#080b1c'))
    # the stage: a platform, curtains in folds, a big neon star in a circle, lightning bolts, the dance floor tiles in front
    box('stage', (0, 13.2, .5), (12, 5, 1.0), mat('stagem', '#1a1030', rough=.5))
    curt = mat('curtain', '#3a1f7a', rough=.9)
    for k in range(40): cyl(f'curt{k}', (-7.8 + k * .4, 15.5, 5), .24, 9, curt)
    pts = []; neon_poly('hstar', star_pts(0, 6.2, 1.3, 15.0), .06, '#2ED3C6', 25.); circ = [(math.cos(a) * 1.9, 15.0, 6.2 + math.sin(a) * 1.9) for a in [i / 48 * math.pi * 2 for i in range(48)]]; neon_poly('hcirc', circ, .05, '#ff4fa0', 18.)
    for sx in (-1, 1): neon_poly(f'bolt{sx}', [(sx * 3.4, 15.0, 7.4), (sx * 3.1, 15.0, 6.4), (sx * 3.5, 15.0, 6.4), (sx * 3.2, 15.0, 5.3)], .04, '#f2c14e', 18., closed=False)
    tilec = ['#2ED3C6', '#ff4fa0', '#7a5cff', '#f2c14e']
    for r in range(3):
        for c in range(10): box(f'tile{r}{c}', (-4.5 + c, 10.2 - r, .02), (.95, .95, .04), mat('tile' + tilec[(r + c) % 4], tilec[(r + c) % 4], rough=.3, emit=tilec[(r + c) % 4], estr=.6))
    # neon icons high on the side walls: a star, a note, a heart
    neon_poly('wstar', [(-11.7, p[1], p[2]) for p in [(0, y, z) for (x, y, z) in [(q[0] + 4, 0, q[2]) for q in star_pts(0, 7, .6)]]], .04, '#2ED3C6', 15.) if False else None
    for k, (x, col) in enumerate(((-6, '#2ED3C6'), (0, '#f2c14e'), (6, '#ff4fa0'))):
        if k == 0: neon_poly('icon0', [(p[0] + x, 15.6, p[2] + 2.0) for p in star_pts(0, 6.6, .5)], .04, col, 15.)
    # the seats: rows of red velvet armchairs with an aisle, little round tables with glowing lamps between
    ch = chair(); n = 0; seats = []
    for r in range(11):
        for c in range(16):
            x = -7.0 + c * .92 + (.5 if c >= 8 else -.5); y = 8.2 - r * 1.0
            o = bpy.data.objects.new(f'seat{r}_{c}', None); o.instance_type = 'COLLECTION'; o.instance_collection = ch; o.location = (x, y, 0); bpy.context.collection.objects.link(o); seats.append((x, y)); n += 1
            if c % 4 == 1 and r % 2 == 0:
                cyl(f'tab{r}{c}', (x + .46, y - .35, .55), .05, 1.1, mat('tabl', '#0a0a10', rough=.3)); cyl(f'tabt{r}{c}', (x + .46, y - .35, 1.1), .32, .04, mat('tabt', '#14141e', rough=.25))
                sphere(f'tlamp{r}{c}', (x + .46, y - .35, 1.22), .1, m=emissive('tlampg', '#ffe2b0', 6.))
    box('aisle', (0, 3.4, .01), (1.0, 11, .02), mat('aislem', '#2a2244', rough=.7))
    # the bar on the left wall: a long counter, shelves of glowing bottles, a pink lamp
    box('bar', (-10.2, 4, .6), (1.4, 8, 1.2), mat('barm', '#2a1030', rough=.4), bevel=.05); box('bartop', (-10.2, 4, 1.22), (1.6, 8.2, .08), mat('bartopm', '#0e1b2e', rough=.2))
    bcol = ['#2ED3C6', '#ff4fa0', '#f2c14e', '#7a5cff', '#7fc48a', '#e8705a']
    for sh in range(3):
        box(f'shelf{sh}', (-11.6, 4, 2.2 + sh * .8), (.4, 8, .05), mat('shelfm', '#3a2a40'))
        box(f'shelfglow{sh}', (-11.5, 4, 2.24 + sh * .8), (.3, 8, .02), mat('shelfglow', '#ffd9b0', emit='#ffcf9a', estr=3.))   # a lit strip under each shelf
        for k in range(22):   # real bottles: a body, a shoulder and a neck, in varied heights and glass colours
            bc = bcol[(k + sh) % 6]; hb = .26 + .1 * ((k * 7 + sh) % 3) / 2; gm = mat('bot' + bc, bc, rough=.08, emit=bc, estr=.35, alpha=1.)
            by = .6 + k * .33; bz = 2.27 + sh * .8
            cyl(f'bot{sh}{k}', (-11.6, by, bz + hb / 2), .065, hb, gm); sphere(f'bsh{sh}{k}', (-11.6, by, bz + hb), .065, m=gm, seg=16)
            cyl(f'bneck{sh}{k}', (-11.6, by, bz + hb + .09), .022, .16, gm); cyl(f'bcap{sh}{k}', (-11.6, by, bz + hb + .18), .026, .03, mat('gold', '#e8c35a', rough=.25, metal=.9))
    box('barmirror', (-11.85, 4, 3.0), (.04, 8.2, 2.4), mat('mirror', '#9aa8d0', rough=.06, metal=1.))
    box('barfront', (-9.45, 4, .6), (.05, 8, 1.1), mat('barwood', '#5a2a1c', rough=.45), bevel=.01)
    cyl('barrail', (-9.38, 4, .2), .03, 8, mat('gold', '#e8c35a', rough=.25, metal=.9), rot=(1.5708, 0, 0))
    cyl('barlampc', (-10.2, 4, 4.4), .02, 2.4, mat('iron', '#0c0d18')); bpy.ops.mesh.primitive_cone_add(radius1=.45, depth=.35, location=(-10.2, 4, 3.15)); setmat(bpy.context.object, mat('lampshade', '#ff4fa0', rough=.4, emit='#ff4fa0', estr=1.5))
    # light: a warm room, coloured stage lights, a key on the seats
    world('#03040c', 1.)
    light('AREA', (0, 2, 8.8), 2200, '#ffd9b0', 14, name='hallkey')
    for sx, col in ((-4, '#ff4fa0'), (4, '#2ED3C6'), (0, '#7a5cff')): light('SPOT', (sx, 9, 8.5), 2500, col, .3, rot=(math.radians(25), 0, 0), name=f'stagespot{sx}')
    light('AREA', (-9.2, 4, 3.0), 300, '#ff9ad0', 3, name='barlight'); light('AREA', (0, -6, 3), 600, '#fff1dc', 8, rot=(math.radians(80), 0, 0), name='charkeyh')
    return seats
