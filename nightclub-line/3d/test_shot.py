"""Test shot (5 s): opening night at the club. The camera starts on the neon sign and tilts down to the door: the big doorman, arms folded, the owner, and the line of 'waiting' strangers behind the rope.
Rendered frame by frame: every character is posed for each frame (soft arms, idle motion, gestures)."""
import bpy, sys, os, math, time
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.read_factory_settings(use_empty=True)
from nc import *; from sets import facade
sc = render_setup(int(os.environ.get('W', 540)), int(os.environ.get('H', 960)), int(os.environ.get('SPP', 16)))
FPS = 24; N = 120
facade()
dm = Mascot('doorman', 'blue1', 1.95, (-1.25, -1.2, .08), rot=math.radians(12), acc=('doorman',), bulk=1.45); dm.face('flat')
own = Mascot('owner', 'owner', 1.7, (.5, -1.75, .08), rot=math.radians(-14), acc=('bowlhair', 'tache', 'bowtie', 'buttons')); own.face('smile')
LINE = [('blue2', ('wear:#e0b030', 'beanie:#c23b3b')), ('blue3', ('wear:#8a5a3a', 'fedora:#5a3a2a', 'tie:#c23b3b')), ('blue1', ('dress:#2a9a7a', 'bob:#c23b3b', 'pearls')), ('blue2', ('wear:#6a4aa8:check:#e8e0f0', 'glasses:#e8577a')),
        ('blue3', ('wear:#2a9a7a', 'beret:#d23a6a')), ('blue1', ('coat:#d0702e', 'pony:#6e4630')), ('blue2', ('wear:#c23b3b:stripe:#f4f1e6', 'beanie:#2ED3C6')), ('blue3', ('suit:#4a3a8a', 'bowtie:#f2c14e'))]
crowd = [Mascot(f'q{i}', sk, 1.55 + .08 * ((i * 7) % 3), (1.95 + i * .8, -.55, .05), rot=math.radians(-28 + (i % 3) * 9), acc=acc) for i, (sk, acc) in enumerate(LINE)]
for i, m in enumerate(crowd): m.face(['flat', 'smile', 'flat', 'frown'][i % 4])
outlines(float(os.environ.get('LINE', 1.4)))
cam = camera((.6, -9.5, 7.6), (0, 0, 6.6), lens=30)
ease = lambda u: u * u * (3 - 2 * u)
def pose_all(f):
    t = f / FPS; H = dm.H
    dm.pose(t, hands=dm.folded(), head=(0, 0, math.radians(-8) * ease(min(1, t / 3))))
    # the owner: proud, one hand presenting the door, the other on his belly
    wave = ease(min(1, max(0, (t - 1.5) / .8))); Ho = own.H
    own.pose(t, hands={'R': (lerp(.2, .36, wave) * Ho, lerp(-.05, -.18, wave) * Ho, lerp(.25, .5, wave) * Ho + .02 * Ho * math.sin(t * 5) * wave), 'L': (-.05 * Ho, -.2 * Ho, .34 * Ho)}, head=(0, 0, math.radians(10) * math.sin(t * .8)))
    # the line: everyone a little different: hands in front, one at the chin, one on the hip, looking about
    for i, m in enumerate(crowd):
        Hm = m.H; k = i % 4
        hands = [{'L': (-.06 * Hm, -.18 * Hm, .3 * Hm), 'R': (.06 * Hm, -.18 * Hm, .3 * Hm)}, {'R': (.05 * Hm, -.2 * Hm, .55 * Hm)}, {'L': (-.22 * Hm, -.02 * Hm, .33 * Hm)}, {}][k]
        m.pose(t, hands=hands, head=(math.radians(4) * math.sin(t * .9 + i), 0, math.radians(18) * math.sin(t * .6 + i * 1.7)))
lerp = lambda a, b, u: a + (b - a) * u
A0, L0, A1, L1 = Vector((.6, -9.5, 7.6)), Vector((0, 0, 6.6)), Vector((.4, -8.0, 2.35)), Vector((.5, 0, 1.45))
out = os.environ.get('OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frames', 'test'))
frames = [int(x) for x in os.environ['FRAMES'].split(',')] if os.environ.get('FRAMES') else range(1, N + 1)
for f in frames:
    u = ease((f - 1) / (N - 1)); aim(cam, A0.lerp(A1, u), L0.lerp(L1, u)); pose_all(f)
    sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); t0 = time.time(); bpy.ops.render.render(write_still=True); print('frame', f, round(time.time() - t0, 1), 's', flush=True)
