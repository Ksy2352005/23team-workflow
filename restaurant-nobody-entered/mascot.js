// The 23 Team mascot: big round head, small rounded body, stubby mitten arms, short legs, two glossy eyes, a line mouth.
// Everything is posed from a plain object every frame, so any frame renders on its own.
import * as THREE from 'three';
import { blob } from './tex.js';

export const COLORS = { blue: '#2257ff', white: '#f1f1ee', yellow: '#ffc21c', grey: '#c3c7d1' };
export const HEAD_R = .25, HEAD_Y = .78, SEAT = .34;

const black = new THREE.MeshStandardMaterial({ color: '#0b0b10', roughness: .18, metalness: 0 });
const mouthMat = new THREE.MeshStandardMaterial({ color: '#141018', roughness: .5 });
const blobTex = blob();

function vinyl(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: .5, metalness: 0, sheen: .4, sheenRoughness: .6, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .5) });
}
// a point on the head sphere, for features that sit on its surface
function onHead(yaw, pitch, lift = 0) {
  const r = HEAD_R + lift;
  return new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch) * r, Math.sin(pitch) * r, Math.cos(yaw) * Math.cos(pitch) * r);
}
function facing(m, pos) { m.position.copy(pos); m.lookAt(pos.clone().multiplyScalar(2)); }

const torsoGeo = new THREE.LatheGeometry([[0, 0], [.12, .006], [.17, .05], [.185, .13], [.175, .22], [.14, .3], [.08, .345], [0, .36]].map(p => new THREE.Vector2(p[0], p[1])), 28);
const headGeo = new THREE.SphereGeometry(HEAD_R, 40, 28);
const armGeo = new THREE.CapsuleGeometry(.058, .17, 6, 14); armGeo.translate(0, -.1, 0);
const handGeo = new THREE.SphereGeometry(.072, 16, 12);
const legGeo = new THREE.CapsuleGeometry(.07, .1, 6, 14); legGeo.translate(0, -.09, 0);
const footGeo = new THREE.SphereGeometry(.085, 16, 12);
const eyeGeo = new THREE.SphereGeometry(1, 16, 12);
const lineGeo = new THREE.CapsuleGeometry(.007, .062, 4, 8); lineGeo.rotateZ(Math.PI / 2);
const smileGeo = (() => { const s = new THREE.Shape(); s.moveTo(-.048, 0); s.lineTo(.048, 0); s.absarc(0, 0, .048, 0, -Math.PI, true); return new THREE.ShapeGeometry(s, 16); })();
const sadGeo = new THREE.TorusGeometry(.03, .008, 6, 20, Math.PI); sadGeo.scale(1, 1.25, 1);
const oGeo = new THREE.SphereGeometry(1, 16, 12);
const shadowGeo = new THREE.PlaneGeometry(1, 1);

export function makeMascot(colorName) {
  const mat = vinyl(COLORS[colorName]);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const torso = new THREE.Mesh(torsoGeo, mat); torso.position.y = .19; body.add(torso);
  const head = new THREE.Group(); head.position.y = HEAD_Y; body.add(head);
  const skull = new THREE.Mesh(headGeo, mat); head.add(skull);
  const eyes = [-1, 1].map(s => { const e = new THREE.Mesh(eyeGeo, black); facing(e, onHead(s * .3, .1, -.004)); e.scale.set(.026, .036, .012); head.add(e); return e; });
  const mouth = new THREE.Group(); head.add(mouth); facing(mouth, onHead(0, -.17, .006));
  const mLine = new THREE.Mesh(lineGeo, mouthMat), mSmile = new THREE.Mesh(smileGeo, mouthMat), mSad = new THREE.Mesh(sadGeo, mouthMat), mO = new THREE.Mesh(oGeo, mouthMat);
  mSmile.position.y = .02; mSad.position.y = -.022; mO.scale.set(.018, .022, .006);
  mouth.add(mLine, mSmile, mSad, mO);
  const arms = [1, -1].map(s => {   // index 0 = left (+x), 1 = right (−x)
    const g = new THREE.Group(); g.position.set(s * .165, .47, 0); body.add(g);
    const a = new THREE.Mesh(armGeo, mat); g.add(a);
    const hand = new THREE.Group(); hand.position.y = -.25; g.add(hand);
    const h = new THREE.Mesh(handGeo, mat); h.scale.set(1, 1.05, .9); hand.add(h);
    return { g, hand };
  });
  const legs = [1, -1].map(s => {
    const g = new THREE.Group(); g.position.set(s * .085, .2, 0); body.add(g);
    const l = new THREE.Mesh(legGeo, mat); g.add(l);
    const f = new THREE.Mesh(footGeo, mat); f.scale.set(.95, .62, 1.3); f.position.set(0, -.18, .03); g.add(f);
    return g;
  });
  const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 1 }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.setScalar(.75); shadow.position.y = .004; shadow.renderOrder = 1; root.add(shadow);
  root.traverse(o => { if (o.isMesh && o !== shadow) o.castShadow = true; });
  return { root, body, head, eyes, mouth: { mLine, mSmile, mSad, mO }, arms, legs, shadow, mat };
}

// P: { x, y, z, ry, vis, lean, tilt, bob, squash, headYaw, headPitch, headRoll, armL:[pitch,roll], armR, legL, legR, sit, smile, sad, o, blink, look:[x,y] }
export function pose(m, P) {
  m.root.visible = P.vis !== false;
  if (!m.root.visible) return;
  const sit = P.sit || 0;
  m.root.position.set(P.x || 0, (P.y || 0), P.z || 0);
  m.root.rotation.y = P.ry || 0;
  const sq = P.squash || 0;
  m.body.position.y = (P.bob || 0) + sit * (SEAT - .2);
  m.body.rotation.set(P.lean || 0, 0, P.tilt || 0);
  m.body.scale.set(1 + sq * .5, 1 - sq, 1 + sq * .5);
  m.head.rotation.set(-(P.headPitch || 0), P.headYaw || 0, P.headRoll || 0, 'YXZ');
  const arm = (a, v, side) => { const [p, r] = v || [0, .08]; a.g.rotation.set(-p, 0, side * r, 'XYZ'); };
  arm(m.arms[0], P.armL, 1); arm(m.arms[1], P.armR, -1);
  const legP = sit * -1.5;
  m.legs[0].rotation.x = legP - (P.legL || 0); m.legs[1].rotation.x = legP - (P.legR || 0);
  // expression: each mouth shape scales in by its weight, the line takes what is left
  const sm = P.smile || 0, sd = P.sad || 0, o = P.o || 0, ne = Math.max(0, 1 - sm - sd - o);
  const show = (mesh, w, base) => { mesh.visible = w > .02; mesh.scale.copy(base).multiplyScalar(Math.max(w, .001)); };
  show(m.mouth.mLine, ne, new THREE.Vector3(1, 1, 1));
  show(m.mouth.mSmile, sm, new THREE.Vector3(1, 1, 1));
  show(m.mouth.mSad, sd, new THREE.Vector3(1, 1, 1));
  show(m.mouth.mO, o, new THREE.Vector3(.018, .022, .006));
  const bl = 1 - .92 * (P.blink || 0), happy = sm > .5 ? (sm - .5) * .3 : 0;
  for (const e of m.eyes) e.scale.set(.026, .036 * bl * (1 - happy), .012);
  m.shadow.position.y = .004 - (m.body.position.y > .5 ? 0 : 0);
  m.shadow.visible = P.shadow !== false;
}

// a walk cycle: phase in radians, amt 0..1
export function walkPose(phi, amt = 1) {
  const s = Math.sin(phi);
  return { legL: s * .55 * amt, legR: -s * .55 * amt, armL: [-s * .4 * amt, .1], armR: [s * .4 * amt, .1], bob: Math.abs(Math.cos(phi)) * .035 * amt, tilt: Math.sin(phi) * .05 * amt };
}
