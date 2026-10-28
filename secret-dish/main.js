// The Chef's Secret Favourite: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// A restaurant's best dish that nobody ordered, until the owner wrote four words next to it on the menu. Navy rooms, cream and wood, gold light.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT } from './story.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'ÉTLAPKacsamellGulyásleves'), document.fonts.load('74px "Caveat Brush"', 'A séf titkos kedvence Kacsamell')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#0b1438';
const NOTE = 'A séf titkos kedvence';
const GLOW = (() => { const [c, x] = mk(); c.width = c.height = 256; const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,214,120,1)'); g.addColorStop(.25, 'rgba(255,214,120,.45)'); g.addColorStop(1, 'rgba(255,214,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return c; })();

function sp(tau, d = .4, b = .2) {   // a spring like Motion's { type: 'spring', visualDuration, bounce }
  if (tau <= 0) return 0; const z = Math.max(.05, 1 - b);
  if (z >= .999) { const w = 4.7 / d; return 1 - Math.exp(-w * tau) * (1 + w * tau); }
  const wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau));
}
const E = (t, at, d = .35, b = .35) => t < at ? 0 : sp(t - at, d, b);
const blinkAt = (t, seed) => { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; };
const reach = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const Hs = s => BASE_H * s * 1.08;
const wob = (t, at, d = .5, f = 18, a = .05) => t > at && t < at + d * 3 ? a * Math.sin((t - at) * f) * Math.exp(-(t - at) / d * 2) : 0;   // a little squash after a hit

// —— small pieces ——
function bg(c, t, o = {}) {
  const g = c.createRadialGradient(540, 860, 80, 540, 960, 1400); g.addColorStop(0, o.c0 || '#26368c'); g.addColorStop(1, '#0a1034'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  if (o.rays) { c.save(); c.translate(o.rx ?? 540, o.ry ?? 900); c.rotate(t * .25); c.fillStyle = `rgba(255,214,120,${.07 * o.rays})`;
    for (let i = 0; i < 14; i++) { c.rotate(Math.PI * 2 / 14); c.beginPath(); c.moveTo(0, 0); c.lineTo(1700, -130); c.lineTo(1700, 130); c.closePath(); c.fill(); } c.restore(); }
}
function spot(c, x, y, w, a = .35) { const g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, `rgba(0,0,20,${a})`); g.addColorStop(1, 'rgba(0,0,20,0)'); c.save(); c.translate(x, y); c.scale(1, .22); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w, 0, 7); c.fill(); c.restore(); }
function glow(c, x, y, r, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(GLOW, x - r, y - r, 2 * r, 2 * r); c.restore(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
function mascot(c, P, k = 1) { if (!P.sit) spot(c, P.x, P.y + 4, Hs(P.s) * .42); scaled(c, P.x, P.y, k, () => drawMascot(c, { ...P, shadow: false })); }
function text(c, s, x, y, size, col = CREAM, font = 'Lilita One', align = 'center') { c.font = `${size}px "${font}"`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
function ell(c, x, y, rx, ry, col, rot = 0) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); c.fill(); }
function cam(c, x, y, z = 1, rot = 0, f) { c.save(); c.translate(540, 960); c.rotate(rot); c.scale(z, z); c.translate(-x, -y); f(); c.restore(); }
function blurred(c, px, f) { if (px <= .2) return f(); c.save(); c.filter = `blur(${px * K}px)`; f(); c.restore(); }
function sparkle(c, x, y, k, r = 40) { if (k <= 0 || k >= 1) return; const s = Math.sin(k * Math.PI); c.save(); c.translate(x, y); c.rotate(k * 1.5); c.fillStyle = `rgba(255,255,255,${s})`;
  c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .18 * s : r * s; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore(); glow(c, x, y, r * 2.5, .6 * s); }
function star(c, x, y, r, k = 1, col = GOLD) { scaled(c, x, y, k, () => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }); }
function speech(c, x, y, w, h, k, tailX, tailY, draw) { scaled(c, tailX, tailY, k, () => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 60); c.fill();
  c.beginPath(); c.moveTo(x - w * .12, y + h / 2 - 4); c.lineTo(tailX, tailY); c.lineTo(x + w * .08, y + h / 2 - 4); c.fill(); draw(); }); }
function qmark(c, x, y, k, size = 120, col = GOLD) { if (k <= 0) return; scaled(c, x, y, k, () => { c.save(); c.translate(x, y); c.rotate(Math.sin(k * 9) * .08 * (1 - Math.min(1, k))); text(c, '?', 0, 0, size, col); c.restore(); }); }
function qbubble(c, x, y, k, r = 58) { if (k <= 0) return; scaled(c, x, y + r, k, () => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - r * .25, y + r * .8); c.lineTo(x - r * .05, y + r * 1.35); c.lineTo(x + r * .25, y + r * .8); c.fill(); text(c, '?', x, y + r * .06, r * 1.45, GOLD2); }); }

// —— the food ——
// the secret dish, seen from the side at a slight angle: duck breast sliced and fanned, a quenelle of purée, a dark sauce, a sprig; y = the plate's centre
function heroDish(c, x, y, w, o = {}) {
  const rx = w / 2, ry = w * .17, t = o.t || 0;
  if (o.glow) glow(c, x, y - w * .12, w * .9, .55 * o.glow);
  ell(c, x + w * .02, y + ry * .4, rx * 1.02, ry * 1.05, 'rgba(0,0,20,.32)');
  ell(c, x, y + ry * .14, rx, ry, '#cfc3a6'); ell(c, x, y, rx, ry, CREAM);
  c.strokeStyle = GOLD2; c.lineWidth = w * .012; c.beginPath(); c.ellipse(x, y, rx * .92, ry * .88, 0, 0, 7); c.stroke();
  ell(c, x, y + ry * .06, rx * .66, ry * .6, '#ede3cb');
  for (let k = 0; k < 6; k++) ell(c, x - rx * .2 + k * rx * .12, y + ry * .42 - Math.sin(k / 5 * Math.PI) * ry * .14, w * .014, w * .009, '#5a2216');
  ell(c, x - rx * .3, y - ry * .12, rx * .19, ry * .42, '#f3e1b0'); ell(c, x - rx * .34, y - ry * .3, rx * .08, ry * .12, 'rgba(255,255,255,.6)');
  for (let i = 0; i < 5; i++) { const sx = x - rx * .04 + i * rx * .11, sy = y - ry * .08 - i * ry * .06, rot = -.9 + i * .1;
    ell(c, sx, sy, w * .052, w * .085, '#6b351c', rot); ell(c, sx + w * .006, sy - w * .004, w * .04, w * .07, '#b8644c', rot); ell(c, sx - w * .01, sy - w * .02, w * .012, w * .03, 'rgba(255,220,200,.35)', rot); }
  for (const [dx, dy, r, a] of [[.42, -.55, .05, -.6], [.48, -.75, .045, .3], [.37, -.8, .04, -1.1]]) ell(c, x + rx * dx, y + ry * dy, w * r, w * r * .45, '#3f7d4f', a);
  c.strokeStyle = '#2f5e3b'; c.lineWidth = w * .006; c.beginPath(); c.moveTo(x + rx * .36, y - ry * .3); c.lineTo(x + rx * .46, y - ry * .9); c.stroke();
  if (o.steam > 0) steam(c, x, y - ry * .7, w, o.steam, t);
}
function steam(c, x, y, w, a, t) { c.save(); c.lineCap = 'round'; c.lineWidth = w * .022; for (let k = 0; k < 3; k++) { const x0 = x + (k - 1) * w * .14, ph = t * 1.4 + k * 1.3, rise = (t * .35 + k * .33) % 1;
  c.strokeStyle = `rgba(246,239,220,${.42 * a * Math.sin(rise * Math.PI)})`; c.beginPath(); for (let i = 0; i <= 12; i++) { const u = i / 12, yy = y - u * w * .55 - rise * w * .1; c.lineTo(x0 + Math.sin(ph + u * 5) * w * .04, yy); } c.stroke(); } c.restore(); }
// the cloche: a silver dome over the plate; lift raises it (and tips it), the crack lets the gold light out
function cloche(c, x, y, w, lift = 0, tip = 0) {
  const rx = w * .44, h = w * .38, yy = y - lift;
  c.save(); c.translate(x, yy); c.rotate(tip); c.translate(-x, -yy);
  const g = c.createLinearGradient(x - rx, yy - h, x + rx, yy); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#dfe3ec'); g.addColorStop(1, '#8f98b0');
  c.fillStyle = g; c.beginPath(); c.ellipse(x, yy, rx, h, 0, Math.PI, 0); c.ellipse(x, yy, rx, rx * .16, 0, 0, Math.PI); c.fill();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - rx * .42, yy - h * .55, rx * .1, h * .3, -.6, 0, 7); c.fill();
  c.fillStyle = '#b9c0d0'; c.beginPath(); c.ellipse(x, yy, rx * 1.03, rx * .17, 0, 0, Math.PI); c.fill();
  ell(c, x, yy - h - w * .02, w * .055, w * .03, GOLD2); ell(c, x, yy - h - w * .045, w * .045, w * .035, GOLD); ell(c, x - w * .012, yy - h - w * .055, w * .012, w * .009, 'rgba(255,255,255,.7)');
  c.restore();
}
function leak(c, x, y, w, a, t) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const ang = -Math.PI / 2 + (i - 4) * .26 + Math.sin(t * 2 + i) * .03, L = w * (1.1 + .3 * hash(i));
  const g = c.createLinearGradient(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L); g.addColorStop(0, `rgba(255,214,120,${.38 * a})`); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g;
  c.beginPath(); c.moveTo(x - w * .3 * Math.sin(ang + Math.PI / 2), y); c.lineTo(x + Math.cos(ang - .05) * L, y + Math.sin(ang - .05) * L); c.lineTo(x + Math.cos(ang + .05) * L, y + Math.sin(ang + .05) * L); c.closePath(); c.fill(); } c.restore(); glow(c, x, y, w * .7, .8 * a); }
// dishes seen from above (the tables, the tickets): the usual soup, the usual schnitzel, and the secret dish
function topDish(c, x, y, r, kind, o = {}) {
  ell(c, x + r * .06, y + r * .1, r * 1.02, r * 1.02, 'rgba(0,0,20,.28)');
  if (kind === 'soup') { ell(c, x, y, r * .95, r * .95, '#f1e7cf'); ell(c, x, y, r * .78, r * .78, '#d9ccab'); ell(c, x, y, r * .72, r * .72, '#b4532a'); ell(c, x - r * .2, y - r * .25, r * .3, r * .14, 'rgba(255,200,140,.25)', -.5);
    for (const [dx, dy] of [[-.3, .1], [.2, -.2], [.1, .35], [.35, .15], [-.1, -.35]]) { c.fillStyle = '#e1b06a'; c.fillRect(x + dx * r - r * .07, y + dy * r - r * .07, r * .14, r * .14); }
    for (const [dx, dy] of [[0, .05], [-.25, -.3], [.3, .4]]) ell(c, x + dx * r, y + dy * r, r * .05, r * .03, '#3f7d4f'); return; }
  ell(c, x, y, r, r, CREAM); c.strokeStyle = kind === 'hero' ? GOLD2 : '#d9ccab'; c.lineWidth = r * .05; c.beginPath(); c.arc(x, y, r * .86, 0, 7); c.stroke();
  if (kind === 'schnitzel') { c.fillStyle = '#d29b45'; c.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 2, rr = r * (.55 + .06 * Math.sin(i * 2.7)); c.lineTo(x - r * .08 + Math.cos(a) * rr * 1.1, y + Math.sin(a) * rr * .8); } c.fill();
    c.fillStyle = '#b07a30'; for (let i = 0; i < 9; i++) ell(c, x - r * .08 + (hash(i) - .5) * r * .9, y + (hash(i + 9) - .5) * r * .7, r * .04, r * .03, '#b07a30');
    ell(c, x + r * .5, y - r * .35, r * .2, r * .2, GOLD); ell(c, x + r * .5, y - r * .35, r * .14, r * .14, '#f6dc7a'); ell(c, x + r * .45, y + r * .45, r * .08, r * .06, '#3f7d4f'); return; }
  // the secret dish
  if (o.glow) glow(c, x, y, r * 2.2, .5 * o.glow);
  ell(c, x - r * .32, y - r * .1, r * .3, r * .26, '#f3e1b0');
  for (let i = 0; i < 5; i++) { const a = -.9 + i * .38, sx = x + r * .12 + Math.cos(a) * r * .22, sy = y + Math.sin(a) * r * .32; ell(c, sx, sy, r * .2, r * .09, '#6b351c', a + Math.PI / 2); ell(c, sx, sy, r * .16, r * .065, '#b8644c', a + Math.PI / 2); }
  for (let k = 0; k < 5; k++) ell(c, x - r * .45 + k * r * .2, y + r * .5 + Math.sin(k) * r * .05, r * .045, r * .045, '#5a2216');
  for (const [dx, dy, a] of [[.45, -.45, -.5], [.55, -.3, .6], [.38, -.6, 1.4]]) ell(c, x + dx * r, y + dy * r, r * .1, r * .045, '#3f7d4f', a);
}
// an order ticket: a cream slip with a zigzag foot, a few lines and the dish drawn on it
function ticket(c, x, y, w, kind, rot = 0, k = 1) {
  if (k <= 0) return; const h = w * 1.45;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(-w / 2 + 6, 8, w, h);
  c.fillStyle = '#f7f1e1'; c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.lineTo(w / 2, h); for (let i = 0; i <= 8; i++) c.lineTo(w / 2 - i * w / 8, h - (i % 2 ? 10 : 0) * w / 120); c.closePath(); c.fill();
  c.fillStyle = '#26346f'; c.fillRect(-w / 2, 0, w, w * .1); c.fillStyle = 'rgba(28,36,80,.35)'; for (let i = 0; i < 2; i++) c.fillRect(-w * .32, w * .2 + i * w * .1, w * (.64 - i * .2), w * .04);
  topDish(c, 0, w * .75, w * .3, kind); c.fillStyle = 'rgba(28,36,80,.35)'; c.fillRect(-w * .32, w * 1.17, w * .64, w * .04);
  c.restore();
}
// the menu: a cream card with a gold border, four dishes; o.note reveals the handwritten line (0..1), o.star stamps a gold star beside it
const MENU = [['soup', 'Gulyásleves', '2 490'], ['schnitzel', 'Rántott szelet', '3 290'], ['soup', 'Paprikás csirke', '3 490'], ['hero', 'Kacsamell', '4 890']];
function menuCard(c, x, y, w, h, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(-w / 2 + 16, -h / 2 + 20, w, h);
  c.fillStyle = CREAM; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = GOLD2; c.lineWidth = w * .008; c.strokeRect(-w / 2 + w * .04, -h / 2 + w * .04, w * .92, h - w * .08); c.lineWidth = w * .003; c.strokeRect(-w / 2 + w * .06, -h / 2 + w * .06, w * .88, h - w * .12);
  const u = w / 860; text(c, 'ÉTLAP', 0, -h / 2 + 150 * u, 110 * u, NAVY); c.fillStyle = GOLD2; c.fillRect(-90 * u, -h / 2 + 225 * u, 180 * u, 6 * u); star(c, 0, -h / 2 + 228 * u, 16 * u);
  MENU.forEach(([kind, name, price], i) => { const ly = -h / 2 + (380 + i * 270) * u;
    topDish(c, -w / 2 + 150 * u, ly, 62 * u, kind); text(c, name, -w / 2 + 245 * u, ly - 8 * u, 62 * u, NAVY, 'Lilita One', 'left'); text(c, price, w / 2 - 90 * u, ly - 8 * u, 50 * u, '#6e5a3a', 'Lilita One', 'right');
    c.fillStyle = 'rgba(110,90,58,.4)'; for (let d = -w / 2 + 245 * u; d < w / 2 - 100 * u; d += 22 * u) c.fillRect(d, ly + 42 * u, 8 * u, 4 * u);
    if (kind === 'hero' && (o.note ?? 0) > 0) { const sz = 70 * u, nx = -w / 2 + 250 * u, ny = ly + 105 * u; c.font = `${sz}px "Caveat Brush"`; const nw = c.measureText(NOTE).width;
      if (o.noteGlow) glow(c, nx + nw / 2, ny, nw * .6, .35 * o.noteGlow);
      c.save(); c.beginPath(); c.rect(nx - 10, ny - sz, (nw + 20) * Math.min(1, o.note), sz * 2); c.clip(); c.save(); c.translate(nx, ny); c.rotate(-.03); text(c, NOTE, 0, 0, sz, '#22307a', 'Caveat Brush', 'left'); c.restore(); c.restore();
      if (o.under > 0) { c.strokeStyle = GOLD2; c.lineWidth = 7 * u; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 20 * o.under; i++) { const px = nx + i / 20 * nw; c.lineTo(px, ny + 46 * u + Math.sin(i * .9) * 3 * u - i * .6 * u); } c.stroke(); }
      if (o.star > 0) star(c, nx + nw + 50 * u, ny - 10 * u, 34 * u, o.star);
      o.pen && o.pen(nx + nw * Math.min(1, o.note), ny, sz); } });
  c.restore();
}
// a pen in a white hand (the owner's)
function penHand(c, tx, ty, s = 1, wig = 0) { c.save(); c.translate(tx, ty); c.rotate(.5 + wig); c.scale(s, s);
  c.fillStyle = NAVY; c.beginPath(); c.roundRect(-11, -150, 22, 160, 8); c.fill(); c.fillStyle = GOLD; c.fillRect(-11, -150, 22, 30); c.fillStyle = '#2a2a33'; c.beginPath(); c.moveTo(-8, 10); c.lineTo(8, 10); c.lineTo(0, 26); c.fill();
  const g = c.createRadialGradient(-20, -90, 10, 0, -80, 80); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#aeb4c8'); c.fillStyle = g; c.beginPath(); c.arc(4, -70, 50, 0, 7); c.fill();
  c.strokeStyle = g; c.lineWidth = 80; c.lineCap = 'round'; c.beginPath(); c.moveTo(20, -80); c.lineTo(160, -420); c.stroke(); c.restore(); }

// —— the rooms ——
// the kitchen: tiled navy wall, a window (day to night), copper pans, a calendar, the ticket rail, heat lamps over the pass
const PASS = 1250;
function kitchen(c, t, o = {}) {
  c.fillStyle = '#18225e'; c.fillRect(-400, -200, 1880, 2400);
  c.strokeStyle = '#212e74'; c.lineWidth = 3; for (let y = -200; y < PASS; y += 46) { c.beginPath(); c.moveTo(-400, y); c.lineTo(1480, y); c.stroke(); for (let x = -400 + ((y / 46) % 2) * 45; x < 1480; x += 90) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 46); c.stroke(); } }
  if (o.window !== false) { const n = o.night || 0, g = c.createLinearGradient(0, 230, 0, 560); g.addColorStop(0, `rgb(${lerp(70, 12, n)},${lerp(110, 22, n)},${lerp(205, 70, n)})`); g.addColorStop(1, `rgb(${lerp(140, 36, n)},${lerp(170, 56, n)},${lerp(230, 130, n)})`);
    c.fillStyle = '#e9dcc0'; c.fillRect(80, 220, 300, 350); c.fillStyle = g; c.fillRect(96, 236, 268, 318);
    const a = o.sunA ?? 0; c.save(); c.beginPath(); c.rect(96, 236, 268, 318); c.clip(); const sx = 230 + Math.cos(a) * 120, sy = 470 - Math.sin(a) * 180;
    if (n < .5) { glow(c, sx, sy, 90, .6); ell(c, sx, sy, 34, 34, '#ffe08a'); } else { ell(c, sx, sy, 30, 30, '#f1e7cf'); ell(c, sx + 12, sy - 8, 26, 26, `rgb(${lerp(70, 12, n)},${lerp(110, 22, n)},${lerp(205, 70, n)})`); c.fillStyle = 'rgba(246,239,220,.8)'; for (let i = 0; i < 6; i++) ell(c, 120 + hash(i) * 220, 260 + hash(i + 4) * 150, 3, 3, 'rgba(246,239,220,.8)'); }
    c.fillStyle = '#121a4e'; for (const [bx, bw, bh] of [[96, 70, 90], [170, 90, 140], [262, 102, 70]]) c.fillRect(bx, 554 - bh, bw, bh); c.restore();
    c.fillStyle = '#e9dcc0'; c.fillRect(224, 236, 12, 318); c.fillRect(96, 390, 268, 10); }
  if (o.pans !== false) { c.fillStyle = '#5a5f73'; c.fillRect(470, 290, 560, 10);
    for (const [px, r] of [[540, 58], [680, 46], [810, 64], [950, 42]]) { c.strokeStyle = '#5a5f73'; c.lineWidth = 4; c.beginPath(); c.moveTo(px, 300); c.lineTo(px, 340); c.stroke(); c.fillStyle = '#7a4a26'; c.fillRect(px - 7, 340, 14, 70); ell(c, px, 410 + r, r, r, '#b8743c'); ell(c, px - r * .25, 410 + r * .75, r * .35, r * .5, 'rgba(255,220,170,.25)', -.4); } }
  if (o.calendar) calendar(c, o.calendar[0], o.calendar[1], o.day || 0, o.tear || 0);
  if (o.rail !== false) { c.fillStyle = '#8f98b0'; c.fillRect(80, 752, 920, 16); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(80, 752, 920, 4); for (const px of [80, 990]) { c.fillStyle = '#5a5f73'; c.fillRect(px, 740, 12, 40); } }
  (o.tickets || []).forEach(f => f());
  for (const lx of o.lamps || [270, 810]) { c.strokeStyle = '#2a2a33'; c.lineWidth = 4; c.beginPath(); c.moveTo(lx, -200); c.lineTo(lx, 960); c.stroke();
    c.fillStyle = '#121a46'; c.beginPath(); c.moveTo(lx - 90, 1040); c.lineTo(lx + 90, 1040); c.lineTo(lx + 40, 960); c.lineTo(lx - 40, 960); c.fill(); ell(c, lx, 1042, 70, 12, '#ffd77a'); glow(c, lx, 1100, 300, .35 * (o.lampA ?? 1)); }
}
function passFront(c, t, o = {}) {   // the pass shelf and the counter front below it (drawn over whoever stands behind)
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(-400, PASS + 30, 1880, 30);
  c.fillStyle = '#e9dcc0'; c.fillRect(-400, PASS, 1880, 34); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-400, PASS, 1880, 5);
  c.fillStyle = '#2a3784'; c.fillRect(-400, PASS + 34, 1880, 1000); c.fillStyle = GOLD2; c.fillRect(-400, PASS + 70, 1880, 6);
  c.strokeStyle = 'rgba(0,0,20,.25)'; c.lineWidth = 4; for (let x = -380; x < 1480; x += 270) c.strokeRect(x, PASS + 110, 230, 300);
}
function calendar(c, x, y, day, tear) {   // a wall calendar; tear (0..1) flips the top page off
  c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(x - 100 + 8, y - 120 + 10, 200, 250);
  c.fillStyle = CREAM; c.fillRect(x - 100, y - 120, 200, 250); c.fillStyle = '#c4566a'; c.fillRect(x - 100, y - 120, 200, 60); text(c, 'OKT', x, y - 90, 40, CREAM);
  text(c, String(14 + day), x, y + 30, 110, NAVY);
  if (tear > 0 && tear < 1) { c.save(); c.translate(x - 100, y - 60); c.rotate(-tear * 1.4); c.translate(tear * 260, -tear * 120); c.globalAlpha = 1 - tear; c.fillStyle = CREAM; c.fillRect(0, 0, 200, 190); text(c, String(13 + day), 100, 90, 110, NAVY); c.restore(); }
  ell(c, x - 50, y - 120, 8, 8, '#2a2a33'); ell(c, x + 50, y - 120, 8, 8, '#2a2a33');
}
// the dining room: wallpaper, a window (day or night), wainscot, a wooden floor, pendant lamps
function dining(c, t, o = {}) {
  const n = o.night || 0;
  c.fillStyle = n ? '#121a4c' : '#1a2766'; c.fillRect(-500, -300, 2080, 1750);
  c.fillStyle = n ? 'rgba(255,255,255,.025)' : 'rgba(255,255,255,.04)'; for (let x = -500; x < 1580; x += 70) c.fillRect(x, -300, 30, 1450);
  for (const [wx, wy] of o.windows || [[120, 380]]) { const g = c.createLinearGradient(0, wy, 0, wy + 580); g.addColorStop(0, n ? '#0b1440' : '#3c5fb4'); g.addColorStop(1, n ? '#22357a' : '#7f9ee0');
    c.fillStyle = '#e9dcc0'; c.fillRect(wx, wy, 330, 600); c.fillStyle = g; c.fillRect(wx + 16, wy + 16, 298, 568);
    c.save(); c.beginPath(); c.rect(wx + 16, wy + 16, 298, 568); c.clip();
    if (n) { ell(c, wx + 220, wy + 120, 40, 40, '#f1e7cf'); ell(c, wx + 236, wy + 108, 36, 36, '#0e1846'); for (let i = 0; i < 8; i++) ell(c, wx + 30 + hash(i + 3) * 270, wy + 40 + hash(i + 11) * 260, 3, 3, 'rgba(246,239,220,.85)'); }
    else { glow(c, wx + 230, wy + 120, 150, .35); ell(c, wx + 230, wy + 120, 40, 40, '#ffe7a6'); }
    c.fillStyle = n ? '#0a1236' : '#22357e'; for (const [bx, bw, bh] of [[0, 90, 200], [95, 110, 290], [210, 100, 170]]) { c.fillRect(wx + 16 + bx, wy + 584 - bh, bw, bh); if (n) for (let yy = wy + 600 - bh; yy < wy + 570; yy += 50) for (let xx = wx + 30 + bx; xx < wx + bx + bw; xx += 34) { c.fillStyle = (xx + yy) % 3 ? '#e9b860' : '#16205a'; c.fillRect(xx, yy, 14, 20); c.fillStyle = '#0a1236'; } }
    c.restore(); c.fillStyle = '#e9dcc0'; c.fillRect(wx + 158, wy + 16, 14, 568); c.fillRect(wx + 16, wy + 290, 298, 12); }
  for (const [fx, fy] of o.frames || []) { c.fillStyle = GOLD2; c.fillRect(fx - 90, fy - 70, 180, 140); c.fillStyle = '#26368c'; c.fillRect(fx - 74, fy - 54, 148, 108); topDish(c, fx, fy, 40, 'hero'); }
  c.fillStyle = WOOD; c.fillRect(-500, 1100, 2080, 350); c.fillStyle = '#e9dcc0'; c.fillRect(-500, 1092, 2080, 14);
  c.strokeStyle = 'rgba(30,15,5,.35)'; c.lineWidth = 4; for (let x = -480; x < 1580; x += 200) c.strokeRect(x, 1140, 160, 260);
  const fg = c.createLinearGradient(0, 1450, 0, 2300); fg.addColorStop(0, '#5a3a22'); fg.addColorStop(1, '#2a1a0f'); c.fillStyle = fg; c.fillRect(-500, 1450, 2080, 900);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 1480; y < 2300; y += 36 + (y - 1450) * .06) { c.beginPath(); c.moveTo(-500, y); c.lineTo(1580, y); c.stroke(); }
  if (n) { c.fillStyle = 'rgba(6,10,36,.35)'; c.fillRect(-500, -300, 2080, 2600); }
}
function pendant(c, x, y, on = 1) { c.strokeStyle = '#2a2a33'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, -300); c.lineTo(x, y); c.stroke();
  c.fillStyle = '#c99a3a'; c.beginPath(); c.moveTo(x - 70, y + 70); c.lineTo(x + 70, y + 70); c.lineTo(x + 30, y); c.lineTo(x - 30, y); c.fill(); ell(c, x, y + 72, 52, 10, on ? '#ffe7a6' : '#6e5a3a'); if (on) glow(c, x, y + 160, 360 * on, .45 * on); }
function table(c, x, y, w, o = {}) {   // a round table with a cream cloth, seen from the side; y = the top
  spot(c, x, y + w * .55, w * .7, .4); c.fillStyle = '#e9dcc0'; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w * .52, y + w * .5); c.quadraticCurveTo(x, y + w * .56, x + w * .52, y + w * .5); c.lineTo(x + w / 2, y); c.fill();
  c.fillStyle = 'rgba(0,0,20,.12)'; for (const k of [-.3, 0, .3]) { c.beginPath(); c.moveTo(x + k * w, y + w * .05); c.lineTo(x + k * w * 1.05 - w * .03, y + w * .52); c.lineTo(x + k * w * 1.05 + w * .03, y + w * .52); c.fill(); }
  ell(c, x, y, w / 2, w * .09, CREAM); if (o.chairsUp) for (const d of [-1, 1]) { c.save(); c.translate(x + d * w * .28, y - w * .02); c.scale(1, -1); c.fillStyle = '#4a321e'; c.fillRect(-w * .1, 0, w * .2, w * .03); c.fillRect(-w * .1, 0, w * .02, w * .25); c.fillRect(w * .08, 0, w * .02, w * .25); c.fillRect(-w * .1, w * .03, w * .02, -w * .2); c.restore(); }
}
// seen from directly above: a guest at the table (shoulders, arms, head); ang points from the seat towards the table centre
function topGuest(c, x, y, ang, skin, fem) {
  const col = { blue1: ['#2448bb', '#5a80f0', '#13246a'], blue2: ['#2a52c9', '#6189f5', '#152a78'], blue3: ['#1f3fa6', '#5272dd', '#101f5e'] }[skin];
  c.save(); c.translate(x, y); c.rotate(ang);
  ell(c, -20, 0, 70, 120, col[2]); c.strokeStyle = col[0]; c.lineCap = 'round'; c.lineWidth = 34; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(-10, d * 90); c.lineTo(70, d * 70); c.stroke(); ell(c, 74, d * 68, 22, 22, col[0]); }
  const g = c.createRadialGradient(-30, -20, 8, -12, 0, 85); g.addColorStop(0, col[1]); g.addColorStop(.5, col[0]); g.addColorStop(1, col[2]); c.fillStyle = g; c.beginPath(); c.arc(-14, 0, 78, 0, 7); c.fill();
  if (fem) { c.fillStyle = '#4a2c1e'; c.beginPath(); c.arc(-24, 0, 74, Math.PI * .45, Math.PI * 1.55); c.fill(); if (fem === 'bun') ell(c, -70, 0, 30, 30, '#4a2c1e'); }
  c.restore();
}
function topTable(c, x, y, r) { ell(c, x + 14, y + 20, r, r, 'rgba(0,0,20,.35)'); ell(c, x, y, r, r, '#e9dcc0'); ell(c, x, y, r * .93, r * .93, CREAM); c.strokeStyle = 'rgba(217,163,50,.5)'; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r * .8, 0, 7); c.stroke(); }
function topFloor(c) { c.fillStyle = '#3a2616'; c.fillRect(-1200, -1200, 3480, 4320); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 4; for (let x = -1200; x < 2300; x += 110) { c.beginPath(); c.moveTo(x, -1200); c.lineTo(x, 3200); c.stroke(); }
  c.fillStyle = 'rgba(6,10,36,.4)'; c.fillRect(-1200, -1200, 3480, 4320); }

// —— the people ——
const CHEF = o => ({ id: 'chef', skin: 'owner', toque: 1, s: 2.4, smile: .7, ...o });
const OWNER = o => ({ id: 'owner', skin: 'owner', tache: 1, s: 2.2, smile: .5, ...o });
const WAITER = o => ({ id: 'waiter', skin: 'owner', bowtie: 1, s: 2.3, smile: .6, ...o });
const GUEST = o => ({ id: 'guest', skin: 'blue2', fem: 'bun', s: 2.2, smile: .5, ...o });

// —— the shots ——
const SHOT = {
  hero(c, t) {   // the restaurant's best dish: under a cloche, in the spotlight; the cloche lifts
    const lift = E(t, HIT.lift, .5, .2), up = ss(seg(t, HIT.lift, HIT.lift + .9));
    bg(c, t, { rays: up, ry: 1150 });
    const cone = c.createLinearGradient(0, 0, 0, 1400); cone.addColorStop(0, 'rgba(255,225,160,.0)'); cone.addColorStop(1, 'rgba(255,225,160,.14)'); c.fillStyle = cone; c.beginPath(); c.moveTo(440, 0); c.lineTo(640, 0); c.lineTo(980, 1400); c.lineTo(100, 1400); c.fill();
    cam(c, 540, 1150, 1 + .08 * seg(t, 0, 1.9), 0, () => {
      ell(c, 540, 1330, 520, 110, '#4a321e'); ell(c, 540, 1320, 500, 100, '#6e4a2c');
      heroDish(c, 540, 1300, 640, { steam: up, t, glow: up });
      cloche(c, 540, 1300, 680, lift * 1400, -lift * .5);
      if (lift < .3) leak(c, 540, 1290, 640, Math.sin(clamp(lift / .3) * Math.PI), t); });
  },
  nobody(c, t) {   // ...and almost nobody ordered it: tickets for the usual dishes slap onto the rail; it waits alone under the lamp
    const fade = ss(seg(t, 2.6, 3.4));
    cam(c, 540, 960, 1.18 + .06 * seg(t, 1.9, 3.6), 0, () => {
      kitchen(c, t, { window: false, lampA: 1 - .5 * fade, tickets: [() => HIT.tickets.forEach((tk, i) => { const k = E(t, tk, .25, .5), sw = Math.sin((t - tk) * 12) * .12 * Math.exp(-(t - tk) * 4) * (t > tk);
        ticket(c, 200 + i * 225, 760, 170, ['soup', 'schnitzel', 'soup', 'schnitzel'][i], sw + (i % 2 ? .04 : -.03), k); })] });
      passFront(c, t); heroDish(c, 540, PASS + 8, 380, { steam: 1 - fade, t });
      c.fillStyle = `rgba(6,10,36,${.3 * fade})`; c.fillRect(0, 0, 1080, 2000); });
  },
  chef(c, t) {   // the chef made it fresh every day: days fly by on the calendar and in the window, a fresh plate every morning
    const d = HIT.days.filter(x => t > x).length, last = HIT.days[Math.max(0, d - 1)], tear = d ? seg(t, last, last + .4) : 0;
    const cyc = (t - 3.6) / .5, night = .5 - .5 * Math.cos(cyc * Math.PI * 2);
    const set = d ? ss(seg(t, last - .25, last + .05)) : 0, back = d ? ss(seg(t, last + .2, last + .45)) : 0;
    cam(c, 560, 980, 1.18, 0, () => {
      kitchen(c, t, { night, sunA: cyc * Math.PI * 2 % Math.PI, calendar: [880, 740], day: d, tear, rail: false, pans: true });
      const P = CHEF({ x: 560, y: 1460, smile: d ? .9 : .7, blink: blinkAt(t, 1), look: .3, squash: wob(t, last, .3, 20, .04) });
      const hand = reach([660, 1200], [560, PASS - 30], set * (1 - back)); P.handR = hand; P.handL = reach([450, 1200], [520, PASS - 30], set * (1 - back));
      mascot(c, P); passFront(c, t);
      if (d) scaled(c, 540, PASS + 8, E(t, last - .1, .25, .45), () => heroDish(c, 540, PASS + 8, 360, { steam: 1, t })); });
  },
  same(c, t) {   // but the guests always chose the same usual dishes: from above, plates of the usual land at every seat; the secret dish slides in, and back out
    topFloor(c);
    cam(c, 540, 980, 1.0, (t - 6.3) * .05, () => {
      topTable(c, 540, 980, 330);
      const seats = [[540, 560, Math.PI / 2], [960, 980, Math.PI], [540, 1400, -Math.PI / 2], [120, 980, 0]], kinds = ['soup', 'schnitzel', 'soup', 'soup'];
      seats.forEach(([x, y, a], i) => { const px = lerp(540, x, .55), py = lerp(980, y, .55), k = E(t, HIT.lands[i], .25, .45); if (k > 0) scaled(c, px, py, lerp(1.6, 1, Math.min(1, k)) * Math.min(1, k * 3), () => topDish(c, px, py, 95, kinds[i])); });
      const hin = ss(seg(t, HIT.heroIn, HIT.heroIn + .45)), hout = ss(seg(t, HIT.heroOut, HIT.heroOut + .45)), hx = lerp(1400, 540, hin) + 860 * hout;
      if (hin > 0) topDish(c, hx, 980, 105, 'hero', { glow: hin * (1 - hout) * .6 });
      seats.forEach(([x, y, a], i) => topGuest(c, x, y, a, ['blue1', 'blue2', 'blue3', 'blue2'][i], [null, 'bob', null, 'bun'][i])); });
  },
  evening(c, t) {   // one evening the owner decided to change the menu a little
    const lamp = E(t, HIT.lamp, .3, .3), chin = ss(seg(t, HIT.chin - .3, HIT.chin)) * (1 - ss(seg(t, HIT.pen - .3, HIT.pen))), pen = ss(seg(t, HIT.pen, HIT.pen + .35)), low = ss(seg(t, HIT.lower, HIT.lower + .4));
    const z = lerp(1, 1.55, ss(seg(t, 10.7, 15.6)));
    cam(c, lerp(540, 640, ss(seg(t, 10.7, 15.6))), lerp(1080, 1180, ss(seg(t, 10.7, 15.6))), z, 0, () => {
      dining(c, t, { night: 1, windows: [[60, 360]] });
      table(c, 200, 1320, 300, { chairsUp: 1 }); table(c, 1000, 1290, 280, { chairsUp: 1 });
      pendant(c, 640, 700, lamp);
      const P = OWNER({ x: 640, y: 1500, sit: 1, f: 0, look: .35 - .4 * chin, blink: blinkAt(t, 4), squash: t > HIT.nod ? Math.sin(clamp((t - HIT.nod) / .5) * Math.PI * 2) * .05 : 0, smile: t > HIT.nod ? .75 : .4 });
      const Hh = Hs(P.s), menuL = [P.x - .22 * Hh, P.y - .3 * Hh]; P.handL = menuL; P.handR = chin > .5 ? null : reach([P.x + .22 * Hh, P.y - .3 * Hh], [P.x + .32 * Hh, P.y - .62 * Hh], pen * (1 - low));
      if (chin > .5) P.chin = 'R';
      mascot(c, P);
      c.save(); c.translate(P.x, P.y - .3 * Hh); c.rotate(-.08 * chin); c.fillStyle = '#26368c'; c.fillRect(-.27 * Hh, -.22 * Hh, .54 * Hh, .36 * Hh); c.strokeStyle = GOLD2; c.lineWidth = 4; c.strokeRect(-.24 * Hh, -.19 * Hh, .48 * Hh, .3 * Hh); text(c, 'ÉTLAP', 0, -.05 * Hh, .1 * Hh, GOLD); c.restore();
      if (pen > .05 && P.handR) { const [hx, hy] = P.handR; c.save(); c.translate(hx, hy); c.rotate(-.4 + .5 * low); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-7, -60, 14, 70, 5); c.fill(); c.fillStyle = GOLD; c.fillRect(-7, -60, 14, 14); c.restore(); }
      table(c, 640, 1420, 520); });
  },
  menu(c, t) {   // the menu from above: down the list, to the duck; the pen arrives beside it
    const pan = ss(seg(t, 15.75, 17.5)), pin = ss(seg(t, HIT.penIn, HIT.penIn + .6));
    bg(c, t, { c0: '#3a2a1c' });
    cam(c, 540, lerp(820, 1250, pan), lerp(1, 1.25, pan), -.04, () => {
      ell(c, 540, 1000, 900, 1300, '#4a321e'); menuCard(c, 540, 960, 860, 1460, { rot: .02 });
      if (pin > 0) penHand(c, lerp(1250, 330, pin), lerp(1900, 1420, pin), 1); });
  },
  write(c, t) {   // next to the dish's name he wrote only this: "A séf titkos kedvence"
    const nk = seg(t, ...HIT.write), st = E(t, HIT.star, .3, .5), un = ss(seg(t, HIT.write[1] - .1, HIT.write[1] + .3));
    bg(c, t, { c0: '#3a2a1c', rays: ss(seg(t, HIT.star, HIT.star + .5)) * .6, ry: 1300 });
    cam(c, lerp(560, 620, ss(seg(t, 18.1, 20.7))), 1290, lerp(1.7, 1.85, ss(seg(t, 18.1, 20.7))), -.03, () => {
      menuCard(c, 540, 960, 860, 1460, { rot: .02, note: nk, star: st, under: un, noteGlow: st, pen: (px, py, sz) => { if (nk < 1.05 && t < HIT.write[1] + .4) penHand(c, px + 10, py + Math.sin(nk * 40) * 10 - 10, .55, Math.sin(nk * 30) * .05); } }); });
  },
  nextday(c, t) {   // the next day, a guest reads it: over her shoulder, the handwritten line catches the light
    const gl = seg(t, HIT.glint, HIT.glint + .7), hand = E(t, HIT.hand, .35, .4);
    blurred(c, 10, () => cam(c, 540, 900, 1.1, 0, () => { dining(c, t, { windows: [[120, 300]] }); pendant(c, 760, 500, .6); }));
    c.fillStyle = 'rgba(10,16,50,.35)'; c.fillRect(0, 0, 1080, 1920);
    cam(c, 560, 1020, 1 + .05 * seg(t, 20.7, 23.3), .03, () => {
      menuCard(c, 600, 900, 620, 1050, { rot: .06, note: 1, noteGlow: .4 + .6 * Math.sin(gl * Math.PI) });
      sparkle(c, 700, 1230, gl, 60);
      blurred(c, 4, () => drawMascot(c, { ...GUEST({ s: 5.2, x: 180, y: 2550, back: true, tilt: -.12 * Math.min(1, hand), squash: wob(t, HIT.hand, .3, 16, .03) }), shadow: false })); });
  },
  ask(c, t) {   // "What makes this dish so special?"
    const b = E(t, HIT.bubble, .35, .45), qk = 1 + HIT.q.reduce((a, q) => a + (t > q ? .25 * Math.sin(clamp((t - q) / .3) * Math.PI) : 0), 0);
    cam(c, 540, 1100, 1.15 + .05 * seg(t, 23.3, 25.85), 0, () => {
      dining(c, t, { windows: [[-140, 300]], frames: [[820, 560]] }); pendant(c, 360, 520, .8);
      const G = GUEST({ x: 330, y: 1560, sit: 1, f: .45, look: -.25, blink: blinkAt(t, 5), squash: wob(t, HIT.bubble, .3, 18, .03) }), Hg = Hs(G.s);
      G.handR = [G.x + .42 * Hg, 1430 - 30 * Math.sin(Math.min(1, b) * Math.PI)];
      mascot(c, G); table(c, 440, 1430, 460);
      c.save(); c.translate(520, 1420); c.rotate(-.1); c.fillStyle = CREAM; c.fillRect(-90, -20, 180, 40); c.fillStyle = GOLD2; c.fillRect(-90, -20, 180, 6); c.restore();
      mascot(c, WAITER({ x: 820, y: 1640, f: -.45, look: .1, smile: .55, blink: blinkAt(t, 6), lean: -.04 * Math.min(1, b), handL: [720, 1350] }));
      c.fillStyle = CREAM; c.save(); c.translate(712, 1330); c.rotate(-.2); c.fillRect(-36, -46, 72, 92); c.fillStyle = 'rgba(28,36,80,.4)'; for (let i = 0; i < 4; i++) c.fillRect(-26, -30 + i * 18, 52, 5); c.restore();
      speech(c, 430, 640, 520, 320, b, 400, 900, () => { topDish(c, 340, 640, 95, 'hero'); qmark(c, 560, 630, qk, 190); }); });
  },
  smile(c, t) {   // the waiter smiled, and said only this
    const sm = ss(seg(t, HIT.smile - .15, HIT.smile + .25)), le = ss(seg(t, HIT.lean, HIT.lean + .4)), wk = t > HIT.wink && t < HIT.wink + .35 ? Math.sin(seg(t, HIT.wink, HIT.wink + .35) * Math.PI) : 0;
    blurred(c, 14, () => cam(c, 540, 900, 1.2, 0, () => { dining(c, t, { frames: [[300, 560], [820, 560]] }); pendant(c, 540, 400, .8); }));
    c.fillStyle = 'rgba(10,16,50,.4)'; c.fillRect(0, 0, 1080, 1920);
    cam(c, 540, 1000, 1 + .06 * seg(t, 25.85, 28.2) + .1 * le, .06 * le, () => {
      const P = WAITER({ s: 6.4, x: 540, y: 2350, f: 0, smile: lerp(.35, 1, sm), look: -.2, blink: wk || blinkAt(t, 7) * (t < HIT.wink), squash: wob(t, HIT.smile, .4, 14, .03) });
      mascot(c, P); });
  },
  tease(c, t) {   // "Taste it, and you'll find out!": he holds up the covered dish and lifts the cloche just a crack, then closes it
    const tk = E(t, HIT.tray, .4, .35), cr = ss(seg(t, HIT.crack, HIT.crack + .25)) * (1 - ss(seg(t, HIT.close - .2, HIT.close)));
    blurred(c, 12, () => cam(c, 540, 900, 1.15, 0, () => { dining(c, t, { windows: [[700, 300]] }); pendant(c, 300, 450, .8); }));
    c.fillStyle = 'rgba(10,16,50,.45)'; c.fillRect(0, 0, 1080, 1920);
    cam(c, 540, 1150, 1.05 + .1 * seg(t, 28.2, 31.45), 0, () => {
      const y = lerp(1900, 1250, Math.min(1.05, tk));
      blurred(c, 3, () => drawMascot(c, { ...WAITER({ s: 4.2, x: 860, y: y + 950, f: -.3, smile: .9, handL: [700, y + 40], blink: blinkAt(t, 8) }), shadow: false }));
      ell(c, 540, y + 40, 380, 60, '#8f98b0'); ell(c, 540, y + 30, 370, 56, '#dfe3ec');
      heroDish(c, 540, y, 600, { steam: cr, t });
      leak(c, 540, y - 8, 560, cr, t);
      cloche(c, 540, y, 640, cr * 70, cr * .18);
      if (cr > .2) for (let k = 0; k < 3; k++) { const u = (t * .8 + k * .33) % 1; ell(c, 330 + k * 30, y - 60 - u * 160, 26 + u * 30, 16 + u * 18, `rgba(246,239,220,${.35 * cr * (1 - u)})`); }
      sparkle(c, 470, y - 240, seg(t, HIT.close, HIT.close + .6), 50); });
  },
  ticket(c, t) {   // the guest finally ordered it: the ticket flies to the rail, ding; the chef pops up, delighted
    const fly = ss(seg(t, HIT.fly, HIT.clip)), clipped = t >= HIT.clip, joy = E(t, HIT.joy, .35, .45);
    cam(c, 540, 1010, 1.06, 0, () => {
      kitchen(c, t, { window: false, lampA: 1 + .4 * (clipped ? Math.exp(-(t - HIT.clip) * 3) : 0), tickets: [() => {
        const x = lerp(-200, 470, fly), y = lerp(500, 760, fly) - Math.sin(fly * Math.PI) * 220, sw = clipped ? Math.sin((t - HIT.clip) * 12) * .15 * Math.exp(-(t - HIT.clip) * 3) : lerp(-1.2, 0, fly);
        ticket(c, x, y, 200, 'hero', sw, 1); if (clipped) glow(c, 470, 900, 220, .5 * Math.exp(-(t - HIT.clip) * 2)); }] });
      const P = CHEF({ x: 780, y: lerp(1900, 1520, Math.min(1.1, joy)), smile: 1, blink: t > HIT.joy + .1 && t < HIT.joy + .6 ? 1 : 0, armL: 2.4 * Math.min(1, joy), armR: 2.4 * Math.min(1, joy), squash: wob(t, HIT.joy + .2, .3, 20, .06) });
      if (joy > 0) mascot(c, P);
      passFront(c, t); });
  },
  yum(c, t) {   // she loved it
    const bite = ss(seg(t, HIT.bite - .35, HIT.bite)), m = t > HIT.mmm, wig = m ? .04 * Math.sin((t - HIT.mmm) * 16) * Math.exp(-(t - HIT.mmm) * 1.5) : 0;
    bg(c, t, { rays: ss(seg(t, HIT.mmm, HIT.mmm + .4)) * .8, ry: 800 });
    blurred(c, 10, () => cam(c, 540, 900, 1.2, 0, () => { dining(c, t, { frames: [[260, 600]] }); pendant(c, 760, 380, .9); }));
    c.fillStyle = 'rgba(10,16,50,.35)'; c.fillRect(0, 0, 1080, 1920);
    cam(c, 540, 1180, 1.1 + .08 * seg(t, 33.5, 34.85), 0, () => {
      const G = GUEST({ s: 3.6, x: 540, y: 1820, sit: 1, smile: m ? 1 : .6, blink: m ? 1 : 0, squash: wig, tilt: wig * 2, look: m ? 0 : .3 }), Hg = Hs(G.s);
      const mouth = [G.x + .05 * Hg, G.y - .66 * Hg], fork = reach([G.x + .3 * Hg, 1560], mouth, bite * (1 - ss(seg(t, HIT.mmm + .1, HIT.mmm + .5))));
      G.handR = [fork[0] + 20, fork[1] + 40]; mascot(c, G);
      c.save(); c.translate(fork[0], fork[1]); c.rotate(-.6); c.fillStyle = '#c9ccd6'; c.fillRect(-5, 0, 10, 110); for (let k = -1; k <= 1; k++) c.fillRect(k * 9 - 3, -36, 6, 40); c.restore();
      ell(c, 540, 1600, 760, 120, '#e9dcc0'); ell(c, 540, 1590, 740, 110, CREAM);
      heroDish(c, 540, 1600, 520, { steam: 1, t }); });
  },
  friends(c, t) {   // the next day she brought her friends along
    const open = ss(seg(t, HIT.door, HIT.door + .35));
    const crew = [['blue2', 'bun', 35.15], ['blue1', null, 35.55], ['blue3', 'long', 35.95], ['blue2', 'beret', 36.35]];
    cam(c, 540, 1100, 1.0 + .05 * seg(t, 34.85, 37.55), 0, () => {
      dining(c, t, { windows: [[700, 360]] });
      c.fillStyle = '#e9dcc0'; c.fillRect(150, 700, 380, 760); const dg = c.createLinearGradient(0, 720, 0, 1450); dg.addColorStop(0, '#9fb6ea'); dg.addColorStop(1, '#d9e2f6'); c.fillStyle = dg; c.fillRect(170, 720, 340, 740); glow(c, 340, 1300, 400, .3 * open);
      c.fillStyle = WOOD; c.fillRect(170, 720, 340 * (1 - .8 * open), 740); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(190, 750, 300 * (1 - .8 * open), 300); ell(c, 170 + 340 * (1 - .8 * open) - 30, 1100, 12, 12, GOLD);
      c.strokeStyle = '#8a7a60'; c.lineWidth = 3; c.beginPath(); c.moveTo(340, 640); c.lineTo(340, 690); c.stroke(); const sw = Math.sin((t - HIT.door) * 14) * .4 * Math.exp(-(t - HIT.door) * 2) * (t > HIT.door); c.save(); c.translate(340, 690); c.rotate(sw); ell(c, 0, 18, 18, 22, GOLD); c.restore();
      pendant(c, 860, 600, .8); table(c, 880, 1460, 340);
      crew.forEach(([skin, fem, t0], i) => { const u = seg(t, t0, t0 + 1.4), x = lerp(340, [470, 640, 1010, 820][i], ss(u)), y = lerp(1470, [1680, 1740, 1700, 1780][i], ss(u));
        if (t > t0) mascot(c, { id: 'f' + i, skin, fem, s: 1.9, x, y, f: u < 1 ? .7 : .3, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, smile: u >= 1 ? .9 : .6, blink: blinkAt(t, 10 + i) }); }); });
  },
  rush(c, t) {   // soon it was one of the most popular dishes: the rail fills with tickets for it, plates stream across the pass
    cam(c, 540, 1010, 1.06, 0, () => {
      kitchen(c, t, { window: false, lampA: 1.3, tickets: [() => HIT.rush.forEach((tk, i) => { const k = E(t, tk, .22, .5), sw = Math.sin((t - tk) * 12) * .12 * Math.exp(-(t - tk) * 4) * (t > tk); ticket(c, 150 + i * 112, 760, 104, 'hero', sw + (i % 2 ? .05 : -.04), k); })] });
      const P = CHEF({ x: 540, y: 1480, smile: 1, blink: blinkAt(t, 1), look: .3 }); P.handR = [660 + 40 * Math.sin(t * 14), PASS - 40]; P.handL = [420 - 40 * Math.sin(t * 14 + 1), PASS - 40]; mascot(c, P);
      passFront(c, t);
      for (let k = 0; k < 7; k++) { const t0 = 37.55 + k * .26, u = seg(t, t0, t0 + .9); if (u > 0 && u < 1) heroDish(c, lerp(-250, 1330, u), PASS + 8, 300, { steam: .7, t }); } });
  },
  tables(c, t) {   // ...across the whole room, the secret dish at every seat
    topFloor(c); c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 540, 960, 900, .25 * ss(seg(t, HIT.glow, HIT.glow + .5))); c.restore();
    cam(c, 540, 960, .78, -.2 + (t - 39.4) * .06, () => {
      const T = [[320, 560], [800, 1000], [320, 1440]]; let n = 0;
      T.forEach(([tx, ty], ti) => { topTable(c, tx, ty, 260); const seats = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        seats.forEach(([dx, dy], si) => { const k = E(t, HIT.stamps[n++], .22, .45), px = tx + dx * 150, py = ty + dy * 150; if (k > 0) scaled(c, px, py, lerp(1.6, 1, Math.min(1, k)) * Math.min(1, k * 3), () => topDish(c, px, py, 78, 'hero')); });
        seats.forEach(([dx, dy], si) => topGuest(c, tx + dx * 330, ty + dy * 330, Math.atan2(-dy, -dx), ['blue1', 'blue2', 'blue3'][(ti + si) % 3], [null, 'bob', 'long', 'bun'][(ti * 2 + si) % 4])); }); });
  },
  recipe(c, t) {   // and yet the recipe hadn't changed at all: the same card, the same plate, then and now
    const pin = E(t, HIT.pin, .35, .5), sw = Math.sin((t - HIT.pin) * 8) * .08 * Math.exp(-(t - HIT.pin) * 2) * (t > HIT.pin), tw = E(t, HIT.twin, .3, .45), eq = E(t, HIT.eq, .3, .5);
    cam(c, 540, 900, 1.08 + .05 * seg(t, 41.2, 43.85), 0, () => {
      kitchen(c, t, { window: false, pans: false, rail: false, lamps: [] });
      c.fillStyle = 'rgba(6,10,36,.35)'; c.fillRect(-400, -200, 1880, 2400);
      c.save(); c.translate(540, 340); c.rotate(-.04 + sw); scaled(c, 0, 0, Math.min(1, pin * 1.2), () => {
        c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(-330, 30, 680, 460); c.fillStyle = '#efe2c2'; c.fillRect(-340, 16, 680, 460); c.fillStyle = 'rgba(160,120,60,.12)'; c.fillRect(-340, 16, 680, 460);
        text(c, 'Kacsamell', -290, 100, 76, '#22307a', 'Caveat Brush', 'left'); c.strokeStyle = 'rgba(34,48,122,.55)'; c.lineWidth = 6; c.lineCap = 'round';
        for (let i = 0; i < 5; i++) { c.beginPath(); for (let k = 0; k <= 30; k++) c.lineTo(-290 + k * (16 + i % 2 * 2), 190 + i * 56 + Math.sin(k * 1.3 + i) * 6); c.stroke(); }
        ell(c, 0, 16, 18, 18, GOLD2); ell(c, -4, 12, 6, 6, 'rgba(255,255,255,.6)'); });
      c.restore();
      passFront(c, t);
      heroDish(c, 270, PASS + 8, 400, { steam: 1, t }); if (tw > 0) scaled(c, 810, PASS + 8, Math.min(1, tw), () => heroDish(c, 810, PASS + 8, 400, { steam: 1, t }));
      if (eq > 0) scaled(c, 540, PASS - 60, eq, () => { c.fillStyle = GOLD; c.beginPath(); c.roundRect(480, PASS - 100, 120, 26, 12); c.roundRect(480, PASS - 44, 120, 26, 12); c.fill(); glow(c, 540, PASS - 60, 160, .45); }); });
  },
  curious(c, t) {   // only now everyone was curious what makes it so special: a "?" over every head; in the kitchen window, the chef: shh
    const shh = ss(seg(t, HIT.shh, HIT.shh + .35)), wink = t > HIT.wink2 && t < HIT.wink2 + .4 ? Math.sin(seg(t, HIT.wink2, HIT.wink2 + .4) * Math.PI) : 0, push = ss(seg(t, 45.6, 48.25));
    cam(c, lerp(540, 790, push), lerp(1080, 820, push), lerp(.95, 1.6, push), 0, () => {
      dining(c, t, { windows: [] });
      c.fillStyle = '#e9dcc0'; c.fillRect(600, 520, 420, 420); c.fillStyle = '#18225e'; c.fillRect(620, 540, 380, 380); glow(c, 810, 760, 300, .4);
      kitchenWin(c, t, shh, wink);
      pendant(c, 260, 520, .8);
      const seated = [[180, 1500, 'blue1', null, .6], [380, 1500, 'blue3', 'long', -.4], [640, 1540, 'blue2', 'bun', .7], [880, 1540, 'blue1', null, .7], [130, 1820, 'blue2', 'bob', .7], [420, 1820, 'blue3', null, .6]];
      [[280, 1420, 380], [760, 1460, 360], [280, 1740, 380]].forEach(([x, y, w]) => table(c, x, y, w));
      seated.forEach(([x, y, skin, fem, f], i) => { mascot(c, { id: 'g' + i, skin, fem, s: 1.5, x, y: y + 60, sit: 1, f, look: -.35, headTurn: .5 - f * .3, smile: .4, blink: blinkAt(t, 20 + i) }); });
      seated.forEach(([x, y], i) => qbubble(c, x + 40, y - 400, E(t, HIT.qs[i], .3, .55), 50)); });
  },
  curiosity(c, t) {   // sometimes curiosity is the first step to trying something new: the cloche lifts a crack, the steam asks, a hand reaches, the lid comes off
    const cr = ss(seg(t, HIT.crack2, HIT.crack2 + .5)), op = E(t, HIT.open, .45, .25), rh = ss(seg(t, HIT.reach, HIT.open));
    bg(c, t, { rays: cr * .6 + ss(seg(t, HIT.open, HIT.open + .5)), ry: 1150 });
    cam(c, 540, 1130, 1 + .1 * seg(t, 48.25, 53.2) + .15 * ss(seg(t, HIT.open, STORY)), 0, () => {
      ell(c, 540, 1330, 520, 110, '#4a321e'); ell(c, 540, 1320, 500, 100, '#6e4a2c');
      heroDish(c, 540, 1300, 620, { steam: cr, t, glow: op });
      leak(c, 540, 1290, 600, cr * (1 - Math.min(1, op)) + Math.min(1, op) * .8, t);
      const q = ss(seg(t, HIT.qsteam, HIT.qsteam + .8)); if (q > 0) { c.save(); c.globalAlpha = .75 * q * (1 - ss(seg(t, HIT.open, HIT.open + .4))); c.translate(560 + Math.sin(t * 1.5) * 12, lerp(1120, 860, q)); c.rotate(Math.sin(t * 1.2) * .08); text(c, '?', 0, 0, 260, CREAM, 'Caveat Brush'); c.restore(); }
      const lift = 60 * cr + op * 1500, hx = lerp(1300, 560, rh), hy = lerp(800, 1300 - 268 - 40, rh) - op * 1500;
      cloche(c, 540, 1300, 660, lift, cr * .12 + op * .4);
      if (rh > 0) { c.strokeStyle = '#2448bb'; c.lineCap = 'round'; c.lineWidth = 90; c.beginPath(); c.moveTo(hx + 700, hy - 300); c.lineTo(hx + 60, hy - 20); c.stroke(); ell(c, hx + 40, hy - 10, 62, 62, '#2a52c9'); } });
  },
};
function kitchenWin(c, t, shh, wink) {   // the chef in the serving window
  c.save(); c.beginPath(); c.rect(620, 540, 380, 380); c.clip(); c.fillStyle = '#1d2a6e'; c.fillRect(620, 540, 380, 380);
  const P = CHEF({ s: 1.9, x: 810, y: 1070, smile: .9, look: -.1, blink: wink || blinkAt(t, 30) * (t < HIT.wink2) });
  drawMascot(c, { ...P, shadow: false });
  if (shh > .6) { const Hh = Hs(1.9), mx = 810, my = 1070 - .76 * Hh + .32 * .225 * Hh; c.globalAlpha = ss((shh - .6) / .4); c.strokeStyle = '#eeeeea'; c.lineCap = 'round'; c.lineWidth = 16; c.beginPath(); c.moveTo(mx, my + 34); c.lineTo(mx, my - 26); c.stroke(); ell(c, mx + 4, my + 44, 26, 22, '#e2e3ea'); c.globalAlpha = 1; }
  c.restore(); c.fillStyle = '#e9dcc0'; c.fillRect(600, 900, 420, 40); heroDish(c, 700, 905, 150, { steam: .6, t });
}
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); }

// —— the locked 23 Team end card (ANIMATION-STYLE.md) ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();
function endCard(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  const u = ss(seg(t, STORY + .15, STORY + 1.05)), w = W * .30, h = w * LOGO.height / LOGO.width, sc = 1.04 - .04 * u;
  c.save(); c.globalAlpha = u * .75; c.filter = u < 1 ? `blur(${(1 - u) * 6 * K}px)` : 'none';
  c.translate(W / 2, H / 2); c.scale(sc, sc); c.drawImage(LOGO_W, -w / 2, -h / 2, w, h); c.restore();
}
function vignette(c) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H * .48, H * .3, W / 2, H * .5, H * .8); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, 'rgba(4,6,30,.4)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
const WHIP = .24, PUNCH = .26, CLOCK = .55;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'whip' && dt < WHIP && i > 0) {
    const e = ss(dt / WHIP), blur = Math.sin(e * Math.PI) * 26 * K;
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${blur}px)`; c.drawImage(bufA, -W * e, 0); c.drawImage(bufB, W * (1 - e), 0); c.restore();
  } else if (kind === 'punch' && dt < PUNCH && i > 0) {
    const e = 1 - Math.pow(1 - dt / PUNCH, 3), s = lerp(1.22, 1, e);
    paintShot(bctx, i, t); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.filter = `blur(${(1 - e) * 10 * K}px)`; c.drawImage(bufB, 0, 0); c.restore();
  } else if (kind === 'clock' && dt < CLOCK && i > 0) {   // a clock hand sweeps round and wipes in the new shot: one evening
    const e = ss(dt / CLOCK), a = -Math.PI / 2 + e * Math.PI * 2, cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t); c.drawImage(bufA, 0, 0);
    c.save(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, -Math.PI / 2, a); c.closePath(); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
    c.save(); c.strokeStyle = GOLD; c.lineCap = 'round'; c.lineWidth = 14 * K; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); c.fillStyle = GOLD; c.beginPath(); c.arc(cx, cy, 22 * K, 0, 7); c.fill(); c.restore();
  } else paintShot(c, i, t);
  vignette(c);
  const fade = ss(seg(t, STORY - .7, STORY)); if (fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits, plus the friends' footsteps as they come in
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
[35.15, 35.55, 35.95, 36.35].forEach((t0, i) => { for (let k = 1; k < 5; k++) EV.push({ t: +(t0 + k * 1.4 / 5).toFixed(3), type: 'step', who: i ? 'friend' : 'guest', pan: lerp(-.5, .2, k / 5) }); });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
