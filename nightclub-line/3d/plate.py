"""2.5D version (user 2026-11-18: the reference is "between 2D and 3D"; "make the world more blue, mascots still visible"):
every shot's background is the 3D set seen from that shot's camera (the cameras copy the reference's shots), rendered once as a soft
still plate without characters. The camera is saved next to it (plates/<shot>.json), so the canvas film (../2d/) can stand our 2D
mascots exactly where the 3D ones stood.

    W=1080 H=1920 SPP=32 /root/blender-venv/bin/python plate.py <shot> [<shot> ...]   (or ALL)   -> ../2d/plates/<shot>.png + .json
"""
import bpy, sys, os, math, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
os.environ['ENGINE'] = 'CYCLES'

# shot: (set, camera position, look-at, lens, width factor for panning shots, dof focus override)
SHOTS = {
 'opened': ('front', (0, -4.0, 1.4), (0, -1.5, 1.15), 34, 1),
 'pays': ('front', (5.95, -4.0, 1.45), (5.95, -1.1, 1.15), 26, 1),
 'line': ('front', (1.2, -2.3, 1.15), (12, -.4, 1.05), 26, 1),
 'notin': ('front', (-1.55, -3.6, 1.75), (-1.65, -1.0, 1.55), 36, 1),
 'opening': ('front', (.3, -9.5, 3.1), (.2, 0, 3.8), 28, 1, 'tall'),
 'band': ('hall', (0, 6.4, 2.4), (0, 13.4, 2.0), 30, 1),
 'bar': ('hall', (-6.9, 2.4, 2.0), (-10.9, 4.0, 1.7), 30, 1),
 'seats': ('hall', (0, -4.8, 3.9), (0, 9, 1.5), 24, 1),
 'empty': ('hall', (9.6, 1.2, 1.5), (2.0, 6.6, .6), 24, 1),   # another angle (user 2026-11-20): across the rows of empty seats from the side aisle
 'spent': ('hall', (0, -3.4, 1.4), (0, -1.0, 1.2), 34, 1),
 'backdoor': ('alley', (-11.7, -5.0, 1.6), (-12, -.6, 1.3), 30, 1),
 'returns': ('front', (9.2, -6.0, 1.5), (11.7, -2.0, 1.1), 28, 1.8),
 'rope': ('front', (2.6, -5.0, 1.3), (2.2, -1.25, .95), 28, 1),
 'lineup': ('front', (1.6, -3.7, 1.6), (8.7, -.6, .9), 26, 1.4),
 'donttalk': ('front', (3.0, -3.2, 1.45), (3.0, -1.4, 1.3), 40, 1),
 'wait': ('front', (3.5, -3.0, 1.35), (4.5, -.6, 1.15), 30, 1.5),
 'turns': ('front', (-1.0, -4.6, 1.55), (-1.0, -1.2, 1.25), 32, 1),
 'sendaway': ('front', (-.2, -3.3, 1.45), (-.4, -1.5, 1.3), 38, 1),
 'window': ('front', (.2, -3.6, 2.3), (.66, -.2, 2.2), 30, 1),
 'emptyroom': ('hall', (0, -2.5, 2.9), (0, 13, 3.0), 24, 1),
 '300': ('front', (-1.6, -3.0, 1.75), (-1.65, -1.0, 1.6), 38, 1),
 'whyno': ('front', (-1.0, -4.4, 1.55), (-1.0, -1.2, 1.25), 32, 1),
 'couple': ('front', (4.3, -6.2, 1.45), (5.3, -2.2, 1.1), 30, 1.8),
 'folds': ('front', (-1.0, -4.8, 1.6), (-1.3, -1.0, 1.35), 30, 1),
 'nottonight': ('front', (-1.6, -2.7, 1.72), (-1.65, -1.0, 1.62), 40, 1),
 'nohome': ('front', (.82, -4.9, 1.4), (.82, -2.1, 1.15), 30, 1),
 'backofline': ('front', (4.6, -5.2, 1.6), (7.1, -1.2, 1.0), 28, 2.4),
 'taxi': ('taxi', (13.6, -2.2, 1.6), (10.3, -4.4, 1.1), 30, 1),
 'joins': ('front', (10.1, -3.9, 1.35), (10.1, -.7, 1.1), 30, 1),
 'eleven': ('front', (1.0, -3.4, 2.6), (32, -.4, 1.0), 28, 1),
 'midnight': ('block', (43, -18, 15), (27, 4, 1.0), 22, 1),
 'money': ('front', (-1.7, -3.9, 1.65), (-1.7, -1.0, 1.45), 32, 1),
 'nods': ('front', (0, -3.2, 1.45), (0, -1.5, 1.32), 40, 1),
 'ropeup': ('front', (2.4, -4.4, 1.25), (1.9, -1.25, .95), 30, 1),
 'cheer': ('hall', (0, .6, 2.5), (0, 9.0, 1.1), 24, 1),   # the dance floor (user 2026-11-20: people dancing and drinking)
 'pays40': ('alley', (-10.8, -4.4, 1.55), (-11.2, -1.1, 1.15), 30, 1),
 'sendshome': ('alley', (-11.0, -3.4, 1.7), (-16.5, -1.6, 1.0), 30, 1),
 'never': ('alley', (-12, -4.0, 1.45), (-12, -.6, 1.2), 32, 1),
 'nobody': ('hall', (0, -4.0, 3.2), (0, 9, 1.4), 26, 1),
 'want': ('hall', (0, 2.0, 1.6), (0, 5.0, 1.2), 22, 1),   # guests in armchairs at lounge tables, drinking (user 2026-11-20)
 'cannot': ('hall', (1.6, 4.3, 1.75), (-.4, 9.0, 1.2), 26, 1),   # the end on the dance floor, closer (user 2026-11-20: standing, dancing, drinking)   # a second angle on the lounge tables to the end (user 2026-11-20)
}

# the camera a little further back (user 2026-11-19: "very close up, bring the camera a bit further"): a wider lens on the close shots
WIDER = {**{k: .72 for k in ('opened', 'pays', 'notin', 'returns', 'rope', 'lineup', 'donttalk', 'wait', 'turns', 'sendaway', 'window', 'couple', 'nohome',
                             'money', 'nods', 'ropeup', 'pays40', 'sendshome', 'never', 'want', 'taxi', 'bar')},
         **{k: .8 for k in ('spent', 'backdoor', '300', 'whyno', 'folds', 'nottonight', 'joins', 'backofline', 'band', 'empty')}}

# the shots that were still close after the wider lens: the camera itself steps back from what it looks at (a wide lens up close bends the faces)
BACK = {'opened': 1.5, 'notin': 2.4, 'donttalk': 2.7, 'wait': 1.3, 'turns': 1.3, 'sendaway': 2.6, '300': 2.7, 'whyno': 1.3, 'nottonight': 3.0, 'nohome': 1.3,
        'money': 1.5, 'nods': 2.8, 'pays': 1.3, 'spent': 1.4}

def blue_world(nc):   # the brand's blue world, a little lighter than before so it reads blue (user 2026-11-18); the red door, rope, carpet and seats stay as warm accents
    nc.brick_mat('brick', c1='#26357a', c2='#1f2c68', mortar='#10173a', scale=3.)
    nc.cobble_mat('cobble', c='#26305a')
    for n, c in (('pave', '#2c3560'), ('kerb', '#3a4472'), ('plinth', '#18204a'), ('bld', '#141c46'), ('hallwall', '#1c2766'), ('hfloorm', '#141a44'),
                 ('hceilm', '#0c1236'), ('roofm', '#1a2250'), ('chimm', '#222c60'), ('signp', '#1c1a5a'), ('marq', '#3a1240'), ('aislem', '#2e2a66'), ('stagem', '#221a52')):
        nc.mat(n, c, rough=.75)

def build(shot):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    import nc, sets, importlib; importlib.reload(nc); importlib.reload(sets)
    kind, A, L, lens, wf = SHOTS[shot][:5]; tall = 'tall' in SHOTS[shot][5:]
    Wd, Hd = int(os.environ.get('W', 1080)), int(os.environ.get('H', 1920))
    sc = nc.render_setup(int(Wd * wf), Hd * (2 if tall else 1), int(os.environ.get('SPP', 32)))
    sc.view_settings.look = 'AgX - Medium High Contrast'; sc.view_settings.exposure = float(os.environ.get('EXP', -.6))
    blue_world(nc)
    if kind in ('front', 'alley', 'block', 'taxi'): sets.facade()
    if kind == 'alley': sets.backdoor()
    if kind == 'block': sets.block()
    if kind == 'taxi': sets.taxi(10.5, -5.4)
    if kind == 'hall': sets.hall()
    if kind not in ('hall', 'block'):   # a deep navy night sky instead of black, and the street wall running on out of sight
        bpy.context.scene.world.node_tree.nodes['Background'].inputs[0].default_value = nc.hexc('#0c1438')
        nc.box('wallfar', (70, .25, 4), (80, .5, 8.5), nc.brick_mat()); nc.box('pavefar', (70, -1.8, .02), (80, 3.6, .08), nc.mat('pave', '#2c3560'))
        nc.box('groundfar', (70, -6, -.05), (80, 20, .1), nc.cobble_mat())
    if kind == 'block': bpy.context.scene.world.node_tree.nodes['Background'].inputs[0].default_value = nc.hexc('#0c1438')
    if kind == 'block':   # seen from above for a plate: a softer top light (the full 30000 W blew out the street)
        bpy.data.lights['blocktop'].energy = 7000
        bpy.data.lights['blocktop'].energy = 3500   # moonlight; the street lamps and lit windows do the rest
        sc.view_settings.exposure = .3
    if kind == 'front':   # the rope line is drawn in 2D now, so people stand behind it, not mixed with it (user 2026-11-20)
        for o in list(bpy.data.objects):
            if o.name.startswith(('post', 'rope')) and not o.name.startswith('poster'): bpy.data.objects.remove(o)
    if shot in ('cheer', 'cannot'):   # a dance floor where the front seats were: big glowing tiles, a mirror ball, coloured spots
        for o in list(bpy.data.objects):
            if (o.name.startswith('seat') and o.instance_type == 'COLLECTION') or o.name.startswith(('tab', 'tlamp')): bpy.data.objects.remove(o)
        cols = ['#1a9a90', '#b8306e', '#5236c0', '#b08a2a']
        for r in range(9):
            for c in range(11): nc.box(f'dtile{r}_{c}', (-6.0 + c * 1.2, 1.6 + r * 1.2, .01), (1.16, 1.16, .02), nc.mat('dt' + cols[(r + c) % 4], cols[(r + c) % 4], rough=.3, emit=cols[(r + c) % 4], estr=.18))
        nc.sphere('mirrorball', (0, 6.5, 6.6), .55, m=nc.mat('mball', '#d8dce8', rough=.12, metal=1.))
        for k, (x, col) in enumerate(((-5, '#ff4fa0'), (0, '#2ED3C6'), (5, '#7a5cff'))): nc.light('SPOT', (x, 4, 8.5), 1500, col, .3, name=f'dspot{k}')
    if shot == 'want':   # lounge: the front rows cleared, two low tables with drinks in front of a row of armchairs (y 5.2)
        for o in list(bpy.data.objects):
            if (o.name.startswith('seat') and o.instance_type == 'COLLECTION') or o.name.startswith(('tab', 'tlamp')):
                x, y = o.location[0], o.location[1]
                if y < 5.0 and abs(x) < 8.5: bpy.data.objects.remove(o)
        wood = nc.mat('loungetab', '#3a1e14', rough=.35); brass = nc.mat('brass', '#e8c35a', rough=.25, metal=.9)
        for k, x in enumerate((-.1,)):   # one long low table across the whole group
            nc.box(f'ltop{k}', (x, 4.45, .74), (4.8, .8, .06), wood, bevel=.03); nc.box(f'lbase{k}', (x, 4.45, .37), (4.4, .5, .7), nc.mat('ltb', '#1e0f0a', rough=.5))
            nc.sphere(f'llamp{k}', (x - 2.1, 4.55, .86), .09, m=nc.emissive('tlampg', '#ffe2b0', 6.)); nc.light('POINT', (x, 4.0, 1.4), 80, '#ffd9a0', .1, name=f'lll{k}')
            for j, (gx, liq) in enumerate(((-1.9, '#e85a7a'), (-1.0, '#f2c14e'), (-.3, '#2ED3C6'), (.8, '#e85a7a'), (1.5, '#f2c14e'))):   # glasses with coloured drinks
                nc.cyl(f'gl{k}{j}', (x + gx, 4.35, .84), .045, .14, nc.mat('glassm', '#cfe0ff', rough=.05, metal=.1)); nc.cyl(f'lq{k}{j}', (x + gx, 4.35, .82), .04, .08, nc.mat('lq' + liq, liq, rough=.2, emit=liq, estr=.4))
            nc.cyl(f'bucket{k}', (x + .3, 4.5, .87), .1, .2, brass); nc.cyl(f'bottle{k}', (x + .3, 4.5, 1.02), .035, .3, nc.mat('bottlem', '#1d3a22', rough=.15))
    if shot == 'ropeup':
        for o in list(bpy.data.objects):
            if o.name == 'rope1': bpy.data.objects.remove(o)
    if shot in BACK:
        k = BACK[shot]; A = tuple(l + (a - l) * k for a, l in zip(A, L)); lens *= .9
    else: lens *= WIDER.get(shot, 1.)
    cam = nc.camera(A, L, lens)
    if tall: cam.data.sensor_height = 48; cam.data.lens = lens * 1.0
    d = math.dist(A, L); cam.data.dof.use_dof = True; cam.data.dof.focus_distance = d; cam.data.dof.aperture_fstop = 2.8 if d < 6 else 5.6
    out = os.path.join(HERE, '..', '2d', 'plates', shot); os.makedirs(os.path.dirname(out), exist_ok=True)
    sc.render.filepath = out + '.png'; bpy.ops.render.render(write_still=True)
    M = cam.matrix_world.inverted()
    json.dump({'m': [list(r) for r in M], 'lens': cam.data.lens, 'sensor': cam.data.sensor_height, 'w': sc.render.resolution_x, 'h': sc.render.resolution_y}, open(out + '.json', 'w'))
    print('plate', shot, flush=True)

names = [a for a in sys.argv[sys.argv.index('--') + 1:]] if '--' in sys.argv else sys.argv[1:]
if names == ['ALL']: names = list(SHOTS)
for n in names:
    if os.environ.get('SKIP') and os.path.exists(os.path.join(HERE, '..', '2d', 'plates', n + '.json')): continue
    build(n)
