// M14 Segíts nekik nyerni (helping them win): a 23 Team neon motion reel after reference video 14, beat by beat on the Hungarian voice.
// This reference's own caption style: small uppercase monospace, typed in.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 28.0, DUR = 30.5, X = 540, Y = 955;
function head(c, x, y, s, a = 1) { c.save(); c.globalAlpha *= a; const g = c.createLinearGradient(x, y - 200 * s, x, y + 220 * s); g.addColorStop(0, 'rgba(200,210,235,.75)'); g.addColorStop(1, 'rgba(200,210,235,0)'); c.fillStyle = g; c.beginPath();
  c.moveTo(x + 110 * s, y + 220 * s); c.bezierCurveTo(x + 150 * s, y + 80 * s, x + 170 * s, y - 40 * s, x + 130 * s, y - 120 * s); c.bezierCurveTo(x + 90 * s, y - 200 * s, x - 60 * s, y - 220 * s, x - 120 * s, y - 130 * s); c.bezierCurveTo(x - 150 * s, y - 80 * s, x - 140 * s, y - 30 * s, x - 150 * s, y); c.lineTo(x - 180 * s, y + 50 * s); c.lineTo(x - 150 * s, y + 60 * s); c.bezierCurveTo(x - 155 * s, y + 90 * s, x - 150 * s, y + 120 * s, x - 110 * s, y + 130 * s); c.bezierCurveTo(x - 90 * s, y + 140 * s, x - 90 * s, y + 190 * s, x - 70 * s, y + 220 * s); c.closePath(); c.fill(); c.restore(); }
function megaphone(c, x, y, s) { P(c, [[x - 40 * s, y - 16 * s], [x + 20 * s, y - 44 * s], [x + 20 * s, y + 44 * s], [x - 40 * s, y + 16 * s]], true); c.strokeRect(x - 62 * s, y - 16 * s, 22 * s, 32 * s); }
function cube(c, x, y, s, lid = 0) { const a = 80 * s, b = 46 * s, h = 92 * s; const top = [[x, y - h / 2 - b], [x + a, y - h / 2], [x, y - h / 2 + b], [x - a, y - h / 2]]; P(c, [[x - a, y - h / 2], [x - a, y + h / 2], [x, y + h / 2 + b], [x + a, y + h / 2], [x + a, y - h / 2]]); P(c, [[x, y - h / 2 + b], [x, y + h / 2 + b]]);
  P(c, [top[3], top[2], top[1]]); if (lid <= 0) P(c, [top[3], top[0], top[1]]); else { c.save(); c.translate(x + 120 * s * lid, y - h / 2 - 130 * s * lid); c.rotate(lid * .9); P(c, top.map(([px, py]) => [px - x, py - (y - h / 2)]), true); c.restore(); } }
function piece(c, x, y, r, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); c.moveTo(-r, -r); c.lineTo(-r * .3, -r); c.arc(0, -r, r * .3, Math.PI, 0); c.lineTo(r, -r); c.lineTo(r, -r * .3); c.arc(r, 0, r * .3, -Math.PI / 2, Math.PI / 2); c.lineTo(r, r); c.lineTo(-r, r); c.closePath(); c.stroke(); c.restore(); }
function bulbOutline(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-26, 50); c.quadraticCurveTo(-26, 20, -50, -5); c.arc(0, -25, 56, Math.PI * .87, Math.PI * 2.13); c.quadraticCurveTo(26, 20, 26, 50); c.closePath(); c.stroke(); P(c, [[-22, 64], [22, 64]]); P(c, [[-16, 78], [16, 78]]); P(c, [[0, -80], [0, 40]]); P(c, [[-50, -20], [50, -20]]); c.restore(); }
function arrow(c, x, y, ang, len) { const dx = Math.cos(ang), dy = Math.sin(ang); P(c, [[x - dx * len, y - dy * len], [x, y]]); P(c, [[x, y], [x - dx * 20 - dy * 12, y - dy * 20 + dx * 12]]); P(c, [[x, y], [x - dx * 20 + dy * 12, y - dy * 20 - dx * 12]]); P(c, [[x - dx * len, y - dy * len], [x - dx * (len - 18) - dy * 12, y - dy * (len - 18) + dx * 12]]); }
function water(c, y, t) { c.save(); const g = c.createLinearGradient(0, y, 0, y + 400); g.addColorStop(0, 'rgba(235,242,255,.85)'); g.addColorStop(1, 'rgba(235,242,255,.15)'); c.fillStyle = g; c.beginPath(); c.moveTo(-40, y + 400); for (let k = 0; k <= 30; k++) { const x = -40 + k * 40; c.lineTo(x, y + 8 * Math.sin(k * .8 + t * 2)); } c.lineTo(1120, y + 400); c.closePath(); c.fill(); c.restore(); }
function flag(c, x, y, s, t) { P(c, [[x, y], [x, y - 120 * s]]); c.beginPath(); c.moveTo(x, y - 120 * s); c.quadraticCurveTo(x + 40 * s, y - 120 * s + 6 * Math.sin(t * 5), x + 80 * s, y - 100 * s); c.lineTo(x, y - 80 * s); c.closePath(); c.fill(); }
const scenes = []; const sc = (t0, f) => scenes.push([t0, f]);
// A: this is why you don't get marketing: a head; a thread of smoke rises; a beam from the head with a megaphone and little icons
sc(0, (c, t) => { const h = ss(seg(t, 0, .6)), sm = seg(t, .3, 1.2), beam = ss(seg(t, T(4) - .2, T(4) + .4));
  head(c, X, Y + 120, 1.6, h); if (sm > 0 && beam < 1) neon(c, () => { c.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20 * sm; c.lineTo(X + 20 + 18 * Math.sin(u * 9 + t * 3), Y - 230 - u * 200); } c.stroke(); }, { w: 3, alpha: 1 - beam });
  if (beam > 0) { c.save(); c.globalAlpha = .45 * beam; const g = c.createLinearGradient(0, Y - 200, 0, Y - 560); g.addColorStop(0, 'rgba(235,242,255,.0)'); g.addColorStop(1, 'rgba(235,242,255,.6)'); c.fillStyle = g; c.beginPath(); c.moveTo(X - 60, Y - 200); c.lineTo(X + 100, Y - 200); c.lineTo(X + 300, Y - 560); c.lineTo(X - 260, Y - 560); c.closePath(); c.fill(); c.restore(); neon(c, () => megaphone(c, X, Y - 380, 1.3 * beam), { w: 4 }); for (let k = 0; k < 3; k++) { const a = E(t, T(4) + .2 + k * .15, .3, .5); if (a > 0) neon(c, () => { c.beginPath(); c.roundRect(X + 90 + k * 50 - 18 * a, Y - 470 + k * 40 - 18 * a, 36 * a, 36 * a, 8); c.stroke(); }, { w: 3 }); } } });
// B: it isn't about your business: axes; bars rise one by one; a ring lands on the tallest
sc(T(5) - .2, (c, t) => { const ax = E(t, T(5), .4, .45), rg = E(t, T(8) - .1, .35, .5);
  neon(c, () => P(c, [[X - 230, Y - 240 * Math.min(1, ax)], [X - 230, Y + 200], [X - 230 + 480 * Math.min(1, ax), Y + 200]]), { w: 5 });
  for (let k = 0; k < 7; k++) { const u = ease3(seg(t, T(7) - .3 + k * .12, T(7) + .1 + k * .12)), h = (50 + k * 50) * u; if (u <= 0) continue; c.save(); const g = c.createLinearGradient(0, Y + 200 - h, 0, Y + 200); g.addColorStop(0, 'rgba(235,242,255,.85)'); g.addColorStop(1, 'rgba(235,242,255,.1)'); c.fillStyle = g; c.fillRect(X - 200 + k * 62, Y + 200 - h, 40, h); c.restore(); }
  if (rg > 0) neon(c, () => circle(c, X + 192, Y - 200, 40 * Math.min(1.08, rg)), { w: 4, glow: 30 }); });
// C: not about your product: a cube; its lid pops off; light inside; a puzzle piece flies out
sc(T(9) - .2, (c, t) => { const a = E(t, T(9) - .1, .45, .35), lid = ease3(seg(t, T(11) - .1, T(11) + .4)), pc = ease3(seg(t, T(11) + .3, T(12)));
  if (lid > 0) glowDot(c, X, Y - 100, 30 * lid, lid); neon(c, () => cube(c, X, Y + 40, 2.0 * Math.min(1.05, a), lid), { w: 4.5 });
  if (pc > 0) neon(c, () => piece(c, lerp(X, X - 230, pc), lerp(Y - 60, Y + 100, pc) - 120 * Math.sin(pc * Math.PI), 34, pc * 3), { w: 4 }); });
// D: and not about your solution: puzzle pieces fly together into a bulb; it lights; it shrinks away
sc(T(12) - .2, (c, t) => { const j = ease3(seg(t, T(12), T(16) + .2)), lit = ss(seg(t, T(16), T(16) + .4)), away = ss(seg(t, T(17) - .4, T(17)));
  const P0 = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; P0.forEach(([dx, dy], k) => { const x = X + dx * lerp(170, 34, j) - (1 - j) * 60 * dy, y = Y - 60 + dy * lerp(150, 34, j); neon(c, () => piece(c, x, y, 34 * (1 - away * .5), (1 - j) * (k + 1) * .8), { w: 4, alpha: 1 - lit * .4 }); });
  if (j > .9) { if (lit > 0) { glowDot(c, X, Y - 60, 70 * lit * (1 - away * .5), .5 * lit); c.save(); c.globalAlpha = .3 * lit; const g = c.createRadialGradient(X, Y - 60, 0, X, Y - 60, 360); g.addColorStop(0, 'rgba(235,242,255,.8)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.fillRect(X - 400, Y - 460, 800, 800); c.restore(); } neon(c, () => bulbOutline(c, X, Y - 30, 1.9 * (1 - away * .5)), { w: 4.5, glow: 30 + 20 * lit }); } });
// E: the market itself doesn't care who you are: a bright target; arrows fly at it and miss, one after another
sc(T(17) - .2, (c, t) => { const a = E(t, T(17), .45, .4);
  neon(c, () => { for (let k = 0; k < 5; k++) circle(c, X, Y, (170 - k * 32) * Math.min(1.05, a)); }, { w: 7, glow: 36 });
  [[T(19), Math.PI, -40, 1], [T(21), 0, 60, -1], [T(23), Math.PI * .7, 140, 1]].forEach(([at, ang, off, d]) => { const u = seg(t, at - .2, at + .5); if (u <= 0 || u >= 1) return; const x = lerp(X - Math.cos(ang) * 700, X + Math.cos(ang) * 700, u), y = Y + off + lerp(-Math.sin(ang) * 300, Math.sin(ang) * 300, u) * d; neon(c, () => arrow(c, x, y, ang + (ang > 3 ? 0 : 0), 120), { w: 4 }); }); });
// F: you only matter if your audience sees you help them get somewhere: a cliff with a pulley; a ball rolls along the top and hauls a hanging ring up out of the water
sc(T(25) - .2, (c, t) => { const pull = ease3(seg(t, T(35) - .2, T(38) + .3)), py = Y - 140, px = X - 250;
  water(c, Y + 260, t);
  neon(c, () => { c.beginPath(); c.moveTo(px - 10, py); c.bezierCurveTo(px - 30, Y + 60, px + 40, Y + 120, px + 30, Y + 270); c.stroke(); P(c, [[px - 10, py], [X + 400, py]]); circle(c, px, py - 40, 22); P(c, [[px - 12, py - 20], [px - 12, py]]); P(c, [[px + 12, py - 20], [px + 12, py]]); }, { w: 4 });
  const bx = lerp(X + 60, X + 340, pull), ringY = lerp(Y + 250, py - 40, pull); glowDot(c, bx, py - 18, 18, 1);
  neon(c, () => { P(c, [[px + 22, py - 40], [bx, py - 18]]); P(c, [[px - 22, py - 40], [px - 22, ringY - 18]]); circle(c, px - 22, ringY, 18); }, { w: 3 }); });
// G: marketing shows people how you help them get what they want; let them see and feel it, and you start to matter: a slope up to a flag; a glowing ball pushes a ring up; both reach the flag and glow
sc(T(39) - .2, (c, t) => { const up = ease3(seg(t, T(43) - .2, T(49) + .3)), zoom = ease3(seg(t, T(52), T(56))), win = ss(seg(t, T(58) - .2, T(58) + .4));
  c.save(); c.translate(lerp(0, -120, zoom), lerp(0, 160, zoom)); const z = lerp(1, 1.35, zoom); c.translate(X + 200, Y - 120); c.scale(z, z); c.translate(-(X + 200), -(Y - 120));
  const A = [X - 420, Y + 200], B = [X - 140, Y + 200], C = [X + 160, Y - 120], D = [X + 480, Y - 120];
  neon(c, () => P(c, [A, B, C, D]), { w: 5, glow: 30 }); c.save(); c.fillStyle = WHITE; c.strokeStyle = WHITE; c.lineWidth = 4; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 20; flag(c, X + 330, Y - 120, 1.1, t); c.restore();
  const path = u => u < .3 ? [lerp(A[0] + 60, B[0], u / .3), B[1]] : u < .85 ? [lerp(B[0], C[0], (u - .3) / .55), lerp(B[1], C[1], (u - .3) / .55)] : [lerp(C[0], X + 280, (u - .85) / .15), C[1]];
  const [rx, ry] = path(up), [bx, by] = path(Math.max(0, up - .08)); const ang = Math.atan2(C[1] - B[1], C[0] - B[0]), on = up > .3 && up < .85;
  const off = (yy, r) => [0, -r]; neon(c, () => circle(c, rx + (on ? Math.sin(ang) * 26 : 0), ry - (on ? Math.cos(ang) * 26 : 26), 26), { w: 4, glow: 20 + 30 * win });
  glowDot(c, bx + (on ? Math.sin(ang) * 26 : 0) - 20, by - (on ? Math.cos(ang) * 26 : 26), 24, 1);
  if (win > 0) { c.save(); c.globalAlpha = .4 * win; const g = c.createRadialGradient(X + 300, Y - 160, 0, X + 300, Y - 160, 360); g.addColorStop(0, 'rgba(235,242,255,.8)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.fillRect(X - 100, Y - 560, 800, 800); c.restore(); }
  c.restore(); });
start({ scenes, words: WORDS.map(([w, a, b]) => [w.toUpperCase(), a, b]), story: STORY, dur: DUR, caption: { font: '500 30px "JBMono"', mode: 'type', y: 470 } });
