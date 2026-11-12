// M09 Identitás (identity): a 23 Team neon motion reel after reference video 9, beat by beat on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 37.4, DUR = 39.9, X = 540, Y = 955;
function apple(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, -46); c.bezierCurveTo(-20, -62, -78, -60, -80, -6); c.bezierCurveTo(-82, 46, -44, 84, -22, 84); c.bezierCurveTo(-10, 84, -8, 78, 0, 78); c.bezierCurveTo(8, 78, 10, 84, 22, 84); c.bezierCurveTo(44, 84, 82, 46, 80, -6); c.bezierCurveTo(78, -60, 20, -62, 0, -46); c.stroke(); P(c, [[0, -46], [4, -70]]); c.beginPath(); c.moveTo(6, -66); c.quadraticCurveTo(22, -96, 46, -92); c.quadraticCurveTo(36, -66, 6, -66); c.stroke(); c.restore(); }
function gear(c, x, y, r, rot) { c.beginPath(); for (let k = 0; k <= 48; k++) { const a = k / 48 * Math.PI * 2 + rot, rr = (Math.floor(k / 3) % 2) ? r : r * 1.2; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.stroke(); circle(c, x, y, r * .45); }
function person(c, x, y, s) { circle(c, x, y - 22 * s, 22 * s); c.beginPath(); c.arc(x, y + 44 * s, 40 * s, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }
function face(c, x, y, r, happy) { circle(c, x, y, r); circle(c, x - r * .33, y - r * .2, r * .07, true); circle(c, x + r * .33, y - r * .2, r * .07, true); c.beginPath(); if (happy > 0) c.arc(x, y + r * .05, r * .42, .3, Math.PI - .3); else c.arc(x, y + r * .62, r * .38, Math.PI + .5, Math.PI * 2 - .5); c.stroke(); }
function phone(c, x, y, s) { c.beginPath(); c.roundRect(x - 50 * s, y - 95 * s, 100 * s, 190 * s, 18 * s); c.stroke(); P(c, [[x - 14 * s, y - 80 * s], [x + 14 * s, y - 80 * s]]); }
function globe(c, x, y, r, rot) { circle(c, x, y, r); for (let k = -2; k <= 2; k++) { const yy = y + k * r * .38, w = Math.sqrt(1 - Math.pow(k * .38, 2)) * r; c.beginPath(); c.ellipse(x, yy, w, w * .12, 0, 0, 7); c.stroke(); } for (let k = 0; k < 4; k++) { const w = Math.cos(((rot + k / 4) % 1) * Math.PI) * r; c.beginPath(); c.ellipse(x, y, Math.abs(w), r, 0, 0, 7); c.stroke(); } }
function key(c, x, y, s) { circle(c, x - 90 * s, y, 26 * s); P(c, [[x - 64 * s, y], [x + 80 * s, y]]); P(c, [[x + 40 * s, y], [x + 40 * s, y + 26 * s]]); P(c, [[x + 66 * s, y], [x + 66 * s, y + 20 * s]]); }
function iso(x, y, z, s) { return [X + (x - z) * 86 * s, Y + (x + z) * 50 * s - y * 100 * s]; }
const scenes = []; const sc = (t0, f) => scenes.push([t0, f]);
// A: this is the psychology behind Apple's genius marketing: a cluster of sparks spreads into a constellation; an apple draws in light; a gleam crosses it
sc(0, (c, t) => { const con = ease3(seg(t, .2, T(2) + .6)), ap = seg(t, T(4) - .1, T(5) + .3), gl = seg(t, T(5), T(6) + .4), N = 9;
  const pts = Array.from({ length: N }, (_, k) => [X + Math.cos(k * 2.4) * (60 + hash(k) * 200) * con, Y + Math.sin(k * 2.4) * (60 + hash(k + 3) * 200) * con]);
  if (ap < .5) { neon(c, () => { for (let k = 1; k < N; k++) P(c, [pts[k - 1], pts[k]]); }, { w: 2.5, alpha: (1 - ap * 2) * con }); pts.forEach(([x, y]) => glowDot(c, x, y, 7, 1 - ap * 2)); }
  if (ap > 0) { c.save(); c.setLineDash([1400 * ease3(ap), 1400]); neon(c, () => apple(c, X, Y, 1.9), { w: 4.5, glow: 26 }); c.restore(); }
  if (gl > 0 && gl < 1) { c.save(); c.globalAlpha = Math.sin(gl * Math.PI); const g = c.createRadialGradient(X - 140 + 280 * gl, Y, 0, X - 140 + 280 * gl, Y, 160); g.addColorStop(0, 'rgba(235,242,255,.9)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.fillRect(X - 340, Y - 220, 680, 440); c.restore(); } });
// B: Apple doesn't just sell technology: the apple grows big; then a gear with circuit lines branching out
sc(T(8) - .2, (c, t) => { const big = E(t, T(9) - .1, .45, .35), g = ss(seg(t, T(12) - .2, T(12) + .2)), tr = seg(t, T(12), T(13) + .6);
  if (g < 1) neon(c, () => apple(c, X, Y, 2.6 * Math.min(1.05, big)), { w: 5, alpha: 1 - g });
  if (g > 0) { neon(c, () => gear(c, X, Y, 90 * g, t * .5), { w: 5, alpha: g }); if (tr > 0) neon(c, () => { [[1, -1], [1, 1], [-1, 1]].forEach(([dx, dy], k) => { const u = clamp(tr * 1.4 - k * .2); if (u <= 0) return; const p = [[X + dx * 110, Y + dy * 30], [X + dx * 170, Y + dy * 30], [X + dx * 210, Y + dy * 120], [X + dx * 260, Y + dy * 120]]; const n = Math.max(2, Math.ceil(u * 4)); P(c, p.slice(0, n)); if (u >= 1) circle(c, p[3][0] + dx * 12, p[3][1], 10); }); P(c, [[X, Y - 110], [X, Y - lerp(110, 220, ease3(tr))]]); }, { w: 3.5 }); } });
// C: it sells identity: a person in a ring; a notched outer ring turns
sc(T(14) - .2, (c, t) => { const a = E(t, T(14) - .1, .45, .4), rg = ss(seg(t, T(14) + .2, T(15)));
  neon(c, () => { person(c, X, Y, 2.2 * Math.min(1.05, a)); circle(c, X, Y, 150 * Math.min(1.05, a)); }, { w: 5, glow: 30 });
  if (rg > 0) neon(c, () => { for (let k = 0; k < 24; k++) { const ang = k / 24 * Math.PI * 2 + t * .4; P(c, [[X + Math.cos(ang) * 180, Y + Math.sin(ang) * 180], [X + Math.cos(ang) * (180 + (k % 2 ? 10 : 22) * rg), Y + Math.sin(ang) * (180 + (k % 2 ? 10 : 22) * rg)]]); } c.beginPath(); c.arc(X, Y, 180, 0, Math.PI * 2 * rg); c.stroke(); }, { w: 3.5 }); });
// D: their ads don't show twenty features, but how it feels to belong to something bigger, creative, clean and bold: a list; it folds into a 3D grid cube; a star of dots; a ring of dots; a burst
sc(T(16) - .2, (c, t) => { const lst = seg(t, T(17), T(20) + .3), fold = ease3(seg(t, T(22) - .1, T(24) + .4)), grid = ss(seg(t, T(27) - .2, T(29) + .2)), starK = ss(seg(t, T(31) - .2, T(31) + .2)), ring = ss(seg(t, T(32) - .2, T(32) + .2)), burst = seg(t, T(34) - .1, T(34) + 1.2);
  if (starK < 1) { c.save(); c.globalAlpha = 1 - starK; neon(c, () => { if (fold < 1) { for (let k = 0; k < 8; k++) { const w = 300 * clamp(lst * 1.5 - k * .1); if (w <= 0) continue; const y = Y - 170 + k * 48; const a = [X - 150, y], b = [X - 150 + w, y]; const fa = iso(-1, 1 - k / 7 * 2, -1, 1.4), fb = iso(1, 1 - k / 7 * 2, -1, 1.4); P(c, [[lerp(a[0], fa[0], fold), lerp(a[1], fa[1], fold)], [lerp(b[0], fb[0], fold), lerp(b[1], fb[1], fold)]]); } }
      if (fold > 0) { const s = 1.4, n = 3 + Math.round(grid * 3); const L = (p, q) => P(c, [iso(...p, s), iso(...q, s)]);
        for (let i = 0; i <= n; i++) { const u = -1 + 2 * i / n; c.globalAlpha = (i === 0 || i === n ? 1 : .55 * fold) * (1 - starK); L([u, -1, -1], [u, 1, -1]); L([-1, u, -1], [1, u, -1]); L([u, 1, -1], [u, 1, 1]); L([-1, 1, u], [1, 1, u]); L([1, u, -1], [1, u, 1]); L([1, -1, u], [1, 1, u]); } } }, { w: 3 }); c.restore(); }
  if (starK > 0 && ring < 1) { const pts = Array.from({ length: 5 }, (_, k) => [X + Math.cos(-Math.PI / 2 + k * Math.PI * 4 / 5) * 190 * starK, Y + Math.sin(-Math.PI / 2 + k * Math.PI * 4 / 5) * 190 * starK]); neon(c, () => P(c, pts, true), { w: 3, alpha: 1 - ring }); pts.forEach(([x, y]) => glowDot(c, x, y, 10, 1 - ring)); }
  if (ring > 0 && burst < .3) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + t * .3; glowDot(c, X + Math.cos(a) * 190, Y + Math.sin(a) * 190, 8, ring * (1 - burst * 3.3)); }
  if (burst > 0 && burst < 1) for (let k = 0; k < 160; k++) { const a = hash(k) * Math.PI * 2, d = ease3(burst) * (60 + hash(k + 9) * 520); glowDot(c, X + Math.cos(a) * d, Y + Math.sin(a) * d, 2 + hash(k + 3) * 3, (1 - burst) * .9); } });
// E: that's emotional branding, and why people queue for a phone they already own: three faces; they line up one behind the other; a phone
sc(T(35) - .2, (c, t) => { const q = ease3(seg(t, T(41) - .2, T(42) + .5)), ph = E(t, T(46) - .1, .4, .45), big = ss(seg(t, T(49) - .2, T(49) + .4));
  const F0 = [[X - 180, Y - 120, 1], [X + 160, Y - 100, 1], [X - 20, Y + 150, -1]];
  F0.forEach(([x, y, h], k) => { const a = E(t, T(35) + k * .15, .4, .45); if (a <= 0) return; const tx = X - 160 + k * 26, ty = Y - 60 + k * 70; neon(c, () => face(c, lerp(x, tx, q), lerp(y, ty, q), 60 * Math.min(1.05, a), h), { w: 4 }); });
  if (ph > 0) neon(c, () => phone(c, X + 200, Y + 40, lerp(.6, 1.3, big) * Math.min(1.05, ph)), { w: 4.5, glow: 26 }); });
// F: they don't buy the product, but the feeling and meaning it stands for: the phone; a ring closes round it; it fades into a dot under a beam of light; the dot lifts
sc(T(51) - .2, (c, t) => { const rg = seg(t, T(53) - .2, T(55) + .2), out = ss(seg(t, T(56) - .2, T(56) + .3)), beam = ss(seg(t, T(57), T(58) + .3)), lift = ease3(seg(t, T(61) - .1, T(61) + .6));
  if (out < 1) neon(c, () => { phone(c, X, Y, 1.3 * (1 - out)); c.beginPath(); c.arc(X, Y, 190, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease3(rg)); c.stroke(); }, { w: 4.5, glow: 26 + 14 * rg });
  if (beam > 0) { c.save(); c.globalAlpha = beam; const g = c.createLinearGradient(0, Y - 380, 0, Y + 120); g.addColorStop(0, 'rgba(235,242,255,0)'); g.addColorStop(1, 'rgba(235,242,255,.45)'); c.fillStyle = g; c.beginPath(); c.moveTo(X - 40, Y - 380); c.lineTo(X + 40, Y - 380); c.lineTo(X + 150, Y + 120); c.lineTo(X - 150, Y + 120); c.closePath(); c.fill(); c.restore(); neon(c, () => { c.beginPath(); c.ellipse(X, Y + 120, 150, 36, 0, 0, 7); c.stroke(); }, { w: 5, alpha: beam }); }
  if (out > 0) glowDot(c, X, lerp(Y + 100, Y - 140, lift), 22, out); });
// G: and that's what good marketing does: a dot; a glowing globe in a bright halo
sc(T(64) - .2, (c, t) => { const g = E(t, T(69) - .2, .45, .4), halo = ss(seg(t, T(69), T(69) + .6));
  if (g < .2) glowDot(c, X, Y, 22, 1 - g * 5);
  if (halo > 0) { c.save(); c.globalAlpha = halo; const gr = c.createRadialGradient(X, Y, 160, X, Y, 460); gr.addColorStop(0, 'rgba(230,238,255,.75)'); gr.addColorStop(1, 'rgba(230,238,255,0)'); c.fillStyle = gr; c.fillRect(X - 460, Y - 460, 920, 920); c.fillStyle = MID; c.beginPath(); c.arc(X, Y, 200, 0, 7); c.fill(); c.restore(); neon(c, () => circle(c, X, Y, 380), { w: 2, alpha: halo * .6 }); }
  if (g > 0) neon(c, () => globe(c, X, Y, 150 * Math.min(1.05, g), t * .12), { w: 4.5 }); });
// H: it makes your offer feel like the missing piece of your customer's identity: a ring; a key; a lit keyhole appears; the key slides in and the light floods
sc(T(70) - .2, (c, t) => { const kk = ss(seg(t, T(75) - .2, T(75) + .2)), hole = ss(seg(t, T(78) - .2, T(78) + .4)), slide = ease3(seg(t, T(80), T(82) + .3)), flood = ss(seg(t, T(82) + .2, T(82) + .8));
  if (kk < 1) neon(c, () => circle(c, X, Y, 46 * (1 - kk * .5)), { w: 4, alpha: 1 - kk });
  if (hole > 0) { const hx = X + 250; c.save(); c.globalAlpha = hole * (.5 + .5 * flood); const g = c.createLinearGradient(hx, 0, hx - 520, 0); g.addColorStop(0, 'rgba(235,242,255,.6)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(hx, Y - 30); c.lineTo(hx - 520, Y - 200 - 200 * flood); c.lineTo(hx - 520, Y + 200 + 200 * flood); c.lineTo(hx, Y + 30); c.closePath(); c.fill(); c.restore();
    c.save(); c.globalAlpha = hole; c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 40; c.beginPath(); c.arc(hx, Y - 16, 26, 0, 7); c.fill(); c.beginPath(); c.moveTo(hx - 14, Y); c.lineTo(hx + 14, Y); c.lineTo(hx + 22, Y + 50); c.lineTo(hx - 22, Y + 50); c.closePath(); c.fill(); c.restore(); }
  if (kk > 0) neon(c, () => key(c, X - 120 + slide * 250, Y, 1.4 * kk), { w: 6, glow: 26, alpha: 1 - flood * .7 });
  if (flood > 0) { c.save(); c.globalAlpha = .5 * flood; const g = c.createRadialGradient(X + 250, Y, 0, X + 250, Y, 600); g.addColorStop(0, 'rgba(235,242,255,.8)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); c.restore(); } });
start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 } });
