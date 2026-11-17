"""Test shot (5 s): opening night at the club. The camera starts on the neon sign and tilts down to the door: the doorman, arms folded, and the line of 'waiting' strangers behind the rope."""
import bpy, sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.read_factory_settings(use_empty=True)
from nc import *; from sets import facade
sc = render_setup(int(os.environ.get('W', 720)), int(os.environ.get('H', 1280)), int(os.environ.get('SPP', 16)))
sc.frame_start, sc.frame_end = 1, 120
facade()
dm = Mascot('doorman', 'blue1', 1.95, (-1.2, -1.15, .08), rot=math.radians(10), acc=('doorman',), bulk=1.45); dm.fold_arms(1); dm.face('flat', 1)
own = Mascot('owner', 'owner', 1.7, (.45, -1.7, .08), rot=math.radians(-12), acc=('bowlhair', 'tache', 'bowtie', 'buttons')); own.face('smile', 1)
LINE = [('blue2', ('wear:#e0b030', 'beanie:#c23b3b')), ('blue3', ('wear:#8a5a3a', 'fedora:#5a3a2a', 'tie:#c23b3b')), ('blue1', ('dress:#2a9a7a', 'bob:#c23b3b', 'pearls')), ('blue2', ('wear:#6a4aa8:check:#e8e0f0', 'glasses:#e8577a')),
        ('blue3', ('wear:#2a9a7a', 'beret:#d23a6a')), ('blue1', ('coat:#d0702e', 'pony:#6e4630')), ('blue2', ('wear:#c23b3b:stripe:#f4f1e6', 'beanie:#2ED3C6')), ('blue3', ('suit:#4a3a8a', 'bowtie:#f2c14e'))]
crowd = []
for i, (sk, acc) in enumerate(LINE):
    m = Mascot(f'q{i}', sk, 1.55 + .08 * ((i * 7) % 3), (1.9 + i * .82, -.55, .05), rot=math.radians(-25 + (i % 3) * 8), acc=acc); m.face(['flat', 'smile', 'flat', 'frown'][i % 4], 1); crowd.append(m)
    m.key_head(1, (0, 0, 0)); m.key_head(60 + i * 5, (0, 0, math.radians(15 * ((-1) ** i)))); m.key_head(110, (0, 0, 0))
dm.key_head(1, (0, 0, 0)); dm.key_head(90, (0, 0, math.radians(-10)))
cam = camera((.6, -9.5, 7.6), (0, 0, 6.6), lens=30)
aim(cam, (.6, -9.5, 7.6), (0, 0, 6.6), 1); aim(cam, (1.4, -8.2, 2.3), (1.3, 0, 1.45), 120)
for fc in cam.animation_data.action.fcurves if hasattr(cam.animation_data.action, 'fcurves') else []:
    for k in fc.keyframe_points: k.interpolation = 'BEZIER'; k.easing = 'EASE_IN_OUT'
out = os.environ.get('OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frames', 'test'))
sc.render.filepath = os.path.join(out, 'f_')
fr = os.environ.get('FRAMES')
if fr:
    import time
    for f in [int(x) for x in fr.split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); t = time.time(); bpy.ops.render.render(write_still=True); print('frame', f, round(time.time() - t, 1), 's')
else:
    bpy.ops.render.render(animation=True)
