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
const TOP = '#00113F', NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#00113F';
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
function text(c, s, x, y, size, col = CREAM, align = 'center') { c.font = `${size}px "Lilita One"`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
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
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }

// —— the world: two upright vacuums, a rug with crumbs, billboards, a phone ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', WOOD2 = '#a6744a', WOOD3 = '#6e4a2c', INKC = '#151018', ROSE = '#c4566a', ROSE2 = '#9b3f52', STEEL = '#8d97b8';
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
function floor(c) { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, '#0d1d5c'); fl.addColorStop(1, '#071341'); c.fillStyle = fl; c.fillRect(0, F, 1080, 220); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(0, F, 1080, 4); }
// an upright vacuum standing on (x, y): o.ours = the small company's gold one, else the well-known rose one; o.run 0..1 hums it
function vacuum(c, x, y, s = 1, o = {}) { const body = o.ours ? GOLD : ROSE, dark = o.ours ? GOLD2 : ROSE2, run = o.run || 0, jig = run * 1.5 * Math.sin(NOW * 60);
  c.save(); c.translate(x, y + jig * .3); c.scale(s, s); c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.ellipse(0, 4, 95, 12, 0, 0, 7); c.fill();
  rrect(c, -86, -46, 172, 46, 18, dark); rrect(c, -86, -46, 172, 16, 8, body); rrect(c, -80, -12, 160, 10, 5, '#2b2f48');   // the head and its brush
  c.save(); c.translate(0, -40); c.rotate(-.18); rrect(c, -32, -250, 64, 220, 28, body); rrect(c, -22, -230, 44, 70, 18, 'rgba(255,255,255,.5)'); rrect(c, -22, -150, 44, 10, 5, dark); rrect(c, -8, -380, 16, 140, 8, STEEL); rrect(c, -40, -398, 80, 26, 13, '#2b2f48'); c.restore();
  if (o.ours) { ell(c, 0, -27, 9, 9, NAVY); } else star(c, 0, -27, 11, 1, '#ffffff');
  c.restore(); }
function rug(c, x, y, w, h = 120) { c.save(); rrect(c, x - w / 2, y - h / 2, w, h, 14, '#3d5cc8'); c.strokeStyle = SAND; c.lineWidth = 6; c.beginPath(); c.roundRect(x - w / 2 + 14, y - h / 2 + 12, w - 28, h - 24, 8); c.stroke(); c.fillStyle = SAND; for (let i = 0; i < 14; i++) { c.fillRect(x - w / 2 - 14, y - h / 2 + 8 + i * (h - 16) / 13, 14, 3); c.fillRect(x + w / 2, y - h / 2 + 8 + i * (h - 16) / 13, 14, 3); } c.restore(); }
const CRUMBS = Array.from({ length: 70 }, (_, i) => [hash(i * 3.1), hash(i * 7.7 + 2), 4 + hash(i + 11) * 7, hash(i * 1.3 + 5)]);
function crumbs(c, x0, x1, y0, y1, k, gone) { for (const [u, v, r, h] of CRUMBS) { const x = lerp(x0, x1, u), y = lerp(y0, y1, v), a = clamp(k * 3 - u * 2); if (a <= 0 || gone(x, h)) continue; c.save(); c.globalAlpha = a; ell(c, x, y, r, r * .7, h > .5 ? '#7a5233' : '#b5a682'); c.restore(); } }
function billboard(c, x, y, w, h, k, draw) { if (k <= 0) return; pop(c, x, y + h / 2 + 260, k, () => { rrect(c, x - w * .3 - 9, y + h / 2, 18, 260, 4, '#2b3f8e'); rrect(c, x + w * .3 - 9, y + h / 2, 18, 260, 4, '#2b3f8e'); c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 12, w, h, 16); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 16, '#f6efdc'); rrect(c, x - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20, 10, '#22357f'); draw(); }); }
function word(c, s, x, y, size, col = CREAM, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; text(c, s, x, y, size, col); c.restore(); }
function coins(c, x, y, n, k) { for (let i = 0; i < n; i++) { const a = clamp(k * n - i); if (a <= 0) continue; const yy = y - i * 16 - (1 - ease(a)) * 60; c.save(); c.globalAlpha = Math.min(1, a * 2); ell(c, x, yy + 6, 46, 14, GOLD2); ell(c, x, yy, 46, 14, GOLD); c.restore(); } }
function moneyBag(c, x, y, s, k) { pop(c, x, y, k, () => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = SAND2; c.beginPath(); c.moveTo(-26, -96); c.lineTo(26, -96); c.lineTo(16, -74); c.bezierCurveTo(80, -50, 82, 0, 60, 0); c.lineTo(-60, 0); c.bezierCurveTo(-82, 0, -80, -50, -16, -74); c.closePath(); c.fill(); rrect(c, -22, -82, 44, 10, 5, GOLD2); text(c, 'Ft', 0, -34, 46, NAVY); c.restore(); }); }
function phone(c, x, y, w, h, draw) { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 12, w, h, 34); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 34, '#1a1f3a'); rrect(c, x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24, '#2b3f8e'); c.save(); c.beginPath(); c.roundRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24); c.clip(); draw(); c.restore(); rrect(c, x - 30, y - h / 2 + 22, 60, 12, 6, '#1a1f3a'); }
function iconNote(c, x, y, r) { c.fillStyle = CREAM; ell(c, x - r * .35, y + r * .45, r * .3, r * .24, CREAM, -.4); ell(c, x + r * .4, y + r * .3, r * .3, r * .24, CREAM, -.4); c.fillRect(x - r * .12, y - r * .6, r * .1, r * 1.05); c.fillRect(x + r * .63, y - r * .75, r * .1, r * 1.05); c.beginPath(); c.moveTo(x - r * .12, y - r * .6); c.lineTo(x + r * .73, y - r * .75); c.lineTo(x + r * .73, y - r * .5); c.lineTo(x - r * .12, y - r * .35); c.fill(); }
function iconCard(c, x, y, r, k, cut, draw) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, '#2b3f8e'); c.strokeStyle = CREAM; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r - 6, 0, 7); c.stroke(); draw(); cross(c, x, y, r * .62, cut); }); }
function eyeB(c, x, y, r, k) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - r * .72, y); c.quadraticCurveTo(x, y - r * .66, x + r * .72, y); c.quadraticCurveTo(x, y + r * .66, x - r * .72, y); c.fill(); ell(c, x, y, r * .27, r * .27, CREAM); ell(c, x, y, r * .13, r * .13, GOLD); }); }
function earB(c, x, y, r, k, cut) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = NAVY; c.lineWidth = r * .14; c.lineCap = 'round'; c.beginPath(); c.arc(x + r * .02, y - r * .12, r * .38, Math.PI * .95, Math.PI * 2.3); c.quadraticCurveTo(x + r * .2, y + r * .35, x - r * .05, y + r * .5); c.stroke(); c.beginPath(); c.arc(x + r * .02, y - r * .1, r * .14, Math.PI, Math.PI * 2.2); c.stroke(); cross(c, x, y, r * .62, cut); }); }
function bulbIcon(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, r * 3, .7); ell(c, x, y, r, r, '#ffd889'); rrect(c, x - r * .45, y + r * .8, r * .9, r * .5, r * .15, SAND2); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y + r * .2); c.lineTo(x, y - r * .25); c.lineTo(x + r * .3, y + r * .2); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); c.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); c.stroke(); } }); }
// the people: the marketing manager is white; customers and colleagues are blue
function boss(c, t, x, y, s, o = {}) { mascot(c, { id: 'mk', skin: 'owner', s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi || 0, handL: o.handL, handR: o.handR, squash: o.squash || 0, bowtie: true }); }
const CUST = [{ skin: 'blue2', fem: 'pony' }, { skin: 'blue1' }, { skin: 'blue3', fem: 'glasses' }, { skin: 'blue1', tache: true }];
function cust(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'c' + k, ...CUST[k % 4], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0 }); }
function phoneInHand(c, x, y, s, f) { const hx = x + f * 46 * s, hy = y - 150 * s; rrect(c, hx - 14 * s, hy - 24 * s, 28 * s, 46 * s, 6 * s, '#1a1f3a'); rrect(c, hx - 10 * s, hy - 20 * s, 20 * s, 36 * s, 4 * s, '#9fc7f0'); return [hx, hy + 10 * s]; }
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
  intro(c, t) {   // a small vacuum maker shows its new product: a little workshop; a cloth is pulled off the new vacuum
    bg(c, '#163A8C'); floor(c); const H = HIT;
    // the little workshop behind: a small building
    rrect(c, 140, 1180, 800, 520, 24, '#22357f'); c.fillStyle = '#2b3f8e'; c.beginPath(); c.moveTo(110, 1200); c.lineTo(540, 1000); c.lineTo(970, 1200); c.closePath(); c.fill(); rrect(c, 230, 1290, 150, 120, 10, '#9fc7f0'); rrect(c, 700, 1290, 150, 120, 10, '#9fc7f0');
    // the plinth and the new vacuum: the cloth slides off on "új"
    rrect(c, 420, 1640, 240, 60, 10, SAND2); const off = ease(seg(t, H.unveil - .2, H.unveil + .5));
    vacuum(c, 540, 1640, 1.15, { ours: true });
    if (off < 1) { c.save(); c.globalAlpha = 1 - ss(seg(off, .6, 1)); c.translate(540 + 260 * off, 1260 + 260 * off * off); c.rotate(.9 * off); c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(-110, -150); c.quadraticCurveTo(0, -200, 110, -150); c.lineTo(130, 380); c.lineTo(-130, 380); c.closePath(); c.fill(); c.restore(); }
    if (t > H.unveil) { spark(c, 540, 1350, t, H.unveil, 7, 220, 18); pop(c, 760, 1280, E(t, H.unveil, .3, .5), () => { rrect(c, 690, 1250, 140, 64, 14, GOLD); text(c, 'ÚJ', 760, 1284, 46, NAVY); }); }
    boss(c, t, 260, F, 1.5, { f: .4, look: .3, smile: 1 });
  },
  rivals(c, t) {   // the big rivals: piles of money; three huge billboards, each with a rose vacuum and a big claim; our little gold one looks up
    bg(c, '#163A8C'); floor(c); const H = HIT;
    for (let i = 0; i < 9; i++) rrect(c, 40 + i * 120, 1300 - hash(i + 4) * 260, 100, 400 + hash(i + 4) * 260, 6, '#16286b');   // a city behind
    const B = [[200, 1170, H.claims[0], 'LEGERŐSEBB'], [540, 1110, H.claims[1], 'LEGGYORSABB'], [880, 1170, H.claims[2], 'LEGJOBB']];
    B.forEach(([x, y, at, s], i) => billboard(c, x, y, 320, 210, E(t, H.boards + i * .25, .35, .45), () => { vacuum(c, x, y + 88, .27); const k = E(t, at, .3, .55); if (k > 0) scaled(c, x, y - 52, Math.min(1.15, k), () => text(c, s, x, y - 50, s.length > 8 ? 34 : 46, GOLD)); }));
    // the money: bags and coin stacks
    moneyBag(c, 170, F, 1.1, E(t, H.money, .35, .5)); coins(c, 300, F - 14, 9, seg(t, H.money + .1, H.money + 1.0)); coins(c, 400, F - 14, 6, seg(t, H.money + .3, H.money + 1.1)); moneyBag(c, 900, F, 1.2, E(t, H.money + .3, .35, .5)); coins(c, 780, F - 14, 8, seg(t, H.money + .4, H.money + 1.2));
    vacuum(c, 600, F, .55, { ours: true });
  },
  copy(c, t) {   // at first the small firm copies them: the manager and a colleague at a drawing board, sketching a billboard just like theirs
    bg(c, '#163A8C'); floor(c); const H = HIT;
    // the board on an easel
    rrect(c, 330, 1060, 460, 330, 14, CREAM); rrect(c, 350, 1080, 420, 290, 8, '#ffffff'); c.fillStyle = WOOD3; c.save(); c.translate(560, 1390); for (const a of [-.25, .25]) { c.save(); c.rotate(a); c.fillRect(-8, 0, 16, 320); c.restore(); } c.restore();
    const d = seg(t, H.draft - .2, H.draft + 1.4); if (d > 0) { c.save(); c.beginPath(); c.rect(350, 1080, 420 * clamp(d * 1.4), 290); c.clip(); vacuum(c, 440, 1330, .5, { ours: true }); text(c, 'LEG…', 640, 1200, 64, NAVY); c.strokeStyle = NAVY; c.lineWidth = 6; c.beginPath(); c.moveTo(560, 1260); c.lineTo(730, 1260); c.moveTo(560, 1300); c.lineTo(690, 1300); c.stroke(); c.restore(); }
    const pen = [lerp(380, 740, (Math.sin(t * 5) + 1) / 2 * (d > 0 && d < 1 ? 1 : 0) + (d >= 1 ? .5 : 0)), 1200 + 50 * Math.sin(t * 9)];
    boss(c, t, 220, F, 1.55, { f: .4, look: .2, smile: .8, handR: d > 0 && d < 1 ? pen : undefined }); cust(c, t, 1, 900, F, 1.45, { f: -.4, look: -.2, smile: .8 });
    check(c, 220, 1180, 42, E(t, H.decide1, .45, .2) * (1 - ss(seg(t, H.draft, H.draft + .3))));
  },
  ignore(c, t) {   // but people don't listen any more: shoppers walk past the billboards, eyes on their phones, while the claims fade out
    bg(c, '#163A8C'); floor(c); const H = HIT; const fade = ss(seg(t, H.noone - .3, H.noone + .6));
    [[300, 1150, 'LEGJOBB'], [800, 1150, 'LEGGYORSABB']].forEach(([x, y, s]) => billboard(c, x, y, 340, 210, 1, () => { vacuum(c, x, y + 88, .27); word(c, s, x, y - 50, s.length > 8 ? 36 : 48, GOLD, 1 - .75 * fade); }));
    for (let k = 0; k < 3; k++) { const x = ((t - 16.8) * 120 + k * 380) % 1300 - 110; const ph = phoneInHand(c, x, F, 1.4, .45); cust(c, t, k, x, F, 1.4, { f: .45, walk: 1, look: .5, smile: .6, handR: ph }); phoneInHand(c, x, F, 1.4, .45); }
    boss(c, t, 140, F, 1.5, { f: .4, look: .4, smile: .4 }); badge(c, 'ex', 140, 1180, 44, E(t, H.notice, .3, .5));
    eyeB(c, 540, 1300, 60, E(t, H.noone, .3, .5)); cross(c, 540, 1300, 40, seg(t, H.noone + .2, H.noone + .6));
  },
  idea(c, t) {   // so he came up with a strange idea: a close-up, the bulb
    bg(c, '#163A8C'); floor(c); const H = HIT; const z = 1 + .06 * ss(seg(t, 21.6, 24.3)); c.save(); c.translate(540, 1700); c.scale(z, z); c.translate(-540, -1700);
    boss(c, t, 540, F, 2.3, { f: .1, look: lerp(-.3, .3, ss(seg(t, H.idea - .5, H.idea))), smile: lerp(.6, 1, ss(seg(t, H.idea, H.idea + .3))), squash: wob(t, H.idea, .4, 18, .6) });
    bulbIcon(c, 540, 1010, 60, E(t, H.idea, .3, .5)); c.restore();
  },
  pair(c, t) {   // instead of a usual ad: the billboard slides away; two vacuums are set side by side: theirs, gold, and a well-known one, rose
    bg(c, '#163A8C'); floor(c); const H = HIT;
    const gone = ease(seg(t, H.instead, H.instead + .6)); if (gone < 1) billboard(c, 540 - 900 * gone, 1080, 460, 240, 1, () => { vacuum(c, 400 - 900 * gone, 1170, .42); text(c, 'LEGJOBB', 600 - 900 * gone, 1084, 52, GOLD); });
    rrect(c, 140, 1640, 800, 60, 12, SAND2);
    pop(c, 340, F - 60, E(t, H.pair, .35, .45), () => vacuum(c, 340, F - 60, 1.45, { ours: true }));
    pop(c, 740, F - 60, E(t, H.pair + .2, .35, .45), () => vacuum(c, 740, F - 60, 1.45));
    pop(c, 340, 1100, E(t, H.ours, .3, .5), () => { ell(c, 344, 1108, 54, 54, 'rgba(0,0,20,.3)'); ell(c, 340, 1100, 54, 54, CREAM); heart(c, 340, 1104, 28, 1, GOLD2); });
    pop(c, 740, 1100, E(t, H.known, .3, .5), () => { ell(c, 744, 1108, 54, 54, 'rgba(0,0,20,.3)'); ell(c, 740, 1100, 54, 54, CREAM); star(c, 740, 1102, 30, 1, ROSE); });
    if (t > H.pair) glow(c, 540, 1500, 380, .15);
  },
  test(c, t) {   // the same rug, crumbs on both halves; both run; no words, just the result: the gold half is spotless, crumbs stay on the rose half. People watch with their own eyes
    bg(c, '#163A8C'); floor(c); const H = HIT;
    const run = ss(seg(t, H.run, H.run + 1.8)), running = run > 0 && run < 1 ? 1 : 0;
    testRig(c, t, { dirt: seg(t, H.rug - .1, H.rug + .6), run, running, clean: ss(seg(t, H.result, H.result + .4)), cleanAt: H.result });
    // the watchers, behind the rug
    for (let k = 0; k < 2; k++) { const a = E(t, H.eyes - .5 + k * .15, .35, .45), x = [118, 962][k]; if (a > 0) scaled(c, x, F, Math.min(1, a), () => cust(c, t, k, x, F, 1.15, { f: k ? -.4 : .4, look: (k ? -1 : 1) * (.2 + .25 * Math.sin(t * 3 + k)), smile: .9 })); }
    eyeB(c, 540, 1080, 58, E(t, H.eyes, .3, .5) * (1 - ss(seg(t, 40.7, 41.0))));
    if (t > H.result) { pop(c, 330, 1260, E(t, H.result, .3, .5), () => check(c, 330, 1260, 44, 1)); pop(c, 750, 1260, E(t, H.result + .2, .3, .5), () => badge(c, 'x', 750, 1260, 44, 1)); }
  },
  simple(c, t) {   // the ad was very simple: no exciting music, no famous actor, no strange promises; just two products, side by side, compared
    bg(c, '#163A8C'); floor(c); const H = HIT;
    // the ad: a screen
    const sk = E(t, 41.1, .35, .45); pop(c, 540, 1460, sk, () => { rrect(c, 160, 1240, 760, 440, 26, '#1a1f3a'); rrect(c, 180, 1260, 720, 400, 16, '#22357f'); rrect(c, 480, 1680, 120, 20, 6, '#1a1f3a');
      const hi = ss(seg(t, H.two - .2, H.two + .3)); vacuum(c, 380, 1620, .75 + .05 * hi, { ours: true }); vacuum(c, 700, 1620, .75 + .05 * hi);
      const vs = E(t, H.compare - .2, .3, .55); if (vs > 0) scaled(c, 540, 1460, Math.min(1.15, vs), () => { ell(c, 540, 1460, 50, 50, CREAM); text(c, 'VS', 540, 1464, 40, NAVY); }); });
    iconCard(c, 260, 1080, 70, E(t, H.music - .2, .3, .5), seg(t, H.music + .1, H.music + .5), () => iconNote(c, 260, 1080, 46));
    iconCard(c, 540, 1080, 70, E(t, H.actor - .2, .3, .5), seg(t, H.actor + .1, H.actor + .5), () => star(c, 540, 1082, 38, 1, GOLD));
    iconCard(c, 820, 1080, 70, E(t, H.promise - .2, .3, .5), seg(t, H.promise + .1, H.promise + .5), () => text(c, '!', 820, 1084, 72, GOLD));
  },
  viral(c, t) {   // the video got huge attention: a phone with the test, hearts and comments flying, the count rolling up; people didn't hear it, they saw it
    bg(c, '#163A8C'); floor(c); const H = HIT;
    phone(c, 540, 1380, 380, 620, () => { const s = .5; c.save(); c.translate(540, 1280); c.scale(s, s); c.translate(-540, -1625); rug(c, 540, 1625, 860, 170); vacuum(c, 330, 1640, 1.25, { ours: true }); vacuum(c, 750, 1640, 1.25); crumbs(c, 590, 920, 1560, 1690, 1, (x, h) => h < .45); c.restore();
      const n = Math.floor(lerp(0, 980, ease(seg(t, H.views - .3, H.views + 2.4)))); rrect(c, 380, 1480, 320, 60, 30, 'rgba(0,0,20,.35)'); text(c, (n >= 1000 ? '1M' : n + 'K') + '  ♥', 540, 1512, 40, CREAM); });
    for (let k = 0; k < 12; k++) { const at = H.views + k * .3, u = seg(t, at, at + 1.6); if (u <= 0 || u >= 1) continue; const x = 540 + (hash(k) - .5) * 520 + Math.sin(u * 6 + k) * 30, y = 1500 - u * 520; heart(c, x, y, 18 + hash(k + 3) * 16, Math.sin(u * Math.PI) * 1.2, k % 3 ? ROSE : GOLD); }
    earB(c, 220, 1120, 62, E(t, H.heard - .1, .3, .5), seg(t, H.heard + .2, H.heard + .6)); eyeB(c, 860, 1120, 62, E(t, H.saw - .1, .3, .5)); check(c, 860, 1230, 30, E(t, H.saw + .2, .45, .2));
    cust(c, t, 0, 150, F, 1.3, { f: .4, look: .3, smile: 1 }); cust(c, t, 2, 930, F, 1.3, { f: -.4, look: -.3, smile: 1 });
  },
  lesson(c, t) {   // the lesson: you don't have to tell them why it's better; set it up so they see the difference themselves
    bg(c, '#163A8C'); floor(c); const H = HIT; const show = ss(seg(t, H.enough - .2, H.enough + .5));
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
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.18, 1.18); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['porszívógyártó','legerősebb','leggyorsabb','legjobb','furcsa','két','szőnyegen','szemükkel','egyszerű','összehasonlítás','látták','különbséget']);
const bare = w => w.replace(/[.,:;!?…„”"]/g, '');
const CAP = { x: 130, y: 540, size: 56, lh: 72, maxW: 790, maxLines: 2 }, CAPFONT = `700 ${CAP.size}px "Montserrat"`;   // the caption area, placed for Instagram's preview: Montserrat Bold, two lines at most
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
    const hot = w === now, col = hot || w.key ? GOLD : CREAM;
    c.save(); c.globalAlpha = a * (1 - out); c.translate(cx, y); c.scale(sc, sc); c.translate(-cx, -y);
    c.shadowColor = 'rgba(0,0,15,.6)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.fillStyle = col; c.fillText(w.w, CAP.x + w.x, y); c.shadowColor = 'transparent';
    c.restore(); });
  c.restore();
}

// —— the locked 23 Team end card (ANIMATION-STYLE.md) ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();
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
    const pic = (cx, j, tt) => { NOW = tt; cx.setTransform(K, 0, 0, K, 0, 0); cx.translate(540, 1790); cx.scale(1.18, 1.18); cx.translate(-540, -1790); SHOT[SHOTS[j][1]](cx, tt); };
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
