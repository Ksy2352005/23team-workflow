"""A lineup still: every character's own face (for the user's check)."""
import bpy, sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.read_factory_settings(use_empty=True)
from nc import *; from sets import facade
sc = render_setup(1350, 1080, 8); facade()
CAST = [('owner', 'owner', 1.7, ('bowlhair', 'tache', 'bowtie', 'buttons'), 'grin', 'happy', None, 0),
        ('doorman', 'blue1', 1.95, ('doorman',), 'flat', 'lids', 'flat', 1.45),
        ('q0', 'blue2', 1.6, ('wear:#e0b030', 'beanie:#c23b3b', 'freckles'), 'smile', 'dots', None, 1),
        ('q1', 'blue3', 1.7, ('wear:#8a5a3a', 'fedora:#5a3a2a', 'tie:#c23b3b', 'beard'), 'smirk', 'lids', 'angry', 1),
        ('q2', 'blue1', 1.55, ('dress:#2a9a7a', 'bob:#c23b3b', 'pearls', 'blush'), 'open', 'wide', 'raised', 1),
        ('q3', 'blue2', 1.62, ('wear:#6a4aa8:check:#e8e0f0', 'glasses:#e8577a', 'nose'), 'frown', 'glossy', 'worried', 1),
        ('q4', 'blue3', 1.58, ('wear:#2a9a7a', 'beret:#d23a6a', 'blush'), 'grin', 'happy', None, 1),
        ('q5', 'blue1', 1.52, ('coat:#d0702e', 'pony:#6e4630'), 'teeth', 'wide', 'worried', 1)]
for i, (n, sk, h, acc, mo, ey, br, bk) in enumerate(CAST):
    m = Mascot(n, sk, h, ((i - 3.5) * 1.05, -1.5, .08), rot=0, acc=acc, bulk=bk); m.face(mo, eyes=ey, brows=br); m.pose(1.0)
camera((0, -10.5, 1.6), (0, -1.5, 1.1), lens=27)
sc.render.filepath = '/tmp/claude-0/-home-user-23team-workflow/5b051186-5765-52d8-a57e-919ff6e40d81/scratchpad/lineup.png'; bpy.ops.render.render(write_still=True)
