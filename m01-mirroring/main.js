// M01 Tükrözés (Mirroring): a 23 Team neon motion reel after reference video 1. Scenes follow the reference beat by beat, on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, bg, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 40.4, DUR = 42.9;

// —— pieces ——
function coin(c, x, y, r, a = 1, lit = 1) { neon(c, () => { circle(c, x, y, r); c.font = `800 ${r * 1.15}px "Inter"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', x, y + r * .05); }, { w: 3, alpha: a, glow: 10 + 16 * lit }); }
function gearPerson(c, x, y, r, rot) {   // a cog with a person inside: a customer
  c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = k % 2 ? r : r * 1.18; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.stroke(); c.restore();
  c.beginPath(); c.arc(x, y, r * .72, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y - r * .2, r * .2, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y + r * .45, r * .36, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
}
function sphere(c, x, y, r) { const g = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#c9d2ea'); g.addColorStop(1, '#4b5a86'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(x - r * .35, y - r * .42, r * .22, r * .12, -.5, 0, 7); c.fill(); }
function cardIcon(c, kind, x, y, s) {   // a rounded card with an icon: tone (sound wave), style (a figure), vibe (a star)
  c.beginPath(); c.roundRect(x - 110 * s, y - 110 * s, 220 * s, 220 * s, 26 * s); c.stroke();
  if (kind === 'tone') { c.beginPath(); for (let k = 0; k <= 60; k++) { const u = k / 60, xx = x - 80 * s + u * 160 * s, a = Math.sin(u * Math.PI) * 55 * s * (k % 3 === 0 ? 1 : .45); c.moveTo(xx, y - a); c.lineTo(xx, y + a); } c.stroke(); }
  if (kind === 'style') { c.beginPath(); c.arc(x, y - 52 * s, 20 * s, 0, 7); c.stroke(); P(c, [[x - 30 * s, y + 70 * s], [x - 18 * s, y - 25 * s], [x + 18 * s, y - 25 * s], [x + 30 * s, y + 70 * s]]); P(c, [[x - 18 * s, y - 15 * s], [x - 50 * s, y + 25 * s]]); P(c, [[x + 18 * s, y - 15 * s], [x + 44 * s, y + 30 * s]]); }
  if (kind === 'vibe') { c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 26 * s : 62 * s; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }
}
function face(c, x, y, r, mood) {   // a round face: mood 1 smile, -1 frown, 0 neutral
  circle(c, x, y, r); c.beginPath(); c.arc(x - r * .33, y - r * .18, r * .09, 0, 7); c.fill(); c.beginPath(); c.arc(x + r * .33, y - r * .18, r * .09, 0, 7); c.fill();
  const m = clamp(mood, -1, 1); c.beginPath(); c.moveTo(x - r * .38, y + r * .3 - m * r * .05); c.quadraticCurveTo(x, y + r * .3 + m * r * .32, x + r * .38, y + r * .3 - m * r * .05); c.stroke();
}
function bust(c, x, y, s, a = 1) {   // a person in a suit and tie, filled white
  c.save(); c.globalAlpha *= a; c.fillStyle = WHITE; c.shadowColor = 'rgba(200,215,255,1)'; c.shadowBlur = 30; c.beginPath(); c.arc(x, y - 70 * s, 52 * s, 0, 7); c.fill();
  c.beginPath(); c.moveTo(x - 120 * s, y + 110 * s); c.quadraticCurveTo(x - 118 * s, y - 2 * s, x, y - 6 * s); c.quadraticCurveTo(x + 118 * s, y - 2 * s, x + 120 * s, y + 110 * s); c.closePath(); c.fill(); c.shadowBlur = 0;
  c.fillStyle = MID; c.beginPath(); c.moveTo(x - 26 * s, y - 4 * s); c.lineTo(x, y + 40 * s); c.lineTo(x + 26 * s, y - 4 * s); c.closePath(); c.fill(); c.fillStyle = '#9fb0de'; c.beginPath(); c.moveTo(x - 9 * s, y + 6 * s); c.lineTo(x + 9 * s, y + 6 * s); c.lineTo(x + 6 * s, y + 70 * s); c.lineTo(x, y + 82 * s); c.lineTo(x - 6 * s, y + 70 * s); c.closePath(); c.fill(); c.restore();
}
function brain(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-10, 70); c.bezierCurveTo(-90, 80, -130, 20, -110, -20); c.bezierCurveTo(-140, -60, -90, -110, -50, -95); c.bezierCurveTo(-30, -130, 30, -130, 45, -100); c.bezierCurveTo(95, -115, 135, -60, 112, -20); c.bezierCurveTo(135, 25, 95, 75, 30, 70); c.lineTo(20, 105); c.lineTo(-5, 105); c.closePath(); c.stroke();
  c.beginPath(); c.moveTo(0, -105); c.bezierCurveTo(-20, -60, 20, -30, -5, 10); c.stroke(); c.beginPath(); c.moveTo(-70, -40); c.quadraticCurveTo(-40, -10, -60, 20); c.stroke(); c.beginPath(); c.moveTo(70, -45); c.quadraticCurveTo(45, -15, 70, 25); c.stroke(); c.restore(); }

const scenes = [];
const sc = (t0, f) => scenes.push([t0, f]);
// A: easily sell more: a few dots in a selection frame become coins; the cursor drags the corner and the grid of coins grows
sc(0, (c, t) => { const n = t < T(1) ? 2 : t < T(3) ? 3 : 5, grow = ease3(seg(t, T(3) - .1, T(4) + .2)), sz = lerp(210, 520, t < T(3) ? (t < T(1) ? 0 : .25) : .25 + .75 * grow), x0 = 540 - sz / 2, y0 = 955 - sz / 2;
  c.save(); c.setLineDash([10, 10]); neon(c, () => c.strokeRect(x0, y0, sz, sz), { w: 3, glow: 10 }); c.restore();
  neon(c, () => [[x0, y0], [x0 + sz, y0], [x0, y0 + sz], [x0 + sz, y0 + sz]].forEach(([x, y]) => c.fillRect(x - 9, y - 9, 18, 18)), { glow: 14 });
  const step = sz / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = x0 + step * (i + .5), y = y0 + step * (j + .5), r = step * .34; if (t < T(1)) glowDot(c, x, y, r * .45, 1); else coin(c, x, y, r, Math.min(1, E(t, (n === 3 ? T(1) : T(3)) + (i + j) * .03, .3, .4)), t > T(4) ? 1 : .5); }
  const cu = t < T(3) - .3 ? 0 : 1; const cx = x0 + sz + 10, cy = y0 + sz + 10; c.save(); c.globalAlpha = ss(seg(t, T(2), T(3) - .2)) * (1 - ss(seg(t, T(4) + .6, T(4) + 1))); c.fillStyle = WHITE; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy + 52); c.lineTo(cx + 13, cy + 40); c.lineTo(cx + 23, cy + 62); c.lineTo(cx + 31, cy + 58); c.lineTo(cx + 21, cy + 37); c.lineTo(cx + 38, cy + 37); c.closePath(); c.fill(); c.restore(); });
// B: an instant connection, a neuromarketing technique: three customers (cogs with people) inside a turning ring; then they fold into two slivers and the word TÜKRÖZÉS assembles, mirrored into place
sc(3.3, (c, t) => { const fold = ss(seg(t, T(11) - .2, T(12) + .2)), rot = (t - 3.3) * .5;
  if (fold < 1) { neon(c, () => { c.beginPath(); c.arc(540, 955, 300, rot, rot + 4.6); c.stroke(); c.beginPath(); c.arc(540, 955, 330, -rot * 1.3 + 2, -rot * 1.3 + 3.2); c.stroke(); }, { w: 4, alpha: (1 - fold) * ss(seg(t, 3.35, 3.8)) });
    [[540, 820, T(6)], [420, 1030, T(7)], [660, 1030, T(9)]].forEach(([x, y, at], k) => { const s = Math.min(1.1, E(t, at - .1, .35, .4)) * (1 - fold); if (s > 0) neon(c, () => gearPerson(c, lerp(x, 540, fold), lerp(y, 955, fold), 74 * s, rot * (k % 2 ? -1 : 1)), { w: 3.5 }); }); }
  const sl = ss(seg(t, T(11), T(12))) * (1 - ss(seg(t, T(13) - .1, T(13) + .2))); if (sl > 0) neon(c, () => { for (const d of [-1, 1]) { const x = 540 + d * lerp(10, 140, sl); c.beginPath(); c.ellipse(x, 955, 8, 46, d * .3, 0, 7); c.fill(); } }, { alpha: sl });
  if (t > T(13) - .1) { const word = 'TÜKRÖZÉS'; let x = 540 - 300; [...word].forEach((ch, k) => { const u = ease3(seg(t, T(13) - .05 + k * .05, T(13) + .3 + k * .05)); c.save(); c.translate(x + k * 86 + 43, 955); c.scale(lerp(-1, 1, u), 1); txt(c, ch, 0, 0, 92, { alpha: Math.min(1, u * 2), glow: 26 }); c.restore(); }); } });
// C: mirroring means giving back their tone, style and vibe: a glossy sphere on a mirror floor; a card above it changes: a sound wave, a figure, a star; everything reflected below
sc(T(14) - .25, (c, t) => { const cards = [['tone', T(22)], ['style', T(23)], ['vibe', T(25)]]; let idx = -1; cards.forEach(([, at], k) => { if (t >= at - .25) idx = k; });
  const draw = (mirror) => { c.save(); if (mirror) { c.translate(0, 2 * 1130); c.scale(1, -1); c.globalAlpha = .22; c.filter = 'blur(3px)'; }
    if (idx >= 0) { const [kind, at] = cards[idx], u = ease3(seg(t, at - .25, at + .15)), x = lerp(760, 540, u); neon(c, () => cardIcon(c, kind, x, 820, 1), { w: 4, alpha: Math.min(1, u * 1.5) });
      if (idx > 0) { const [pk] = cards[idx - 1]; neon(c, () => cardIcon(c, pk, lerp(540, 300, u), 820, 1), { w: 4, alpha: 1 - u }); } }
    const sy = 1060 + 6 * Math.sin(t * 2); sphere(c, 540, sy, 70 * Math.min(1, E(t, T(14) - .2, .4, .35))); c.restore(); };
  draw(true); draw(false); neon(c, () => P(c, [[230, 1131], [850, 1131]]), { w: 1.5, alpha: .25, glow: 8 }); });
// D: if they're casual, be casual too: a dot grows into a circle and a soft ring breathes out
sc(T(26) - .2, (c, t) => { const g = Math.min(1.06, E(t, T(27) - .2, .45, .35)); glowDot(c, 540, 955, lerp(8, 70, g), 1); const r = seg(t, T(30) - .1, T(30) + 1.2); if (r > 0 && r < 1) neon(c, () => circle(c, 540, 955, 70 + r * 260), { w: 3, alpha: 1 - r }); });
// E: if they're formal, be professional: the circle sharpens into points, then becomes a person in a suit and tie
sc(T(32) - .2, (c, t) => { const spike = ss(seg(t, T(33) - .1, T(33) + .4)), suit = ss(seg(t, T(34) - .2, T(34) + .25));
  if (suit < 1) { c.save(); c.globalAlpha = 1 - suit; c.fillStyle = WHITE; c.shadowColor = 'rgba(200,215,255,1)'; c.shadowBlur = 30; c.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + t * .4, rr = k % 2 ? 70 : 70 + 26 * spike; c.lineTo(540 + Math.cos(a) * rr, 955 + Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore(); }
  if (suit > 0) bust(c, 540, 975, .9 + .1 * suit, suit); });
// F: mirroring their lifestyle, thoughts and interests: squares turn and zoom around a glowing core; it splits into three; trust grows: the core swells and shines
sc(T(38) - .2, (c, t) => { const sq = ss(seg(t, T(38), T(39) + .3)) * (1 - ss(seg(t, T(46) - .4, T(46)))), split = ease3(seg(t, T(46) - .2, T(46) + .4)), grow = ease3(seg(t, T(47), T(50) + .4));
  if (sq > 0) neon(c, () => { for (let k = 0; k < 4; k++) { const z = ((t - T(38)) * .35 + k / 4) % 1, s = 90 + z * 520, a = (t - T(38)) * (.25 + k * .05) + k * .4; c.save(); c.translate(540, 955); c.rotate(a); c.globalAlpha = sq * (1 - z) ; c.strokeRect(-s / 2, -s / 2, s, s); c.restore(); } }, { w: 4 });
  const cr = lerp(48, 48 + 70 * grow, 1); glowDot(c, 540, 955, cr, 1);
  if (split > 0) neon(c, () => { for (const d of [-1, 1]) circle(c, 540 + d * lerp(0, 230, split), 955 + d * 40 * (1 - split), 46); }, { w: 4, alpha: Math.min(1, split * 1.5) });
  if (grow > .6) neon(c, () => circle(c, 540, 955, cr + 30 + 10 * Math.sin(t * 4)), { w: 2, alpha: (grow - .6) * 2.5 * .6 }); });
// G: why does it work? simple psychology: the core darkens on one side and becomes a brain; dotted waves run above and below; sparks light up inside
sc(T(51) - .2, (c, t) => { const b = ss(seg(t, T(52), T(53) + .2)), waves = ss(seg(t, T(53), T(54) + .4));
  if (b < 1) { c.save(); c.globalAlpha = 1 - b; glowDot(c, 540, 955, 118, 1); c.fillStyle = MID; c.beginPath(); c.arc(560, 955, 100, -Math.PI / 2, Math.PI / 2); c.fill(); c.restore(); }
  if (b > 0) neon(c, () => brain(c, 540, 955, 1.6), { w: 4.5, alpha: b });
  if (waves > 0) { c.save(); c.setLineDash([3, 14]); neon(c, () => { for (const [y0, ph] of [[640, 0], [1280, 2]]) { c.beginPath(); for (let k = 0; k <= 80 * waves; k++) { const x = -20 + k / 80 * 1120, y = y0 + Math.sin(k / 80 * Math.PI * 2 + ph + t * .8) * 70; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }, { w: 4, alpha: .9 }); c.restore(); }
  [[490, 900, T(54)], [600, 920, T(55) - .3], [545, 1010, T(55)]].forEach(([x, y, at]) => { const k = E(t, at, .3, .5); if (k > 0) glowDot(c, x, y, 11 * Math.min(1.2, k), 1); }); });
// H: people are drawn to what feels familiar: the brain shatters; the screen turns pale; two circles drift and pull together, then merge; a dark oval closes it
sc(T(56) - .15, (c, t) => { const t0 = T(56) - .15, shat = seg(t, t0, t0 + .9), pale = ss(seg(t, t0 + .3, t0 + .7)) * (1 - ss(seg(t, T(64) + .1, T(64) + .55)));
  if (pale > 0) { c.save(); c.globalAlpha = pale; c.fillStyle = '#b8c1da'; c.fillRect(-200, -200, 1480, 2400); c.restore(); }
  if (shat < 1) for (let k = 0; k < 26; k++) { const a = hash(k) * Math.PI * 2, d = ease3(shat) * (200 + hash(k + 9) * 500), x = 540 + Math.cos(a) * d, y = 955 + Math.sin(a) * d; c.save(); c.translate(x, y); c.rotate(shat * 6 * (hash(k + 3) - .5)); c.globalAlpha = 1 - shat; c.fillStyle = pale > .5 ? '#6b7596' : WHITE; c.beginPath(); c.moveTo(0, -14); c.lineTo(12, 8); c.lineTo(-10, 10); c.closePath(); c.fill(); c.restore(); }
  const pull = ease3(seg(t, T(60) - .3, T(63) + .2)), merge = ss(seg(t, T(63), T(64))); if (pale > .3) { c.save(); c.globalAlpha = pale; for (const [x0, y0, r, col] of [[300, 1100, 70, '#9aa3bd'], [800, 820, 110, '#aab2c8']]) { const x = lerp(x0, 540 + (x0 < 540 ? -40 : 40) * (1 - merge), pull), y = lerp(y0, 955, pull); c.fillStyle = col; c.beginPath(); c.arc(x, y, lerp(r, 95, merge), 0, 7); c.fill(); } c.restore(); }
  const ov = ss(seg(t, T(64) + .05, T(64) + .55)); if (ov > 0) { c.save(); c.fillStyle = MID; c.beginPath(); c.ellipse(540, 955, 80 + ov * 900, 120 + ov * 1400, 0, 0, 7); c.fill(); c.restore(); } });
// I: subtly mirror your audience and they feel understood: three faces flick between moods; then they mirror each other; on "understood" all three smile
sc(T(65) - .2, (c, t) => { const all = ss(seg(t, T(73) - .1, T(73) + .3)), k = E(t, T(65) - .1, .4, .35);
  [390, 540, 690].forEach((x, i) => { const flick = Math.sign(Math.sin(t * 3.1 + i * 2.2)) * (t < T(67) ? 1 : .6), m = lerp(i === 1 ? 1 : flick, 1, all); neon(c, () => face(c, x, 955, 60 * Math.min(1.1, k), m), { w: 3.5, glow: 12 + 18 * all }); }); });
// J: use it and watch: one by one the faces turn into coins
sc(T(75) - .2, (c, t) => { [[390, T(76)], [540, T(77)], [690, T(78)]].forEach(([x, at]) => { const u = ss(seg(t, at - .1, at + .2)); if (u < 1) neon(c, () => face(c, x, 955, 60, 1), { w: 3.5, alpha: 1 - u }); if (u > 0) { glowDot(c, x, 955, 60 * Math.min(1, E(t, at - .1, .3, .5)), u * .9); c.save(); c.globalAlpha = u; c.fillStyle = MID; c.font = '800 70px "Inter"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', x, 958); c.restore(); } }); });

start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 }, continuous: [4, 5, 6] });
