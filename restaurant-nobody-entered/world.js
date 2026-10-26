// The world: one Budapest old-town street with the restaurant, its interior, and the vista down to the river.
// Units are metres at mascot scale (a mascot is 1.0 tall). The street runs along x; the restaurant's front wall is z = 0, the street is z > 0.
import * as THREE from 'three';
import { mulberry } from '/core/lib.js';
import * as TX from './tex.js';

export const ROOM = { x0: -3.2, x1: 3.2, z0: -4.8, z1: -.2, h: 2.6 };
export const DOOR = { x0: -2.75, x1: -1.85, h: 1.8, hinge: -1.85 };
export const WIN = { x0: -.6, x1: 1.8, y0: .35, ySpring: 1.05, cx: .6, r: 1.2 };
// tables and their two chairs (seat position and the way a sitter faces)
export const TABLES = [
  { id: 'A', x: .6, z: -.95, seats: [[.05, -.95, Math.PI / 2], [1.15, -.95, -Math.PI / 2]] },
  { id: 'B', x: -1.15, z: -1.6, seats: [[-1.7, -1.6, Math.PI / 2], [-.6, -1.6, -Math.PI / 2]] },
  { id: 'C', x: 2.35, z: -2.0, seats: [[1.8, -2.0, Math.PI / 2], [2.9, -2.0, -Math.PI / 2]] },
  { id: 'D', x: -1.9, z: -3.15, seats: [[-2.45, -3.15, Math.PI / 2], [-1.35, -3.15, -Math.PI / 2]] },
  { id: 'E', x: .45, z: -3.0, seats: [[-.1, -3.0, Math.PI / 2], [1.0, -3.0, -Math.PI / 2]] },
  { id: 'F', x: -.75, z: -4.15, seats: [[-1.3, -4.15, Math.PI / 2], [-.2, -4.15, -Math.PI / 2]] },
];

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, ...o });
const basic = (color, k = 1, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), ...o });
function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent?.add(m); return m; }
function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, parent, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); parent?.add(m); return m; }
function sph(r, mat, x = 0, y = 0, z = 0, parent, s = [20, 14]) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, s[0], s[1]), mat); m.position.set(x, y, z); parent?.add(m); return m; }
function archShape(x0, x1, y0, ySpring, inset = 0) {
  const s = new THREE.Shape(), cx = (x0 + x1) / 2, r = (x1 - x0) / 2 - inset;
  s.moveTo(x0 + inset, y0 + inset); s.lineTo(x1 - inset, y0 + inset); s.lineTo(x1 - inset, ySpring); s.absarc(cx, ySpring, r, 0, Math.PI, false); s.lineTo(x0 + inset, y0 + inset);
  return s;
}

export function buildWorld(scene) {
  const W = {};
  const R = mulberry(77);

  // —— sky: a gradient dome, recoloured per time of day ——
  const skyGeo = new THREE.SphereGeometry(600, 32, 16);
  skyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(skyGeo.attributes.position.count * 3), 3));
  W.sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(W.sky);
  W.setSky = (top, mid, low) => {
    const p = skyGeo.attributes.position, c = skyGeo.attributes.color, a = new THREE.Color(top), b = new THREE.Color(mid), l = new THREE.Color(low), tmp = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const h = p.getY(i) / 600; if (h < .08) tmp.copy(l).lerp(b, Math.max(0, h + .05) / .13); else tmp.copy(b).lerp(a, Math.min(1, (h - .08) / .5)); c.setXYZ(i, tmp.r, tmp.g, tmp.b); }
    c.needsUpdate = true;
  };

  // —— ground: pavement, kerb, cobbled road, far pavement ——
  W.roadMat = std('#ffffff', { map: TX.cobbles(), roughness: .75 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(60, 5.4), W.roadMat); road.rotation.x = -Math.PI / 2; road.position.set(-4, -.06, 5.1); scene.add(road);
  W.paveMat = std('#ffffff', { map: TX.slabs(), roughness: .8 });
  for (const [z, d] of [[1.2, 2.4], [9.0, 2.4]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(60, d), W.paveMat); p.rotation.x = -Math.PI / 2; p.position.set(-4, 0, z); scene.add(p); }
  const kerbMat = std('#8a8fa6');
  box(60, .08, .14, kerbMat, -4, -.02, 2.4, scene); box(60, .08, .14, kerbMat, -4, -.02, 7.8, scene);
  // embankment and river at the street's end
  const river = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std('#0d1838', { roughness: .25, metalness: .2 })); river.rotation.x = -Math.PI / 2; river.position.set(-232, -2.5, 0); scene.add(river);
  const rail = std('#141a30');
  box(.12, .9, 20, rail, -34, .45, 5, scene);
  for (let z = -4; z <= 14; z += 2) box(.3, 1.0, .3, rail, -34, .5, z, scene);
  const embank = new THREE.Mesh(new THREE.PlaneGeometry(8, 30), W.paveMat); embank.rotation.x = -Math.PI / 2; embank.position.set(-30, 0, 5); scene.add(embank);

  // —— the Parliament across the river: a warm-lit silhouette ——
  {
    const g = new THREE.Group(), gold = basic('#d8a058', .95, { fog: false }), dark = basic('#6e4622', 1, { fog: false });
    box(16, 16, 150, gold, 0, 8, 0, g); box(18, 3, 154, dark, 0, 17, 0, g);
    for (let z = -70; z <= 70; z += 7) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.2, 9, 6), gold); c.position.set(0, 22, z); g.add(c); }
    for (const z of [-30, 30]) { box(9, 30, 9, gold, 0, 15, z, g); const c = new THREE.Mesh(new THREE.ConeGeometry(4.5, 18, 8), gold); c.position.set(0, 39, z); g.add(c); }
    cyl(13, 13, 14, gold, 0, 25, 0, g, 32); const d = sph(13.5, gold, 0, 32, 0, g, [32, 16]); d.scale.y = 1.15;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(2.4, 24, 8), gold); sp.position.set(0, 58, 0); g.add(sp);
    for (let z = -72; z <= 72; z += 3) box(.6, 13, 1.1, dark, 8.1, 7, z, g);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const r = box(.8, 13, .8, dark, Math.cos(a) * 13.2, 25, Math.sin(a) * 13.2, g); }
    g.scale.setScalar(.8); g.position.set(-300, -4, 4); scene.add(g);
    // its reflection: soft warm streaks on the water
    const gl = new THREE.MeshBasicMaterial({ map: TX.glow('255,190,110'), transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    for (let i = 0; i < 9; i++) { const q = new THREE.Mesh(new THREE.PlaneGeometry(40, 6 + R() * 10), gl); q.rotation.x = -Math.PI / 2; q.position.set(-150 - R() * 80, -2.45, -40 + i * 11); scene.add(q); }
    // a far hillside with a palace glow on the left bank
    const hill = new THREE.Mesh(new THREE.SphereGeometry(140, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), basic('#101a3d', 1, { fog: false })); hill.scale.y = .32; hill.position.set(-330, -6, -120); scene.add(hill);
    W.parliament = g;
  }

  // —— buildings along both sides of the street ——
  const walls = ['#e3cfa2', '#d9b46c', '#e7c8b2', '#cfc4a6', '#ead9bb', '#d6a978'];
  function building(x0, x1, front, side, seed) {
    const w = x1 - x0, h = 8.5 + R() * 3, wall = walls[Math.floor(R() * walls.length)];
    const f = TX.facade({ seed, wall, floors: Math.round(h / 2.4), cols: Math.max(2, Math.round(w / 1.9)), lit: .32 });
    f.map.repeat.set(1, 1); f.emissive.repeat.set(1, 1);
    const fm = std('#ffffff', { map: f.map, emissive: '#ffffff', emissiveMap: f.emissive, emissiveIntensity: 1.6, roughness: .9 });
    const pm = std(wall, { roughness: .95 });
    const mats = [pm, pm, std('#5a4a3c'), pm, side > 0 ? fm : pm, side < 0 ? fm : pm];
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 6), mats);
    b.position.set((x0 + x1) / 2, h / 2, front + (side > 0 ? -3 : 3)); scene.add(b);
    box(w + .1, .25, .3, std('#f1e6cd'), (x0 + x1) / 2, h - .2, front + side * .12, scene);   // roof cornice
    return b;
  }
  for (const [a, b] of [[-26, -19.5], [-19.5, -12.5], [-12.5, -7.6], [-7.6, -3.6], [3.6, 9.5], [9.5, 15.5], [15.5, 22]]) building(a, b, .05, 1, Math.floor(R() * 999));
  for (let x = -26; x < 22;) { const w = 5 + R() * 3.5; building(x, Math.min(22, x + w), 10, -1, Math.floor(R() * 999)); x += w; }

  // —— the restaurant building ——
  const cream = std('#ead8ae', { roughness: .9 });
  {
    const s = new THREE.Shape(); s.moveTo(-3.6, 0); s.lineTo(3.6, 0); s.lineTo(3.6, 2.75); s.lineTo(-3.6, 2.75); s.lineTo(-3.6, 0);
    const dh = new THREE.Path(); dh.moveTo(DOOR.x0, 0); dh.lineTo(DOOR.x0, DOOR.h); dh.lineTo(DOOR.x1, DOOR.h); dh.lineTo(DOOR.x1, 0); dh.lineTo(DOOR.x0, 0); s.holes.push(dh);
    s.holes.push(new THREE.Path(archShape(WIN.x0, WIN.x1, WIN.y0, WIN.ySpring).getPoints(48).reverse()));
    const g = new THREE.ExtrudeGeometry(s, { depth: .25, bevelEnabled: false, curveSegments: 32 }); g.translate(0, 0, -.2);
    const front = new THREE.Mesh(g, [cream, std('#1c2b63')]); scene.add(front);
    // inner face of the front wall: navy like the room
    const inner = new THREE.Mesh(new THREE.ShapeGeometry(s, 32), std('#1c2b63', { side: THREE.BackSide })); inner.position.z = -.201; scene.add(inner);
    const f = TX.facade({ seed: 4, wall: '#ead8ae', floors: 3, cols: 3, lit: .5 });
    const fm = std('#ffffff', { map: f.map, emissive: '#ffffff', emissiveMap: f.emissive, emissiveIntensity: 1.6, roughness: .9 });
    const up = new THREE.Mesh(new THREE.BoxGeometry(7.2, 7.0, 5.3), [cream, cream, std('#5a4a3c'), cream, fm, cream]); up.position.set(0, 2.75 + 3.5, -2.6); scene.add(up);
    box(7.4, .18, .35, std('#f4ead2'), 0, 2.78, .1, scene); box(7.6, .3, .45, std('#f4ead2'), 0, 9.7, -.1, scene);
    // ground-floor pilasters and a plinth
    for (const x of [-3.45, -1.7, 2.0, 3.45]) box(.22, 2.6, .12, std('#f1e3c3'), x, 1.3, .1, scene);
    box(7.2, .32, .1, std('#b9a88a'), 0, .16, .1, scene);
  }

  // —— the room ——
  const navy = std('#1c2b63', { roughness: .9 }), ceilM = std('#131c45'), wains = std('#e8d9b9', { roughness: .7 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.6), std('#ffffff', { map: TX.planks(), roughness: .55 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, .001, -2.5); scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.6), ceilM); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, ROOM.h, -2.5); scene.add(ceil);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6.4, ROOM.h), navy); back.position.set(0, ROOM.h / 2, ROOM.z0); scene.add(back);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(4.6, ROOM.h), navy); w.rotation.y = -s * Math.PI / 2; w.position.set(s * ROOM.x1, ROOM.h / 2, -2.5); scene.add(w); }
  // wainscot panels and rail
  box(6.4, .85, .03, wains, 0, .425, ROOM.z0 + .015, scene); box(6.4, .05, .06, std('#f2e7cf'), 0, .87, ROOM.z0 + .03, scene);
  for (const s of [-1, 1]) { box(.03, .85, 4.6, wains, s * (ROOM.x1 - .015), .425, -2.5, scene); box(.06, .05, 4.6, std('#f2e7cf'), s * (ROOM.x1 - .03), .87, -2.5, scene); }
  box(2.05, .85, .03, wains, -.62 - 0, .425, -.215, scene).position.x = 2.5;
  box(.85, .35, .03, wains, -1.2, .175, -.215, scene); box(.4, .85, .03, wains, -3.0, .425, -.215, scene);
  for (const x of [-3.0, -2.2, -1.4, -.6, .2, 1.0, 1.8, 2.6]) for (const s of [-1, 1]) box(.02, .55, .5, std('#d9c8a4'), s * (ROOM.x1 - .03), .44, x * .55 - 2.5, scene);
  // paintings
  for (const [z, seed] of [[-1.6, 3], [-3.4, 8]]) { const p = new THREE.Group(); box(.04, .62, .82, std('#b08a3e', { metalness: .6, roughness: .35 }), 0, 0, 0, p); const art = new THREE.Mesh(new THREE.PlaneGeometry(.7, .5), std('#ffffff', { map: TX.painting(seed) })); art.rotation.y = Math.PI / 2; art.position.x = .025; p.add(art); p.position.set(ROOM.x0 + .03, 1.55, z); scene.add(p); }
  // counter with an espresso machine and shelves of bottles
  const oak = std('#a8713d', { roughness: .55 }), oakDark = std('#7a4c25', { roughness: .5 }), brass = std('#c9a04a', { metalness: .85, roughness: .3 });
  box(2.6, .82, .5, oak, 1.55, .41, -4.45, scene); box(2.7, .05, .58, oakDark, 1.55, .845, -4.45, scene);
  { const m = new THREE.Group(); box(.42, .36, .3, brass, 0, .18, 0, m); box(.46, .05, .32, std('#e5e1d8', { metalness: .7, roughness: .25 }), 0, .385, 0, m); cyl(.03, .03, .1, std('#20222a'), -.1, .1, .17, m); cyl(.03, .03, .1, std('#20222a'), .1, .1, .17, m); m.position.set(2.3, .87, -4.5); scene.add(m); }
  for (const y of [1.25, 1.7]) { box(2.4, .04, .22, oakDark, 1.55, y, -4.68, scene); for (let i = 0; i < 9; i++) { const c = ['#2f7a4b', '#7b2a2a', '#d9b45a', '#3a5aa8', '#e8e2d0'][Math.floor(R() * 5)]; const b = cyl(.035, .04, .22 + R() * .08, std(c, { roughness: .2, transparent: true, opacity: .9 }), .5 + i * .26, y + .14, -4.68, scene, 10); b.scale.y = 1; } }
  // plants
  W.plant = (x, z, s = 1, y = 0) => {
    const g = new THREE.Group(); cyl(.16, .12, .3, std('#2b3b7a'), 0, .15, 0, g);
    const leaf = std('#3f7f3a', { roughness: .7 }), leaf2 = std('#5b9a45', { roughness: .7 });
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = .1 + R() * .12; const l = sph(.13 + R() * .06, i % 2 ? leaf : leaf2, Math.cos(a) * r, .45 + R() * .35, Math.sin(a) * r, g, [10, 8]); l.scale.set(1, 1.3, .8); }
    g.position.set(x, y, z); g.scale.setScalar(s); scene.add(g); return g;
  };
  W.plant(-2.95, -4.5, 1.2); W.plant(2.95, -.55, 1.1); W.plant(-2.95, -.6, 1.0); W.plant(.9, -4.45, .55, .87);

  // —— tables, chairs, candles ——
  const tableTop = std('#b97d44', { roughness: .45 }), metal = std('#1d1f29', { metalness: .5, roughness: .4 }), cushion = std('#22348a', { roughness: .85 }), wood = std('#8a552a', { roughness: .55 });
  W.tables = {}; W.chairs = []; W.candles = [];
  const flameMat = basic('#ffc46b', 4);
  for (const T of TABLES) {
    const g = new THREE.Group(); cyl(.38, .38, .04, tableTop, 0, .52, 0, g, 32); cyl(.03, .03, .5, metal, 0, .26, 0, g, 10); cyl(.16, .2, .03, metal, 0, .015, 0, g, 20);
    g.position.set(T.x, 0, T.z); scene.add(g); W.tables[T.id] = g;
    const candle = new THREE.Group(); cyl(.035, .03, .07, std('#e9e1cf', { transparent: true, opacity: .55, roughness: .1 }), 0, .035, 0, candle, 14); const fl = sph(.012, flameMat, 0, .085, 0, candle, [8, 6]); fl.scale.y = 1.6;
    candle.position.set(T.x + .1, .54, T.z - .08); scene.add(candle); W.candles.push({ g: candle, fl, seed: T.x * 13 + T.z });
    for (const [sx, sz, ry] of T.seats) {
      const c = new THREE.Group();
      box(.34, .045, .32, wood, 0, .32, 0, c); box(.32, .04, .3, cushion, 0, .355, 0, c);
      for (const [lx, lz] of [[-.14, -.13], [.14, -.13], [-.14, .13], [.14, .13]]) cyl(.016, .016, .32, wood, lx, .16, lz, c, 8);
      const backrest = new THREE.Group(); backrest.position.set(0, .34, -.15); c.add(backrest);
      for (const lx of [-.14, .14]) cyl(.016, .016, .42, wood, lx, .21, 0, backrest, 8);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(.14, .018, 6, 16, Math.PI), wood); arc.position.y = .4; backrest.add(arc);
      c.position.set(sx, 0, sz); c.rotation.y = ry; scene.add(c);
      W.chairs.push({ g: c, x: sx, z: sz, ry, table: T.id });
    }
  }
  W.chair = (tableId, i) => W.chairs.filter(c => c.table === tableId)[i];

  // —— pendant lamps ——
  W.pendants = [];
  const cord = std('#111');
  W.globeMat = basic('#ffd08c', 3.2);
  for (const [x, z] of [[.6, -.95], [-1.5, -2.4], [1.5, -3.2]]) {
    cyl(.006, .006, .55, cord, x, ROOM.h - .27, z, scene, 6); cyl(.05, .07, .06, brass, x, ROOM.h - .56, z, scene, 14);
    sph(.11, W.globeMat, x, ROOM.h - .68, z, scene, [20, 14]);
    const L = new THREE.PointLight('#ffb466', 3, 9, 2); L.position.set(x, ROOM.h - .72, z); scene.add(L); W.pendants.push(L);
  }

  // —— the door, its bell, the window ——
  {
    const door = new THREE.Group(); door.position.set(DOOR.hinge, 0, -.07); scene.add(door);
    const dm = std('#17255c', { roughness: .55 }), dm2 = std('#22357a', { roughness: .5 });
    const w = DOOR.x1 - DOOR.x0;
    box(w, DOOR.h, .06, dm, -w / 2, DOOR.h / 2, 0, door);
    for (const s of [1, -1]) { box(w * .7, .55, .02, dm2, -w / 2, .45, s * .035, door); }
    W.doorGlassMat = std('#6d5a4a', { emissive: '#ffb25e', emissiveIntensity: .35, roughness: .15 });
    for (const s of [1, -1]) { box(w * .5, .5, .015, W.doorGlassMat, -w / 2, 1.32, s * .03, door); box(.035, .5, .02, dm, -w / 2, 1.32, s * .035, door); box(w * .5, .035, .02, dm, -w / 2, 1.32, s * .035, door); }
    for (const s of [1, -1]) sph(.035, brass, -w + .1, .95, s * .06, door, [12, 8]);
    box(w + .12, .1, .2, std('#f1e3c3'), DOOR.x0 + w / 2, DOOR.h + .05, 0, scene);
    W.door = door;
    const bell = new THREE.Group(); bell.position.set(DOOR.x0 + w / 2, DOOR.h - .02, -.28); scene.add(bell);
    box(.02, .1, .02, brass, 0, -.05, 0, bell); const cup = new THREE.Mesh(new THREE.ConeGeometry(.05, .08, 16, 1, true), brass); cup.material.side = THREE.DoubleSide; cup.position.y = -.12; bell.add(cup); sph(.012, brass, 0, -.17, 0, bell, [8, 6]);
    box(.04, .02, .14, brass, DOOR.x0 + w / 2, DOOR.h - .01, -.2, scene);
    W.bell = bell;
  }
  {
    const fr = std('#1a2659', { roughness: .5 });
    const ring = archShape(WIN.x0, WIN.x1, WIN.y0, WIN.ySpring); ring.holes.push(new THREE.Path(archShape(WIN.x0, WIN.x1, WIN.y0, WIN.ySpring, .07).getPoints(48).reverse()));
    const fg = new THREE.ExtrudeGeometry(ring, { depth: .1, bevelEnabled: false, curveSegments: 32 }); fg.translate(0, 0, -.13);
    scene.add(new THREE.Mesh(fg, fr));
    for (const mx of [WIN.cx - .6, WIN.cx + .6]) { const top = WIN.ySpring + Math.sqrt(WIN.r * WIN.r - .36); box(.05, top - WIN.y0, .08, fr, mx, (WIN.y0 + top) / 2, -.08, scene); }
    box(WIN.x1 - WIN.x0 - .1, .06, .08, fr, WIN.cx, WIN.ySpring, -.08, scene);
    W.glassMat = new THREE.MeshStandardMaterial({ color: '#a9bcff', transparent: true, opacity: .1, roughness: .05, metalness: .1, depthWrite: false });
    const gl = new THREE.Mesh(new THREE.ShapeGeometry(archShape(WIN.x0, WIN.x1, WIN.y0, WIN.ySpring, .06), 32), W.glassMat); gl.position.z = -.06; scene.add(gl); W.glass = gl;
    box(WIN.x1 - WIN.x0 + .3, .07, .28, std('#f1e3c3'), WIN.cx, WIN.y0 - .035, .02, scene);
  }

  // —— awning, lanterns, trees, outdoor table ——
  {
    const st = TX.stripes(); st.repeat.set(1, 1);
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.15), std('#ffffff', { map: st, side: THREE.DoubleSide, roughness: .85 }));
    aw.position.set(-.45, 2.32, .5); aw.rotation.x = -Math.PI / 2 + .55; scene.add(aw);
    const val = new THREE.Mesh(new THREE.PlaneGeometry(5.6, .2), std('#ffffff', { map: TX.stripes(), side: THREE.DoubleSide, roughness: .85 })); val.position.set(-.45, 1.92, .99); scene.add(val);
    for (const x of [-3.2, 2.3]) { const arm = cyl(.012, .012, 1.0, std('#20253a'), x, 2.18, .5, scene, 6); arm.rotation.x = Math.PI / 2 - .5; }
  }
  W.lanternMat = basic('#ffcf87', 3);
  for (const x of [-2.98, -1.62]) { const g = new THREE.Group(); box(.14, .2, .14, W.lanternMat, 0, 0, 0, g); box(.18, .04, .18, std('#1a1d2b'), 0, .12, 0, g); const c = new THREE.Mesh(new THREE.ConeGeometry(.12, .1, 4), std('#1a1d2b')); c.rotation.y = Math.PI / 4; c.position.y = .18; g.add(c); box(.03, .03, .16, std('#1a1d2b'), 0, .02, -.1, g); g.position.set(x, 1.62, .2); scene.add(g); }
  W.lantern = new THREE.PointLight('#ffb466', 2.2, 7, 2); W.lantern.position.set(-2.3, 1.6, .55); scene.add(W.lantern);
  W.tree = (x, z) => {
    const g = new THREE.Group(); cyl(.24, .18, .42, std('#2a3772'), 0, .21, 0, g); cyl(.035, .045, .9, std('#5a4330'), 0, .85, 0, g, 8);
    const lf = [std('#3f6f3a'), std('#57894a'), std('#6e9a4f')];
    for (let i = 0; i < 16; i++) { const a = i * 2.39, r = .08 + R() * .25; const l = sph(.17 + R() * .1, lf[i % 3], Math.cos(a) * r, 1.35 + R() * .45, Math.sin(a) * r, g, [10, 8]); l.scale.y = .9; }
    g.position.set(x, 0, z); scene.add(g); return g;
  };
  W.tree(-3.35, .55); W.tree(2.45, .6);
  { const g = new THREE.Group(); cyl(.25, .25, .03, std('#20253a', { metalness: .6, roughness: .4 }), 0, .5, 0, g, 24); cyl(.02, .02, .5, std('#20253a'), 0, .25, 0, g, 8); g.position.set(3.05, 0, 1.15); scene.add(g);
    for (const dx of [-.42, .42]) { const c = new THREE.Group(); box(.3, .03, .3, std('#20253a', { metalness: .5 }), 0, .32, 0, c); for (const [lx, lz] of [[-.12, -.12], [.12, -.12], [-.12, .12], [.12, .12]]) cyl(.012, .012, .32, std('#20253a'), lx, .16, lz, c, 6); const b = new THREE.Mesh(new THREE.TorusGeometry(.13, .012, 6, 14, Math.PI), std('#20253a')); b.position.set(0, .52, -.14); c.add(b); c.position.set(3.05 + dx, 0, 1.15); c.rotation.y = dx > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(c); } }

  // —— street lamps ——
  W.lampHeadMat = basic('#ffd496', 3.4);
  function lamp(x, z, light) {
    const g = new THREE.Group(), iron = std('#151826', { metalness: .4, roughness: .5 });
    cyl(.16, .22, .5, iron, 0, .25, 0, g, 12); cyl(.05, .07, 2.9, iron, 0, 1.9, 0, g, 10); cyl(.1, .06, .12, iron, 0, 3.35, 0, g, 10);
    const head = cyl(.16, .1, .38, W.lampHeadMat, 0, 3.6, 0, g, 6); const cap = new THREE.Mesh(new THREE.ConeGeometry(.24, .22, 6), iron); cap.position.y = 3.9; g.add(cap); sph(.04, iron, 0, 4.03, 0, g, [8, 6]);
    g.position.set(x, 0, z); scene.add(g);
    if (light) { const L = new THREE.PointLight('#ffb466', 9, 14, 2); L.position.set(x, 3.5, z); scene.add(L); return L; }
  }
  W.streetLights = [lamp(-5.4, 2.05, true), lamp(4.4, 2.05, true)];
  for (const x of [-12.5, -19.5]) lamp(x, 2.05); for (const x of [-9, -16, -23, -1.5, 6, 13]) lamp(x, 7.95);
  // warm pools of light on the ground (they read as wet reflections once the street is wet)
  W.poolMat = new THREE.MeshBasicMaterial({ map: TX.glow('255,180,100'), transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending });
  W.pools = [];
  for (const [x, z, sx, sz] of [[-5.4, 2.6, 2.6, 3.6], [4.4, 2.6, 2.6, 3.6], [.6, 1.2, 3.4, 2.4], [-2.3, .9, 1.8, 1.6], [-12.5, 2.6, 2, 3], [-19.5, 2.6, 2, 3], [-9, 7, 2, 3], [-16, 7, 2, 3], [-1.5, 7, 2, 3], [6, 7, 2, 3]]) {
    const q = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), W.poolMat); q.rotation.x = -Math.PI / 2; q.position.set(x, .012, z); q.renderOrder = 2; scene.add(q); W.pools.push(q);
  }

  // —— the tram (opening shot only) ——
  {
    const g = new THREE.Group(), y = std('#f2c230', { roughness: .45 }), win = basic('#ffd796', 1.6);
    box(2.4, 2.4, 10, y, 0, 1.5, 0, g); box(2.42, .7, 9, win, 0, 1.85, 0, g); box(2.3, .2, 10.2, std('#e8e2d0'), 0, 2.75, 0, g); box(2.42, .3, 10, std('#9a2d22'), 0, .45, 0, g);
    g.position.set(-24, 0, -30); scene.add(g); W.tram = g;
  }
  // —— birds ——
  W.birds = [0, 1].map(() => { const g = new THREE.Group(), m = basic('#0b1028', 1); const wl = new THREE.Mesh(new THREE.PlaneGeometry(.35, .1), m); wl.position.x = -.17; const wr = wl.clone(); wr.position.x = .17; const pl = new THREE.Group(), pr = new THREE.Group(); pl.add(wl); pr.add(wr); g.add(pl, pr); g.userData = { pl, pr }; scene.add(g); return g; });

  // —— rain, drops on the glass, mist ——
  {
    const N = 900, g = new THREE.BoxGeometry(.006, .3, .006), m = new THREE.MeshBasicMaterial({ color: '#a7b8ff', transparent: true, opacity: .35, depthWrite: false });
    W.rain = new THREE.InstancedMesh(g, m, N); W.rain.frustumCulled = false; scene.add(W.rain);
    W.rainSeed = [...Array(N)].map(() => [R() * 12 - 6, R() * 6, .25 + R() * 7.5, .8 + R() * .4]);
    const D = 140, dg = new THREE.SphereGeometry(1, 8, 6), dm = new THREE.MeshStandardMaterial({ color: '#cfdcff', roughness: .05, transparent: true, opacity: .55 });
    W.drops = new THREE.InstancedMesh(dg, dm, D); W.drops.frustumCulled = false; scene.add(W.drops);
    W.dropSeed = [...Array(D)].map(() => [WIN.x0 + .1 + R() * (WIN.x1 - WIN.x0 - .2), WIN.y0 + .1 + R() * 1.8, .02 + R() * .08, R()]);
    W.mist = [0, 1, 2].map(i => { const q = new THREE.Mesh(new THREE.PlaneGeometry(26, 2.2), new THREE.MeshBasicMaterial({ map: TX.mist(), transparent: true, opacity: .16, depthWrite: false })); q.position.set(-8, .55, 3 + i * 2.2); scene.add(q); return q; });
  }

  // —— cups, a tray, a cloth, a key, small plates (posed per shot) ——
  const china = std('#f4f1ea', { roughness: .3 });
  W.cup = () => { const g = new THREE.Group(); cyl(.07, .07, .01, china, 0, .005, 0, g, 18); cyl(.04, .032, .06, china, 0, .04, 0, g, 16); cyl(.036, .036, .005, std('#4a2a14'), 0, .068, 0, g, 14); g.visible = false; scene.add(g); return g; };
  W.plate = () => { const g = new THREE.Group(); cyl(.11, .09, .015, china, 0, .008, 0, g, 22); sph(.05, std(['#d9a04a', '#c8743a', '#e8cf8a'][Math.floor(R() * 3)], { roughness: .7 }), 0, .03, 0, g, [10, 8]).scale.y = .5; g.visible = false; scene.add(g); return g; };
  W.trayMesh = cyl(.2, .2, .02, std('#b8bcc8', { metalness: .8, roughness: .3 }), 0, 0, 0, null, 24);
  W.cloth = box(.16, .02, .12, std('#f6f4ee', { roughness: .95 }));
  W.key = new THREE.Group(); { const b = std('#d4ac52', { metalness: .9, roughness: .3 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(.04, .012, 8, 16), b); ring.position.y = .06; W.key.add(ring); cyl(.009, .009, .14, b, 0, -.03, 0, W.key, 8); box(.03, .025, .008, b, .02, -.08, 0, W.key); }

  // —— lights ——
  W.hemi = new THREE.HemisphereLight('#4a62c8', '#1a1a2e', .6); scene.add(W.hemi);
  W.moon = new THREE.DirectionalLight('#8aa2ff', .5); W.moon.position.set(6, 14, 10); scene.add(W.moon);
  W.fill = new THREE.DirectionalLight('#ffd2a0', 0); W.fill.position.set(-3, 4, -6); scene.add(W.fill);

  return W;
}
