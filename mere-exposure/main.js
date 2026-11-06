// Seen Again: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'VIRÁG Ft?'), document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const TOP = '#111a52', NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#0b1438';
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

// —— motion helpers: one stage, bold single visuals handing over to each other ——
function KF(t, keys) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i]; if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, ss((t - t0) / Math.max(1e-6, t1 - t0))); } } return keys[keys.length - 1][1]; }
const life = (t, a, b, fi = .35, fo = .3) => Math.min(ss(seg(t, a, a + fi)), 1 - ss(seg(t, b - fo, b)));   // 0..1: in from a, out by b
function enter(c, x, y, k, kind, f) {   // a section comes in and goes out with a bold, eased move
  if (k <= 0) return; c.save(); c.globalAlpha *= Math.min(1, k * 1.4); c.translate(x, y);
  if (kind === 'up') c.translate(0, (1 - k) * 160); if (kind === 'left') c.translate((1 - k) * -260, 0); if (kind === 'right') c.translate((1 - k) * 260, 0);
  const sc = kind === 'pop' ? lerp(.6, 1, k) : kind === 'zoom' ? lerp(1.5, 1, k) : 1; c.scale(sc, sc); c.translate(-x, -y); f(); c.restore();
}
function badge(c, kind, x, y, r, k = 1) {
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); const g = r * .55;
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, NAVY); if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (typeof kind === 'number') { c.save(); c.font = `700 ${g * 1.6}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(String(kind), x, y + g * .08); c.restore(); } });
}
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
// —— the brand: MIRA, a gold wave in a circle ——
function logo(c, x, y, r, o = {}) {   // o.grey 0..1 (unknown: grey, blurred), o.name 0..1 (the name underneath)
  const gr = o.grey || 0; c.save(); if (gr > 0) c.filter = `grayscale(${gr}) blur(${gr * r * .08 * K}px)`;
  ell(c, x + r * .05, y + r * .08, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, GOLD); ell(c, x, y, r * .86, r * .86, '#f2c95e');
  c.strokeStyle = CREAM; c.lineWidth = r * .14; c.lineCap = 'round'; for (const d of [-.32, .02, .36]) { c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(x - r * .55 + u * r * 1.1, y + d * r + Math.sin(u * Math.PI * 2) * r * .12); } c.stroke(); }
  c.restore();
  if (o.name > 0) { c.save(); c.globalAlpha *= Math.min(1, o.name); c.font = `700 ${r * .62}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = CREAM; c.fillText('MIRA', x, y + r * 1.5 + (1 - Math.min(1, o.name)) * 30); c.restore(); }
}
function ring(c, x, y, r, p, w = 14) { c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(246,239,220,.15)'; c.lineWidth = w; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); if (p > 0) { c.strokeStyle = GOLD; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke(); } c.restore(); }
function eyeIcon(c, x, y, s, open = 1, inner) { c.save(); c.fillStyle = CREAM; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); if (open > .2) { c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.clip(); ell(c, x, y, 40 * s, 40 * s, NAVY); inner && inner(); } c.restore(); }
function bell(c, x, y, s, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = GOLD; c.beginPath(); c.moveTo(-26 * s, 18 * s); c.quadraticCurveTo(-24 * s, -30 * s, 0, -32 * s); c.quadraticCurveTo(24 * s, -30 * s, 26 * s, 18 * s); c.closePath(); c.fill(); c.fillRect(-32 * s, 14 * s, 64 * s, 8 * s); ell(c, 0, 26 * s, 7 * s, 7 * s, GOLD2); ell(c, 0, -34 * s, 5 * s, 5 * s, GOLD2); c.restore(); }
function bottle(c, x, y, s) { c.fillStyle = '#5d7fc4'; c.beginPath(); c.roundRect(x - 34 * s, y - 150 * s, 68 * s, 150 * s, 18 * s); c.fill(); c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(x - 22 * s, y - 182 * s, 44 * s, 36 * s, 8 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 24 * s, y - 136 * s, 10 * s, 110 * s); }
function cart(c, x, y, s, shake = 0) { c.save(); c.translate(x + Math.sin(shake * 40) * 8 * shake, y); c.strokeStyle = CREAM; c.lineWidth = 10 * s; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-90 * s, -70 * s); c.lineTo(-62 * s, -70 * s); c.lineTo(-40 * s, 30 * s); c.lineTo(60 * s, 30 * s); c.lineTo(80 * s, -40 * s); c.lineTo(-52 * s, -40 * s); c.stroke(); ell(c, -30 * s, 56 * s, 13 * s, 13 * s, CREAM); ell(c, 50 * s, 56 * s, 13 * s, 13 * s, CREAM); c.restore(); }
// a feed post in the phone; brand posts carry the logo
function post(c, x, y, w, i, brand, t, o = {}) {
  const h = w * 1.18; c.fillStyle = '#fbf6ea'; c.beginPath(); c.roundRect(x - w / 2, y, w, h, 16); c.fill();
  ell(c, x - w / 2 + 34, y + 32, 18, 18, brand ? GOLD : ['#8f98b0', '#c4566a', '#7fbf8a', '#5d7fc4'][i % 4]); c.fillStyle = 'rgba(28,36,80,.35)'; c.fillRect(x - w / 2 + 62, y + 24, brand ? 70 : 90 + (i % 3) * 20, 14);
  c.fillStyle = brand ? '#1f2c62' : ['#d9ccab', '#c9d6b0', '#e6c3b8', '#b8c6e6'][i % 4]; c.fillRect(x - w / 2 + 14, y + 62, w - 28, w - 28);
  if (brand) logo(c, x, y + 62 + (w - 28) / 2, w * .24, { grey: o.grey || 0 }); else { ell(c, x - w * .1, y + 62 + w * .3, w * .14, w * .14, 'rgba(255,255,255,.5)'); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x - w / 2 + 14, y + 62 + w - 28); c.lineTo(x, y + 62 + w * .4); c.lineTo(x + w / 2 - 14, y + 62 + w - 28); c.fill(); }
  heart(c, x - w / 2 + 34, y + h - 30, 12, 1, brand ? '#c4566a' : 'rgba(28,36,80,.4)');
}
function phone(c, x, y, w, h, f) { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 12, y - h / 2 + 16, w, h, 56); c.fill(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 56); c.fill(); c.fillStyle = '#efe6d2'; c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 42); c.fill(); c.save(); c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 42); c.clip(); f(); c.restore(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - 60, y - h / 2 + 26, 120, 26, 13); c.fill(); }
function face(c, x, y, r, P, k = 1) { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => { ell(c, x + 4, y + 6, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); c.save(); c.beginPath(); c.arc(x, y, r * .82, 0, 7); c.clip(); drawMascot(c, { ...P, x, y: y + r * 1.7, s: r / 66, f: 0, shadow: false }); c.restore(); }); }
const AUD = [['blue2', 'bob'], ['blue1', null], ['blue3', 'pony'], ['blue2', null], ['blue3', 'long']];
const ME = o => ({ id: 'me', skin: 'blue3', fem: 'pony', s: 1.7, smile: .8, ...o });

const SHOT = {
  flow(c, t) {
    const H = HIT; bg(c, '#2c46a0');
    stage(c, [120, 880, 960, 1760], 0, () => {
      // 1 · the phone, the feed scrolling; MIRA keeps showing up; the empty cart
      const P1 = life(t, 0, H.unk + .3, .4, .35);
      enter(c, 540, 1320, P1, 'up', () => phone(c, 540, 1320, 470, 860, () => { const sc = KF(t, [[0, 0], [H.seen, 260], [H.insta, 560], [H.never, 840], [H.unk, 880]]);
        for (let i = 0; i < 8; i++) { const brand = i === 2 || i === 4 || i === 6, y = 920 + i * 450 - sc; if (y > 2000 || y < 400) continue; post(c, 540, y, 400, i, brand, t); if (brand && y > 820 && y < 1500) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 6; c.globalAlpha = .9; c.beginPath(); c.roundRect(340, y - 6, 400, 400 * 1.18 + 12, 18); c.stroke(); c.restore(); } } }));
      if (P1 > 0) { const ck = E(t, H.never, .3, .45) * (1 - ss(seg(t, H.unk - .2, H.unk + .1))); if (ck > 0) scaled(c, 860, 1640, Math.min(1.1, ck), () => { ell(c, 860, 1640, 90, 90, '#c4566a'); cart(c, 860, 1640, .75, Math.max(0, 1 - (t - H.never - .3) / .6)); }); }
      // 2-4 · one post, close: the logo and its ring of exposures: unknown, noticed, familiar; the name rings a bell
      const P2 = life(t, H.unk, H.need + .1, .4, .35), ringP = KF(t, [[H.unk, 0], [H.unk + .6, .15], [H.second, .15], [H.second + .5, .45], [H.few, .45], [H.few + 1.4, .9], [H.name, 1]]), grey = KF(t, [[H.unk, 1], [H.second, 1], [H.second + .5, .45], [H.few, .45], [H.few + .8, 0]]);
      enter(c, 540, 1300, P2, 'zoom', () => { glow(c, 540, 1300, 300, .2 + .3 * ringP); ring(c, 540, 1300, 230, ringP, 18);
        if (t > H.few && t < H.name + .2) for (let k = 0; k < 4; k++) { const u = seg(t, H.few + k * .3, H.few + k * .3 + .45); if (u > 0 && u < 1) { c.save(); c.globalAlpha = Math.sin(u * Math.PI) * .6; logo(c, 540 + (k % 2 ? 1 : -1) * (130 + 60 * u), 1300 - 60 + k * 40, 70 * (1 - .3 * u)); c.restore(); } }
        logo(c, 540, 1300, 150 + 10 * Math.sin(Math.min(1, E(t, H.second, .3, .4)) * Math.PI), { grey, name: E(t, H.name, .35, .45) });
        badge(c, 'q', 720, 1130, 46, E(t, H.q, .3, .5) * (1 - ss(seg(t, H.second, H.second + .3))));
        const mk = E(t, H.memo, .3, .5) * (1 - ss(seg(t, H.few, H.few + .3))); if (mk > 0) scaled(c, 730, 1140, Math.min(1.1, mk), () => { c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(700, 1090); c.lineTo(760, 1090); c.lineTo(760, 1190); c.lineTo(730, 1165); c.lineTo(700, 1190); c.closePath(); c.fill(); });
        const bk = E(t, H.bell, .3, .45); if (bk > 0) { bell(c, 760, 1570, 1.2 * Math.min(1.1, bk), .5 * Math.sin((t - H.bell) * 18) * Math.exp(-(t - H.bell) * 2.5)); for (let k = 0; k < 2; k++) { c.strokeStyle = `rgba(236,189,74,${.7 * Math.max(0, 1 - (t - H.bell) / 1.4)})`; c.lineWidth = 5; c.beginPath(); c.arc(760, 1560, 50 + k * 22, -.6, .6); c.stroke(); } }
        const ne = Math.min(5, Math.floor(ringP * 5.5)); for (let k = 0; k < ne; k++) scaled(c, 540 + (k - (ne - 1) / 2) * 110, 990, Math.min(1, ringP * 5.5 - k), () => eyeIcon(c, 540 + (k - (ne - 1) / 2) * 110, 990, .5, 1)); });
      // 5 · one day you need something this brand also offers: her list; the bottle; MIRA's tag on it
      const P5 = life(t, H.need, H.mind + .1, .4, .35);
      enter(c, 540, 1320, P5, 'right', () => { mascot(c, ME({ x: 330, y: 1720, f: .4, blink: blinkAt(t, 3), look: .2, handR: [440, 1520] }));
        c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(486, 1000, 360, 470, 20); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(478, 990, 360, 470, 20); c.fill(); c.fillStyle = '#c4566a'; c.fillRect(478, 990, 360, 22);
        for (let k = 0; k < 3; k++) { c.strokeStyle = 'rgba(28,36,80,.4)'; c.lineWidth = 4; c.strokeRect(510, 1060 + k * 70, 30, 30); c.fillStyle = 'rgba(28,36,80,.25)'; c.fillRect(560, 1070 + k * 70, 180 - k * 30, 12); }
        const pk = E(t, H.product, .35, .45); if (pk > 0) scaled(c, 658, 1420, Math.min(1.1, pk), () => { glow(c, 658, 1350, 120, .3); bottle(c, 658, 1430, 1.1); });
        const ok = E(t, H.offers, .3, .5); if (ok > 0) logo(c, 720, 1300, 34 * Math.min(1.1, ok)); });
      // 6 · it's one of the first to come to mind: a line-up of brands; MIRA jumps to the top
      const P6 = life(t, H.mind, H.term + .1, .4, .35), up = ss(seg(t, H.first - .3, H.first + .25));
      enter(c, 540, 1320, P6, 'up', () => { const order = [1, 2, 0, 3]; [0, 1, 2, 3].forEach(i => { const slot = i === 2 ? lerp(2, 0, up) : (i < 2 ? i + up : i), y = 1050 + slot * 170, mira = i === 2, w = 560;
          c.save(); c.translate(mira ? Math.sin(up * Math.PI) * 60 : 0, 0); c.fillStyle = mira ? (up > .5 ? '#2a3a86' : 'rgba(246,239,220,.1)') : 'rgba(246,239,220,.1)'; c.beginPath(); c.roundRect(540 - w / 2, y - 64, w, 128, 24); c.fill(); if (mira && up > .5) { c.strokeStyle = GOLD; c.lineWidth = 6; c.stroke(); }
          badge(c, Math.round(slot) + 1, 540 - w / 2 + 64, y, 34, 1);
          if (mira) logo(c, 540 - 40, y, 46); else { c.fillStyle = ['#8f98b0', '#6b6f86', '#7d86a6', '#9aa0b8'][i]; if (i === 0) { c.beginPath(); c.roundRect(500 - 44, y - 44, 88, 88, 16); c.fill(); } else if (i === 1) { c.beginPath(); c.moveTo(500, y - 48); c.lineTo(548, y + 40); c.lineTo(452, y + 40); c.closePath(); c.fill(); } else { c.beginPath(); c.ellipse(500, y, 50, 36, 0, 0, 7); c.fill(); } }
          c.fillStyle = mira ? CREAM : 'rgba(246,239,220,.3)'; c.fillRect(570, y - 10, mira ? 150 : 120, 20); c.restore(); });
        if (up >= 1) spark(c, 540, 1050, t, H.first + .25, 6, 300, 18); });
      // 7 · the Mere Exposure Effect: an eye, the logo in its pupil, copies of it circling
      const P7 = life(t, H.term, H.chart + .1, .4, .35), op = ss(seg(t, H.term + .1, H.term + .5));
      enter(c, 540, 1320, P7, 'zoom', () => { for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + (t - H.term) * .8, rr = 300 * ss(seg(t, H.mere - .2 + k * .06, H.mere + .4 + k * .06)); if (rr > 1) { c.save(); c.globalAlpha = .85; logo(c, 540 + Math.cos(a) * rr, 1320 + Math.sin(a) * rr * .8, 44); c.restore(); } }
        eyeIcon(c, 540, 1320, 2.3, op, () => logo(c, 540, 1320, 62)); });
      // 8 · again and again: exposures stack up on the timeline; familiarity climbs; liking follows
      const P8 = life(t, H.chart, H.regular + .1, .4, .35);
      enter(c, 540, 1320, P8, 'up', () => { const x0 = 230, x1 = 880, y0 = 1600, y1 = 1020; c.strokeStyle = 'rgba(246,239,220,.6)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y1 - 20); c.lineTo(x0, y0); c.lineTo(x1 + 20, y0); c.stroke();
        H.again.forEach((at, i) => { const k = E(t, at, .3, .45); if (k > 0) logo(c, x0 + 90 + i * 150, y0 + 70, 34 * Math.min(1.1, k)); });
        const line = (p, col, lift, end) => { if (p <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = 12; c.lineJoin = 'round'; c.beginPath(); const n = 30; for (let i = 0; i <= n * p; i++) { const u = i / n, x = x0 + 20 + u * (x1 - x0 - 40), y = y0 - 20 - (1 - Math.exp(-u * 2.4)) / (1 - Math.exp(-2.4)) * (y0 - y1 - 60) * lift; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); if (p >= 1) end(x1 - 20, y0 - 20 - (y0 - y1 - 60) * lift); };
        line(ss(seg(t, H.grow, H.grow + 1.0)), GOLD, 1, (x, y) => eyeIcon(c, x + 40, y - 40, .5 * Math.min(1, E(t, H.grow + 1.0, .3, .5)), 1));
        line(ss(seg(t, H.like, H.like + 1.0)), '#e8664f', .62, (x, y) => heart(c, x + 40, y - 30, 36, Math.min(1.1, E(t, H.like + 1.0, .3, .5)), '#e8664f')); });
      // 9 · that's why a brand should be regularly present in its audience's life: a week, the logo on its days; the audience's faces light up
      const P9 = life(t, H.regular, 99, .4, .3);
      enter(c, 540, 1320, P9, 'up', () => { const days = 7, cx0 = 220, gw = 92; for (let d = 0; d < days; d++) { const x = cx0 + d * (gw + 8), y = 1040; c.fillStyle = 'rgba(246,239,220,.12)'; c.beginPath(); c.roundRect(x, y, gw, 130, 14); c.fill(); if (d % 2 === 0 || d === 5) { const k = E(t, H.rhythm + d * .12, .3, .45); if (k > 0) logo(c, x + gw / 2, y + 65, 30 * Math.min(1.1, k)); } }
        AUD.forEach(([sk, fem], i) => { const k = E(t, H.audience + i * .1, .35, .45); const x = 260 + i * 140; face(c, x, 1440, 62, { skin: sk, fem, smile: 1 }, k); if (t > H.audience + .5 + i * .1) { logo(c, x + 42, 1400, 16); } });
        if (t > H.end) { glow(c, 540, 1440, 380, .3 * ss(seg(t, H.end, H.end + .5))); spark(c, 540, 1440, t, H.end, 8, 330, 18); } });
    });
  },
};

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['többször','Instagramon','soha','először','ismeretlen','Másodszor','logóját','ismerősen','szükséged','első','Mere','Exposure','Effectnek','újra','ismerősség','szimpátiánkat','rendszeresen','célközönsége']);
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
  c.fillStyle = TOP; c.fillRect(0, 0, 1080, 660); const g = c.createLinearGradient(0, 660, 0, 760); g.addColorStop(0, TOP); g.addColorStop(1, 'rgba(17,26,82,0)'); c.fillStyle = g; c.fillRect(0, 660, 1080, 100);
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
const WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55, PAGE = .6;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'whip' && dt < WHIP && i > 0) {
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
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
