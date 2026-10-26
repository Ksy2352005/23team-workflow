// The Restaurant Nobody Entered — a 23 Team reel, built in three.js and rendered frame by frame from render(t)
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { clamp, lerp, seg, ss, vnoise } from '/core/lib.js';
import { buildWorld, TABLES, WIN } from './world.js';
import { makeMascot, pose } from './mascot.js';
import { DUR, HIT, DISSOLVES, sceneAt, SCENES } from './story.js';

const Q = new URLSearchParams(location.search);
const W = innerWidth, H = innerHeight, SS = +(Q.get('ssaa') || 1), RES = W / 1080;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1;
document.getElementById('stage').appendChild(renderer.domElement);
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const octx = ov.getContext('2d');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#101c4e', .014);
const camera = new THREE.PerspectiveCamera(50, W / H, .05, 1200);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SS });
post.bloom.strength = .32; post.bloom.radius = .55; post.bloom.threshold = 1.05;
post.vig.uniforms.amt.value = .42; post.vig.uniforms.contrast.value = .12; post.vig.uniforms.sat.value = 1.08;

const WD = buildWorld(scene);

// —— the cast ——
const CAST = { owner: 'blue', guest: 'white', y1: 'yellow', g2: 'grey', y2: 'yellow', w2: 'white', g3: 'grey', y3: 'yellow', w3: 'white', g4: 'grey', y4: 'yellow', w4: 'white' };
const M = {};
for (const [k, c] of Object.entries(CAST)) { M[k] = makeMascot(c); scene.add(M[k].root); }

// —— props ——
const key = WD.key; M.owner.arms[1].hand.add(key); key.position.set(.04, -.02, .07); key.rotation.set(.3, 0, .4);
const cloth = WD.cloth; scene.add(cloth);
const tray = new THREE.Group(); tray.add(WD.trayMesh); M.owner.body.add(tray); tray.position.set(0, .43, .3);
const trayCups = [WD.cup(), WD.cup()]; trayCups.forEach((c, i) => { scene.remove(c); tray.add(c); c.position.set(i ? .08 : -.08, .01, i ? -.04 : .05); });
const seatKeys = TABLES.flatMap(T => T.seats.map((s, i) => ({ k: T.id + i, T, s })));
const cups = {}, plates = {};
for (const { k, T, s } of seatKeys) {
  const dx = s[0] - T.x, dz = s[1] - T.z, d = Math.hypot(dx, dz);
  cups[k] = WD.cup(); cups[k].position.set(T.x + dx / d * .22, .54, T.z + dz / d * .22 + .08);
  plates[k] = WD.plate(); plates[k].position.set(T.x + dx / d * .2, .54, T.z + dz / d * .2 - .1);
}
const sipCup = WD.cup(); M.guest.arms[1].hand.add(sipCup); scene.remove(sipCup); M.guest.arms[1].hand.add(sipCup); sipCup.position.set(0, -.04, .06);

// —— looks ——
const LOOKS = {
  dawn: { sky: ['#1b3684', '#4467b8', '#c89a9a'], hemi: ['#7f9be8', '#2a2a40', 1.1], moon: ['#b9c6ff', .7], fog: ['#3c5296', .010], street: 1, exp: 1.0 },
  morning: { sky: ['#3a63c4', '#7aa0e6', '#f0c4a0'], hemi: ['#a9c0ff', '#3a3550', 1.5], moon: ['#cfdaff', 1.0], fog: ['#6c86c8', .006], street: .3, exp: 1.02 },
  dusk: { sky: ['#101f5c', '#2a428f', '#a8707a'], hemi: ['#5a72cc', '#24203a', .85], moon: ['#9fb0ff', .45], fog: ['#24357a', .012], street: 1, exp: 1.0 },
  night: { sky: ['#060d30', '#0f1f5e', '#1f3070'], hemi: ['#4660c8', '#221d30', .85], moon: ['#8aa0ff', .55], fog: ['#101c4e', .014], street: 1, exp: 1.05 },
};
let lastLook = null;
function applyLook(name) {
  const L = LOOKS[name];
  if (lastLook !== name) { WD.setSky(...L.sky); lastLook = name; }
  WD.hemi.color.set(L.hemi[0]); WD.hemi.groundColor.set(L.hemi[1]); WD.hemi.intensity = L.hemi[2];
  WD.moon.color.set(L.moon[0]); WD.moon.intensity = L.moon[1];
  scene.fog.color.set(L.fog[0]); scene.fog.density = L.fog[1];
  WD.streetLights.forEach(l => l.intensity = 9 * L.street); WD.lampHeadMat.color.set('#ffd496').multiplyScalar(lerp(1, 3.4, L.street));
  renderer.toneMappingExposure = L.exp;
}

const tmpV = new THREE.Vector3();
function bellSwing(t) { let a = 0; for (const h of [HIT.bell1, HIT.bell2, HIT.bell3, HIT.bell4, HIT.bell5]) { const d = t - h + .05; if (d > 0 && d < 3) a += Math.sin(d * 16) * Math.exp(-d * 2.6) * .55; } return a; }

function draw(t) {
  const { S } = sceneAt(t);
  applyLook(S.look);
  // camera
  camera.position.set(...S.cam.pos); camera.lookAt(...S.cam.tgt); camera.fov = S.cam.fov; camera.updateProjectionMatrix();
  post.dof.focus = S.cam.focus; post.dof.aper = (S.cam.aper ?? 8) * RES; post.dof.maxCoc = 18 * RES;
  // cast
  for (const k of Object.keys(M)) pose(M[k], S.chars[k] || { vis: false });
  // interior light
  const I = S.interior ?? 1;
  WD.pendants.forEach(l => l.intensity = 3.2 * I); WD.globeMat.color.set('#ffd08c').multiplyScalar(lerp(.4, 3.2, clamp(I)));
  WD.doorGlassMat.emissiveIntensity = .7 * I;
  const lo = S.lanternOn ?? 1; WD.lantern.intensity = 2.2 * lo; WD.lanternMat.color.set('#ffcf87').multiplyScalar(lerp(.5, 3, lo));
  for (const c of WD.candles) { const f = 1 + .25 * (vnoise(t * 9 + c.seed) - .5); c.fl.scale.set(f, 1.6 * f, f); c.g.scale.y = S.candleLow ? .6 : 1; c.fl.visible = I > .5; }
  // door and bell
  WD.door.rotation.y = -(S.door || 0);
  WD.bell.rotation.z = bellSwing(t);
  // chairs
  const pull = S.chairPull || 0;
  for (const c of WD.chairs) {
    const isA = c.table === 'A', isB1 = c === WD.chair('B', 1);
    c.g.position.set(c.x, 0, c.z); c.g.rotation.set(0, c.ry, 0);
    if (c === WD.chair('A', 1)) c.g.position.x += pull;
    if (c === WD.chair('B', 0)) c.g.position.x += .16 - (S.chairTuck ?? .16);
    let up = S.chairsUp && c.table !== 'B';
    if (isB1 && S.props?.chairB && S.props.chairB !== 'up') {
      up = false;
      if (S.props.chairB === 'lift' || S.props.chairB === 'place') {
        const u = M.owner.root.visible ? (S.chars.owner.chairU ?? 1) : 1, lift = Math.sin(u * Math.PI) * .35;
        c.g.rotation.z = Math.PI * (1 - ss(u)); c.g.position.y = lerp(.915, 0, ss(u)) + lift; continue;
      }
    }
    if (up) { const T = WD.tables[c.table]; c.g.position.set(lerp(c.x, T.position.x, .55), .915, lerp(c.z, T.position.z, .55)); c.g.rotation.set(0, c.ry, Math.PI); }
  }
  // props
  key.visible = S.props?.key === 'owner';
  if (S.props?.cloth === 'owner') { M.owner.root.updateMatrixWorld(true); M.owner.arms[1].hand.getWorldPosition(tmpV); cloth.position.set(tmpV.x, Math.max(.55, tmpV.y - .04), tmpV.z); cloth.visible = true; }
  else if (S.props?.cloth === 'table') { cloth.position.set(.82, .555, -1.08); cloth.rotation.y = .4; cloth.visible = true; }
  else if (S.props?.cloth === 'tableB') { cloth.position.set(-1.0, .555, -1.45); cloth.rotation.y = .3; cloth.visible = true; }
  else cloth.visible = false;
  tray.visible = S.props?.tray === 'owner'; trayCups.forEach((c, i) => c.visible = i < (S.props?.trayCups || 0));
  for (const k in cups) cups[k].visible = !!S.cups?.[k];
  for (const k in plates) plates[k].visible = !!S.plates && !!S.cups?.[k] && k !== 'A0' && k !== 'A1';
  const cu = S.chars.guest?.cupUp || 0; sipCup.visible = cu > .25; if (cu > .25 && cups.A0) cups.A0.visible = false;
  // weather and life
  const wet = S.wet || 0;
  WD.roadMat.roughness = lerp(.75, .32, wet); WD.paveMat.roughness = lerp(.8, .4, wet); WD.roadMat.metalness = .15 * wet; WD.paveMat.metalness = .1 * wet;
  WD.poolMat.opacity = lerp(.22, .6, wet);
  WD.rain.visible = !!S.rain;
  if (S.rain) {
    const m = new THREE.Matrix4();
    WD.rainSeed.forEach(([x, y, z, s], i) => { const yy = ((y - t * 7 * s) % 6 + 6) % 6; m.makeTranslation(x + (z - 4) * .02, yy, z); WD.rain.setMatrixAt(i, m); });
    WD.rain.instanceMatrix.needsUpdate = true;
  }
  WD.drops.visible = !!S.drops;
  if (S.drops) {
    const m = new THREE.Matrix4(), n = Math.round(WD.dropSeed.length * S.drops);
    WD.dropSeed.forEach(([x, y, sp, r], i) => {
      const yy = y - ((t * sp + r) % 1) * .35 * (r > .7 ? 1 : .15);
      const top = WIN.ySpring + Math.sqrt(Math.max(0, WIN.r * WIN.r - (x - WIN.cx) ** 2)) - .08;
      const s = i < n && yy < top && yy > WIN.y0 + .05 ? 1 : 0;
      m.compose(tmpV.set(x, yy, .03), new THREE.Quaternion(), new THREE.Vector3(.011 * s + 1e-5, .016 * s + 1e-5, .004)); WD.drops.setMatrixAt(i, m);
    });
    WD.drops.instanceMatrix.needsUpdate = true;
  }
  WD.mist.forEach((q, i) => { q.visible = false; q.position.x = -8 + ((S.mist || 0) * .25 * (i + 1)) % 4; q.lookAt(camera.position.x, q.position.y, camera.position.z); });
  WD.tram.visible = S.tram !== undefined; if (S.tram !== undefined) WD.tram.position.z = lerp(-22, 26, S.tram);
  WD.birds.forEach((b, i) => { b.visible = S.birds !== undefined && S.birds > 0 && S.birds < 1; if (!b.visible) return; const u = S.birds + i * .05; b.position.set(lerp(-4, -26, u), 7.5 + i * .8 + Math.sin(u * 9) * .3, lerp(2, 9, u) + i); const f = Math.sin(t * 22 + i) * .7; b.userData.pl.rotation.z = f; b.userData.pr.rotation.z = -f; b.lookAt(camera.position); });
  post.composer.render();
}

window.DUR = DUR;
window.EV = Object.entries(HIT).map(([type, t]) => ({ t, type })).sort((a, b) => a.t - b.t);
window.render = t => {
  const D = DISSOLVES.find(d => t >= d.at && t < d.at + d.d);
  if (D) {
    draw(D.at - 1 / 48);
    octx.clearRect(0, 0, W, H); octx.filter = D.blur ? `blur(${D.blur * RES * seg(t, D.at, D.at + D.d)}px)` : 'none';
    octx.drawImage(renderer.domElement, 0, 0); ov.style.opacity = 1 - ss(seg(t, D.at, D.at + D.d));
  } else { ov.style.opacity = 0; }
  draw(t);
};
renderer.compile(scene, camera);
window.render(0);
window.READY = true;
