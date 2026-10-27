// The Popcorn Choice: a 23 Team reel in bold 2D motion graphics, drawn frame by frame from render(t).
// A clean navy stage, the characters big in frame, the sizes and prices as kinetic shapes that snap in with the voice; whips and punch-ins between shots.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { glowSprite, bucket, NAVY, GOLD, GOLD2, CREAM } from './sets.js';
import { DUR, STORY, SHOTS, HIT } from './story.js';

await document.fonts.load('74px "Lilita One"', 'MOZIKICSIKÖZEPESNAGYTEREM 1900165018500Ft+?');
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const GLOW = glowSprite('255,214,120');
const END_BLUE = '#0b1438';

function sp(tau, d = .4, b = .2) {   // a spring like Motion's { type: 'spring', visualDuration, bounce }
  if (tau <= 0) return 0; const z = Math.max(.05, 1 - b);
  if (z >= .999) { const w = 4.7 / d; return 1 - Math.exp(-w * tau) * (1 + w * tau); }
  const wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau));
}
const E = (t, at, d = .35, b = .35) => t < at ? 0 : sp(t - at, d, b);
const blinkAt = (t, seed) => { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; };
const reach = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const Hs = s => BASE_H * s * 1.08;   // a mascot's standing height on screen

// —— the stage and its pieces (all in a 1080 × 1920 frame) ——
function bg(c, t, o = {}) {
  const g = c.createRadialGradient(540, 860, 80, 540, 960, 1400); g.addColorStop(0, o.dark ? '#1a2462' : '#26368c'); g.addColorStop(1, '#0a1034'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  c.fillStyle = 'rgba(255,255,255,.05)'; const off = (t * 24) % 60;
  for (let y = -60; y < 1980; y += 60) for (let x = -60; x < 1140; x += 60) { c.beginPath(); c.arc(x + off + (y / 60 % 2) * 30, y + off, 3, 0, 7); c.fill(); }
  if (o.rays) { c.save(); c.translate(o.rx ?? 540, o.ry ?? 900); c.rotate(t * .25); c.fillStyle = `rgba(255,214,120,${.07 * o.rays})`;
    for (let i = 0; i < 14; i++) { c.rotate(Math.PI * 2 / 14); c.beginPath(); c.moveTo(0, 0); c.lineTo(1600, -120); c.lineTo(1600, 120); c.closePath(); c.fill(); } c.restore(); }
  if (o.dark) { c.fillStyle = `rgba(5,8,30,${.35 * o.dark})`; c.fillRect(0, 0, 1080, 1920); }
}
function spot(c, x, y, w) { const g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, 'rgba(0,0,20,.35)'); g.addColorStop(1, 'rgba(0,0,20,0)'); c.save(); c.translate(x, y); c.scale(1, .22); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w, 0, 7); c.fill(); c.restore(); }
function glow(c, x, y, r, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(GLOW, x - r, y - r, 2 * r, 2 * r); c.restore(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
function mascot(c, P, k = 1) { spot(c, P.x, P.y + 4, Hs(P.s) * .42); scaled(c, P.x, P.y, k, () => drawMascot(c, { ...P, shadow: false })); }
function text(c, s, x, y, size, col = CREAM, align = 'center') { c.font = `${size}px "Lilita One"`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
function card(c, x, y, w, h, label, k, o = {}) {   // a price card that springs in
  scaled(c, x, y, k, () => { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 12, w, h, h * .22); c.fill();
    c.fillStyle = o.gold ? GOLD : CREAM; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, h * .22); c.fill(); text(c, label, x, y + h * .04, h * .58, NAVY); });
}
const counted = (t, t0, target) => t < t0 ? 0 : Math.round(target * ss(seg(t, t0, t0 + .36)) / 50) * 50;
function kernels(c, x, y, u, n, R, seed, size = 13) {   // a burst of popcorn flying out and falling
  if (u <= 0 || u >= 1) return;
  for (let i = 0; i < n; i++) { const a = -Math.PI * (.1 + .8 * hash(seed + i)), r = R * (.5 + .5 * hash(seed + i * 3)), px = x + Math.cos(a) * r * u, py = y + Math.sin(a) * r * u + 700 * u * u;
    c.globalAlpha = 1 - u * u; c.fillStyle = hash(seed + i * 7) > .4 ? '#f7dd8a' : GOLD; c.beginPath(); c.arc(px, py, size * (.7 + .5 * hash(i)), 0, 7); c.fill(); }
  c.globalAlpha = 1;
}
function bang(c, x, y, k, mark = '!', r = 90) {   // a "!" or "?" bubble
  scaled(c, x, y, k, () => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - r * .3, y + r * .8); c.lineTo(x - r * .1, y + r * 1.35); c.lineTo(x + r * .25, y + r * .85); c.fill(); text(c, mark, x, y + r * .08, r * 1.5, '#e8573a'); });
}
function star(c, x, y, k, r = 60) { scaled(c, x, y, k, () => { c.fillStyle = GOLD; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }); }
// a bucket carried at his side (never in front of his face): returns where it stands; his near hand holds its side
function carry(P, h) { const Hh = Hs(P.s), d = (P.f ?? 0) < -.1 ? -1 : 1, cx = P.x + d * (.27 * Hh + h * .34), base = P.y - .03 * Hh;
  P[d > 0 ? 'handR' : 'handL'] = [cx - d * h * .3, base - Math.min(h * .62, .4 * Hh)]; return [cx, base]; }


// —— a minimal cinema cashier: a counter with the cashier behind it, a POPCORN sign, the register; nothing else ——
const CT = { x0: 400, x1: 1120, top: 1380, front: 1700 }, SPOT = [290, 1800], CASH0 = { id: 'cashier', skin: 'owner', fem: 'bun', s: 2.0, x: 860, y: 1560, f: -.4, smile: .8 };
const ON_COUNTER = { S: [480, 90], M: [580, 120], L: [700, 150] };
function counter(c, t, o = {}) {
  bg(c, t, o.bg || {});
  c.save(); c.translate(540, 1100); c.scale(1.12, 1.12); c.translate(-630, -1420);   // the counter group sits in the middle of the frame, a little bigger
  c.fillStyle = 'rgba(5,8,30,.35)'; c.fillRect(-400, CT.front, 2000, 1200);
  c.fillStyle = '#121a46'; c.beginPath(); c.roundRect(650, 760, 420, 130, 22); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 6; c.stroke(); text(c, 'POPCORN', 860, 830, 88, GOLD);
  for (let i = 0; i < 18; i++) { const u = i / 18, x = u < .5 ? 660 + u * 2 * 400 : 1060 - (u - .5) * 2 * 400, y = u < .5 ? 760 : 890, on = (Math.floor(t * 4) + i) % 3 !== 0; c.fillStyle = on ? '#ffe7a6' : '#8a7040'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); if (on) glow(c, x, y, 26, .4); }
  if (o.sign) { c.fillStyle = '#26368c'; c.beginPath(); c.roundRect(300, 470, 330, 100, 18); c.fill(); text(c, '← TEREM 1', 465, 522, 62); }
  const C = { ...CASH0, blink: blinkAt(t, 2), ...(o.cashier || {}) }; drawMascot(c, { ...C, shadow: false });
  if (o.cashHold) bucket(c, o.cashHold[0], o.cashHold[1], 150, 1.1, 72);
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(CT.x0 + 10, CT.top + 14, CT.x1 - CT.x0, 24);
  c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(CT.x0 - 20, CT.top - 14, CT.x1 - CT.x0 + 40, 30, 12); c.fill();
  c.fillStyle = CREAM; c.fillRect(CT.x0, CT.top + 16, CT.x1 - CT.x0, CT.front - CT.top - 16); c.fillStyle = '#26368c'; c.fillRect(CT.x0, CT.top + 80, CT.x1 - CT.x0, 44); c.fillStyle = GOLD; c.fillRect(CT.x0, CT.top + 76, CT.x1 - CT.x0, 5); c.fillRect(CT.x0, CT.top + 124, CT.x1 - CT.x0, 5);
  const dr = o.drawer || 0; c.fillStyle = '#121a46'; c.beginPath(); c.roundRect(970, CT.top - 110, 120, 100, 14); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.roundRect(985, CT.top - 98, 90, 28, 6); c.fill();
  c.fillStyle = CREAM; for (let i = 0; i < 3; i++) { c.beginPath(); c.roundRect(985 + i * 31, CT.top - 58, 24, 18, 4); c.fill(); }
  if (dr > 0) { c.fillStyle = '#3a4580'; c.beginPath(); c.roundRect(960, CT.top - 16, 140, 20 + 50 * dr, 8); c.fill(); c.fillStyle = GOLD; for (let i = 0; i < 4; i++) c.fillRect(975 + i * 30, CT.top - 6, 20, 10 + 34 * dr); }
  for (const [k, v] of Object.entries(o.items || {})) { if (!v) continue; const [x, h] = ON_COUNTER[k], [dy, sc] = typeof v === 'object' ? v : [0, 1]; scaled(c, x, CT.top + dy, sc, () => bucket(c, x, CT.top + dy, h, 1, 110 + h)); }
  (o.front || []).forEach(f => f());
  c.restore();
}

// —— the shots ——
const MAN = (o = {}) => ({ id: 'man', skin: 'blue1', s: 2.3, x: 540, y: 1640, f: 0, ...o });
const SHOT = {
  intro(c, t) {   // a man goes to the cinema, and fancies some popcorn
    bg(c, t);
    const tk = E(t, HIT.ticket, .4, .4); scaled(c, 540, 560, tk, () => { c.save(); c.translate(540, 560); c.rotate(-.08 + .03 * Math.sin(t * 2));
      c.fillStyle = CREAM; c.beginPath(); c.roundRect(-270, -120, 540, 240, 24); c.fill(); c.fillStyle = '#26368c'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 270, 0, 34, 0, 7); c.fill(); }
      c.strokeStyle = NAVY; c.lineWidth = 6; c.setLineDash([16, 14]); c.beginPath(); c.moveTo(150, -100); c.lineTo(150, 100); c.stroke(); c.setLineDash([]); text(c, 'MOZI', -50, 6, 120, NAVY); star(c, 210, 0, 1, 36); c.restore(); });
    const sn = ss(seg(t, HIT.sniff, HIT.sniff + .3)) * (1 - ss(seg(t, 2.7, 3.0))), turn = ss(seg(t, 1.2, 1.5));
    const P = MAN({ f: .45 * turn, headTurn: .2 * turn, look: -.5 * turn, smile: .6 + .4 * sn, blink: sn > .5 ? 1 : blinkAt(t, 1), headUp: .025 * sn, squash: -.03 * sn });
    mascot(c, P, E(t, HIT.manIn, .4, .4));
    const bk = E(t, HIT.bucketIn, .35, .45); scaled(c, 850, 1180, bk, () => bucket(c, 850, 1180, 230, 1.1, 4)); glow(c, 850, 1000, 260, .5 * bk);
    if (t > HIT.bucketIn + .2) { c.save(); c.strokeStyle = `rgba(255,240,200,${.55 * sn})`; c.lineWidth = 9; c.lineCap = 'round';
      for (let k = 0; k < 3; k++) { c.beginPath(); for (let i = 0; i <= 30; i++) { const u = i / 30, x = lerp(800, 610, u), y = lerp(960, 1150, u) + Math.sin(u * 8 + t * 4 + k * 2) * 24 - k * 26; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } c.restore(); }
    HIT.kernels.forEach((k, i) => kernels(c, 850, 960, seg(t, k, k + .8), 9, 260, 10 + i * 20));
  },
  sizes(c, t) {   // at the counter: three sizes slam down onto it
    const items = {}; ['S', 'M', 'L'].forEach((k, i) => { const at = HIT.slams[i]; if (t < at - .28) return; const fall = clamp((t - (at - .28)) / .28), land = t > at ? Math.sin(clamp((t - at) / .35) * Math.PI) * Math.exp(-(t - at) * 3) : 0;
      items[k] = [-(1 - fall * fall) * 1300, 1 + .12 * land]; });
    counter(c, t, { items, cashier: { smile: .9, look: .2 }, front: [() => mascot(c, MAN({ s: 2.1, x: SPOT[0], y: SPOT[1], f: .5, look: -.4, smile: .8 }), E(t, 3.0, .3, .3))] });
  },
  price(c, t, i) {   // one size at a time, the price counting up and stamping down
    const t0 = SHOTS.find(s => s[1] === ['small', 'medium', 'large'][i])[0];
    bg(c, t, { rays: .8 + .4 * i });
    const lab = ['KICSI', 'KÖZEPES', 'NAGY'][i], k = E(t, t0 + .08, .3, .4);
    scaled(c, 540, 400, k, () => { text(c, lab, 540, 400, 150); c.fillStyle = GOLD; c.fillRect(540 - 160, 490, 320, 12); });
    const h = [380, 450, 520][i], bk = E(t, t0 + .02, .35, .4); glow(c, 540, 1000, 520, .35 * bk); scaled(c, 540, 1320, bk, () => bucket(c, 540, 1320, h, 1.1, 50 + i));
    const n = counted(t, HIT.counts[i], [900, 1650, 1850][i]), st = E(t, HIT.stamps[i], .28, .5);
    if (t > HIT.counts[i]) card(c, 540, 1560, 640, 210, `${n} Ft`, t < HIT.stamps[i] ? 1 : 1 + .12 * (1 - st));
  },
  wanted(c, t) {   // he only meant to get the small one: he points at it
    const nod = t > HIT.check ? Math.sin(clamp((t - HIT.check) / .4) * Math.PI) * .05 : 0, pt = ss(seg(t, 14.4, 14.75));
    const P = MAN({ s: 2.1, x: SPOT[0], y: SPOT[1], f: .5, look: -.2, smile: .7, squash: nod }); if (pt > 0) P.handR = reach([300, 1560], [480, 1330], pt);
    const ck = E(t, HIT.check, .3, .4);
    counter(c, t, { items: { S: [0, 1 + .15 * Math.sin(clamp((t - HIT.check) / .4) * Math.PI) * (t > HIT.check)], M: 1, L: 1 }, cashier: { look: .3 }, front: [() => mascot(c, P), () => {
      const k = E(t, 14.35, .35, .4); scaled(c, 420, 780, k, () => { c.fillStyle = '#ffffff';
        for (const [dx, dy, r] of [[-100, -10, 105], [0, -60, 125], [100, -10, 105], [0, 50, 115]]) { c.beginPath(); c.arc(420 + dx, 780 + dy, r, 0, 7); c.fill(); }
        c.beginPath(); c.arc(340, 950, 26, 0, 7); c.fill(); c.beginPath(); c.arc(310, 1020, 14, 0, 7); c.fill(); bucket(c, 420, 870, 150, 1, 3); });
      if (ck > 0) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.arc(420, 780, 190, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, ck)); c.stroke();
        c.beginPath(); c.moveTo(540, 930); c.lineTo(575, 970); c.lineTo(650, 885); c.globalAlpha = Math.min(1, ck); c.stroke(); c.restore(); } }] });
  },
  sees(c, t) {   // he sees something: a close-up, eyes wide
    bg(c, t, { rays: 1.2 });
    const P = MAN({ s: 5.2, x: 540, y: 1960, o: .9 * ss(seg(t, HIT.gasp - .1, HIT.gasp + .1)), look: -.6, headUp: .02, blink: 0 }); mascot(c, P);
    bang(c, 820, 420, E(t, HIT.bang, .3, .45), '!', 110);
  },
  plus(c, t) {   // the medium and the large side by side: only 200 Ft more... and the large grows
    const grow = E(t, HIT.grow, .4, .4);
    bg(c, t, { rays: grow });
    const dimM = .5 * grow;
    scaled(c, 300, 1330, E(t, 18.22, .3, .4), () => bucket(c, 300, 1330, 330, 1, 61));
    glow(c, 770, 1050, 500, .5 * grow); scaled(c, 770, 1330, E(t, 18.3, .3, .4) * (1 + .22 * grow), () => bucket(c, 770, 1330, 430, 1.1, 62));
    if (dimM) { c.fillStyle = `rgba(10,15,45,${dimM})`; c.beginPath(); c.roundRect(110, 900, 380, 480, 30); c.fill(); }
    card(c, 300, 1540, 370, 140, '1650 Ft', E(t, 18.3, .3, .4)); card(c, 770, 1540, 370, 140, '1850 Ft', E(t, 18.38, .3, .4), { gold: grow > .5 });
    const ar = ss(seg(t, HIT.arrow, HIT.arrow + .35)); if (ar > 0) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath();
      for (let k = 0; k <= 40 * ar; k++) { const u = k / 40, x = lerp(300, 770, u), y = 820 - Math.sin(u * Math.PI) * 260; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      if (ar >= 1) { c.fillStyle = GOLD; c.beginPath(); c.moveTo(790, 850); c.lineTo(730, 800); c.lineTo(790, 780); c.closePath(); c.fill(); } c.restore(); }
    const ch = E(t, HIT.chip, .3, .5); scaled(c, 535, 520, ch, () => { c.fillStyle = GOLD; c.beginPath(); c.roundRect(535 - 210, 520 - 75, 420, 150, 75); c.fill(); text(c, '+200 Ft', 535, 526, 96, NAVY); });
  },
  decide(c, t) {   // a moment's thought, the sizes circling his head... then the cashier hands him the large
    const got = t > HIT.drop, g = E(t, HIT.drop, .35, .45), u = ss(seg(t, HIT.drop, HIT.drop + .45));
    const P = MAN({ s: 2.1, x: SPOT[0], y: SPOT[1], f: .5, smile: got ? 1 : .35, look: got ? 0 : -.8 });
    if (!got) { P.chin = 'R'; P.headTurn = .4 * Math.sin((t - 22) * 2.4); P.tilt = -.06; }
    const Pc = { ...P }; const [bx, base] = carry(Pc, 150); if (u >= 1) Object.assign(P, Pc);
    const path = [lerp(700, bx, u), lerp(CT.top, base, u) - Math.sin(u * Math.PI) * 160], C = { smile: got ? 1 : .8, look: .3 };
    if (got && u < .55) C.handL = [path[0] + 40, path[1] - 110];
    counter(c, t, { bg: { rays: g * .8 }, items: { S: 1, M: 1, L: !got }, cashier: C, front: [() => mascot(c, P), () => { if (got) bucket(c, path[0], path[1], 150, 1.1, 72); },
      () => { const ob = E(t, HIT.orbit, .35, .4); [[0, 80], [1, 105], [2, 130]].forEach(([i, h]) => { const a = t * 1.7 + i * 2.094, x = 300 + Math.cos(a) * 220, y = 900 + Math.sin(a) * 80; scaled(c, x, y, ob * (got ? 1 - u : 1), () => bucket(c, x, y, h, 1, 70 + i)); }); }] });
  },
  overflow(c, t) {   // so much more popcorn for the money: it bursts out over the top
    const gig = t > HIT.hehe ? Math.sin((t - HIT.hehe) * 22) * Math.exp(-(t - HIT.hehe) * 3) * .05 : 0;
    const P = MAN({ s: 2.1, x: SPOT[0], y: SPOT[1], f: .5, smile: 1, blink: t > HIT.hehe - .1 && t < HIT.hehe + .6 ? 1 : blinkAt(t, 1), squash: gig }), [bx, base] = carry(P, 150);
    counter(c, t, { bg: { rays: 1 }, items: { S: 1, M: 1 }, cashier: { smile: 1, look: .2 }, front: [() => mascot(c, P), () => bucket(c, bx, base, 150, 1.1 + .6 * ss(seg(t, HIT.burst, HIT.burst + .6)), 72),
      () => { for (let w = 0; w < 6; w++) kernels(c, bx, base - 200, seg(t, HIT.burst + w * .2, HIT.burst + w * .2 + 1.2), 16, 480, 200 + w * 31, 14); }] });
  },
  cashier(c, t) {   // closer on the cashier: she rings it up, pleased. Ka-ching
    const press = Math.sin(seg(t, HIT.key - .2, HIT.key + .2) * Math.PI), happy = t > HIT.ching + .1, C = { smile: happy ? 1 : .8, blink: happy && t < HIT.ching + 1.2 ? 1 : blinkAt(t, 2), look: .2, f: .3 };
    if (press > .05) C.handR = reach([900, 1340], [1030, CT.top - 50], press);
    c.save(); c.translate(540, 900); c.scale(1.5, 1.5); c.translate(-700, -980);
    counter(c, t, { bg: { rays: E(t, HIT.ching, .4, .3) * .8 }, items: { S: 1, M: 1, L: 1 }, cashier: C, drawer: E(t, HIT.ching, .25, .45), front: [() => kernels(c, 1030, CT.top, seg(t, HIT.ching, HIT.ching + 1.0), 12, 300, 300, 10)] });
    c.restore();
  },
  off(c, t) {   // and off he goes to the film, happy; she waves
    const u = seg(t, 30.2, 31.8), x = lerp(SPOT[0], -260, ss(u)), hop = Math.abs(Math.sin(u * Math.PI * 5)) * 36 * (u > 0 && u < 1 ? 1 : 0);
    const P = MAN({ s: 2.1, x, y: SPOT[1] - hop, f: u > 0 ? -.7 : .5, smile: 1, phi: u * Math.PI * 10, walk: u > 0 && u < 1 ? 1 : 0 }), [bx, base] = carry(P, 150);
    counter(c, t, { sign: 1, items: { S: 1, M: 1, L: 1 }, cashier: { smile: 1, armR: 2.4 + .3 * Math.sin(t * 14), look: 0 }, front: [() => mascot(c, P), () => bucket(c, bx, base, 150, 1.5, 72)] });
  },
  question(c, t) {   // but did he really want the large one?
    bg(c, t, { dark: ss(seg(t, 32.6, 33.2)) });
    const push = 1 + .06 * seg(t, 32.6, 35.3); c.save(); c.translate(540, 1100); c.scale(push, push); c.translate(-540, -1100);
    const P = MAN({ s: 1.6, x: 380, y: 1720, f: .3, smile: lerp(1, .1, ss(seg(t, 33.6, 34.4))), look: -.5, headTurn: .2 }), [bx, base] = carry(P, 420);
    mascot(c, P); bucket(c, bx, base, 420, 1.3, 72);
    const q = E(t, HIT.qdrop, .45, .5); c.save(); c.translate(540, lerp(-400, 560, Math.min(q, 1.05))); c.rotate(Math.sin((t - HIT.qdrop) * 5) * .08 * Math.exp(-(t - HIT.qdrop) * 1.5)); text(c, '?', 0, 0, 560, GOLD); c.restore();
    c.restore();
  },
  strings(c, t) {   // or were the prices set up so the large looks best? the medium is on strings
    bg(c, t, { rays: E(t, HIT.big, .4, .3) * .9 });
    const tug = t > HIT.tug ? Math.sin(clamp((t - HIT.tug) / .9) * Math.PI * 3) * Math.exp(-(t - HIT.tug) * 2.5) : 0, xs = [200, 540, 880];
    const bar = [540 + 40 * tug, 230 + 30 * Math.abs(tug)], sk = E(t, HIT.strings, .4, .3);
    xs.forEach((x, i) => { const k = E(t, 35.3 + i * .1, .3, .4), big = i === 2 ? E(t, HIT.big, .35, .45) : 0, dy = i === 1 ? -70 * tug : 0, sc = k * (1 + .14 * big), y = 1080 + dy;
      if (i === 2) glow(c, x, y, 380, .55 * big);
      if (i === 1 && sk > 0) { c.strokeStyle = 'rgba(239,228,200,.8)'; c.lineWidth = 3; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(bar[0] + s * 90, bar[1]); c.lineTo(x + s * 120, y - 230 * sc); c.stroke(); } }
      scaled(c, x, y, sc, () => { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - 140 + 8, y - 230 + 12, 280, 460, 30); c.fill();
        c.fillStyle = CREAM; c.beginPath(); c.roundRect(x - 140, y - 230, 280, 460, 30); c.fill(); text(c, ['KICSI', 'KÖZEPES', 'NAGY'][i], x, y - 180, i === 1 ? 50 : 58, NAVY);
        bucket(c, x, y + 100, [110, 135, 160][i], 1, 80 + i); c.fillStyle = i === 2 && big > .5 ? GOLD : NAVY; c.beginPath(); c.roundRect(x - 120, y + 120, 240, 86, 18); c.fill();
        text(c, ['900 Ft', '1650 Ft', '1850 Ft'][i], x, y + 166, 56, i === 2 && big > .5 ? NAVY : CREAM); });
      if (i === 0 && t > 37.6) { c.fillStyle = `rgba(10,15,45,${.5 * ss(seg(t, 37.6, 38.0))})`; c.beginPath(); c.roundRect(x - 140, y - 230, 280, 460, 30); c.fill(); }
      if (i === 1 && t > HIT.decoy) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 9; c.setLineDash([26, 16]); c.lineDashOffset = -t * 80; c.globalAlpha = ss(seg(t, HIT.decoy, HIT.decoy + .3)); c.beginPath(); c.roundRect(x - 156, y - 246, 312, 492, 36); c.stroke(); c.restore(); }
      if (i === 2) star(c, x + 120, y - 230, E(t, HIT.star, .3, .5), 70); });
    if (sk > 0) { scaled(c, bar[0], bar[1], sk, () => { c.save(); c.translate(...bar); c.rotate(.25 * tug); c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(-110, -14, 220, 28, 14); c.fill(); c.beginPath(); c.roundRect(-14, -70, 28, 140, 14); c.fill();
      c.fillStyle = '#2448bb'; c.beginPath(); c.arc(0, -96, 46, 0, 7); c.fill(); c.strokeStyle = '#2448bb'; c.lineWidth = 60; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -110); c.lineTo(60, -400); c.stroke(); c.restore(); }); }
  },
  everyone(c, t) {   // no one needs talking into it: one after another, people take the large themselves
    const people = [[280, 1850, 1.45, 'blue1', null, 0], [500, 1850, 1.45, 'blue3', 'long', 1], [720, 1850, 1.45, 'blue2', 'bob', 2], [940, 1850, 1.45, 'blue1', 'hat', 3]];
    counter(c, t, { items: { S: 1, M: 1, L: 1 }, cashier: { smile: .9, armL: -.2, armR: -.2, look: .3 }, front: people.map(([x, y, sc, skin, fem, i]) => () => {
      const k = E(t, HIT.people[i], .3, .45), got = E(t, HIT.buckets[i], .25, .5), P = { id: 'p' + i, skin, fem, s: sc, x, y, f: .4, smile: .6 + .4 * got, blink: blinkAt(t, 5 + i), look: -.2 };
      const bh = 82 * sc, [bx, base] = got > 0 ? carry(P, bh) : [0, 0]; mascot(c, P, k); if (got > 0) scaled(c, bx, base, got, () => bucket(c, bx, base, bh, 1.1, 90 + i)); }) });
  },
  podium(c, t) {   // show the options so they choose the dearer one themselves
    const win = E(t, HIT.win, .4, .4);
    bg(c, t, { rays: win, ry: 760, rx: 860 });
    [[220, 160, 130, 0], [540, 260, 170, 1], [860, 380, 220, 2]].forEach(([x, ph, bh, i]) => { const r = E(t, HIT.rise[i], .35, .35), top = 1500 - ph * r;
      if (i === 2) { glow(c, x, top - 160, 420, .7 * win); if (win > 0) { c.fillStyle = `rgba(255,230,160,${.12 * win})`; c.beginPath(); c.moveTo(x - 60, 0); c.lineTo(x + 60, 0); c.lineTo(x + 200, top); c.lineTo(x - 200, top); c.closePath(); c.fill(); } }
      c.fillStyle = i === 2 && win > .5 ? GOLD : CREAM; c.fillRect(x - 140, top, 280, 1500 - top + 4); c.fillStyle = 'rgba(0,0,30,.15)'; c.fillRect(x + 90, top, 50, 1500 - top + 4);
      if (r > .3) text(c, ['900 Ft', '1650 Ft', '1850 Ft'][i], x, top + 60, 54, NAVY);
      scaled(c, x, top, r, () => bucket(c, x, top, bh, 1, 100 + i)); if (i === 2) star(c, x + 110, top - bh - 40, win, 60); });
    c.fillStyle = '#0d1440'; c.fillRect(0, 1500, 1080, 420);
    const pt = Math.sin(seg(t, HIT.point - .2, HIT.point + 1.4) * Math.PI) > 0 ? ss(seg(t, HIT.point - .2, HIT.point + .1)) : 0;
    const P = { id: 'chooser', skin: 'blue2', fem: 'long', s: 2.0, x: 230, y: 2010, f: .5, look: -1, headUp: .03, smile: .6 + .4 * win, blink: blinkAt(t, 9) };
    if (pt > 0) P.handR = reach([300, 1580], [860, 1100], pt); mascot(c, P, E(t, 43.5, .35, .4));
  },
};
const PAINT = { small: (c, t) => SHOT.price(c, t, 0), medium: (c, t) => SHOT.price(c, t, 1), large: (c, t) => SHOT.price(c, t, 2) };
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); const name = SHOTS[i][1]; (PAINT[name] || SHOT[name])(c, t); }

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
const WHIP = .24, PUNCH = .26;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'whip' && dt < WHIP && i > 0) {   // the old shot flies off left, the new one comes in from the right, smeared
    const e = ss(dt / WHIP), blur = Math.sin(e * Math.PI) * 26 * K;
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${blur}px)`; c.drawImage(bufA, -W * e, 0); c.drawImage(bufB, W * (1 - e), 0); c.restore();
  } else if (kind === 'punch' && dt < PUNCH && i > 0) {   // a snap zoom into the new shot
    const e = 1 - Math.pow(1 - dt / PUNCH, 3), s = lerp(1.22, 1, e);
    paintShot(bctx, i, t); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.filter = `blur(${(1 - e) * 10 * K}px)`; c.drawImage(bufB, 0, 0); c.restore();
  } else paintShot(c, i, t);
  vignette(c);
  const fade = ss(seg(t, STORY - .7, STORY)); if (fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits, plus his footsteps as he walks off to the film
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
for (let k = 1; k < 10; k++) { const u = k / 10, t = 30.2 + u * 1.5; EV.push({ t: +t.toFixed(3), type: 'step', pan: lerp(-.8, .5, u) }); }
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
