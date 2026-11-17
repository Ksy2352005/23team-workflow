"""The nightclub film, shot by shot (after the reference reel, frame for frame in story and angles), in 3D with our mascots.
SHOT=<name> renders that shot's frames into ../frames/<name>/f_<global frame>.png; ALL=1 renders every shot (run render_all.sh).
Each shot: a set, its cast, and update(t) that poses everyone and moves the camera for every frame (t = film time in seconds)."""
import bpy, sys, os, math, json, time
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
W = json.loads(open(os.path.join(HERE, '..', 'captions.js')).read().split('=', 1)[1].strip().rstrip(';'))
T = lambda i: W[i][1]
FPS = 24; END = 66.3
ease = lambda u: (lambda v: v * v * (3 - 2 * v))(min(1., max(0., u)))
seg = lambda t, a, b: min(1., max(0., (t - a) / max(1e-6, b - a)))
lerp = lambda a, b, u: a + (b - a) * u
V = lambda *a: Vector(a)

def setup(kind):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    global nc_, sets_; import nc as nc_, sets as sets_
    import importlib; importlib.reload(nc_); importlib.reload(sets_)
    from nc import render_setup
    sc = render_setup(int(os.environ.get('W', 540)), int(os.environ.get('H', 960)), int(os.environ.get('SPP', 6)))
    if kind in ('front', 'alley', 'block', 'taxi'): sets_.facade()
    if kind == 'alley': sets_.backdoor()
    if kind == 'block': sets_.block()
    if kind == 'taxi': sets_.taxi(10.5, -5.4)
    if kind == 'hall': sets_.hall()
    return sc

# —— the cast ——
def OWNER(loc, rot=0., **k): return nc_.Mascot('owner', 'owner', 1.7, loc, rot=rot, acc=('bowlhair', 'tache', 'bowtie', 'buttons'), **k)
def DOORMAN(loc, rot=0.): m = nc_.Mascot('doorman', 'blue1', 1.95, loc, rot=rot, acc=('doorman',), bulk=1.45); m.face('flat', eyes='lids'); return m
STR = [('blue2', ('wear:#e0b030', 'beanie:#c23b3b', 'freckles'), 'dots', None, 'smile'), ('blue3', ('wear:#8a5a3a', 'fedora:#5a3a2a', 'tie:#c23b3b', 'beard'), 'lids', 'angry', 'smirk'),
       ('blue1', ('wear:#6a4aa8:check:#e8e0f0', 'glasses:#e8577a', 'nose'), 'glossy', 'worried', 'frown'), ('blue2', ('wear:#2a9a7a', 'beret:#d23a6a', 'blush'), 'happy', None, 'smile'),
       ('blue3', ('coat:#d0702e', 'pony:#6e4630'), 'dots', None, 'flat'), ('blue1', ('wear:#c23b3b:stripe:#f4f1e6', 'beanie:#2ED3C6'), 'glossy', 'raised', 'smile'),
       ('blue2', ('wear:#3d6be0', 'scarf:#f2c14e'), 'lids', None, 'flat'), ('blue3', ('wear:#e8705a', 'bob:#4a2c1e'), 'wide', None, 'open')]
LITE_COLS = ['#e0b030', '#8a5a3a', '#6a4aa8', '#2a9a7a', '#d0702e', '#c23b3b', '#3d6be0', '#e8705a', '#7a5cff', '#f4f1e6', '#5fb89a', '#ff4fa0']
def stranger(i, loc, rot=0., lite=False):
    sk, acc, ey, br, mo = STR[i % len(STR)]
    if lite:
        m = nc_.Mascot(f'x{i}', sk, 1.5 + .12 * ((i * 7) % 3) / 2, loc, rot=rot, acc=('wear:' + LITE_COLS[i % 12],) + (('beanie:' + LITE_COLS[(i + 5) % 12],) if i % 3 == 0 else ()), lite=True, eyes=['dots', 'glossy', 'happy'][i % 3])
        return m
    m = nc_.Mascot(f's{i}', sk, 1.55 + .08 * ((i * 7) % 3), loc, rot=rot, acc=acc); m.face(mo, eyes=ey, brows=br); return m
def COUPLE(xm, xw, y, rot=0.):
    man = nc_.Mascot('guy', 'blue2', 1.68, (xm, y, .08), rot=rot, acc=('suit:#4a3a8a', 'bowtie:#f2c14e')); man.face('smile', eyes='glossy')
    wom = nc_.Mascot('lady', 'blue1', 1.58, (xw, y, .08), rot=rot, acc=('dress:#2a9a7a', 'bob:#c23b3b', 'pearls', 'blush')); wom.face('smile', eyes='glossy')
    return man, wom
def CAM(A, L, lens=32, dof=None):
    c = bpy.context.scene.camera or nc_.camera(A, L, lens); nc_.aim(c, A, L); c.data.lens = lens
    if dof: c.data.dof.use_dof = True; c.data.dof.focus_distance = dof[0]; c.data.dof.aperture_fstop = dof[1]
    return c
def move(A0, L0, A1, L1, u, lens=32, dof=None): return CAM(tuple(V(*A0).lerp(V(*A1), u)), tuple(V(*L0).lerp(V(*L1), u)), lens, dof)
def talk(t, a, b, closed='smile'):   # a talking mouth between a and b
    return ('open' if (t * 7.5) % 1 < .55 else closed) if a <= t <= b else closed
def walkin(m, t, a, b, P0, P1, rot):   # walk from P0 to P1 between a and b
    u = seg(t, a, b); p = V(*P0).lerp(V(*P1), ease(u) if False else u); moving = 0 < u < 1
    m.pose(t, loc=tuple(p), rot=rot, walk=1. if moving else 0., phase=t * 9.)
def hands(m, **h): return {k: tuple(v) for k, v in h.items()}

# —— the shots ——
SHOTS = []
def shot(name, start, kind):
    def deco(f): SHOTS.append((name, start, kind, f)); return f
    return deco

@shot('opened', 0.0, 'front')
def _(t, S):   # „Nyitott egy éjszakai klubot”: the owner, proud and laughing, in front of his red door
    if not S: S['o'] = OWNER((0, -1.5, .08)); S['o'].face('grin', eyes='happy')
    o = S['o']; H = o.H; w = math.sin(t * 6)
    o.pose(t, hands={'L': (-.24 * H, -.2 * H, .33 * H + .02 * H * w), 'R': (.24 * H, -.2 * H, .33 * H - .02 * H * w)}, head=(0, 0, .06 * math.sin(t * 3)), bob=.012 * abs(math.sin(t * 9)))
    move((0, -4.0, 1.4), (0, -1.5, 1.15), (0, -3.5, 1.35), (0, -1.5, 1.15), seg(t, 0, 1.5), 34)

@shot('pays', T(4) - .05, 'front')
def _(t, S):   # „és fizetett 40 embernek”: the owner hands a fan of cash to a stranger, who takes it
    if not S: S['o'] = OWNER((5.4, -1.2, .08), rot=math.radians(30)); S['o'].face('smile', eyes='glossy', brows='raised'); S['o'].acc_cash('R'); S['s'] = stranger(0, (6.5, -1.1, .05), rot=math.radians(-30))
    o, s = S['o'], S['s']; H = o.H; g = ease(seg(t, T(5), T(6) + .3))
    o.pose(t, hands={'R': (lerp(.2, .3, g) * H, lerp(-.1, -.3, g) * H, lerp(.3, .42, g) * H), 'L': (-.22 * H, -.15 * H, .32 * H)}, head=(0, 0, .15))
    s.pose(t, hands={'L': (-.2 * s.H, lerp(-.05, -.3, g) * s.H, lerp(.28, .42, g) * s.H)}, head=(0, 0, -.2)); s.face('grin' if g > .7 else 'smile')
    move((5.95, -4.0, 1.45), (5.95, -1.1, 1.15), (5.95, -3.6, 1.4), (5.95, -1.1, 1.15), seg(t, T(4), T(8)), 26)

@shot('line', T(8) - .05, 'front')
def _(t, S):   # „hogy álljanak kint”: down the wall: a long line of strangers waiting outside
    if not S: S['c'] = [stranger(i, (2.0 + i * .85, -.6, .05), rot=math.radians(-10 + (i % 3) * 8), lite=i > 5) for i in range(16)]
    for i, m in enumerate(S['c']): m.pose(t, head=(0, 0, .25 * math.sin(t * .8 + i)))
    move((1.2, -2.3, 1.15), (12, -.4, 1.05), (1.6, -2.3, 1.15), (12, -.4, 1.05), seg(t, T(8), T(11)), 26)

@shot('notin', T(11) - .05, 'front')
def _(t, S):   # „és ne menjenek be”: the doorman, arms folded, smug
    if not S: S['d'] = DOORMAN((-1.7, -1.0, .08), rot=math.radians(8))
    d = S['d']; d.pose(t, hands=d.folded(), head=(0, 0, .08 * math.sin(t * 4)))
    move((-1.55, -3.6, 1.75), (-1.65, -1.0, 1.55), (-1.55, -3.2, 1.72), (-1.65, -1.0, 1.55), seg(t, T(11), T(15)), 36)

@shot('opening', T(15) - .05, 'front')
def _(t, S):   # „Ma este van a megnyitó”: the club front; the camera tilts up from the door to the neon sign
    if not S: S['d'] = DOORMAN((-1.75, -1.05, .08), rot=math.radians(8)); S['o'] = OWNER((.3, -1.6, .08)); S['c'] = [stranger(i, (2.0 + i * .85, -.6, .05), lite=True) for i in range(8)]
    d, o = S['d'], S['o']; d.pose(t, hands=d.folded()); o.pose(t, hands={'R': (.3 * o.H, -.15 * o.H, .48 * o.H + .05 * o.H * math.sin(t * 5))})
    for i, m in enumerate(S['c']): m.pose(t)
    u = ease(seg(t, T(15), T(20))); move((.3, -9.5, 2.0), (.2, 0, 2.0), (.3, -9.5, 4.2), (.2, 0, 5.6), u, 28)

@shot('band', T(20) - .05, 'hall')
def _(t, S):   # „Odabent zenekar”: inside: the band on the stage under the neon star
    if not S:
        S['b'] = [nc_.Mascot('b0', 'blue2', 1.5, (-1.8, 13.0, 1.0), acc=('wear:#ffffff', 'bowtie:#d23a3a', 'tache')), nc_.Mascot('b1', 'blue3', 1.5, (0, 13.6, 1.0), acc=('wear:#7a5cff', 'beanie:#f2c14e')), nc_.Mascot('b2', 'blue1', 1.5, (1.8, 13.0, 1.0), acc=('wear:#f2c14e', 'fedora:#151018'))]
        S['b'][0].face('open', eyes='happy'); S['b'][1].face('grin', eyes='lids'); S['b'][2].face('smile', eyes='happy')
        gold = nc_.mat('gold', '#e8c35a', rough=.25, metal=.9); nc_.cyl('drum', (0, 13.0, 1.35), .35, .45, nc_.mat('drumr', '#c23b3b', rough=.5), rot=(1.5708, 0, 0))
        nc_.cyl('cym', (.6, 13.2, 2.0), .3, .02, gold); nc_.cyl('snare', (-.55, 13.1, 1.6), .22, .18, nc_.mat('drumw', '#f4f1e6'))
        nc_.cyl('trumpet', (-1.55, 12.7, 1.95), .05, .7, gold, rot=(1.5708, 0, .3)); nc_.cyl('bell', (-1.4, 12.35, 1.95), .14, .1, gold, rot=(1.5708, 0, .3))
        nc_.box('guitar', (1.75, 12.75, 1.55), (.42, .1, .55), nc_.mat('guit', '#e8705a', rough=.4), bevel=.12); nc_.box('neck', (2.1, 12.72, 1.85), (.5, .05, .06), nc_.mat('neckm', '#3a2418'), rot=(0, -.5, 0))
    b = S['b']; H = 1.5
    b[0].pose(t, hands={'L': (-.05 * H, -.33 * H, .55 * H), 'R': (.05 * H, -.35 * H, .56 * H)}, head=(-.15, 0, .1 * math.sin(t * 4)))
    hit = abs(math.sin(t * 10)); b[1].pose(t, hands={'L': (-.25 * H, -.3 * H, (.42 + .06 * hit) * H), 'R': (.25 * H, -.3 * H, (.42 + .06 * (1 - hit)) * H)}, head=(0, 0, .1 * math.sin(t * 5)), bob=.01 * hit)
    b[2].pose(t, hands={'L': (.2 * H, -.25 * H, .5 * H), 'R': (.1 * H, -.28 * H, (.35 + .04 * math.sin(t * 14)) * H)}, head=(.1 * math.sin(t * 6), 0, 0))
    move((0, 6.4, 2.4), (0, 13.4, 2.0), (0, 7.6, 2.3), (0, 13.4, 2.0), seg(t, T(20), T(22)), 30)

@shot('bar', T(22) - .05, 'hall')
def _(t, S):   # „bár”: the bar: glowing bottles, a pink lamp, the bartender polishing a glass
    if not S: S['k'] = nc_.Mascot('bartender', 'blue3', 1.6, (-10.9, 4.0, .55), rot=math.radians(-90), acc=('wear:#f4f1e6', 'bowtie:#151018', 'tache', 'glasses:#f2c14e')); S['k'].face('flat', eyes='dots')
    k = S['k']; H = k.H; w = math.sin(t * 9)
    k.pose(t, hands={'L': (-.1 * H, -.3 * H, .55 * H), 'R': ((.0 + .05 * w) * H, -.32 * H, .56 * H)}, head=(0, 0, .1))
    move((-6.9, 2.4, 2.0), (-10.9, 4.0, 1.7), (-7.2, 2.5, 2.0), (-10.9, 4.0, 1.7), seg(t, T(22), T(24)), 30)

@shot('seats', T(24) - .05, 'hall')
def _(t, S):   # „és 300 bársonyszék várja a vendégeket”: the empty hall: rows of red velvet seats, lamps on the tables, the stage
    move((0, -4.8, 3.9), (0, 9, 1.5), (0, -3.4, 3.3), (0, 9, 1.4), seg(t, T(24), T(29)), 24)

@shot('empty', T(29) - .05, 'hall')
def _(t, S):   # „de egyikben sem ül senki”: one little table with its lamp, and nobody in any seat
    move((2.24, 3.7, 1.45), (2.24, 6.0, 1.05), (2.24, 4.3, 1.35), (2.24, 6.0, 1.05), seg(t, T(29), T(34)), 32)

@shot('spent', T(34) - .05, 'hall')
def _(t, S):   # „Az utolsó forintját is erre költötte”: the owner in the empty hall: worried, then shocked
    if not S: S['o'] = OWNER((0, -1.0, .02))
    o = S['o']; H = o.H; sh = t > T(36)
    o.face('teeth' if sh else 'frown', eyes='wide' if sh else 'glossy', brows='worried')
    o.pose(t, hands={'L': (-.12 * H, -.25 * H, (.62 if sh else .35) * H), 'R': (.12 * H, -.25 * H, (.62 if sh else .35) * H)}, head=(0, 0, .04 * math.sin(t * 20) if sh else 0))
    move((0, -3.4, 1.4), (0, -1.0, 1.2), (0, -3.0, 1.38), (0, -1.0, 1.2), seg(t, T(34), T(40)), 34)

@shot('backdoor', T(40) - .05, 'alley')
def _(t, S):   # „Ezért kimegy a hátsó ajtón”: he slips out of the back door into the alley
    if not S: S['o'] = OWNER((-12, -.3, .08)); S['o'].face('smirk', eyes='lids')
    walkin(S['o'], t, T(40) + .1, T(44), (-12, -.3, .08), (-11.2, -1.8, .08), math.radians(-25))
    move((-11.7, -5.0, 1.6), (-12, -.6, 1.3), (-11.5, -4.4, 1.5), (-11.6, -1.0, 1.2), seg(t, T(40), T(45)), 30)

@shot('returns', T(45) - .05, 'front')
def _(t, S):   # „és elöl visszajön 40 idegennel”: round the front he comes, a line of strangers behind him
    if not S: S['o'] = OWNER((14, -2.0, .08)); S['o'].face('grin', eyes='happy'); S['c'] = [stranger(i, (15 + i * .9, -2.0, .05), lite=i > 4) for i in range(10)]
    a, b = T(45), T(50); u = seg(t, a, b)
    walkin(S['o'], t, a, b, (13, -2.0, .08), (8.5, -2.0, .08), math.radians(90))
    for i, m in enumerate(S['c']): walkin(m, t, a, b, (14.2 + i * .9, -2.0, .05), (9.7 + i * .9, -2.0, .05), math.radians(90))
    x = lerp(12.6, 8.8, u); CAM((x - 1.5, -6.0, 1.5), (x + 1.0, -2.0, 1.1), 28)

@shot('rope', T(50) - .05, 'front')
def _(t, S):   # „meg egy piros kötéllel”: the velvet rope and its gold posts, hooked on with a flourish
    if not S: S['o'] = OWNER((2.4, -1.9, .08), rot=math.radians(20)); S['o'].face('smile', eyes='glossy'); S['s'] = stranger(1, (3.3, -.6, .05))
    o = S['o']; H = o.H; g = ease(seg(t, T(51), T(53)))
    o.pose(t, hands={'R': (lerp(.2, -.05, g) * H, lerp(-.1, .25, g) * H, lerp(.3, .58, g) * H)}, head=(0, 0, .2)); S['s'].pose(t)
    move((2.6, -5.0, 1.3), (2.2, -1.25, .95), (2.4, -4.6, 1.25), (2.1, -1.25, .95), seg(t, T(50), T(54)), 28)

@shot('lineup', T(54) - .05, 'front')
def _(t, S):   # „Sorba állítja őket a fal mellett”: he walks along the line, setting each one against the wall
    if not S: S['o'] = OWNER((2.0, -1.8, .08)); S['o'].face('smile', eyes='glossy', brows='raised'); S['c'] = [stranger(i, (2.0 + i * .85, -.6, .05), lite=i > 5) for i in range(14)]
    walkin(S['o'], t, T(54), T(60), (2.0, -1.8, .08), (7.0, -1.8, .08), math.radians(-90))
    for i, m in enumerate(S['c']): m.pose(t, head=(0, 0, .2 * math.sin(t + i)))
    move((.6, -3.6, 1.6), (8, -.6, .9), (2.6, -3.8, 1.6), (9.5, -.6, .9), seg(t, T(54), T(60)), 26)

@shot('donttalk', T(60) - .05, 'front')
def _(t, S):   # „„Ne beszéljetek senkivel. Csak tegyetek úgy, mintha várnátok.”” (21.4 cuts to the line): the owner, close, a finger up
    if not S: S['o'] = OWNER((3.0, -1.4, .08)); S['o'].face('smile', eyes='glossy', brows='angry'); S['c'] = [stranger(i, (2.0 + i * .85, -.6, .05), lite=True) for i in range(5)]
    o = S['o']; H = o.H; o.face(talk(t, T(60), T(63) - .1, 'flat'))
    o.pose(t, hands={'R': (.2 * H, -.28 * H, (.72 + .03 * math.sin(t * 8)) * H)}, head=(0, 0, .06 * math.sin(t * 5)))
    for m in S['c']: m.pose(t)
    move((3.0, -3.2, 1.45), (3.0, -1.4, 1.3), (3.0, -2.9, 1.42), (3.0, -1.4, 1.3), seg(t, T(60), T(63)), 40, dof=(1.6, 2.8))

@shot('wait', T(63) - .05, 'front')
def _(t, S):   # „Csak tegyetek úgy, mintha várnátok”: the strangers act natural: looking at watches, whistling, looking about
    if not S: S['c'] = [stranger(i, (2.0 + i * .85, -.6, .05)) for i in range(6)]
    for i, m in enumerate(S['c']):
        H = m.H; hh = [{'L': (-.05 * H, -.2 * H, .45 * H), 'R': (.12 * H, -.2 * H, .42 * H)}, {}, {'R': (.08 * H, -.22 * H, .56 * H)}, {}, {'L': (-.25 * H, -.05 * H, .3 * H)}, {}][i]
        m.pose(t, hands=hh, head=(.1 * math.sin(t * 1.3 + i), 0, .3 * math.sin(t * .9 + i * 2)))
    move((2.6, -3.0, 1.35), (3.6, -.6, 1.15), (4.4, -3.0, 1.35), (5.4, -.6, 1.15), seg(t, T(63), T(68)), 30)

@shot('turns', T(68) - .05, 'front')
def _(t, S):   # „Aztán az ajtónállóhoz fordul”: he turns to the big doorman by the door
    if not S: S['d'] = DOORMAN((-1.75, -1.05, .08), rot=math.radians(15)); S['o'] = OWNER((-.4, -1.5, .08)); S['o'].face('smirk', eyes='glossy')
    S['d'].pose(t, hands=S['d'].folded()); u = ease(seg(t, T(69), T(71)))
    S['o'].pose(t, rot=lerp(0, math.radians(-55), u), head=(0, 0, -.2 * u))
    move((-1.0, -4.6, 1.55), (-1.0, -1.2, 1.25), (-1.0, -4.1, 1.5), (-1.0, -1.2, 1.25), seg(t, T(68), T(72)), 32)

@shot('sendaway', T(72) - .05, 'front')
def _(t, S):   # „„Aki most jön, azt küldd el.””: the owner, close, pointing away down the street
    if not S: S['o'] = OWNER((-.4, -1.5, .08), rot=math.radians(-35)); S['o'].face('smile', eyes='lids', brows='angry')
    o = S['o']; H = o.H; o.face(talk(t, T(72), T(77) + .2, 'smirk'))
    o.pose(t, hands={'L': (-.35 * H, -.15 * H, (.5 + .03 * math.sin(t * 6)) * H)}, head=(0, 0, .1))
    move((-.2, -3.3, 1.45), (-.4, -1.5, 1.3), (-.2, -3.0, 1.42), (-.4, -1.5, 1.3), seg(t, T(72), T(78)), 38, dof=(1.7, 2.8))

@shot('window', T(78) - .05, 'front')
def _(t, S):   # „Az ajtónálló benéz az ablakon”: the doorman leans to the little window in the door and peers in
    if not S: S['d'] = DOORMAN((.66, -.85, .08), rot=math.radians(180)); S['d'].face('flat', eyes='lids')
    d = S['d']; u = ease(seg(t, T(78), T(80) + .3)); d.pose(t, hands={'L': (-.2 * d.H, -.25 * d.H, .78 * d.H), 'R': (.2 * d.H, -.25 * d.H, .78 * d.H)}, lean=-.18 * u, head=(-.2 * u, 0, 0))
    move((.2, -3.6, 2.3), (.66, -.2, 2.2), (.4, -2.8, 2.35), (.66, -.2, 2.3), seg(t, T(78), T(83)), 30)

@shot('emptyroom', T(83) - .05, 'hall')
def _(t, S):   # „az üres terembe”: the empty room, from the back: stage, star, empty seats
    move((0, -2.5, 2.9), (0, 13, 3.0), (0, -1.6, 2.7), (0, 13, 3.0), seg(t, T(83), T(86)), 24)

@shot('300', T(86) - .05, 'front')
def _(t, S):   # „„300 helyünk van.””: the doorman, eyes wide, teeth showing
    if not S: S['d'] = DOORMAN((-1.7, -1.0, .08), rot=math.radians(5)); S['d'].face('teeth', eyes='wide', brows='raised')
    d = S['d']; d.face(talk(t, T(86), T(88) + .3, 'teeth')); d.pose(t, hands={'L': (-.32 * d.H, -.2 * d.H, .55 * d.H), 'R': (.32 * d.H, -.2 * d.H, .55 * d.H)}, head=(0, 0, .05 * math.sin(t * 12)))
    move((-1.6, -3.0, 1.75), (-1.65, -1.0, 1.6), (-1.6, -2.7, 1.73), (-1.65, -1.0, 1.6), seg(t, T(86), T(89)), 38)

@shot('whyno', T(89) - .05, 'front')
def _(t, S):   # „Miért mondjak nemet?”: the doorman, puzzled, palms up; the owner just smiles
    if not S: S['d'] = DOORMAN((-1.75, -1.05, .08), rot=math.radians(15)); S['d'].face('open', eyes='glossy', brows='worried'); S['o'] = OWNER((-.4, -1.5, .08), rot=math.radians(-45)); S['o'].face('smirk', eyes='lids')
    d = S['d']; d.face(talk(t, T(89), T(91) + .3, 'frown')); d.pose(t, hands={'L': (-.4 * d.H, -.2 * d.H, .4 * d.H), 'R': (.4 * d.H, -.2 * d.H, .4 * d.H)}, head=(0, 0, .15))
    S['o'].pose(t, head=(0, 0, -.15))
    move((-1.0, -4.4, 1.55), (-1.0, -1.2, 1.25), (-1.0, -4.0, 1.5), (-1.0, -1.2, 1.25), seg(t, T(89), T(92)), 32)

@shot('couple', T(92) - .05, 'front')
def _(t, S):   # „Odasétál egy pár, a legszebb ruhájukban”: a couple in their best clothes stroll up to the door
    if not S: S['m'], S['w'] = COUPLE(6, 6.8, -2.3)
    a, b = T(92), T(98) - .2
    walkin(S['m'], t, a, b, (7.0, -2.3, .08), (2.4, -2.3, .08), math.radians(90)); walkin(S['w'], t, a, b, (7.8, -2.3, .08), (3.2, -2.3, .08), math.radians(90))
    x = lerp(7.0, 2.4, seg(t, a, b)); CAM((x - .4, -6.2, 1.45), (x + .6, -2.2, 1.1), 30)

@shot('folds', T(98) - .05, 'front')
def _(t, S):   # „Az ajtónálló összefonja a karját”: the doorman slowly folds his arms in front of them
    if not S: S['d'] = DOORMAN((-1.7, -1.0, .08), rot=math.radians(20)); S['m'], S['w'] = COUPLE(.4, 1.2, -2.0, rot=math.radians(70))
    d = S['d']; H = d.H; u = ease(seg(t, T(99), T(102))); f = d.folded(); r = {'L': (-.3 * H, -.07 * H, .3 * H), 'R': (.3 * H, -.07 * H, .3 * H)}
    d.pose(t, hands={k: tuple(V(*r[k]).lerp(V(*f[k]), u)) for k in 'LR'}, head=(.08 * u, 0, 0)); S['m'].pose(t); S['w'].pose(t)
    move((-1.0, -4.8, 1.6), (-1.3, -1.0, 1.35), (-1.2, -4.3, 1.6), (-1.4, -1.0, 1.4), seg(t, T(98), T(103)), 30)

@shot('nottonight', T(103) - .05, 'front')
def _(t, S):   # „„Ma este nem.””: the doorman, close, heavy lids
    if not S: S['d'] = DOORMAN((-1.7, -1.0, .08), rot=math.radians(10))
    d = S['d']; d.face(talk(t, T(103), T(105) + .3, 'flat'), eyes='lids', brows='flat'); d.pose(t, hands=d.folded(), head=(0, 0, .05 * math.sin(t * 3)))
    move((-1.6, -2.7, 1.72), (-1.65, -1.0, 1.62), (-1.6, -2.45, 1.72), (-1.65, -1.0, 1.62), seg(t, T(103), T(106)), 40)

@shot('nohome', T(106) - .05, 'front')
def _(t, S):   # „De nem mennek haza.”: the couple, shocked; then they set their faces
    if not S: S['m'], S['w'] = COUPLE(.4, 1.25, -2.1)
    sh = t < T(108) + .2
    for m in (S['m'], S['w']): m.face('open' if sh else 'flat', eyes='wide' if sh else 'lids', brows='raised' if sh else 'angry'); m.pose(t, head=(0, 0, .05 * math.sin(t * 10) if sh else 0))
    move((.82, -4.9, 1.4), (.82, -2.1, 1.15), (.82, -4.6, 1.38), (.82, -2.1, 1.15), seg(t, T(106), T(110)), 30)

@shot('backofline', T(110) - .05, 'front')
def _(t, S):   # „Beállnak a sor végére”: they march past the line to its end
    if not S: S['m'], S['w'] = COUPLE(2, 2.8, -1.9); S['c'] = [stranger(i, (2.0 + i * .85, -.6, .05), lite=i > 3) for i in range(9)]
    a, b = T(110), T(114) - .2
    walkin(S['m'], t, a, b, (2.0, -1.9, .08), (9.6, -1.0, .08), math.radians(-90)); walkin(S['w'], t, a, b, (1.2, -1.9, .08), (8.8, -1.0, .08), math.radians(-90))
    for m in S['c']: m.pose(t)
    x = lerp(2.0, 9.0, seg(t, a, b)); CAM((x - 2.5, -5.2, 1.6), (x, -1.2, 1.0), 28)

@shot('taxi', T(114) - .05, 'taxi')
def _(t, S):   # „Egy férfi kiszáll egy taxiból”: a taxi pulls up; a man in a hat steps out
    if not S: S['f'] = nc_.Mascot('hatman', 'blue3', 1.7, (10.2, -4.6, .08), acc=('wear:#7a5a3a', 'fedora:#3a2418', 'tie:#c23b3b'), eyes='lids'); S['f'].face('flat', eyes='lids', brows='flat')
    u = ease(seg(t, T(115), T(118))); S['f'].pose(t, loc=(10.2, lerp(-4.7, -3.6, u), .08), rot=0, walk=1. if 0 < u < 1 else 0., phase=t * 8)
    move((12.6, -9.5, 1.4), (10.4, -4.6, 1.0), (12.0, -8.8, 1.45), (10.3, -4.2, 1.0), seg(t, T(114), T(119)), 30)

@shot('joins', T(119) - .05, 'front')
def _(t, S):   # „és beáll a sorba. Meg sem kérdezi, mire várnak.”: he joins the end of the line beside the couple, no questions asked
    if not S: S['m'], S['w'] = COUPLE(8.0, 8.8, -.7); S['f'] = nc_.Mascot('hatman', 'blue3', 1.7, (10.6, -1.6, .08), acc=('wear:#7a5a3a', 'fedora:#3a2418', 'tie:#c23b3b')); S['f'].face('flat', eyes='lids', brows='flat'); S['c'] = [stranger(i, (2.0 + i * .85, -.6, .05), lite=True) for i in range(6, 7)]
    walkin(S['f'], t, T(119), T(121), (10.8, -1.8, .08), (9.6, -.7, .08), math.radians(-60))
    if t > T(121): S['f'].pose(t, loc=(9.6, -.7, .08), rot=0, head=(0, 0, .2 * math.sin(t)))
    S['m'].pose(t, head=(0, 0, -.3 * ease(seg(t, T(122), T(123))))); S['w'].pose(t, head=(0, 0, -.25 * ease(seg(t, T(122), T(123)))))
    move((8.9, -3.9, 1.35), (8.9, -.7, 1.1), (8.9, -3.5, 1.35), (8.9, -.7, 1.1), seg(t, T(119), T(128)), 30)

@shot('eleven', T(128) - .05, 'block')
def _(t, S):   # „Tizenegyre a sor már a sarokig ér”: the line runs all the way down the street to the corner
    if not S: S['c'] = [stranger(i, (2.0 + i * .78, -.6, .05), rot=math.radians((i * 37) % 30 - 15), lite=True) for i in range(40)]
    for i, m in enumerate(S['c']): m.pose(t, head=(0, 0, .2 * math.sin(t + i)))
    move((1.0, -3.4, 2.6), (32, -.4, 1.0), (3.0, -3.2, 2.4), (33, -.4, 1.0), seg(t, T(128), T(135)), 28)

@shot('midnight', T(135) - .05, 'block')
def _(t, S):   # „Éjfélre már az egész háztömb körül kígyózik a sor”: from high above: the line snakes round the whole block
    if not S: S['c'] = [stranger(i, (2.0 + i * .78, -.6, .05), lite=True) for i in range(40)] + [stranger(40 + i, (34.9, .6 + i * .78, .05), rot=math.radians(90), lite=True) for i in range(30)]
    for i, m in enumerate(S['c']): m.pose(t)
    move((42, -18, 20), (26, 8, 0), (45, -13, 22), (28, 10, 0), seg(t, T(135), T(144)), 24)

@shot('money', T(144) - .05, 'front')
def _(t, S):   # „és az emberek pénzt kínálnak az ajtónállónak”: hands full of cash pushed at the doorman from both sides
    if not S:
        S['d'] = DOORMAN((-1.7, -1.0, .08), rot=math.radians(5)); S['d'].face('flat', eyes='wide', brows='raised')
        S['a'] = stranger(1, (-2.75, -1.6, .05), rot=math.radians(-60)); S['a'].acc_cash('L'); S['b'] = stranger(3, (-.6, -1.6, .05), rot=math.radians(60)); S['b'].acc_cash('R')
    d = S['d']; d.pose(t, hands=d.folded(), head=(0, 0, .25 * math.sin(t * 2.5)))
    w = math.sin(t * 9); S['a'].pose(t, hands={'L': (.3 * 1.6, -.25 * 1.6, (.6 + .05 * w) * 1.6)}); S['b'].pose(t, hands={'R': (-.3 * 1.6, -.25 * 1.6, (.6 - .05 * w) * 1.6)})
    move((-1.7, -3.9, 1.65), (-1.7, -1.0, 1.45), (-1.7, -3.4, 1.65), (-1.7, -1.0, 1.45), seg(t, T(144), T(151)), 32)

@shot('nods', T(151) - .05, 'front')
def _(t, S):   # „Csak ekkor bólint”: the owner, close, smiles and nods
    if not S: S['o'] = OWNER((0, -1.5, .08)); S['o'].face('smirk', eyes='lids')
    nod = .18 * math.sin(seg(t, T(152), T(154)) * math.pi * 2); S['o'].pose(t, head=(nod, 0, 0))
    move((0, -3.2, 1.45), (0, -1.5, 1.32), (0, -3.0, 1.45), (0, -1.5, 1.32), seg(t, T(151), T(154)), 40)

@shot('ropeup', T(154) - .05, 'front')
def _(t, S):   # „és felemelik a kötelet”: the rope's hook comes up off the post; the red door waits
    if not S:
        for o in list(bpy.data.objects):
            if o.name in ('rope1',): bpy.data.objects.remove(o)
        S['r'] = nc_.tube('ropeL', [(1.5, -1.25, .95), (2.25, -1.25, .62), (3.0, -1.25, .95)], .04, nc_.mat('rope', '#c0182a', rough=.7)); S['d'] = DOORMAN((.9, -1.9, .08), rot=math.radians(-20))
    u = ease(seg(t, T(155), T(157))); sp = S['r'].data.splines[0]; end = V(lerp(1.5, 1.9, u), lerp(-1.25, -1.6, u), lerp(.95, 1.35, u))
    for p, q in zip(sp.points, (end, (end + V(3.0, -1.25, .95)) / 2 - V(0, 0, .3), V(3.0, -1.25, .95))): p.co = (q.x, q.y, q.z, 1)
    S['d'].pose(t, hands={'L': (-.35, -.4, lerp(.75, 1.15, u))})
    move((2.4, -4.4, 1.25), (1.9, -1.25, .95), (2.2, -4.0, 1.2), (1.8, -1.25, 1.0), seg(t, T(154), T(158)), 30)

@shot('cheer', T(158) - .05, 'hall')
def _(t, S):   # „Bent úgy ujjonganak, mintha nyertek volna valamit”: the hall is packed: everyone on their feet, cheering
    if not S:
        S['c'] = []; k = 0
        for r in range(1, 9):
            for c in range(16):
                if (r * 16 + c) % 2 == 0 or r < 5: x = -7.0 + c * .92 + (.5 if c >= 8 else -.5); S['c'].append(stranger(k, (x, 8.2 - r * 1.0 - .3, .05), rot=math.pi, lite=True)); k += 1
        for m in S['c']: m.face('smile', eyes='happy') if 'happy' in m.eyesets else None
    for i, m in enumerate(S['c']):
        H = m.H; j = abs(math.sin(t * 7 + i * .7)); m.pose(t, hands={'L': (-.18 * H, -.05 * H, (.85 + .1 * j) * H), 'R': (.18 * H, -.05 * H, (.85 + .1 * (1 - j)) * H)}, bob=.05 * j)
    move((0, 11.5, 3.2), (0, 2.0, 1.0), (0, 11.0, 3.6), (0, 1.0, .8), seg(t, T(158), T(165)), 26)

@shot('pays40', T(165) - .05, 'alley')
def _(t, S):   # „A 40 idegent a hátsó ajtónál kifizeti”: at the back door he pays them off, one by one
    if not S: S['o'] = OWNER((-12, -1.0, .08), rot=math.radians(-60)); S['o'].face('grin', eyes='happy'); S['o'].acc_cash('R'); S['c'] = [stranger(i, (-10.6 + i * .8, -1.3, .05), rot=math.radians(90)) for i in range(4)]
    o = S['o']; H = o.H; w = abs(math.sin((t - T(165)) * 3.5))
    o.pose(t, hands={'R': (.25 * H, -.32 * H, (.4 + .1 * w) * H), 'L': (-.2 * H, -.15 * H, .35 * H)}); S['c'][0].pose(t, hands={'L': (-.2 * 1.6, -.3 * 1.6, (.4 + .1 * w) * 1.6)}); [m.pose(t) for m in S['c'][1:]]
    move((-10.8, -4.4, 1.55), (-11.2, -1.1, 1.15), (-10.9, -4.0, 1.5), (-11.3, -1.1, 1.15), seg(t, T(165), T(172)), 30)

@shot('sendshome', T(172) - .05, 'alley')
def _(t, S):   # „és hazaküldi őket”: off they go, down the dark street
    if not S: S['c'] = [stranger(i, (-13 - i * .7, -1.6 - (i % 2) * .5, .05), rot=math.radians(90), lite=i > 2) for i in range(8)]
    for i, m in enumerate(S['c']): walkin(m, t, T(172), T(175) + .6, (-12.6 - i * .7, -1.6 - (i % 2) * .5, .05), (-17.6 - i * .7, -1.6 - (i % 2) * .5, .05), math.radians(90))
    CAM((-11.0, -3.4, 1.7), (-16.5, -1.6, 1.0), 30)

@shot('never', T(175) - .05, 'alley')
def _(t, S):   # „Soha többé nincs rájuk szüksége.”: the owner in the back doorway, pleased with himself
    if not S: S['o'] = OWNER((-12, -.6, .08)); S['o'].face('smirk', eyes='happy')
    o = S['o']; H = o.H; S['o'].pose(t, hands={'L': (-.12 * H, -.22 * H, .36 * H), 'R': (.12 * H, -.22 * H, .36 * H)}, head=(0, 0, .1 * math.sin(t * 2)))
    move((-12, -4.0, 1.45), (-12, -.6, 1.2), (-12, -3.2, 1.4), (-12, -.6, 1.25), seg(t, T(175), T(180)), 32)

@shot('nobody', T(180) - .05, 'hall')
def _(t, S):   # „Tudod, senki nem akar egy üres teremben ülni.”: an empty row of red seats, then the whole empty hall
    move((0, -.6, 1.1), (0, 6, 1.0), (0, -4.0, 3.2), (0, 9, 1.4), ease(seg(t, T(180), T(188))), 26)

@shot('want', T(188) - .05, 'hall')
def _(t, S):   # „Azt a helyet akarják, amiről épp most mondták nekik,”: in the seats now: the lucky ones, laughing, pearls and all
    if not S:
        S['c'] = [nc_.Mascot('lady', 'blue1', 1.58, (-.5, 4.9, .3), acc=('dress:#2a9a7a', 'bob:#c23b3b', 'pearls', 'blush')), nc_.Mascot('guy', 'blue2', 1.68, (-1.4, 4.9, .3), acc=('suit:#4a3a8a', 'bowtie:#f2c14e')), stranger(3, (.5, 4.9, .3), rot=0), nc_.Mascot('pearl2', 'blue3', 1.55, (1.4, 4.9, .3), acc=('wear:#f4f1e6', 'pearls', 'beret:#c23b3b'))]
        for m, (mo, ey) in zip(S['c'], (('grin', 'happy'), ('smile', 'happy'), ('grin', 'happy'), ('open', 'happy'))): m.face(mo, eyes=ey)
    for i, m in enumerate(S['c']): H = m.H; m.pose(t, hands={'L': (-.2 * H, -.2 * H, .4 * H), 'R': (.2 * H, -.2 * H, .4 * H)}, head=(.05 * math.sin(t * 8 + i), 0, .08 * math.sin(t * 2 + i)), bob=.01 * abs(math.sin(t * 8 + i)))
    move((0, 1.4, 1.5), (0, 4.9, 1.3), (0, 1.8, 1.5), (0, 4.9, 1.3), seg(t, T(188), T(197)), 28)

@shot('cannot', T(197) - .05, 'front')
def _(t, S):   # „hogy nem kaphatják meg.”: the doorman behind his rope, arms folded, smug
    if not S: S['d'] = DOORMAN((-1.7, -1.0, .08), rot=math.radians(5)); S['d'].face('smirk', eyes='lids', brows='flat')
    d = S['d']; d.pose(t, hands=d.folded()); move((-1.6, -3.4, 1.7), (-1.65, -1.0, 1.55), (-1.6, -2.7, 1.7), (-1.65, -1.0, 1.58), seg(t, T(197), END), 36)

SHOTS.sort(key=lambda s: s[1])
def frames_of(i):
    a = SHOTS[i][1]; b = SHOTS[i + 1][1] if i + 1 < len(SHOTS) else END
    return range(max(1, round(a * FPS) + 1), round(b * FPS) + 1)

if __name__ == '__main__':
    names = [s[0] for s in SHOTS]; want = os.environ.get('SHOT'); only = os.environ.get('FRAMES')
    if os.environ.get('LIST'): [print(n, round(SHOTS[i][1], 2), len(frames_of(i))) for i, n in enumerate(names)]; sys.exit()
    for i, (name, start, kind, f) in enumerate(SHOTS):
        if want and name not in want.split(','): continue
        sc = setup(kind); S = {}; f(start, S)
        if os.environ.get('LINES', '1') == '1': nc_.outlines(1.3)
        out = os.path.join(HERE, '..', 'frames', name); os.makedirs(out, exist_ok=True)
        fr = list(frames_of(i)); fr = [fr[int(x)] if x.isdigit() and int(x) < len(fr) else fr[-1] for x in only.split(',')] if only else fr
        for g in fr:
            p = os.path.join(out, f'f_{g:05d}.png')
            if os.path.exists(p) and not only: continue
            t = (g - 1) / FPS; f(t, S); sc.render.filepath = p; t0 = time.time(); bpy.ops.render.render(write_still=True); print('frame', name, g, round(time.time() - t0, 1), flush=True)
