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
 'empty': ('hall', (2.24, 3.7, 1.45), (2.24, 6.0, 1.05), 32, 1),
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
 'backofline': ('front', (3.0, -5.2, 1.6), (5.5, -1.2, 1.0), 28, 2.0),
 'taxi': ('taxi', (13.6, -2.2, 1.6), (10.3, -4.4, 1.1), 30, 1),
 'joins': ('front', (8.9, -3.9, 1.35), (8.9, -.7, 1.1), 30, 1),
 'eleven': ('front', (1.0, -3.4, 2.6), (32, -.4, 1.0), 28, 1),
 'midnight': ('block', (42, -18, 20), (26, 8, 0), 24, 1),
 'money': ('front', (-1.7, -3.9, 1.65), (-1.7, -1.0, 1.45), 32, 1),
 'nods': ('front', (0, -3.2, 1.45), (0, -1.5, 1.32), 40, 1),
 'ropeup': ('front', (2.4, -4.4, 1.25), (1.9, -1.25, .95), 30, 1),
 'cheer': ('hall', (0, -6.0, 3.6), (0, 8.0, 1.3), 26, 1),
 'pays40': ('alley', (-10.8, -4.4, 1.55), (-11.2, -1.1, 1.15), 30, 1),
 'sendshome': ('alley', (-11.0, -3.4, 1.7), (-16.5, -1.6, 1.0), 30, 1),
 'never': ('alley', (-12, -4.0, 1.45), (-12, -.6, 1.2), 32, 1),
 'nobody': ('hall', (0, -4.0, 3.2), (0, 9, 1.4), 26, 1),
 'want': ('hall', (0, 1.4, 1.5), (0, 4.9, 1.3), 28, 1),
 'cannot': ('front', (-1.6, -3.4, 1.7), (-1.65, -1.0, 1.55), 36, 1),
}

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
        for o in list(bpy.data.objects):   # the street-lamp poles cast long black shadows across the aerial view
            if o.name.startswith('spole'): bpy.data.objects.remove(o)
        sc.view_settings.exposure = .2
    if shot == 'ropeup':
        for o in list(bpy.data.objects):
            if o.name == 'rope1': bpy.data.objects.remove(o)
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
