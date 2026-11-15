// Story 20, A két porszívó (The Product Comparison): a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, TS } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'LEGERŐSEBB ÚJ VS Ft?…'), document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const TOP = '#050916', NAVY = '#0f131e', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#050916';
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
const wob = (t, at, d = .5, f = 18, a = .05) => t > at && t < at + d * 3 ? a * Math.sin((t - at) * f) * Math.exp(-(t - at) / d * 2) : 0;

// —— small pieces ——
function glow(c, x, y, r, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(GLOW, x - r, y - r, 2 * r, 2 * r); c.restore(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
function spot(c, x, y, w, a = .35) { const g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, `rgba(0,0,20,${a})`); g.addColorStop(1, 'rgba(0,0,20,0)'); c.save(); c.translate(x, y); c.scale(1, .2); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w, 0, 7); c.fill(); c.restore(); }
function mascot(c, P, k = 1) { spot(c, P.x, P.y + 4, Hs(P.s) * .42); scaled(c, P.x, P.y, k, () => drawMascot(c, { ...P, shadow: false })); }
function text(c, s, x, y, size, col = CREAM, align = 'center') { c.font = `700 ${Math.round(size * .84)}px "Montserrat"`;   // Montserrat (has Ő and Ű), a little smaller as it is wider
  c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
function ell(c, x, y, rx, ry, col, rot = 0) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); c.fill(); }
// the stage: the part of the frame under the captions where the story plays; each shot names the box its content needs, and the camera fits that box inside the stage
const STAGE = { x0: 50, x1: 1030, y0: 760, y1: 1860 };   // the story plays under the caption area
const lerpBox = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
let NOW = 0; const KICK = () => (HIT.kicks || []).reduce((m, k) => NOW < k ? m : Math.max(m, Math.exp(-(NOW - k) * 6) * Math.sin(Math.min(1, (NOW - k) / .08) * Math.PI / 2)), 0);   // a quick punch-in of the camera on the key beats
function stage(c, box, push, f) { const [x0, y0, x1, y1] = box, z = Math.min((STAGE.x1 - STAGE.x0) / (x1 - x0), (STAGE.y1 - STAGE.y0) / (y1 - y0)) * (.96 + .04 * push) * (1 + .035 * KICK());
  c.save(); c.translate((STAGE.x0 + STAGE.x1) / 2, (STAGE.y0 + STAGE.y1) / 2); c.scale(z, z); c.translate(-(x0 + x1) / 2, -(y0 + y1) / 2); f(); c.restore(); }
function cam(c, x, y, z = 1, rot = 0, f) { c.save(); c.translate(540, 960); c.rotate(rot); c.scale(z, z); c.translate(-x, -y); f(); c.restore(); }
function star(c, x, y, r, k = 1, col = GOLD) { scaled(c, x, y, k, () => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }); }
function heart(c, x, y, r, k = 1, col = GOLD) { scaled(c, x, y, k, () => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.3, y, x - r * .8, y - r, x, y - r * .35); c.bezierCurveTo(x + r * .8, y - r, x + r * 1.3, y, x, y + r * .9); c.fill(); }); }
function bubble(c, x, y, w, h, k, tx, ty, draw, col = '#ffffff') { scaled(c, tx, ty, k, () => { c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, Math.min(60, h / 2)); c.fill();
  c.beginPath(); c.moveTo(x - w * .1, y + h / 2 - 4); c.lineTo(tx, ty); c.lineTo(x + w * .08, y + h / 2 - 4); c.fill(); draw && draw(); }); }
function check(c, x, y, r, k) { if (k <= 0) return; c.save(); c.strokeStyle = GOLD; c.lineWidth = r * .2; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, k)); c.stroke();
  c.globalAlpha = Math.min(1, k); c.beginPath(); c.moveTo(x - r * .42, y + r * .02); c.lineTo(x - r * .1, y + r * .34); c.lineTo(x + r * .45, y - r * .3); c.stroke(); c.restore(); }
function cross(c, x, y, r, k) { if (k <= 0) return; c.save(); c.strokeStyle = '#d94a3a'; c.lineCap = 'round'; c.lineWidth = r * .22; const u = Math.min(1, k * 2), v = clamp(k * 2 - 1);
  c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x - r + 2 * r * u, y - r + 2 * r * u); c.stroke(); if (v > 0) { c.beginPath(); c.moveTo(x + r, y - r); c.lineTo(x + r - 2 * r * v, y - r + 2 * r * v); c.stroke(); } c.restore(); }
function poof(c, x, y, k, r = 60) { if (k <= 0 || k >= 1) return; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, d = r * (.4 + k); ell(c, x + Math.cos(a) * d, y + Math.sin(a) * d, r * .3 * (1 - k), r * .3 * (1 - k), `rgba(246,239,220,${.7 * (1 - k)})`); } }

// —— small helpers ——
const KF = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i]; if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, ss((t - t0) / Math.max(1e-6, t1 - t0))); } } return keys[keys.length - 1][1]; };
function badge(c, kind, x, y, r, k = 1) {
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); const g = r * .55;
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, NAVY); if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (kind === 'x') { c.strokeStyle = '#c4566a'; c.lineWidth = g * .3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - g * .5, y - g * .5); c.lineTo(x + g * .5, y + g * .5); c.moveTo(x + g * .5, y - g * .5); c.lineTo(x - g * .5, y + g * .5); c.stroke(); }
    if (kind === 'bell') { c.fillStyle = GOLD2; c.beginPath(); c.moveTo(x - g * .7, y + g * .4); c.quadraticCurveTo(x - g * .6, y - g * .8, x, y - g * .8); c.quadraticCurveTo(x + g * .6, y - g * .8, x + g * .7, y + g * .4); c.closePath(); c.fill(); ell(c, x, y + g * .55, g * .18, g * .18, GOLD2); }
    if (kind === 'pin') { c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(x - g * .45, y - g * .7); c.lineTo(x + g * .45, y - g * .7); c.lineTo(x + g * .45, y + g * .7); c.lineTo(x, y + g * .35); c.lineTo(x - g * .45, y + g * .7); c.closePath(); c.fill(); } });
}
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
function bg(c, col = '#1a2138') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(-400, -400, 1880, 2720); }

// —— the world: two upright vacuums, a rug with crumbs, billboards, a phone ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', WOOD2 = '#a6744a', WOOD3 = '#6e4a2c', INKC = '#151018', ROSE = '#c4566a', ROSE2 = '#9b3f52', STEEL = '#8d97b8';
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
function floor(c) { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, '#0a1022'); fl.addColorStop(1, '#070b18'); c.fillStyle = fl; c.fillRect(-400, F, 1880, 420); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(-400, F, 1880, 4); }
// an upright vacuum standing on (x, y): o.ours = the small company's gold one, else the well-known rose one; o.run 0..1 hums it
function vacuum(c, x, y, s = 1, o = {}) { const body = o.ours ? GOLD : ROSE, dark = o.ours ? GOLD2 : ROSE2, run = o.run || 0, jig = run * 1.5 * Math.sin(NOW * 60);
  c.save(); c.translate(x, y + jig * .3); c.scale(s, s); c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.ellipse(0, 4, 95, 12, 0, 0, 7); c.fill();
  rrect(c, -86, -46, 172, 46, 18, dark); rrect(c, -86, -46, 172, 16, 8, body); rrect(c, -80, -12, 160, 10, 5, '#14161c');   // the head and its brush
  c.save(); c.translate(0, -40); c.rotate(-.18); rrect(c, -32, -250, 64, 220, 28, body); rrect(c, -22, -230, 44, 70, 18, 'rgba(255,255,255,.5)'); rrect(c, -22, -150, 44, 10, 5, dark); rrect(c, -8, -380, 16, 140, 8, STEEL); rrect(c, -40, -398, 80, 26, 13, '#14161c'); c.restore();
  if (o.ours) { ell(c, 0, -27, 9, 9, NAVY); } else star(c, 0, -27, 11, 1, '#ffffff');
  c.restore(); }
function rug(c, x, y, w, h = 120) { c.save(); rrect(c, x - w / 2, y - h / 2, w, h, 14, '#3d5cc8'); c.strokeStyle = SAND; c.lineWidth = 6; c.beginPath(); c.roundRect(x - w / 2 + 14, y - h / 2 + 12, w - 28, h - 24, 8); c.stroke(); c.fillStyle = SAND; for (let i = 0; i < 14; i++) { c.fillRect(x - w / 2 - 14, y - h / 2 + 8 + i * (h - 16) / 13, 14, 3); c.fillRect(x + w / 2, y - h / 2 + 8 + i * (h - 16) / 13, 14, 3); } c.restore(); }
const CRUMBS = Array.from({ length: 70 }, (_, i) => [hash(i * 3.1), hash(i * 7.7 + 2), 4 + hash(i + 11) * 7, hash(i * 1.3 + 5)]);
function crumbs(c, x0, x1, y0, y1, k, gone) { for (const [u, v, r, h] of CRUMBS) { const x = lerp(x0, x1, u), y = lerp(y0, y1, v), a = clamp(k * 3 - u * 2); if (a <= 0 || gone(x, h)) continue; c.save(); c.globalAlpha = a; ell(c, x, y, r, r * .7, h > .5 ? '#7a5233' : '#b5a682'); c.restore(); } }
function billboard(c, x, y, w, h, k, draw) { if (k <= 0) return; pop(c, x, y + h / 2 + 260, k, () => { rrect(c, x - w * .3 - 9, y + h / 2, 18, 260, 4, '#181f35'); rrect(c, x + w * .3 - 9, y + h / 2, 18, 260, 4, '#181f35'); c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 12, w, h, 16); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 16, '#f6efdc'); rrect(c, x - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20, 10, '#141b2f'); draw(); }); }
function word(c, s, x, y, size, col = CREAM, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; text(c, s, x, y, size, col); c.restore(); }
function coins(c, x, y, n, k) { for (let i = 0; i < n; i++) { const a = clamp(k * n - i); if (a <= 0) continue; const yy = y - i * 16 - (1 - ease(a)) * 60; c.save(); c.globalAlpha = Math.min(1, a * 2); ell(c, x, yy + 6, 46, 14, GOLD2); ell(c, x, yy, 46, 14, GOLD); c.restore(); } }
function moneyBag(c, x, y, s, k) { pop(c, x, y, k, () => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = SAND2; c.beginPath(); c.moveTo(-26, -96); c.lineTo(26, -96); c.lineTo(16, -74); c.bezierCurveTo(80, -50, 82, 0, 60, 0); c.lineTo(-60, 0); c.bezierCurveTo(-82, 0, -80, -50, -16, -74); c.closePath(); c.fill(); rrect(c, -22, -82, 44, 10, 5, GOLD2); text(c, 'Ft', 0, -34, 46, NAVY); c.restore(); }); }
function phone(c, x, y, w, h, draw) { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 12, w, h, 34); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 34, '#0d0f16'); rrect(c, x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24, '#181f35'); c.save(); c.beginPath(); c.roundRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24); c.clip(); draw(); c.restore(); rrect(c, x - 30, y - h / 2 + 22, 60, 12, 6, '#0d0f16'); }
function iconNote(c, x, y, r) { c.fillStyle = CREAM; ell(c, x - r * .35, y + r * .45, r * .3, r * .24, CREAM, -.4); ell(c, x + r * .4, y + r * .3, r * .3, r * .24, CREAM, -.4); c.fillRect(x - r * .12, y - r * .6, r * .1, r * 1.05); c.fillRect(x + r * .63, y - r * .75, r * .1, r * 1.05); c.beginPath(); c.moveTo(x - r * .12, y - r * .6); c.lineTo(x + r * .73, y - r * .75); c.lineTo(x + r * .73, y - r * .5); c.lineTo(x - r * .12, y - r * .35); c.fill(); }
function iconCard(c, x, y, r, k, cut, draw) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, '#181f35'); c.strokeStyle = CREAM; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r - 6, 0, 7); c.stroke(); draw(); cross(c, x, y, r * .62, cut); }); }
function eyeB(c, x, y, r, k) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - r * .72, y); c.quadraticCurveTo(x, y - r * .66, x + r * .72, y); c.quadraticCurveTo(x, y + r * .66, x - r * .72, y); c.fill(); ell(c, x, y, r * .27, r * .27, CREAM); ell(c, x, y, r * .13, r * .13, GOLD); }); }
function earB(c, x, y, r, k, cut) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = NAVY; c.lineWidth = r * .14; c.lineCap = 'round'; c.beginPath(); c.arc(x + r * .02, y - r * .12, r * .38, Math.PI * .95, Math.PI * 2.3); c.quadraticCurveTo(x + r * .2, y + r * .35, x - r * .05, y + r * .5); c.stroke(); c.beginPath(); c.arc(x + r * .02, y - r * .1, r * .14, Math.PI, Math.PI * 2.2); c.stroke(); cross(c, x, y, r * .62, cut); }); }
function bulbIcon(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, r * 3, .7); ell(c, x, y, r, r, '#ffd889'); rrect(c, x - r * .45, y + r * .8, r * .9, r * .5, r * .15, SAND2); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y + r * .2); c.lineTo(x, y - r * .25); c.lineTo(x + r * .3, y + r * .2); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); c.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); c.stroke(); } }); }
// the people: the marketing manager is white; customers and colleagues are blue
function boss(c, t, x, y, s, o = {}) { mascot(c, { id: 'mk', skin: 'owner', s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi || 0, handL: o.handL, handR: o.handR, squash: o.squash || 0, bowtie: true }); }
const CUST = [{ skin: 'blue2', fem: 'pony' }, { skin: 'blue1' }, { skin: 'blue3', fem: 'glasses' }, { skin: 'blue1', tache: true }];
function cust(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'c' + k, ...CUST[k % 4], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0 }); }
function phoneInHand(c, x, y, s, f) { const hx = x + f * 46 * s, hy = y - 150 * s; rrect(c, hx - 14 * s, hy - 24 * s, 28 * s, 46 * s, 6 * s, '#0d0f16'); rrect(c, hx - 10 * s, hy - 20 * s, 20 * s, 36 * s, 4 * s, '#9fc7f0'); return [hx, hy + 10 * s]; }
// the test: one rug, two halves; each vacuum runs over its own half; the gold one takes every crumb, the rose one leaves some
function testRig(c, t, o) { c.save(); c.translate(540, 1700); c.scale(.82, .82); c.translate(-540, -1700); testRig0(c, t, o); c.restore(); }
function testRig0(c, t, o) { const L = [130, 520], R = [560, 950], y0 = 1560, y1 = 1690;
  rug(c, 540, 1625, 860, 170); c.fillStyle = 'rgba(246,239,220,.5)'; c.fillRect(538, 1546, 4, 158);
  const u = o.run, xs = x0 => lerp(x0[0] + 60, x0[1] - 100, u);
  crumbs(c, L[0] + 30, L[1] - 30, y0, y1, o.dirt, (x, h) => u > 0 && x < xs(L) + 100);
  crumbs(c, R[0] + 30, R[1] - 30, y0, y1, o.dirt, (x, h) => u > 0 && x < xs(R) + 100 && h < .45);
  if (o.clean > 0) { glow(c, 330, 1620, 260, .45 * o.clean); spark(c, 330, 1600, NOW, o.cleanAt, 6, 160, 16); }
  const vx = k => xs(k ? R : L);
  vacuum(c, vx(0), 1640, 1.25, { ours: true, run: o.running }); vacuum(c, vx(1), 1640, 1.25, { run: o.running }); }

const SHOT = {
  intro(c, t) {   // v3 (user 2026-11-15: clearer, more alive): a little garage workshop; the owner tightens the last screw, switches the new vacuum on, it sucks up the crumbs, an „ÚJ!” sticker slaps on, he jumps for joy
    bg(c, '#0d2463'); floor(c); const H = HIT;
    rrect(c, 110, 960, 860, 740, 22, '#141a2e'); for (let k = 0; k < 6; k++) rrect(c, 150 + k * 140, 1000, 6, 360, 3, '#1b2340');   // the garage's back wall
    [[240, 1080, 'w'], [360, 1060, 'h'], [480, 1090, 's']].forEach(([x, y, k]) => { c.fillStyle = '#2a3354'; if (k === 'w') { rrect(c, x - 8, y - 50, 16, 100, 6, '#2a3354'); ell(c, x, y - 52, 22, 18, '#2a3354'); } if (k === 'h') { rrect(c, x - 6, y - 40, 12, 110, 5, '#2a3354'); rrect(c, x - 36, y - 56, 72, 26, 6, '#2a3354'); } if (k === 's') { rrect(c, x - 5, y - 50, 10, 70, 4, '#2a3354'); rrect(c, x - 13, y + 18, 26, 44, 8, '#2a3354'); } });   // tools on the wall
    const lampOn = .6 + .4 * ss(seg(t, .1, .5)); c.save(); c.globalAlpha = lampOn * .5; const cg = c.createLinearGradient(0, 1010, 0, 1470); cg.addColorStop(0, 'rgba(255,230,170,.0)'); cg.addColorStop(1, 'rgba(255,230,170,.45)'); c.fillStyle = cg; c.beginPath(); c.moveTo(610, 1010); c.lineTo(690, 1010); c.lineTo(900, 1470); c.lineTo(400, 1470); c.closePath(); c.fill(); c.restore();
    rrect(c, 646, 960, 8, 40, 3, '#0d1220'); c.fillStyle = '#2c3658'; c.beginPath(); c.ellipse(650, 1010, 46, 22, 0, Math.PI, 0); c.fill(); ell(c, 650, 1012, 18, 7, '#ffe6a8');   // the lamp
    rrect(c, 330, 1470, 600, 34, 8, WOOD); rrect(c, 350, 1504, 22, 196, 6, WOOD3); rrect(c, 888, 1504, 22, 196, 6, WOOD3);   // the workbench
    const run = t > 1.85 && t < 2.5 ? 1 : 0;
    vacuum(c, 680, 1470, 1.05, { ours: true, run });
    for (let k = 0; k < 6; k++) { const x0 = 760 + k * 24, u = ss(seg(t, 1.9 + k * .05, 2.25 + k * .05)); if (u >= 1) continue; ell(c, lerp(x0, 700, u), 1464 - 3 * (k % 2), 6 * (1 - u * .6), 5 * (1 - u * .6), '#c9a46a'); }   // crumbs sucked up
    const screw = t < 1.75, hp = screw ? [610, 1300 + 6 * Math.sin(t * 22)] : (t < 1.95 ? [640, 1360] : undefined);
    const jump = E(t, H.unveil + .05, .35, .5), jy = t > H.unveil ? -40 * Math.sin(clamp((t - H.unveil) / .5) * Math.PI) : 0;
    boss(c, t, 470, F + jy, 1.55, { f: .5, look: .25, smile: t > H.unveil ? 1 : .75, handR: hp, squash: wob(t, H.unveil, .4, 18, .5) });
    if (screw) { c.save(); c.translate(hp[0], hp[1]); c.rotate(-.6 + .25 * Math.sin(t * 22)); rrect(c, -8, -10, 16, 46, 6, '#d94a3a'); rrect(c, -3, -48, 6, 40, 3, STEEL); c.restore(); }   // the screwdriver
    if (t > H.unveil) { spark(c, 700, 1240, t, H.unveil, 7, 200, 18); pop(c, 760, 1210, E(t, H.unveil, .3, .5), () => { c.save(); c.translate(760, 1210); c.rotate(-.12); rrect(c, -78, -36, 156, 72, 16, GOLD); text(c, 'ÚJ!', 0, 2, 52, NAVY); c.restore(); }); }
  },
  rivals(c, t) {   // v3: three giant towers shoot up around the tiny garage; money rains on them; their billboards show off: a muscle vacuum (strongest), a rocket vacuum (fastest), a crowned vacuum (best); the owner looks up, worried
    bg(c, '#0d2463'); floor(c); const H = HIT;
    const TW = [[195, H.boards], [540, H.boards + .15], [885, H.boards + .3]];
    TW.forEach(([x, at], i) => { const k = Math.min(1, E(t, at, .45, .3)); if (k <= 0) return; const top = 820 + (i === 1 ? -60 : 0), h = (F - top) * k;
      rrect(c, x - 140, F - h, 280, h, 10, '#1a2140'); for (let r = 0; r < 7; r++) for (let q = 0; q < 3; q++) { const wy = F - h + 330 + r * 70; if (wy < F - 40) rrect(c, x - 100 + q * 75, wy, 44, 36, 4, hash(i * 30 + r * 3 + q) > .45 ? '#ffd889' : '#262e52'); } });
    // the money pours down on the towers
    if (t > H.money) for (let k = 0; k < 26; k++) { const st = H.money + hash(k) * 1.6, u = (t - st) / .9; if (u < 0 || u > 1) continue; const x = [195, 540, 885][k % 3] + (hash(k + 9) - .5) * 220, y = lerp(560, 860, u * u); ell(c, x, y + 4, 22, 8, GOLD2); ell(c, x, y, 22, 8, GOLD); }
    moneyBag(c, 120, F, 1.0, E(t, H.money + .4, .35, .5)); moneyBag(c, 960, F, 1.1, E(t, H.money + .7, .35, .5));
    // the billboards on the towers, each with its show-off gag
    const BB = [[195, 1000, 'LEGERŐSEBB', 'muscle'], [540, 940, 'LEGGYORSABB', 'rocket'], [885, 1000, 'LEGJOBB', 'crown']];
    BB.forEach(([x, y, s, gag], i) => { const k = E(t, 7.2 + i * .25, .35, .45); if (k <= 0) return; pop(c, x, y, k, () => {
      rrect(c, x - 125, y - 125, 250, 250, 14, CREAM); rrect(c, x - 115, y - 115, 230, 230, 10, '#141b2f');
      const cl = E(t, H.claims[i], .3, .55), vy = y + 95;
      if (gag === 'rocket' && cl > 0) { for (let q = 0; q < 4; q++) { c.save(); c.globalAlpha = .7; rrect(c, x - 110 + ((t * 600 + q * 60) % 90), vy - 120 + q * 22, 40, 6, 3, '#9fc7f0'); c.restore(); } c.save(); c.globalAlpha = .9; ell(c, x - 40, vy - 30, 24 + 6 * Math.sin(t * 40), 12, '#ff9a3c'); c.restore(); }
      c.save(); if (gag === 'rocket' && cl > 0) { c.translate(x, vy); c.rotate(.35); c.translate(-x, -vy); } vacuum(c, x, vy, .3); c.restore();
      if (gag === 'muscle' && cl > 0) { const pump = Math.abs(Math.sin(t * 7)); for (const sd of [-1, 1]) { const sx = x + sd * 10, sy = vy - 75, ex = x + sd * 52, ey = vy - 75; c.strokeStyle = ROSE2; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(ex, ey - 34); c.stroke(); ell(c, x + sd * 34, sy - 10 - 4 * pump, 12 + 5 * pump, 10 + 4 * pump, ROSE); } }
      if (gag === 'crown' && cl > 0) { c.save(); c.translate(x - 12, vy - 128); c.fillStyle = GOLD; c.beginPath(); c.moveTo(-26, 12); c.lineTo(-30, -14); c.lineTo(-12, 0); c.lineTo(0, -20); c.lineTo(12, 0); c.lineTo(30, -14); c.lineTo(26, 12); c.closePath(); c.fill(); c.restore(); spark(c, x, vy - 60, t, H.claims[i], 5, 80, 10); }
      if (cl > 0) scaled(c, x, y - 82, Math.min(1.15, cl), () => text(c, s, x, y - 80, s.length > 8 ? 34 : 46, GOLD)); }); });
    // the tiny garage in front, the owner looks up, worried
    rrect(c, 440, F - 170, 200, 170, 10, '#2a3354'); c.fillStyle = '#323c66'; c.beginPath(); c.moveTo(425, F - 165); c.lineTo(540, F - 235); c.lineTo(655, F - 165); c.closePath(); c.fill(); rrect(c, 505, F - 100, 70, 100, 6, '#141a2e');
    vacuum(c, 610, F, .42, { ours: true }); boss(c, t, 470, F, .85, { f: .4, look: -1, smile: .1, sad: .5 });
  },
  copy(c, t) {   // v3: at first they copy the giants: the owner makes his own cardboard sign „MI IS!” (us too!) and proudly holds it up; a giant billboard slides in behind and makes it tiny; the wind bends it
    bg(c, '#0d2463'); floor(c); const H = HIT;
    const giant = ease(seg(t, 14.75, 15.45)); if (giant > 0) { c.save(); c.translate(0, -700 * (1 - giant)); rrect(c, 120, 760, 840, 470, 18, CREAM); rrect(c, 140, 780, 800, 430, 12, '#141b2f'); vacuum(c, 330, 1180, .7); text(c, 'LEGJOBB!', 680, 990, 96, GOLD); rrect(c, 300, 1230, 24, 470, 6, '#181f35'); rrect(c, 756, 1230, 24, 470, 6, '#181f35'); c.restore(); }
    const d = seg(t, 12.0, 14.3), wind = t > 15.4 ? .22 * Math.sin((t - 15.4) * 7) * Math.exp(-(t - 15.4) * 1.2) + .1 : 0, hold = ease(seg(t, 14.3, 14.75));
    const sx = lerp(620, 520, hold), sy = lerp(1500, 1230, hold);   // the cardboard sign: drawn on the table, then held up high
    rrect(c, 560, 1520, 400, 26, 8, WOOD); rrect(c, 590, 1546, 18, 154, 5, WOOD3); rrect(c, 912, 1546, 18, 154, 5, WOOD3);
    c.save(); c.translate(sx, sy); c.rotate(wind); rrect(c, -8, 40, 16, 210 * hold, 4, WOOD3); rrect(c, -130, -85, 260, 150, 10, '#d9b98a'); rrect(c, -122, -77, 244, 134, 8, '#e8cfa2');
    if (d > 0) { c.save(); c.beginPath(); c.rect(-122, -77, 244 * clamp(d * 1.3), 134); c.clip(); vacuum(c, -75, 50, .3, { ours: true }); text(c, 'MI IS!', 40, -8, 50, NAVY); c.restore(); } c.restore();
    const pen = d > 0 && d < 1 ? [sx - 100 + 220 * ((Math.sin(t * 6) + 1) / 2), sy - 10 + 20 * Math.sin(t * 11)] : (hold > 0 ? [sx - 10, sy + 70] : undefined);
    boss(c, t, 400, F, 1.5, { f: .5, look: giant > .5 ? -.9 : .2, smile: giant > .5 ? .1 : .85, sad: giant > .5 ? .5 : 0, handR: pen });
    check(c, 400, 1110, 40, E(t, H.decide1, .45, .2) * (1 - ss(seg(t, 13.9, 14.2))));
    if (giant > .9) for (let k = 0; k < 2; k++) { const u = ((t * 1.4 + k * .5) % 1); c.save(); c.globalAlpha = Math.sin(u * Math.PI); c.fillStyle = '#a8dcff'; const dx = 430 + k * 30, dy = 1290 + 50 * u * u; c.beginPath(); c.moveTo(dx, dy - 12); c.quadraticCurveTo(dx + 8, dy, dx, dy + 6); c.quadraticCurveTo(dx - 8, dy, dx, dy - 12); c.fill(); c.restore(); }   // a drop of sweat
  },
  ignore(c, t) {   // v3: shoppers walk by with big headphones, eyes on their phones; the billboards fire their claims at them and the words bounce off and fall; the marketing manager (glasses, clipboard) watches and has a „!” moment; a shopper yawns; the words crumble
    bg(c, '#0d2463'); floor(c); const H = HIT;
    [[230, 960, 'LEGJOBB'], [850, 960, 'LEGGYORSABB']].forEach(([x, y, s]) => billboard(c, x, y, 330, 200, 1, () => { vacuum(c, x - 95, y + 80, .25); text(c, s, x + 30, y - 10, s.length > 8 ? 32 : 46, GOLD); }));
    const WORDS2 = ['LEGJOBB!', 'LEGERŐSEBB!', 'LEGGYORSABB!', 'LEGJOBB!', 'SZUPER!', 'LEGJOBB!'];
    for (let k = 0; k < 6; k++) { const st = 16.9 + k * .62, u = seg(t, st, st + 1.25); if (u <= 0 || u >= 1) continue; const from = k % 2 ? [850, 1080] : [230, 1080], hitX = 360 + ((k * 170) % 420), hitY = 1360;
      let x, y, rot = 0, a = 1; if (u < .45) { const v = u / .45; x = lerp(from[0], hitX, v); y = lerp(from[1], hitY, v) - 120 * Math.sin(v * Math.PI); } else { const v = (u - .45) / .55; x = hitX + (k % 2 ? 80 : -80) * v; y = hitY + 340 * v * v - 60 * Math.sin(v * Math.PI); rot = (k % 2 ? 1 : -1) * 2.5 * v; a = t > 20.5 ? 1 - seg(t, 20.5, 21.2) : 1; }
      c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); text(c, WORDS2[k], 0, 0, 40, GOLD); c.restore(); }
    for (let k = 0; k < 3; k++) { const x = 400 + k * 210 + (t - 16.5) * 22; const yawn = k === 1 && t > H.noone && t < H.noone + 1.0;
      const ph = phoneInHand(c, x, F, 1.3, .45); cust(c, t, k, x, F, 1.3, { f: .45, walk: 1, look: .6, smile: yawn ? 0 : .4, handR: ph }); phoneInHand(c, x, F, 1.3, .45);
      const Hh = 210 * 1.3 * 1.08, hy = F - .76 * Hh, R = .225 * Hh; c.save(); c.strokeStyle = '#1c1f2a'; c.lineWidth = 12; c.beginPath(); c.arc(x, hy, R * 1.08, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); for (const sd of [-1, 1]) rrect(c, x + sd * R * 1.02 - 14, hy - 22, 28, 48, 12, '#d94a3a'); c.restore();   // big headphones
      if (yawn) { c.save(); c.globalAlpha = Math.sin(seg(t, H.noone, H.noone + 1) * Math.PI); ell(c, x + 16, hy + R * .45, 14, 20, '#3a1a20'); c.restore(); } }
    const mk = E(t, 17.2, .35, .45); if (mk > 0) { const mx = 130, s = 1.45; scaled(c, mx, F, Math.min(1.1, mk), () => { mascot(c, { id: 'mgr', skin: 'blue2', specs: true, s, x: mx, y: F, f: .55, look: t > H.notice ? -.6 : .2, smile: t > H.notice ? .1 : .6, o: t > H.notice && t < H.notice + .8 ? .7 : 0, blink: blinkAt(t, 11), handR: [mx + 60, F - 170] }); rrect(c, mx + 40, F - 210, 56, 74, 6, '#e8e2d0'); rrect(c, mx + 52, F - 222, 32, 14, 4, STEEL); });
      pop(c, mx + 40, F - 420, E(t, H.notice, .3, .5), () => { ell(c, mx + 44, F - 412, 42, 42, 'rgba(0,0,20,.3)'); ell(c, mx + 40, F - 420, 42, 42, GOLD); text(c, '!', mx + 40, F - 418, 60, NAVY); }); }
  },
  idea(c, t) {   // so he came up with a strange idea: a close-up, the bulb
    bg(c, '#0d2463'); floor(c); const H = HIT; const z = 1 + .06 * ss(seg(t, 21.6, 24.3)); c.save(); c.translate(540, 1700); c.scale(z, z); c.translate(-540, -1700);
    boss(c, t, 540, F, 2.3, { f: .1, look: lerp(-.3, .3, ss(seg(t, H.idea - .5, H.idea))), smile: lerp(.6, 1, ss(seg(t, H.idea, H.idea + .3))), squash: wob(t, H.idea, .4, 18, .6) });
    bulbIcon(c, 540, 1010, 60, E(t, H.idea, .3, .5)); c.restore();
  },
  pair(c, t) {   // instead of a usual ad: the billboard slides away; two vacuums are set side by side: theirs, gold, and a well-known one, rose
    bg(c, '#0d2463'); floor(c); const H = HIT;
    const gone = ease(seg(t, H.instead + .55, H.instead + 1.0)); if (gone < 1) { billboard(c, 540 - 900 * gone, 1080, 460, 240, 1, () => { vacuum(c, 400 - 900 * gone, 1170, .42); text(c, 'LEGJOBB', 600 - 900 * gone, 1084, 56, GOLD); }); cross(c, 540 - 900 * gone, 1200, 120, seg(t, H.instead - .1, H.instead + .35)); }
    rrect(c, 140, 1640, 800, 60, 12, SAND2);
    pop(c, 340, F - 60, E(t, H.instead + .9, .35, .45), () => vacuum(c, 340, F - 60, 1.45, { ours: true }));
    pop(c, 740, F - 60, E(t, H.instead + 1.1, .35, .45), () => vacuum(c, 740, F - 60, 1.45));
    pop(c, 340, 1100, E(t, H.ours, .3, .5), () => { ell(c, 344, 1108, 54, 54, 'rgba(0,0,20,.3)'); ell(c, 340, 1100, 54, 54, CREAM); heart(c, 340, 1104, 28, 1, GOLD2); });
    pop(c, 740, 1100, E(t, H.known, .3, .5), () => { ell(c, 744, 1108, 54, 54, 'rgba(0,0,20,.3)'); ell(c, 740, 1100, 54, 54, CREAM); star(c, 740, 1102, 30, 1, ROSE); });
    if (t > H.pair) glow(c, 540, 1500, 380, .15);
  },
  test(c, t) {   // the same rug, crumbs on both halves; both run; no words, just the result: the gold half is spotless, crumbs stay on the rose half. People watch with their own eyes
    bg(c, '#0d2463'); floor(c); const H = HIT;
    const run = ss(seg(t, H.run, H.run + 1.8)), running = run > 0 && run < 1 ? 1 : 0;
    testRig(c, t, { dirt: seg(t, H.rug - .1, H.rug + .6), run, running, clean: ss(seg(t, H.result, H.result + .4)), cleanAt: H.result });
    // the watchers, behind the rug
    for (let k = 0; k < 2; k++) { const a = E(t, H.eyes - .5 + k * .15, .35, .45), x = [170, 910][k]; if (a > 0) scaled(c, x, F, Math.min(1, a), () => cust(c, t, k, x, F, 1.15, { f: k ? -.4 : .4, look: (k ? -1 : 1) * (.2 + .25 * Math.sin(t * 3 + k)), smile: .9 })); }
    eyeB(c, 540, 1080, 58, E(t, H.eyes, .3, .5) * (1 - ss(seg(t, 40.7, 41.0))));
    if (t > H.result) { pop(c, 330, 1260, E(t, H.result, .3, .5), () => check(c, 330, 1260, 44, 1)); pop(c, 750, 1260, E(t, H.result + .2, .3, .5), () => badge(c, 'x', 750, 1260, 44, 1)); }
  },
  simple(c, t) {   // the ad was very simple: no exciting music, no famous actor, no strange promises; just two products, side by side, compared
    bg(c, '#0d2463'); floor(c); const H = HIT;
    // the ad: a screen
    const sk = E(t, 41.1, .35, .45); pop(c, 540, 1460, sk, () => { rrect(c, 160, 1240, 760, 440, 26, '#0d0f16'); rrect(c, 180, 1260, 720, 400, 16, '#141b2f'); rrect(c, 480, 1680, 120, 20, 6, '#0d0f16');
      const hi = ss(seg(t, H.two - .2, H.two + .3)); vacuum(c, 380, 1620, .75 + .05 * hi, { ours: true }); vacuum(c, 700, 1620, .75 + .05 * hi);
      const vs = E(t, H.compare - .2, .3, .55); if (vs > 0) scaled(c, 540, 1460, Math.min(1.15, vs), () => { ell(c, 540, 1460, 50, 50, CREAM); text(c, 'VS', 540, 1464, 40, NAVY); }); });
    iconCard(c, 260, 1080, 70, E(t, H.music - .2, .3, .5), seg(t, H.music + .1, H.music + .5), () => iconNote(c, 260, 1080, 46));
    iconCard(c, 540, 1080, 70, E(t, H.actor - .2, .3, .5), seg(t, H.actor + .1, H.actor + .5), () => star(c, 540, 1082, 38, 1, GOLD));
    iconCard(c, 820, 1080, 70, E(t, H.promise - .2, .3, .5), seg(t, H.promise + .1, H.promise + .5), () => text(c, '!', 820, 1084, 72, GOLD));
  },
  viral(c, t) {   // the video got huge attention: a phone with the test, hearts and comments flying, the count rolling up; people didn't hear it, they saw it
    bg(c, '#0d2463'); floor(c); const H = HIT;
    phone(c, 540, 1380, 380, 620, () => { const s = .5; c.save(); c.translate(540, 1280); c.scale(s, s); c.translate(-540, -1625); rug(c, 540, 1625, 860, 170); vacuum(c, 330, 1640, 1.25, { ours: true }); vacuum(c, 750, 1640, 1.25); crumbs(c, 590, 920, 1560, 1690, 1, (x, h) => h < .45); c.restore();
      const n = Math.floor(lerp(0, 980, ease(seg(t, H.views - .3, H.views + 2.4)))); rrect(c, 380, 1480, 320, 60, 30, 'rgba(0,0,20,.35)'); text(c, (n >= 1000 ? '1M' : n + 'K') + '  ♥', 540, 1512, 40, CREAM); });
    for (let k = 0; k < 12; k++) { const at = H.views + k * .3, u = seg(t, at, at + 1.6); if (u <= 0 || u >= 1) continue; const x = 540 + (hash(k) - .5) * 520 + Math.sin(u * 6 + k) * 30, y = 1500 - u * 520; heart(c, x, y, 18 + hash(k + 3) * 16, Math.sin(u * Math.PI) * 1.2, k % 3 ? ROSE : GOLD); }
    earB(c, 220, 1120, 62, E(t, H.heard - .1, .3, .5), seg(t, H.heard + .2, H.heard + .6)); eyeB(c, 860, 1120, 62, E(t, H.saw - .1, .3, .5)); check(c, 860, 1230, 30, E(t, H.saw + .2, .45, .2));
    cust(c, t, 0, 175, F, 1.3, { f: .4, look: .3, smile: 1 }); cust(c, t, 2, 905, F, 1.3, { f: -.4, look: -.3, smile: 1 });
  },
  lesson(c, t) {   // the lesson: you don't have to tell them why it's better; set it up so they see the difference themselves
    bg(c, '#0d2463'); floor(c); const H = HIT; const show = ss(seg(t, H.enough - .2, H.enough + .5));
    // first the manager, explaining with a full bubble of words, which gets crossed out
    const tell = 1 - show; if (tell > 0) { c.save(); c.globalAlpha = tell; boss(c, t, 300, F, 1.7, { f: .4, look: .2, smile: .9 }); bulbIcon(c, 300, 1100, 40, E(t, H.important, .3, .5) * (1 - ss(seg(t, H.tell - .4, H.tell)))); const b = E(t, H.tell, .3, .5); if (b > 0) bubble(c, 680, 1170, 380, 170, Math.min(1.1, b), 430, 1330, () => { for (let i = 0; i < 3; i++) rrect(c, 520, 1120 + i * 40, 320 - i * 60, 18, 9, SAND3); cross(c, 680, 1170, 60, seg(t, H.why, H.why + .5)); }); c.restore(); }
    // then the test, seen by a customer, who sees the difference
    if (show > 0) { c.save(); c.globalAlpha = show; testRig(c, t, { dirt: 1, run: 1, running: 0, clean: ss(seg(t, H.see - .3, H.see + .3)), cleanAt: H.see }); cust(c, t, 0, 540, 1578, 1.25, { f: 0, look: Math.sin(t * 2.5) * .5, smile: lerp(.8, 1, ss(seg(t, H.see, H.see + .3))) });
      eyeB(c, 540, 1120, 58, E(t, H.see - .2, .3, .5)); if (t > H.see) spark(c, 540, 1120, t, H.see, 7, 130, 16); c.restore(); }
  },
};
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.06, 1.06); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['porszívógyártó','legerősebb','leggyorsabb','legjobb','furcsa','két','szőnyegen','szemükkel','egyszerű','összehasonlítás','látták','különbséget']);
const bare = w => w.replace(/[.,:;!?…„”"]/g, '');
const CAP = { x: 130, y: 540, size: 50, lh: 64, maxW: 790, maxLines: 2 }, CAPFONT = `700 ${CAP.size}px "Montserrat"`;   // the caption area, placed for Instagram's preview: Montserrat Bold, two lines at most
const PAGES = (() => {   // group the words into short pages: a new page after a full stop, a question, a colon, or once a page is full
  const m = document.createElement('canvas').getContext('2d'); m.font = CAPFONT; const space = m.measureText(' ').width;
  const pages = []; let cur = [], x = 0, line = 0;
  const flush = () => { if (cur.length) pages.push(cur); cur = []; x = 0; line = 0; };
  WORDS.forEach(([w, t0], i) => { const wd = m.measureText(w).width;
    if (x > 0 && x + space + wd > CAP.maxW) { line++; x = 0; if (line >= CAP.maxLines) flush(); }
    cur.push({ w, t: t0, x: x ? x + space : 0, line, wd, key: KEY.has(bare(w)) }); x = (x ? x + space : 0) + wd;
    const prev = WORDS[i + 1]; if (/[.?!:…”]$/.test(w) || (/,$/.test(w) && cur.length >= 4) || cur.length >= 7 || (prev && prev[1] - t0 > 1.1)) flush(); });
  flush(); return pages.map((p, i) => ({ words: p, t0: p[0].t - .05, t1: pages[i + 1] ? pages[i + 1][0].t - .05 : STORY - .5 }));
})();
function captions(c, t) {
  c.setTransform(K, 0, 0, K, 0, 0);
  // behind the words, plain: the same blue as the top of every scene, fading into the picture
  c.fillStyle = TOP; c.fillRect(0, 0, 1080, 660); const g = c.createLinearGradient(0, 660, 0, 760); g.addColorStop(0, TOP); g.addColorStop(1, 'rgba(0,17,63,0)'); c.fillStyle = g; c.fillRect(0, 660, 1080, 100);
  const p = PAGES.find(p => t >= p.t0 && t < p.t1); if (!p) return;
  const out = ss(seg(t, p.t1 - .12, p.t1)), now = p.words.filter(w => t >= w.t - .02).pop();
  c.save(); c.globalAlpha = 1 - out; c.translate(0, -30 * out); c.font = CAPFONT; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  p.words.forEach(w => { const k = E(t, w.t - .06, .28, .45); if (k <= 0) return; const a = Math.min(1, k * 2.2), y = CAP.y + w.line * CAP.lh + (1 - Math.min(1, k)) * 34, sc = .75 + .25 * k, cx = CAP.x + w.x + w.wd / 2;
    const hot = w === now, col = hot || w.key ? '#2ED3C6' : CREAM;   // dark story world: turquoise key words
    c.save(); c.globalAlpha = a * (1 - out); c.translate(cx, y); c.scale(sc, sc); c.translate(-cx, -y);
    c.shadowColor = 'rgba(0,0,15,.6)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.fillStyle = col; c.fillText(w.w, CAP.x + w.x, y); c.shadowColor = 'transparent';
    c.restore(); });
  c.restore();
}

// —— the locked 23 Team end card (ANIMATION-STYLE.md) ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#F4F7FF'; x.fillRect(0, 0, c.width, c.height); return c; })();
function endCard(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  const u = ss(seg(t, STORY + .15, STORY + 1.05)), w = W * .30, h = w * LOGO.height / LOGO.width, sc = 1.04 - .04 * u;
  c.save(); c.globalAlpha = u * .75; c.filter = u < 1 ? `blur(${(1 - u) * 6 * K}px)` : 'none';
  c.translate(W / 2, H / 2); c.scale(sc, sc); c.drawImage(LOGO_W, -w / 2, -h / 2, w, h); c.restore();
}
function vignette(c) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H * .5, H * .3, W / 2, H * .5, H * .8); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, 'rgba(4,6,30,.4)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
const PH = [540, 1300];
const SOFT = .7, DIVE = .6, WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55, PAGE = .6;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'soft' && dt < SOFT && i > 0) {
    const e = ss(dt / SOFT), b = Math.sin(e * Math.PI);
    const pic = (cx, j, tt) => { NOW = tt; cx.setTransform(K, 0, 0, K, 0, 0); cx.translate(540, 1790); cx.scale(1.06, 1.06); cx.translate(-540, -1790); SHOT[SHOTS[j][1]](cx, tt); };
    pic(actx, i - 1, t0 - 1 / 48); pic(bctx, i, t);
    const at = (buf, s, a, bl) => { c.save(); c.globalAlpha = a; if (bl > .3) c.filter = `blur(${bl * K}px)`; c.translate(W / 2, H * .68); c.scale(s, s); c.translate(-W / 2, -H * .68); c.drawImage(buf, 0, 0); c.restore(); };
    at(bufA, 1 + .06 * e, 1, 7 * b); at(bufB, .95 + .05 * e, e, 7 * b);
    c.setTransform(K, 0, 0, K, 0, 0); captions(c, t);   // the words stay crisp on top while the picture dissolves
  } else if ((kind === 'dive' || kind === 'rise') && dt < DIVE && i > 0) {
    const e = ss(dt / DIVE), px = PH[0] * K, py = PH[1] * K, dive = kind === 'dive';
    const pic = (cx, j, tt) => { cx.setTransform(K, 0, 0, K, 0, 0); NOW = tt; SHOT[SHOTS[j][1]](cx, tt); };
    pic(actx, i - 1, t0 - 1 / 48); pic(bctx, i, t);
    const zoomAt = (buf, s, a, blur) => { c.save(); c.globalAlpha = a; if (blur > .2) c.filter = `blur(${blur * K}px)`; c.translate(px, py); c.scale(s, s); c.translate(-px, -py); c.drawImage(buf, 0, 0); c.restore(); };
    if (dive) { zoomAt(bufA, lerp(1, 5, e * e), 1 - ss(clamp((e - .35) / .45)), 10 * Math.sin(e * Math.PI)); zoomAt(bufB, lerp(.18, 1, e), ss(clamp((e - .2) / .5)), 8 * (1 - e)); }
    else { zoomAt(bufB, lerp(5, 1, 1 - (1 - e) * (1 - e)), ss(clamp(e / .5)), 10 * (1 - e)); zoomAt(bufA, lerp(1, .18, e), 1 - ss(clamp((e - .25) / .5)), 6 * e); }
    c.setTransform(K, 0, 0, K, 0, 0); captions(c, t);
  } else if (kind === 'whip' && dt < WHIP && i > 0) {
    const e = ss(dt / WHIP), blur = Math.sin(e * Math.PI) * 26 * K;
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${blur}px)`; c.drawImage(bufA, -W * e, 0); c.drawImage(bufB, W * (1 - e), 0); c.restore();
  } else if (kind === 'clock' && dt < CLOCK && i > 0) {   // a clock hand sweeps round and wipes in the new shot: the next day
    const e = ss(dt / CLOCK), a = -Math.PI / 2 + e * Math.PI * 2, cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t); c.drawImage(bufA, 0, 0);
    c.save(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, -Math.PI / 2, a); c.closePath(); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
    c.save(); c.strokeStyle = GOLD; c.lineCap = 'round'; c.lineWidth = 14 * K; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); c.fillStyle = GOLD; c.beginPath(); c.arc(cx, cy, 22 * K, 0, 7); c.fill(); c.restore();
  } else if (kind === 'page' && dt < PAGE && i > 0) {   // a page turns: the old shot curls over from the right, its cream back showing, a shadow on the new one
    const e = ss(dt / PAGE), xf = W * (1 - e), flap = Math.min(xf, (W - xf) * .55);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t); c.drawImage(bufB, 0, 0);
    const sg = c.createLinearGradient(xf, 0, xf + 90 * K, 0); sg.addColorStop(0, 'rgba(0,0,20,.45)'); sg.addColorStop(1, 'rgba(0,0,20,0)'); c.fillStyle = sg; c.fillRect(xf, 0, 90 * K, H);
    c.save(); c.beginPath(); c.rect(0, 0, xf, H); c.clip(); c.drawImage(bufA, 0, 0); c.restore();
    if (flap > 0) { const g = c.createLinearGradient(xf - flap, 0, xf, 0); g.addColorStop(0, '#e9dcc0'); g.addColorStop(.85, '#f6efdc'); g.addColorStop(1, '#cdbf9c'); c.fillStyle = g; c.fillRect(xf - flap, 0, flap, H); c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(xf - flap - 6 * K, 0, 6 * K, H); }
  } else if (kind === 'dream' && dt < DREAM && i > 0) {   // into (or out of) an imagined scene: a soft, warm, blurred dissolve
    const e = ss(dt / DREAM), b = Math.sin(e * Math.PI);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${b * 18 * K}px) brightness(${1 + .25 * b})`; c.globalAlpha = 1; c.drawImage(bufA, 0, 0); c.globalAlpha = e; c.drawImage(bufB, 0, 0); c.restore();
  } else if (kind === 'punch' && dt < PUNCH && i > 0) {
    const e = 1 - Math.pow(1 - dt / PUNCH, 3), s = lerp(1.22, 1, e);
    paintShot(bctx, i, t); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.filter = `blur(${(1 - e) * 10 * K}px)`; c.drawImage(bufB, 0, 0); c.restore();
  } else paintShot(c, i, t);
  vignette(c);
  const fade = ss(seg(t, STORY - .7, STORY)); if (fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits and the footsteps
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t: +(t * TS).toFixed(3), type });   // the sound follows the real clock
window.DUR = +(DUR * TS).toFixed(2);
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t / TS);   // the picture runs on the timeline's clock
window.render(0);
window.READY = true;
