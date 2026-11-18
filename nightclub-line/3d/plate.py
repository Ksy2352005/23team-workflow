"""2.5D version (user 2026-11-18: the reference is "between 2D and 3D"): the 3D sets are rendered as soft, warm, out-of-focus
background plates (no characters); our 2D mascots are drawn on top in the canvas film.

    W=1080 H=1920 /root/blender-venv/bin/python plate.py <name>     -> ../plates/<name>.png
Plates: door (the owner's red door, close), street (the club front with the rope line)."""
import bpy, sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
os.environ['ENGINE'] = 'CYCLES'
import nc, sets
from nc import *

def warm():   # the reference's colours: warm red brick, warm grey pavement, red carpet, gold
    brick_mat('brick', c1='#8c3b2c', c2='#7a3125', mortar='#4a3a34', scale=3.)
    mat('pave', '#5a5450', rough=.6); mat('kerb', '#6e6862', rough=.6); mat('plinth', '#3a3430', rough=.7)
    cobble_mat('cobble', c='#4a4642'); mat('door_red', '#7c0f18', rough=.55); mat('bld', '#2a2030', rough=.8)

def dof(cam, focus, fstop=1.4):
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = focus; cam.data.dof.aperture_fstop = fstop

name = sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = render_setup(int(os.environ.get('W', 1080)), int(os.environ.get('H', 1920)), int(os.environ.get('SPP', 48)))
sc.view_settings.look = 'AgX - Base Contrast'; sc.view_settings.exposure = -.3
warm(); sets.facade()
for l in bpy.data.lights:   # drop the cold night fills: warm, soft street light like the reference
    if l.name in ('moon', 'bluefill') or l.name.startswith('streetrim') or l.name == 'charrim': l.energy *= .15
bpy.context.scene.world.node_tree.nodes['Background'].inputs[0].default_value = hexc('#2a2230')
light('AREA', (0, -6, 3.5), 250, '#ffe2c0', 8, rot=(math.radians(75), 0, 0), name='platefill')
if name == 'door':      # straight on, the red double door filling the frame; focus on the owner's spot in front of it
    cam = camera((-.7, -6.4, 1.6), (-.2, 0, 1.3), lens=34); dof(cam, 3.6, 1.1)
elif name == 'street':  # the club front from the pavement, the rope line running away to the right
    cam = camera((-2.5, -5.0, 1.5), (4, 0, 1.4), lens=24); dof(cam, 4.5, 2.0)
out = os.path.join(HERE, '..', '2d', 'plates', name + '.png'); os.makedirs(os.path.dirname(out), exist_ok=True)
sc.render.filepath = out; bpy.ops.render.render(write_still=True); print('plate', out)
