// M02 Megerősítés (confirmation): a 23 Team neon motion reel after reference video 2, beat by beat on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 38.8, DUR = 41.3, X = 540, Y = 955;

function eye(c, x, y, w, open) { const h = w * .42 * open; c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x, y - h, x + w / 2, y); c.quadraticCurveTo(x, y + h, x - w / 2, y); c.closePath(); c.stroke(); }
function petals(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); for (const d of [-1, 1]) { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-70 * s, -40 * s * d, -60 * s, -130 * s * d, 0, -150 * s * d); c.bezierCurveTo(60 * s, -130 * s * d, 70 * s, -40 * s * d, 0, 0); c.stroke(); } c.restore(); }
function figure(c, x, y, s, a) {   // line-art person; the head is the glowing dot, drawn separately
  c.save(); c.globalAlpha *= a; c.beginPath(); c.arc(x, y + 40 * s, 26 * s, 0, 7); c.stroke(); P(c, [[x - 30 * s, y + 80 * s], [x + 30 * s, y + 80 * s], [x + 42 * s, y + 120 * s], [x + 22 * s, y + 200 * s], [x - 22 * s, y + 200 * s], [x - 42 * s, y + 120 * s]], true);
  P(c, [[x - 30 * s, y + 80 * s], [x - 70 * s, y + 20 * s], [x - 30 * s, y - 10 * s]]); P(c, [[x + 30 * s, y + 80 * s], [x + 70 * s, y + 20 * s], [x + 30 * s, y - 10 * s]]); P(c, [[x - 18 * s, y + 200 * s], [x - 34 * s, y + 360 * s]]); P(c, [[x + 18 * s, y + 200 * s], [x + 34 * s, y + 360 * s]]); c.restore();
}
const scenes = [];
const sc = (t0, f) => scenes.push([t0, f]);
// A: a little-known psychology trick: a dot with small orbits on dotted lines; it turns into a dim disc, then a dark circle with a glowing rim; a hidden X inside
sc(0, (c, t) => { const orb = 1 - ss(seg(t, T(5) - .2, T(5) + .2)), disc = ss(seg(t, T(5) - .1, T(5) + .3)), ring = ss(seg(t, T(7) - .2, T(7) + .3)), xk = seg(t, T(8) - .05, T(8) + .4);
  if (orb > 0) { c.save(); c.setLineDash([4, 10]); neon(c, () => { P(c, [[X, Y - 220], [X, Y + 220]]); P(c, [[X - 220, Y], [X + 220, Y]]); }, { w: 2, alpha: orb * .7 }); c.restore();
    neon(c, () => [[0, -230], [0, 230], [-230, 0], [230, 0]].forEach(([dx, dy], k) => { const a = t * 1.2 + k; c.beginPath(); c.ellipse(X + dx + Math.cos(a) * 6, Y + dy, 28, 14, 0, 0, 7); c.stroke(); }), { w: 2.5, alpha: orb * ss(seg(t, .1, .6)) }); }
  if (ring < 1) glowDot(c, X, Y, lerp(16, 52, disc), 1 - .5 * disc);
  if (ring > 0) { c.save(); c.globalAlpha = ring; c.fillStyle = '#000a26'; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 40; c.beginPath(); c.arc(X, Y, 80, 0, 7); c.fill(); c.restore(); neon(c, () => circle(c, X, Y, 80), { w: 4, alpha: ring, glow: 30 }); }
  if (xk > 0) neon(c, () => { const l = 40 * ease3(xk); P(c, [[X - l, Y - l], [X + l, Y + l]]); P(c, [[X + l, Y - l], [X - l, Y + l]]); }, { w: 3, alpha: 1 - ss(seg(t, T(9) - .2, T(9) + .1)) }); });
// B: business and personal life: the circle opens into an eye; it blinks; a beam of light sweeps from it and a ring of dots appears: trust and deeper connections
sc(T(9) - .15, (c, t) => { const op = ease3(seg(t, T(9) - .1, T(9) + .4)), blink = t > T(14) && t < T(14) + .5 ? Math.abs(Math.cos((t - T(14)) / .5 * Math.PI)) : 1, beam = ss(seg(t, T(17) - .2, T(17) + .3)), ang = -Math.PI / 3 + (t - T(17)) * 2.2;
  neon(c, () => eye(c, X, Y, lerp(160, 560, op), op * blink), { w: 4, alpha: 1 - ss(seg(t, T(17) - .3, T(17))) * .7 }); glowDot(c, X, Y, 46, 1);
  if (beam > 0) { c.save(); c.globalAlpha = beam * .8; const g = c.createLinearGradient(X, Y, X + Math.cos(ang) * 300, Y + Math.sin(ang) * 300); g.addColorStop(0, 'rgba(240,244,255,.95)'); g.addColorStop(1, 'rgba(240,244,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, 320, ang - .18, ang + .18); c.closePath(); c.fill(); c.restore(); }
  for (let k = 0; k < 16; k++) { const a = -Math.PI / 2 + k / 16 * Math.PI * 2, at = T(20) - .3 + k * .05; const p = E(t, at, .25, .5); if (p > 0) glowDot(c, X + Math.cos(a) * 240, Y + Math.sin(a) * 240, 9 * Math.min(1.2, p), 1); } });
// C: people love information that confirms what they already believe: two mirrored petals around the dot turn into place; rays burst out
sc(T(22) - .2, (c, t) => { const k = E(t, T(22) - .1, .45, .35), rot = lerp(.9, 0, ease3(seg(t, T(28), T(29) + .3))) + .05 * Math.sin(t * 1.5); glowDot(c, X, Y, 34, 1); neon(c, () => petals(c, X, Y, 1.3 * Math.min(1.05, k), rot), { w: 4 });
  const r = seg(t, T(35) - .1, T(35) + .8); if (r > 0 && r < 1) neon(c, () => { for (let q = 0; q < 12; q++) { const a = q / 12 * Math.PI * 2 + .1, r0 = 230 + r * 80, r1 = r0 + 90; P(c, [[X + Math.cos(a) * r0, Y + Math.sin(a) * r0], [X + Math.cos(a) * r1, Y + Math.sin(a) * r1]]); } }, { w: 4, alpha: 1 - r }); });
// D: eco-friendly products, tell them they make a positive impact: the dot rises to become a person's head; a platform; a cone of light from above
sc(T(36) - .2, (c, t) => { const fig = ss(seg(t, T(38) - .2, T(38) + .5)), plat = ss(seg(t, T(40) - .2, T(40) + .4)), cone = ss(seg(t, T(46) - .3, T(49) + .2)), hy = lerp(Y, Y - 200, fig);
  if (cone > 0) { c.save(); c.globalAlpha = cone * .75; const g = c.createLinearGradient(0, hy, 0, Y + 200); g.addColorStop(0, 'rgba(240,244,255,.9)'); g.addColorStop(1, 'rgba(240,244,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, hy); c.lineTo(X - 200 * cone, Y + 190); c.lineTo(X + 200 * cone, Y + 190); c.closePath(); c.fill(); c.restore(); }
  neon(c, () => figure(c, X, hy, 1, 1), { w: 3, alpha: fig }); if (plat > 0) neon(c, () => { c.beginPath(); c.ellipse(X, Y + 190, 260 * plat, 40 * plat, 0, 0, 7); c.stroke(); }, { w: 3 }); glowDot(c, X, hy, 26, 1); });
// E: if it's luxury, affirm their taste for the best: the head slides into the chest, the figure fades, a ring opens wide round the dot
sc(T(50) - .2, (c, t) => { const dn = ease3(seg(t, T(51) - .1, T(51) + .5)), fade = ss(seg(t, T(52), T(53) + .2)), ring = ease3(seg(t, T(56) - .2, T(56) + .6)), hy = lerp(Y - 200, Y, dn);
  neon(c, () => figure(c, X, Y - 200, 1, 1 - fade), { w: 3 }); neon(c, () => { c.beginPath(); c.ellipse(X, Y + 190, 260, 40, 0, 0, 7); c.stroke(); }, { w: 3, alpha: 1 - fade }); glowDot(c, X, hy, 26, 1);
  if (ring > 0) neon(c, () => circle(c, X, Y, 40 + ring * 200), { w: 3.5, alpha: 1 - ss(seg(t, T(58), T(58) + .5)) }); });
// F: reflect back their beliefs and you build instant trust: a tall mirror beside the dot; its reflection appears inside; then dot and reflection circle each other on an orbit
sc(T(59) - .2, (c, t) => { const m = ss(seg(t, T(60) - .3, T(60) + .2)), refl = E(t, T(62), .3, .45), orbit = ss(seg(t, T(63) - .2, T(63) + .4)), a = (t - T(63)) * 2.2;
  neon(c, () => c.strokeRect(X + 70, Y - 170, 150, 300), { w: 3.5, alpha: m * (1 - orbit) });
  if (orbit < 1) { glowDot(c, lerp(X, X - 80, m), Y + 60, 24, 1); if (refl > 0) neon(c, () => circle(c, X + 145, Y + 60, 20 * Math.min(1, refl)), { w: 3, alpha: 1 - orbit }); }
  if (orbit > 0) { neon(c, () => { c.beginPath(); c.ellipse(X, Y, 280 * orbit, 60 * orbit, 0, 0, 7); c.stroke(); }, { w: 2.5, alpha: orbit }); glowDot(c, X + Math.cos(a) * 60 * orbit - 20 * (1 - orbit), Y + Math.sin(a) * 14, 24, 1); neon(c, () => circle(c, X - Math.cos(a) * 60 * orbit + 20 * (1 - orbit), Y - Math.sin(a) * 14, 20), { w: 3 }); } });
// G: here's the key: the two merge into a crescent; an eye opens around a dark pupil (align with their views); coloured dots circle it and pour into the light (they connect with you)
sc(T(66) - .2, (c, t) => { const merge = ss(seg(t, T(67) - .3, T(67) + .2)), eyeK = ease3(seg(t, T(70) - .1, T(73) + .1)), dots = ss(seg(t, T(76) - .3, T(76) + .2)), pour = ease3(seg(t, T(77), T(78) + .4));
  if (eyeK < .3) { glowDot(c, X, Y, 26, 1); c.save(); c.fillStyle = MID; c.beginPath(); c.arc(X + lerp(40, 10, merge), Y - 4, 22, 0, 7); c.fill(); c.restore(); }
  if (eyeK > 0 && dots < 1) { neon(c, () => eye(c, X, Y, 420, eyeK), { w: 4, alpha: 1 - dots }); c.save(); c.globalAlpha = 1 - dots; c.fillStyle = '#000a26'; c.beginPath(); c.arc(X, Y, 40 * eyeK, 0, 7); c.fill(); c.restore(); neon(c, () => circle(c, X, Y, 40 * eyeK), { w: 3, alpha: 1 - dots }); }
  if (dots > 0) { glowDot(c, X, Y, 34 * dots + 10 * pour, 1); const cols = ['#ff5a5a', '#ffa53a', '#ffe14d', '#5ce67a', '#3ad0ff', '#4d6bff', '#b45cff', '#ff5ad7']; cols.forEach((col, k) => { const a = k / 8 * Math.PI * 2 + (t - T(76)) * 1.4, r = lerp(220, 0, pour); if (pour < 1) { c.save(); c.globalAlpha = dots; c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 20; c.beginPath(); c.arc(X + Math.cos(a) * r, Y + Math.sin(a) * r, 11, 0, 7); c.fill(); c.restore(); } }); } });
// H: simply because it feels right: frames multiply into a tunnel round the light, then only the light remains
sc(T(79) - .2, (c, t) => { const tun = ss(seg(t, T(79), T(80) + .3)) * (1 - ss(seg(t, T(82) - .3, T(82) + .2)));
  if (tun > 0) neon(c, () => { for (let q = 0; q < 8; q++) { const z = ((t - T(79)) * .45 + q / 8) % 1, f = .2 + z * 2.4; c.globalAlpha = tun * (1 - z) * .9; c.strokeRect(X - 170 * f, Y - 300 * f, 340 * f, 600 * f); } for (let q = -5; q <= 5; q++) { if (Math.abs(q) < 3) continue; c.globalAlpha = tun * .4; P(c, [[X + q * 70, 400], [X + q * 70, 1500]]); } }, { w: 3 });
  glowDot(c, X, Y, 36 + 10 * ss(seg(t, T(82), T(83) + .3)), 1); });

start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 }, continuous: [3, 4, 5, 6] });
