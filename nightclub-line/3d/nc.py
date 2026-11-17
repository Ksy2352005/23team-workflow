"""Nightclub-line 3D kit (Blender bpy): our 23 Team mascots in 3D, accessories, materials, helpers.
The mascot follows the 2D one in char2d.js: round head, small rounded body, mitten arms, short legs, glossy eyes, a simple mouth; H = standing height.
World look (user 2026-11-17): the reference's club world, shifted to our dark-blue story world; the mascots keep their blues (owner white)."""
import bpy, bmesh, math
from mathutils import Vector, Euler

def hexc(h, a=1.0):
    h = h.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), a)

MATS = {}
def mat(name, col, rough=.5, metal=0., emit=None, estr=0., coat=0., sss=0., alpha=1.):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col) if isinstance(col, str) else col
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if coat: b.inputs['Coat Weight'].default_value = coat
    if emit: b.inputs['Emission Color'].default_value = hexc(emit) if isinstance(emit, str) else emit; b.inputs['Emission Strength'].default_value = estr
    if alpha < 1: b.inputs['Alpha'].default_value = alpha
    MATS[name] = m; return m

def emissive(name, col, strength):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = hexc(col); e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], o.inputs[0]); MATS[name] = m; return m

def setmat(o, m):
    o.data.materials.clear(); o.data.materials.append(m); return o

def smooth(o, sub=1):
    for p in o.data.polygons: p.use_smooth = True
    if sub: md = o.modifiers.new('sub', 'SUBSURF'); md.levels = sub; md.render_levels = sub
    return o

def sphere(name, loc, r, scale=(1, 1, 1), m=None, seg=32, parent=None, sub=0):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale; smooth(o, sub)
    if m: setmat(o, m)
    if parent: par(o, parent)
    return o

def cyl(name, loc, r, depth, m=None, rot=(0, 0, 0), verts=32, parent=None, scale=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    if scale: o.scale = scale
    if m: setmat(o, m)
    if parent: par(o, parent)
    return o

def box(name, loc, size, m=None, rot=(0, 0, 0), parent=None, bevel=0.):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)   # real-size texture coordinates (bricks, cobbles)
    if bevel: md = o.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = 3
    if m: setmat(o, m)
    if parent: par(o, parent)
    return o

def torus(name, loc, R, r, m=None, rot=(0, 0, 0), parent=None, scale=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=48, minor_segments=12)
    o = bpy.context.object; o.name = name; smooth(o, 0)
    if scale: o.scale = scale
    if m: setmat(o, m)
    if parent: par(o, parent)
    return o

def tube(name, pts, r, m=None, parent=None, closed=False):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 4; cu.use_fill_caps = True
    sp = cu.splines.new('NURBS'); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (*q, 1)
    sp.use_endpoint_u = True; sp.order_u = min(4, len(pts)); sp.use_cyclic_u = closed
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    if m: o.data.materials.append(m)
    if parent: par(o, parent)
    return o

def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new(name, None); o.location = loc; bpy.context.collection.objects.link(o)
    if parent: par(o, parent)
    return o

def par(o, p):   # parent keeping o's current world transform relative to p's local space
    o.parent = p; o.matrix_parent_inverse = p.matrix_world.inverted()

def cut_below(o, z):   # remove the vertices of a mesh below local z (for hair caps, hats)
    bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < z], context='VERTS'); bm.to_mesh(o.data); bm.free()

SKIN = {'owner': '#eeeeea', 'blue1': '#2448bb', 'blue2': '#2a52c9', 'blue3': '#1f3fa6'}
INK = '#151018'

class Mascot:
    """A 23 Team mascot. root: move/rotate it; parts for posing: armL/armR (shoulder pivots, rotate x to raise forward, y to raise sideways), head (pivot at the neck).
    Faces: set_face(frame, kind) switches mouth/eye shapes by visibility keyframes."""
    def __init__(self, name, skin='blue1', H=1.6, loc=(0, 0, 0), rot=0., acc=(), bulk=1.):
        self.name, self.H, self.bulk = name, H, bulk; R = .205 * H; self.R = R   # heads a little smaller than the 2D .225 (user 2026-11-17: still big and cute)
        sk = mat('skin_' + skin, SKIN[skin], rough=.62); self.sk = sk
        chars = bpy.data.collections.get('chars') or bpy.data.collections.new('chars')
        if chars.name not in bpy.context.scene.collection.children: bpy.context.scene.collection.children.link(chars)
        prev = bpy.context.view_layer.active_layer_collection; bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children['chars']
        self.root = empty(name, (0, 0, 0)); loc0 = Vector(loc)   # build at the origin unrotated, then place
        r = self.root
        # body, neck, legs, feet
        self.body = sphere(name + '_body', (0, 0, .38 * H), 1, (.15 * H * bulk, .125 * H * bulk ** .6, .155 * H * bulk ** .3), sk, parent=r, sub=1)
        sphere(name + '_neck', (0, 0, .55 * H), 1, (.09 * H, .075 * H, .07 * H), sk, parent=r)
        self.legs = []
        for s in (-1, 1):
            lg = empty(f'{name}_leg{s}', (s * .055 * H, 0, .27 * H), r)
            cyl(f'{name}_legm{s}', (s * .055 * H, 0, .15 * H), .04 * H, .24 * H, sk, parent=lg)
            sphere(f'{name}_foot{s}', (s * .06 * H, -.03 * H, .03 * H), 1, (.065 * H, .085 * H, .038 * H), sk, parent=lg)
            self.legs.append(lg)
        # arms: soft bendy arms (a curve from the shoulder through the elbow to the hand) with mitten hands and a thumb; posed every frame by pose()
        self.arms, self.hands, self.sh, self.biceps = {}, {}, {}, {}
        ar = .03 * H * (1 + (bulk - 1) * 1.8); self.armlen = .33 * H
        for s, k in ((-1, 'L'), (1, 'R')):
            S0 = Vector((s * .13 * H * bulk, 0, .485 * H)); self.sh[k] = S0
            cu = bpy.data.curves.new(f'{name}_arm{k}', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = ar; cu.bevel_resolution = 4; cu.use_fill_caps = True
            sp = cu.splines.new('NURBS'); sp.points.add(2); sp.use_endpoint_u = True; sp.order_u = 3
            o = bpy.data.objects.new(f'{name}_arm{k}', cu); bpy.context.collection.objects.link(o); o.data.materials.append(sk); par(o, r); self.arms[k] = o
            hd = empty(f'{name}_handp{k}', (0, 0, 0), r); hr = .05 * H * (1 + (bulk - 1) * .9)
            sphere(f'{name}_mitt{k}', (0, 0, 0), 1, (hr, hr * .8, hr * 1.1), sk, parent=hd); sphere(f'{name}_thumb{k}', (-s * hr * .75, -hr * .45, hr * .35), hr * .42, m=sk, parent=hd)
            self.hands[k] = hd
            if bulk > 1.05:   # the big guy: round shoulders and biceps
                sphere(f'{name}_shoulder{k}', tuple(S0), .078 * H * bulk, m=sk, parent=r); self.biceps[k] = sphere(f'{name}_bicep{k}', (0, 0, 0), 1, (.066 * H * bulk, .062 * H * bulk, .09 * H), sk, parent=r)
        # head (pivot at the neck) with the face on -Y
        self.head = empty(name + '_head', (0, 0, .56 * H), r)
        hz = .74 * H; self.hz = hz
        self.skull = sphere(name + '_skull', (0, 0, hz), R, (1, .96, .97), sk, seg=48, parent=self.head)
        ink = mat('ink', INK, rough=.3)
        hi = emissive('eye_hi', '#ffffff', 3.)
        self.eyes = []
        for s in (-1, 1):
            d = Vector((s * .34, -.93, -.02)).normalized() * R * .97
            e = sphere(f'{name}_eye{s}', (d.x, d.y, hz + d.z), 1, (.1 * R, .06 * R, .15 * R), ink, seg=24, parent=self.head)
            e.rotation_euler = (0, 0, s * -.33)
            sphere(f'{name}_hi{s}', (d.x - .03 * R, d.y - .05 * R, hz + d.z + .065 * R), .032 * R, m=hi, seg=12, parent=self.head)
            self.eyes.append(e)
        # mouths: smile (a dark arc), open (an oval), flat; one visible at a time
        mz = hz - .3 * R; fy = -math.sqrt(max(0., R * R - (.3 * R) ** 2)) * .97
        arc = [(x * R, fy + abs(x) * .25 * R - .02 * R, mz + .9 * (x * x) * R) for x in (-.2, -.1, 0, .1, .2)]
        self.mouths = {'smile': tube(name + '_m_smile', arc, .018 * R, ink, self.head),
                       'open': sphere(name + '_m_open', (0, fy - .01 * R, mz - .02 * R), 1, (.07 * R, .03 * R, .09 * R), ink, parent=self.head),
                       'flat': tube(name + '_m_flat', [(-.13 * R, fy, mz), (0, fy - .01 * R, mz), (.13 * R, fy, mz)], .016 * R, ink, self.head),
                       'frown': tube(name + '_m_frown', [(x * R, fy + abs(x) * .25 * R - .02 * R, mz - .03 * R - .8 * (x * x) * R) for x in (-.18, -.09, 0, .09, .18)], .017 * R, ink, self.head)}
        self.face('smile'); self.pose(0)
        for a in acc: getattr(self, 'acc_' + a.split(':')[0])(*a.split(':')[1:])
        self.root.location = loc0; self.root.rotation_euler = (0, 0, rot); self.rot0 = rot; self.loc0 = loc0
        bpy.context.view_layer.active_layer_collection = prev
    # —— per-frame posing (the film renders frame by frame and calls pose() for every character) ——
    def rest_hand(self, k, t):
        s = -1 if k == 'L' else 1; H = self.H; ph = t * 1.7 + (0 if k == 'L' else 1.3) + sum(map(ord, self.name)) % 7
        return Vector((s * (.2 * H * self.bulk + .012 * H * math.sin(ph)), -.03 * H + .015 * H * math.sin(ph * .7), .25 * H + .012 * H * math.cos(ph)))
    def pose(self, t, hands=None, head=(0, 0, 0), mouth=None, walk=0., phase=0., bob=0., loc=None, rot=None, lean=0.):
        H = self.H; hands = hands or {}
        if loc is not None: self.root.location = loc
        if rot is not None: self.root.rotation_euler = (lean, 0, rot)
        br = .006 * H * math.sin(t * 2.2 + len(self.name))   # breathing
        self.body.location = (0, 0, .38 * H + br + abs(math.sin(phase)) * .02 * H * walk + bob)
        for k in ('L', 'R'):
            s = -1 if k == 'L' else 1; S0 = self.sh[k] + Vector((0, 0, br)); hv = hands.get(k)
            P = Vector(hv) if hv is not None else self.rest_hand(k, t)
            if walk: P = P + Vector((0, -s * .09 * H * math.sin(phase) * walk, 0))
            d = P - S0; L = self.armlen; dist = min(d.length, L * .98); P = S0 + d.normalized() * dist if d.length > 0 else P
            sag = math.sqrt(max(0., (L / 2) ** 2 - (dist / 2) ** 2)); side = Vector((s, .25, -.6)).normalized()   # the elbow bends out, a little back and down
            perp = side - d.normalized() * side.dot(d.normalized()); perp = perp.normalized() if perp.length > 1e-6 else Vector((s, 0, 0))
            E = (S0 + P) / 2 + perp * sag * 1.4
            sp = self.arms[k].data.splines[0]
            for pt, q in zip(sp.points, (S0, E, P)): pt.co = (q.x, q.y, q.z, 1)
            self.hands[k].location = P
            if k in self.biceps: self.biceps[k].location = S0 + (E - S0) * .45
        self.head.rotation_euler = head
        for k2, lg in enumerate(self.legs): lg.rotation_euler = ((1 if k2 else -1) * math.sin(phase) * .5 * walk, 0, 0)
        if mouth:
            for k3, o in self.mouths.items(): o.hide_render = (k3 != mouth)
    def folded(self):   # hands on the opposite upper arms: arms crossed over the chest
        H, b = self.H, self.bulk; return {'L': (.09 * H * b, -.17 * H * b, .43 * H), 'R': (-.09 * H * b, -.19 * H * b, .4 * H)}
    # —— face keyframes ——
    def face(self, kind, frame=None):
        for k, o in self.mouths.items(): o.hide_render = (k != kind)
    def sleeve(self, m):
        for k in 'LR':
            self.arms[k].data.materials.clear(); self.arms[k].data.materials.append(m)
            for o in self.root.children:
                if o.name.startswith(self.name + '_shoulder') or o.name.startswith(self.name + '_bicep'): setmat(o, m)
    def acc_tache(self):
        R, hz = self.R, self.hz; m = mat('tache', '#2a1a12', rough=.6)
        for s in (-1, 1): o = sphere(f'{self.name}_tache{s}', (s * .13 * R, -.93 * R, hz - .18 * R), 1, (.16 * R, .06 * R, .055 * R), m, parent=self.head); o.rotation_euler = (0, s * .3, 0)
    def acc_bowlhair(self, col='#141018'):
        R, hz = self.R, self.hz; o = sphere(self.name + '_hair', (0, .03 * R, hz + .02 * R), R * 1.07, (1, .98, 1), mat('hair_' + col, col, rough=.55), seg=48, parent=self.head); cut_below(o, .3 * R)
        o.rotation_euler = (-.25, 0, 0)
    def acc_bowtie(self, col='#d23a3a'):
        H = self.H; m = mat('bow_' + col, col, rough=.45)
        for s in (-1, 1): o = sphere(f'{self.name}_bow{s}', (s * .045 * H, -.125 * H, .5 * H), 1, (.045 * H, .02 * H, .028 * H), m, parent=self.root); o.rotation_euler = (0, s * .2, 0)
        sphere(self.name + '_knot', (0, -.13 * H, .5 * H), .018 * H, m=m, parent=self.root)
    def acc_buttons(self, col='#e8c35a'):
        H = self.H; m = mat('btn_' + col, col, rough=.25, metal=.8)
        for k in range(3): sphere(f'{self.name}_btn{k}', (0, -.152 * H + abs(k - 1) * .005 * H, .45 * H - k * .07 * H), .014 * H, m=m, seg=12, parent=self.root)
    def acc_doorman(self):
        R, hz, H = self.R, self.hz, self.H; navy = mat('uni_navy', '#1a2350', rough=.5); red = mat('uni_red', '#c23b3b', rough=.5); gold = mat('gold', '#e8c35a', rough=.25, metal=.9)
        bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=.86 * R, radius2=1.12 * R, depth=.5 * R, location=(0, 0, hz + .8 * R)); cr = bpy.context.object; cr.name = self.name + '_capc'; smooth(cr, 0); setmat(cr, navy); par(cr, self.head)
        cyl(self.name + '_capband', (0, 0, hz + .64 * R), .88 * R, .14 * R, red, parent=self.head)
        sphere(self.name + '_captop', (0, 0, hz + 1.05 * R), 1, (1.12 * R, 1.12 * R, .07 * R), navy, parent=self.head)
        br = sphere(self.name + '_brim', (0, -.72 * R, hz + .55 * R), 1, (.58 * R, .36 * R, .045 * R), mat('brim', '#0c1230', rough=.35), parent=self.head); br.rotation_euler = (.3, 0, 0)
        sphere(self.name + '_badge', (0, -.98 * R, hz + .84 * R), .12 * R, m=gold, parent=self.head)
        # the uniform: a navy jacket over the body, gold buttons, a tie
        bk = self.bulk; sphere(self.name + '_jacket', (0, 0, .38 * H), 1, (.158 * H * bk, .132 * H * bk ** .6, .16 * H * bk ** .3), navy, parent=self.root, sub=1)
        for k in range(3): sphere(f'{self.name}_gb{k}', (.04 * H, -.133 * H, .44 * H - k * .07 * H), .012 * H, m=gold, seg=12, parent=self.root)
        box(self.name + '_tie', (0, -.135 * H, .44 * H), (.02 * H, .006 * H, .1 * H), mat('tie', '#0c1230', rough=.4), parent=self.root)
        self.sleeve(navy)
    def acc_beanie(self, col='#c23b3b'):
        R, hz = self.R, self.hz; m = mat('knit_' + col, col, rough=.9); o = sphere(self.name + '_beanie', (0, 0, hz + .1 * R), R * 1.06, m=m, seg=40, parent=self.head); cut_below(o, .3 * R)
        torus(self.name + '_beanrim', (0, 0, hz + .42 * R), 1.0 * R, .1 * R, m, parent=self.head); sphere(self.name + '_pom', (0, 0, hz + 1.2 * R), .2 * R, m=m, parent=self.head)
    def acc_fedora(self, col='#5a3a2a'):
        R, hz = self.R, self.hz; m = mat('felt_' + col, col, rough=.8)
        cyl(self.name + '_fedc', (0, 0, hz + .82 * R), .78 * R, .5 * R, m, parent=self.head, scale=(1, .9, 1))
        cyl(self.name + '_fedb', (0, 0, hz + .58 * R), 1.35 * R, .05 * R, m, parent=self.head)
        cyl(self.name + '_fedband', (0, 0, hz + .66 * R), .8 * R, .1 * R, mat('band_dk', '#1a1210'), parent=self.head)
    def acc_beret(self, col='#d23a6a'):
        R, hz = self.R, self.hz; o = sphere(self.name + '_beret', (.15 * R, 0, hz + .78 * R), 1, (.95 * R, .9 * R, .28 * R), mat('beret_' + col, col, rough=.85), parent=self.head); o.rotation_euler = (0, .25, 0)
    def acc_glasses(self, col='#e8577a'):
        R, hz = self.R, self.hz; m = mat('frame_' + col, col, rough=.3)
        for s in (-1, 1):
            d = Vector((s * .34, -.98, -.02)).normalized() * R * 1.02
            torus(f'{self.name}_gl{s}', (d.x, d.y - .02 * R, hz + d.z), .19 * R, .025 * R, m, rot=(math.pi / 2, 0, s * -.33), parent=self.head)
        tube(self.name + '_glbr', [(-.15 * R, -1.02 * R, hz), (0, -1.06 * R, hz + .02 * R), (.15 * R, -1.02 * R, hz)], .02 * R, m, self.head)
    def acc_scarf(self, col='#e0a030'):
        H = self.H; m = mat('scarf_' + col, col, rough=.9); torus(self.name + '_scarf', (0, 0, .53 * H), .1 * H, .035 * H, m, parent=self.root, scale=(1, .9, 1))
        box(self.name + '_scarft', (.05 * H, -.11 * H, .43 * H), (.035 * H, .012 * H, .11 * H), m, rot=(0, .15, 0), parent=self.root)
    def acc_pony(self, col='#6e4630'):
        R, hz = self.R, self.hz; m = mat('hair_' + col, col, rough=.6); o = sphere(self.name + '_hairc', (0, .05 * R, hz + .05 * R), R * 1.05, m=m, seg=40, parent=self.head); cut_below(o, .15 * R)
        o.rotation_euler = (-.35, 0, 0); sphere(self.name + '_pony', (0, .95 * R, hz - .1 * R), 1, (.22 * R, .2 * R, .5 * R), m, parent=self.head)
        sphere(self.name + '_bow', (0, .82 * R, hz + .32 * R), .12 * R, m=mat('pinkbow', '#ef6a98'), parent=self.head)
    def acc_bob(self, col='#c23b3b'):
        R, hz = self.R, self.hz; o = sphere(self.name + '_bob', (0, .06 * R, hz - .05 * R), R * 1.1, (1.04, 1, 1.02), mat('hair_' + col, col, rough=.55), seg=48, parent=self.head); cut_below(o, -.6 * R)
        bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y < -.3 * R and v.co.z < .38 * R], context='VERTS'); bm.to_mesh(o.data); bm.free()
    def acc_pearls(self):
        H = self.H; m = mat('pearl', '#f4f1e6', rough=.3)
        for k in range(16): a = k / 16 * math.pi * 2; sphere(f'{self.name}_pr{k}', (math.cos(a) * .1 * H, math.sin(a) * .085 * H - .01 * H, .54 * H - .03 * H * max(0, -math.sin(a))), .014 * H, m=m, seg=10, parent=self.root)
    def acc_dress(self, col='#2a9a7a'):
        H = self.H; o = sphere(self.name + '_dress', (0, 0, .33 * H), 1, (.17 * H, .14 * H, .19 * H), mat('dress_' + col, col, rough=.6), parent=self.root, sub=1)
    def acc_suit(self, col='#4a3a8a'):
        H = self.H; m = mat('suit_' + col, col, rough=.55); sphere(self.name + '_suit', (0, 0, .38 * H), 1, (.157 * H, .131 * H, .16 * H), m, parent=self.root, sub=1)
        self.sleeve(m)
    def acc_wear(self, col='#e0a030', pattern='', col2='#ffffff'):   # clothes like the reference: a jacket/sweater over the body and the sleeves; pattern 'check' or 'stripe'
        H, bk = self.H, self.bulk; m = cloth_mat(col, pattern, col2)
        sphere(self.name + '_top', (0, 0, .38 * H), 1, (.158 * H * bk, .132 * H * bk ** .6, .162 * H * bk ** .3), m, parent=self.root, sub=1)
        self.sleeve(m)
    def acc_coat(self, col='#c8902e'):   # a long coat: the top plus a skirt to the knees and a collar
        H = self.H; m = cloth_mat(col); self.acc_wear(col)
        sphere(self.name + '_coatlow', (0, 0, .25 * H), 1, (.15 * H, .125 * H, .12 * H), m, parent=self.root, sub=1)
        torus(self.name + '_collar', (0, 0, .52 * H), .1 * H, .03 * H, m, parent=self.root, scale=(1, .85, 1))
    def acc_tie(self, col='#c23b3b'):
        H = self.H; box(self.name + '_tie2', (0, -.135 * H, .43 * H), (.02 * H, .006 * H, .1 * H), mat('tie_' + col, col), parent=self.root)
    def acc_cash(self, side='R'):
        H = self.H; m = mat('cash', '#7fc48a', rough=.6); hd = self.hands[side]; p = hd.matrix_world.translation
        for k in range(4): box(f'{self.name}_cash{k}', (p.x + (k - 1.5) * .02 * H, p.y - .03 * H, p.z + .05 * H + k * .006 * H), (.12 * H, .004 * H, .06 * H), m, rot=(0, (k - 1.5) * .3, 0), parent=hd)
    # —— posing helpers ——
    def key_head(self, frame, rot):
        self.head.rotation_euler = rot; self.head.keyframe_insert('rotation_euler', frame=frame)
    def key_root(self, frame, loc=None, rot=None):
        if loc is not None: self.root.location = loc; self.root.keyframe_insert('location', frame=frame)
        if rot is not None: self.root.rotation_euler = (0, 0, rot); self.root.keyframe_insert('rotation_euler', frame=frame)
def render_setup(w=720, h=1280, samples=16, fps=24):
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_denoising = True
    try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.cycles.max_bounces = 4; sc.cycles.diffuse_bounces = 2; sc.cycles.glossy_bounces = 2; sc.cycles.transmission_bounces = 2; sc.cycles.transparent_max_bounces = 4
    sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = .05; sc.render.use_persistent_data = True
    sc.render.resolution_x, sc.render.resolution_y = w, h; sc.render.fps = fps
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'; sc.view_settings.exposure = .45
    sc.cycles.seed = 0; sc.cycles.use_animated_seed = False
    sc.render.image_settings.file_format = 'PNG'; return sc

def outlines(px=1.6):   # the reference's dark outlines round the characters (Freestyle, characters only)
    sc = bpy.context.scene; sc.render.use_freestyle = True; sc.render.line_thickness_mode = 'ABSOLUTE'; sc.render.line_thickness = px
    vl = bpy.context.view_layer; fs = vl.freestyle_settings; ls = fs.linesets[0] if fs.linesets else fs.linesets.new('L')
    ls.select_by_collection = True; ls.collection = bpy.data.collections['chars']; ls.select_by_visibility = True
    ls.select_silhouette = True; ls.select_border = True; ls.select_crease = False; ls.select_contour = True
    if ls.linestyle is None: ls.linestyle = bpy.data.linestyles.new('ink')
    ls.linestyle.color = (.02, .02, .05); ls.linestyle.thickness = px

def world(col='#05070f', strength=1.):
    w = bpy.data.worlds.new('W'); bpy.context.scene.world = w; w.use_nodes = True; bgn = w.node_tree.nodes['Background']
    bgn.inputs[0].default_value = hexc(col); bgn.inputs[1].default_value = strength

def light(kind, loc, energy, col='#ffffff', size=1., rot=(0, 0, 0), name=None):
    ld = bpy.data.lights.new(name or kind, kind); ld.energy = energy; ld.color = hexc(col)[:3]
    if kind == 'AREA': ld.size = size
    if kind in ('POINT', 'SPOT'): ld.shadow_soft_size = size
    o = bpy.data.objects.new(name or kind, ld); o.location = loc; o.rotation_euler = rot; bpy.context.collection.objects.link(o); return o

def camera(loc, look, lens=28):
    cd = bpy.data.cameras.new('cam'); cd.lens = lens; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24
    o = bpy.data.objects.new('cam', cd); bpy.context.collection.objects.link(o); bpy.context.scene.camera = o
    aim(o, loc, look); return o

def aim(cam, loc, look, frame=None):
    cam.location = loc; d = Vector(look) - Vector(loc); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    if frame is not None: cam.keyframe_insert('location', frame=frame); cam.keyframe_insert('rotation_euler', frame=frame)

def cloth_mat(col, pattern='', col2='#ffffff'):
    name = f'cloth_{col}_{pattern}_{col2}'
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = .8
    if pattern == 'check':
        tc = nt.nodes.new('ShaderNodeTexCoord'); ck = nt.nodes.new('ShaderNodeTexChecker'); ck.inputs['Scale'].default_value = 26
        ck.inputs['Color1'].default_value = hexc(col); ck.inputs['Color2'].default_value = hexc(col2); nt.links.new(tc.outputs['Object'], ck.inputs['Vector']); nt.links.new(ck.outputs['Color'], b.inputs['Base Color'])
    elif pattern == 'stripe':
        tc = nt.nodes.new('ShaderNodeTexCoord'); wv = nt.nodes.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'; wv.inputs['Scale'].default_value = 6
        ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'; ramp.color_ramp.elements[0].color = hexc(col); ramp.color_ramp.elements[1].position = .5; ramp.color_ramp.elements[1].color = hexc(col2)
        nt.links.new(tc.outputs['Object'], wv.inputs['Vector']); nt.links.new(wv.outputs['Fac'], ramp.inputs[0]); nt.links.new(ramp.outputs[0], b.inputs['Base Color'])
    else: b.inputs['Base Color'].default_value = hexc(col)
    MATS[name] = m; return m

def brick_mat(name='brick', c1='#46508f', c2='#39427e', mortar='#161a33', scale=3.):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); br = nt.nodes.new('ShaderNodeTexBrick'); br.inputs['Color1'].default_value = hexc(c1); br.inputs['Color2'].default_value = hexc(c2)
    br.inputs['Mortar'].default_value = hexc(mortar); br.inputs['Scale'].default_value = scale; br.inputs['Mortar Size'].default_value = .018; br.offset = .5
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 30
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = .25
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); cmb = nt.nodes.new('ShaderNodeCombineXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs[0]); nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])   # the wall stands in X-Z: bricks laid in that plane
    nt.links.new(cmb.outputs[0], br.inputs['Vector']); nt.links.new(br.outputs['Color'], mix.inputs[6]); nt.links.new(nz.outputs['Color'], mix.inputs[7]); nt.links.new(mix.outputs[2], b.inputs['Base Color'])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .35; nt.links.new(br.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = .85; MATS[name] = m; return m

def cobble_mat(name='cobble', c='#1a1c30', scale=9.):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    v = nt.nodes.new('ShaderNodeTexVoronoi'); v.feature = 'DISTANCE_TO_EDGE'; v.inputs['Scale'].default_value = scale
    ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = .02; ramp.color_ramp.elements[0].color = hexc('#07080f'); ramp.color_ramp.elements[1].position = .12; ramp.color_ramp.elements[1].color = hexc(c)
    nt.links.new(v.outputs['Distance'], ramp.inputs[0]); nt.links.new(ramp.outputs[0], b.inputs['Base Color'])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .5; nt.links.new(v.outputs['Distance'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = .45; MATS[name] = m; return m

def star_pts(cx, cz, r, y=0., n=5):
    return [(cx + math.cos(-math.pi / 2 + i * math.pi / n) * (r if i % 2 == 0 else r * .45), y, cz - math.sin(-math.pi / 2 + i * math.pi / n) * (r if i % 2 == 0 else r * .45)) for i in range(2 * n)]

def neon_poly(name, pts, r, col, strength, closed=True):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 3
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (*q, 1)
    sp.use_cyclic_u = closed; o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o); o.data.materials.append(emissive('neon_' + col + str(strength), col, strength)); return o
