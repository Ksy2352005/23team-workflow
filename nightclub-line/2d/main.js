// The nightclub film in 2.5D (user 2026-11-18): soft 3D plates from Blender behind, our 2D mascots on top, the reference's captions.
import { toon } from './toon.js';
import { WORDS } from './captions.js';
const W = innerWidth, H = innerHeight, K = W / 1080;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, seg = (t, a, b) => clamp((t - a) / (b - a));
const T = i => WORDS[i][1];
const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });

// the camera: a plate scaled about a point (cx, cy in 1080x1920 units), zoom z; characters drawn in the same space
function cam(c, z, cx = 540, cy = 960) { c.translate(540, 960); c.scale(z, z); c.translate(-cx, -cy); }

const SHOTS = [];
const shot = (t0, plate, draw) => SHOTS.push({ t0, plate, draw });

// 1 „Nyitott egy éjszakai klubot,”: the owner laughing in front of his red door; a punch-in on „klubot” like the reference
shot(0, 'door', (c, t, P) => {
  const punch = t < T(3) ? 1.0 + .03 * ss(seg(t, 0, T(3))) : 1.32 + .02 * ss(seg(t, T(3), T(4)));
  c.save(); cam(c, punch, 540, t < T(3) ? 960 : 900); c.drawImage(P, 0, 0, 1080, 1920);
  const laugh = Math.sin(t * 15), rub = Math.sin(t * 11);
  toon(c, { x: 540, y: 1560, h: 900, skin: 'owner', hair: '#4a2a1c', tache: true, bow: true, buttons: true,
    eyes: 'happy', mouth: 'laugh', sq: .03 + .03 * laugh, tilt: .05 * Math.sin(t * 4),
    handL: [-.06 + .025 * rub, -.33], handR: [.06 + .025 * rub, -.31] });
  c.restore();
});

// —— captions: the reference's big white words with a thick dark outline, three at a time, the word being said in turquoise ——
const CHUNKS = (() => { const out = []; let cur = []; WORDS.forEach((w, i) => { cur.push(i); if (cur.length === 3 || /[.,!?…]$/.test(w[0])) { out.push(cur); cur = []; } }); if (cur.length) out.push(cur); return out; })();
function caption(c, t) {
  const ch = CHUNKS.find((k, n) => t >= T(k[0]) - .02 && (n + 1 >= CHUNKS.length || t < T(CHUNKS[n + 1][0]) - .02)); if (!ch) return;
  c.save(); c.font = '700 84px "Montserrat"'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const words = ch.map(i => WORDS[i][0]), sp = c.measureText(' ').width, wid = words.map(w => c.measureText(w).width), tot = wid.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let x = 540 - tot / 2; const y = 1180, pop = 1 + .08 * (1 - ss(seg(t, T(ch[0]) - .02, T(ch[0]) + .1)));
  c.translate(540, y); c.scale(pop, pop); c.translate(-540, -y);
  ch.forEach((i, k) => { const on = t >= WORDS[i][1] - .02 && t < WORDS[i][2] + .05;
    c.lineWidth = 16; c.strokeStyle = '#120a0a'; c.strokeText(words[k], x, y); c.fillStyle = on ? '#2ED3C6' : '#ffffff'; c.fillText(words[k], x, y); x += wid[k] + sp; });
  c.restore();
}

const plates = {};
(async () => {
  await document.fonts.load('700 84px "Montserrat"', 'ÁÉŐŰáéőű');
  for (const s of SHOTS) if (!plates[s.plate]) plates[s.plate] = await load(`plates/${s.plate}.png`);
  const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  window.DUR = +(new URLSearchParams(location.search).get('dur') || 4.6);
  window.render = t => { const c = ctx; c.setTransform(K, 0, 0, K, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, 1080, 1920);
    let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0) i++; const s = SHOTS[i]; s.draw(c, t, plates[s.plate]); caption(c, t); };
  window.render(0); window.READY = true;
})();
