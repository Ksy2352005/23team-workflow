// The 23 Team mascot in 2D: round head, small rounded body, mitten arms, short legs, glossy eyes, a simple mouth.
// Soft "animated feature" shading: a radial body gradient, a contact shadow and a warm rim light. Posed from a plain object.
export const BASE_H = 210;   // standing height at scale 1, in world pixels

export const SKIN = {
  owner: { base: '#eeeeea', hi: '#ffffff', lo: '#aeb4c8' },
  blue1: { base: '#2448bb', hi: '#5a80f0', lo: '#13246a' },
  blue2: { base: '#2a52c9', hi: '#6189f5', lo: '#152a78' },
  blue3: { base: '#1f3fa6', hi: '#5272dd', lo: '#101f5e' },
};
const INK = '#151018';

function bodyGrad(ctx, cx, cy, r, sk, light = -1) {
  const g = ctx.createRadialGradient(cx + light * r * .38, cy - r * .45, r * .05, cx, cy, r * 1.08);
  g.addColorStop(0, sk.hi); g.addColorStop(.45, sk.base); g.addColorStop(1, sk.lo); return g;
}
function capsule(ctx, x1, y1, x2, y2, w) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = Math.cos(a + Math.PI / 2) * w / 2, ny = Math.sin(a + Math.PI / 2) * w / 2;
  ctx.beginPath(); ctx.moveTo(x1 + nx, y1 + ny); ctx.lineTo(x2 + nx, y2 + ny); ctx.arc(x2, y2, w / 2, a + Math.PI / 2, a - Math.PI / 2, true);
  ctx.lineTo(x1 - nx, y1 - ny); ctx.arc(x1, y1, w / 2, a - Math.PI / 2, a + Math.PI / 2, true); ctx.closePath();
}
function rim(ctx, cx, cy, r, side, col, a = .55, w = .07) {
  if (!side) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = r * w;
  ctx.beginPath(); const mid = side > 0 ? 0 : Math.PI; ctx.arc(cx, cy, r * .96, mid - 1.0, mid + 1.0); ctx.stroke(); ctx.restore();
}

// P: { x, y (feet), s, skin, f (-1 left .. 1 right), back, phi, walk, armL, armR, lean, bob, squash, sit, smile, sad, o, blink, tilt, look, rimSide, rimCol, hold, alpha }
export function drawMascot(ctx, P) {
  if (P.vis === false) return;
  const sk = SKIN[P.skin] || SKIN.blue1, H = BASE_H * (P.s || 1) * 1.08, f = Math.max(-1, Math.min(1, P.f || 0));
  const sit = P.sit || 0, sq = P.squash || 0, walk = P.walk || 0, phi = P.phi || 0;
  const bob = (P.bob || 0) * H + Math.abs(Math.cos(phi)) * .035 * H * walk;
  const x = P.x, y = P.y;
  ctx.save(); if (P.alpha !== undefined) ctx.globalAlpha = P.alpha;
  // contact shadow
  if (P.shadow !== false) {
  const sg = ctx.createRadialGradient(x, y, 0, x, y, H * .3); sg.addColorStop(0, 'rgba(5,6,25,.45)'); sg.addColorStop(1, 'rgba(5,6,25,0)');
  ctx.fillStyle = sg; ctx.save(); ctx.translate(x, y); ctx.scale(1, .2); ctx.translate(-x, -y); ctx.beginPath(); ctx.arc(x, y, H * .3, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.translate(x, y); ctx.rotate(P.lean || 0); ctx.translate(-x, -y);
  if (P.rot) { const px = x, py = y - .2 * H; ctx.translate(px, py); ctx.rotate(P.rot); ctx.translate(-px, -py); }
  const lift = sit * .05 * H, yb = y - lift - bob;       // body baseline
  const hipY = yb - .26 * H, shY = yb - .5 * H, headY = yb - .76 * H * (1 - sq * .6), R = .225 * H;
  const legW = .078 * H, legDX = .055 * H * (1 - .55 * Math.abs(f)), fwd = Math.sign(f || 1);
  const light = P.lightSide ?? -1;
  // legs
  const leg = (side, swing) => {
    const lx = x + side * legDX;
    if (sit > .5) {
      const dir = Math.abs(f) > .3 ? fwd : 0, kx = lx + dir * .2 * H, ky = hipY + .04 * H;
      ctx.fillStyle = bodyGrad(ctx, lx, hipY, .2 * H, sk, light); capsule(ctx, lx, hipY, kx, ky, legW); ctx.fill();
      ctx.beginPath(); ctx.ellipse(kx + dir * .02 * H, ky + .05 * H, .062 * H, .04 * H, 0, 0, 7); ctx.fill();
    } else if (side < 0 ? P.footL : P.footR) {
      const [fx, fy] = side < 0 ? P.footL : P.footR, L = (yb - .05 * H - hipY) * 1.04, dx = fx - lx, dy = fy - hipY, d = Math.min(Math.hypot(dx, dy), L * .999);
      const a = Math.atan2(dy, dx), k = Math.acos(d / L) * fwd, kx = lx + Math.cos(a - k) * L / 2, ky = hipY + Math.sin(a - k) * L / 2, ex = lx + Math.cos(a) * d, ey = hipY + Math.sin(a) * d;
      ctx.fillStyle = bodyGrad(ctx, lx, hipY + .1 * H, .2 * H, sk, light); capsule(ctx, lx, hipY, kx, ky, legW); ctx.fill(); capsule(ctx, kx, ky, ex, ey, legW); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex + fwd * .025 * H, ey + .01 * H, .065 * H, .036 * H, 0, 0, 7); ctx.fill();
    } else {
      const sx = swing * .1 * H * Math.max(Math.abs(f), .25) * fwd, up = Math.max(0, -swing) * .05 * H;
      ctx.fillStyle = bodyGrad(ctx, lx, hipY + .1 * H, .2 * H, sk, light); capsule(ctx, lx, hipY, lx + sx, yb - .05 * H - up, legW); ctx.fill();
      ctx.beginPath(); ctx.ellipse(lx + sx + f * .03 * H, yb - .03 * H - up, .07 * H, .04 * H, 0, 0, 7); ctx.fill();
    }
  };
  const s1 = Math.sin(phi) * walk;
  if (f >= 0) { leg(1, -s1); leg(-1, s1); } else { leg(-1, s1); leg(1, -s1); }
  // arms: angle 0 hangs down, positive swings outward on its own side of the screen
  // an arm either swings to an angle, or reaches for a point in the world (a hand target)
  const arm = (side, ang) => {
    const ax = x + side * .125 * H * (1 - .45 * Math.abs(f)), ay = shY, L0 = .27 * H;
    let tgt = side < 0 ? P.handL : P.handR;
    if (P.chin && ((P.chin === 'L') === (side < 0))) tgt = [x + (P.headDX || 0) * H + side * .05 * H, headY + .2 * H];
    let a = ang * side, L = L0;
    if (tgt) { const dx = tgt[0] - ax, dy = tgt[1] - ay; a = Math.atan2(dx, dy); L = Math.min(Math.hypot(dx, dy), L0 * 1.35); }
    const ex = ax + Math.sin(a) * L, ey = ay + Math.cos(a) * L;
    ctx.fillStyle = bodyGrad(ctx, ax, ay + L / 2, L * .8, sk, light); capsule(ctx, ax, ay, ex, ey, .062 * H); ctx.fill();
    ctx.beginPath(); ctx.arc(ex, ey, .046 * H, 0, 7); ctx.fill();
    return [ex, ey];
  };
  const armL = P.armL ?? (.12 + s1 * .35 * Math.max(.4, Math.abs(f)) * -fwd), armR = P.armR ?? (.12 + s1 * .35 * Math.max(.4, Math.abs(f)) * fwd);
  // the far arm goes behind the body when turned
  let hands = {};
  if (f > .25) hands.L = arm(-1, armL); if (f < -.25) hands.R = arm(1, armR);
  // body
  const bx = x, by = yb - .38 * H;
  ctx.fillStyle = bodyGrad(ctx, bx, by, .24 * H, sk, light);
  ctx.beginPath(); ctx.ellipse(bx, by, .135 * H * (1 + sq * .4) * (1 - .1 * Math.abs(f)), .15 * H * (1 - sq), 0, 0, 7); ctx.fill();
  if (!(f > .25)) hands.L = arm(-1, armL); if (!(f < -.25)) hands.R = arm(1, armR);
  // held props
  P_tray = P; if (P.hold) drawHeld(ctx, P.hold, hands, H, x, shY, f);
  // head
  const hx = x + (P.headDX || 0) * H, hy = headY - (P.headUp || 0) * H;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(P.tilt || 0); ctx.translate(-hx, -hy);
  ctx.fillStyle = 'rgba(0,0,20,.22)'; ctx.beginPath(); ctx.ellipse(hx, hy + R * .9, R * .55, R * .16, 0, 0, 7); ctx.fill();
  const ff = Math.max(-1, Math.min(1, f + (P.headTurn || 0)));
  if (P.fem) hairBack(ctx, hx, hy, R, P.fem, ff, P.back);
  ctx.fillStyle = bodyGrad(ctx, hx, hy, R, sk, light); ctx.beginPath(); ctx.arc(hx, hy, R, 0, 7); ctx.fill();
  if (!P.back) face(ctx, hx, hy, R, ff, P);
  if (P.fem) hairFront(ctx, hx, hy, R, P.fem, ff, P.back);
  if (P.cap) capHat(ctx, hx, hy, R, ff, P.back);
  if (P.helmet) helmet(ctx, hx, hy, R, ff);
  if (P.tache && !P.back) { const mx = hx + ff * .42 * R, my = hy + .2 * R + (P.look || 0) * R * .06; ctx.fillStyle = '#3a2418';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(mx + s * .11 * R, my, .14 * R, .06 * R, s * .25, 0, 7); ctx.fill(); } }
  ctx.restore();
  ctx.restore();
}

function capHat(ctx, hx, hy, R, f, back) {   // a navy baseball cap, peak forward
  ctx.fillStyle = '#26346f'; ctx.beginPath(); ctx.arc(hx, hy - R * .08, R * 1.02, Math.PI * 1.04, Math.PI * 1.96); ctx.closePath(); ctx.fill();
  if (!back) { const d = Math.abs(f) > .25 ? Math.sign(f) : 0; ctx.fillStyle = '#1b2654'; ctx.beginPath();
    if (d) ctx.ellipse(hx + d * R * .9, hy - R * .3, R * .55, R * .12, d * .1, 0, 7); else ctx.ellipse(hx, hy - R * .3, R * .85, R * .16, 0, 0, Math.PI); ctx.fill(); }
  ctx.fillStyle = '#f1e6cc'; ctx.beginPath(); ctx.arc(hx, hy - R * 1.08, R * .1, 0, 7); ctx.fill();
}
function helmet(ctx, hx, hy, R, f) {   // a cream cycling helmet with navy vents
  ctx.fillStyle = '#efe4c8'; ctx.beginPath(); ctx.ellipse(hx - f * R * .1, hy - R * .38, R * 1.08, R * .78, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#26346f'; for (const k of [-.45, 0, .45]) { ctx.beginPath(); ctx.ellipse(hx + (k - f * .1) * R, hy - R * .82, R * .12, R * .22, k * .6, 0, 7); ctx.fill(); }
  ctx.strokeStyle = '#2a2a33'; ctx.lineWidth = R * .05; ctx.beginPath(); ctx.moveTo(hx - R * .7 + f * R * .3, hy - R * .4); ctx.lineTo(hx + f * R * .3, hy + R * .75); ctx.stroke();
}
function face(ctx, cx, cy, R, f, P) {
  const lookY = (P.look || 0) * R * .12, fx = cx + f * .42 * R, sep = .34 * R * (1 - .5 * Math.abs(f));
  const blink = 1 - .92 * (P.blink || 0), happy = Math.max(0, (P.smile || 0) - .55) * .55;
  for (const s of [-1, 1]) {
    const far = (s === Math.sign(-f)) ? 1 - .35 * Math.abs(f) : 1;
    const ex = fx + s * sep, ey = cy - .02 * R + lookY, w = .095 * R * far, h = .145 * R * blink * (1 - happy);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex, ey, w, Math.max(h, .012 * R), 0, 0, 7); ctx.fill();
    if (h > .05 * R) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(ex - w * .3, ey - h * .45, w * .32, 0, 7); ctx.fill(); }
    if (P.fem) { ctx.strokeStyle = INK; ctx.lineWidth = .025 * R; ctx.lineCap = 'round'; const o = s * (1 - .3 * Math.abs(f));
      for (const k of [0, 1]) { const ax = ex + o * w * (.55 + .35 * k), ay = ey - h * (.75 - .35 * k); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + o * .07 * R, ay - .05 * R); ctx.stroke(); } }
    if (P.fem === 'glasses') { ctx.strokeStyle = '#e8577a'; ctx.lineWidth = .04 * R; ctx.beginPath(); ctx.ellipse(ex, ey, .17 * R * far, .17 * R, 0, 0, 7); ctx.stroke(); }
  }
  if (P.fem === 'glasses') { ctx.strokeStyle = '#e8577a'; ctx.lineWidth = .035 * R; ctx.beginPath(); ctx.moveTo(fx - sep + .17 * R, cy - .03 * R + lookY); ctx.lineTo(fx + sep - .17 * R, cy - .03 * R + lookY); ctx.stroke(); }
  const sm = P.smile || 0, sd = P.sad || 0, o = P.o || 0, mx = fx, my = cy + .32 * R + lookY * .5, mw = .2 * R * (1 - .3 * Math.abs(f));
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = .035 * R;
  if (o > .3) { ctx.beginPath(); ctx.ellipse(mx, my, .06 * R * o, .08 * R * o, 0, 0, 7); ctx.fill(); }
  else if (sm > .45) {
    const k = (sm - .45) / .55; ctx.beginPath(); ctx.moveTo(mx - mw * .75, my - .02 * R); ctx.quadraticCurveTo(mx, my + (.06 + .16 * k) * R, mx + mw * .75, my - .02 * R); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c4566a'; ctx.beginPath(); ctx.ellipse(mx, my + .07 * R * k, .07 * R * k, .03 * R * k, 0, 0, 7); ctx.fill();
  } else if (sm > .1) { ctx.beginPath(); ctx.moveTo(mx - mw * .6, my); ctx.quadraticCurveTo(mx, my + .07 * R * sm * 2, mx + mw * .6, my); ctx.stroke(); }
  else if (sd > .2) { ctx.beginPath(); ctx.moveTo(mx - mw * .55, my + .04 * R); ctx.quadraticCurveTo(mx, my - .07 * R * sd, mx + mw * .55, my + .04 * R); ctx.stroke(); }
  else if (P.fem) { ctx.fillStyle = '#d6456a'; ctx.beginPath(); ctx.ellipse(mx, my - .012 * R, .07 * R, .03 * R, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(mx, my + .022 * R, .06 * R, .03 * R, 0, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(mx - mw * .45, my); ctx.lineTo(mx + mw * .45, my); ctx.stroke(); }
}

// —— the women's looks (after the character sheet): a bow, a bun, a ponytail, a bob, long hair, a beret, glasses, a sun hat, a headband ——
const HAIR = '#4a2c1e', HAIR2 = '#6e4630', PINK = '#ef6a98', PINK2 = '#e8577a';
function cap(ctx, hx, hy, R, f, back, down = .32) {   // hair over the top of the head with a soft fringe
  ctx.fillStyle = HAIR; ctx.beginPath();
  if (back) { ctx.arc(hx, hy, R * 1.04, Math.PI * .95, Math.PI * .05, false); ctx.lineTo(hx + R, hy + R * .25); ctx.quadraticCurveTo(hx, hy + R * .45, hx - R, hy + R * .25); ctx.closePath(); ctx.fill(); return; }
  const fo = f * .25 * R; ctx.arc(hx, hy, R * 1.04, Math.PI * 1.02, Math.PI * 1.98, false);
  ctx.quadraticCurveTo(hx + R * .6 + fo, hy - R * down * .4, hx + fo, hy - R * down); ctx.quadraticCurveTo(hx - R * .6 + fo, hy - R * down * .4, hx - R * 1.02, hy - R * .05); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(hx - R * .35, hy - R * .72, R * .3, R * .1, -.4, 0, 7); ctx.fill();
}
function bow(ctx, x, y, s, rot = .35) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = PINK;
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(d * s * 1.1, -s * .9, d * s * 1.15, 0); ctx.quadraticCurveTo(d * s * 1.1, s * .9, 0, 0); ctx.fill(); }
  ctx.fillStyle = PINK2; ctx.beginPath(); ctx.arc(0, 0, s * .32, 0, 7); ctx.fill(); ctx.restore();
}
function hairBack(ctx, hx, hy, R, kind, f, back) {
  ctx.fillStyle = HAIR;
  if (kind === 'bob') { ctx.beginPath(); ctx.moveTo(hx - R * 1.12, hy - R * .2); ctx.quadraticCurveTo(hx - R * 1.2, hy + R * .55, hx - R * .8, hy + R * .62); ctx.lineTo(hx + R * .8, hy + R * .62); ctx.quadraticCurveTo(hx + R * 1.2, hy + R * .55, hx + R * 1.12, hy - R * .2); ctx.closePath(); ctx.fill(); }
  if (kind === 'long') { ctx.beginPath(); ctx.moveTo(hx - R * 1.1, hy - R * .2); for (let i = 0; i <= 6; i++) ctx.lineTo(hx - R * 1.15 + Math.sin(i * 1.4) * R * .08, hy + i * R * .22); ctx.lineTo(hx + R * 1.15, hy + R * 1.32); for (let i = 6; i >= 0; i--) ctx.lineTo(hx + R * 1.15 + Math.sin(i * 1.4) * R * .08, hy + i * R * .22); ctx.closePath(); ctx.fill(); }
  if (kind === 'pony') { const d = f > .1 ? -1 : 1; ctx.strokeStyle = HAIR; ctx.lineCap = 'round'; ctx.lineWidth = R * .34; ctx.beginPath(); ctx.moveTo(hx + d * R * .55, hy - R * .85); ctx.quadraticCurveTo(hx + d * R * 1.35, hy - R * .7, hx + d * R * 1.15, hy + R * .35); ctx.stroke(); }
  if (kind === 'hat') { ctx.fillStyle = '#e8577a'; ctx.beginPath(); ctx.ellipse(hx, hy - R * .55, R * 1.55, R * .3, 0, Math.PI, 0); ctx.fill(); }
}
function hairFront(ctx, hx, hy, R, kind, f, back) {
  if (kind === 'bow') { bow(ctx, hx + R * .55, hy - R * .82, R * .32); return; }
  if (kind === 'glasses') return;
  if (kind === 'beret') { ctx.fillStyle = '#c4305f'; ctx.beginPath(); ctx.ellipse(hx + R * .12, hy - R * .78, R * .92, R * .34, -.15, 0, 7); ctx.fill(); ctx.fillStyle = '#a82652'; ctx.fillRect(hx + R * .05, hy - R * 1.2, R * .1, R * .16); return; }
  if (kind === 'hat') { ctx.fillStyle = '#ef6a98'; ctx.beginPath(); ctx.ellipse(hx, hy - R * .55, R * 1.55, R * .3, 0, 0, Math.PI); ctx.fill(); ctx.beginPath(); ctx.ellipse(hx, hy - R * .8, R * .78, R * .48, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#c4305f'; ctx.fillRect(hx - R * .78, hy - R * .72, R * 1.56, R * .12);
    ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; ctx.beginPath(); ctx.arc(hx + R * .45 + Math.cos(a) * R * .1, hy - R * .9 + Math.sin(a) * R * .1, R * .08, 0, 7); ctx.fill(); } ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(hx + R * .45, hy - R * .9, R * .06, 0, 7); ctx.fill(); return; }
  if (kind === 'band') { ctx.fillStyle = PINK2; ctx.beginPath(); ctx.arc(hx, hy, R * 1.03, Math.PI * 1.05, Math.PI * 1.95); ctx.arc(hx, hy + R * .1, R * .85, Math.PI * 1.9, Math.PI * 1.1, true); ctx.closePath(); ctx.fill(); bow(ctx, hx + R * .62, hy - R * .82, R * .26, .6); return; }
  cap(ctx, hx, hy, R, f, back, kind === 'bob' || kind === 'long' ? .42 : .3);
  if (kind === 'bun') { ctx.fillStyle = HAIR; ctx.beginPath(); ctx.arc(hx, hy - R * 1.12, R * .42, 0, 7); ctx.fill(); ctx.fillStyle = HAIR2; ctx.beginPath(); ctx.arc(hx - R * .1, hy - R * 1.2, R * .18, 0, 7); ctx.fill(); ctx.fillStyle = PINK2; ctx.beginPath(); ctx.ellipse(hx, hy - R * .8, R * .4, R * .09, 0, 0, 7); ctx.fill(); }
  if (kind === 'pony') { ctx.fillStyle = PINK2; ctx.beginPath(); ctx.arc(hx + (f > .1 ? -1 : 1) * R * .55, hy - R * .85, R * .12, 0, 7); ctx.fill(); }
}

let P_tray = {};
function drawHeld(ctx, what, hands, H, x, shY, f) {
  const hR = hands.R || hands.L, hL = hands.L || hands.R;
  if (what === 'key' && hR) {
    ctx.strokeStyle = '#e2b955'; ctx.lineWidth = .025 * H; ctx.beginPath(); ctx.arc(hR[0], hR[1] - .05 * H, .035 * H, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hR[0], hR[1] - .015 * H); ctx.lineTo(hR[0], hR[1] + .09 * H); ctx.lineTo(hR[0] + .03 * H, hR[1] + .09 * H); ctx.stroke();
  }
  if (what === 'cloth' && hR) { ctx.fillStyle = '#f7f5ee'; ctx.beginPath(); ctx.ellipse(hR[0], hR[1] + .03 * H, .07 * H, .03 * H, .2, 0, 7); ctx.fill(); }
  if (what === 'tray' && hL && hR) {
    const ty = Math.min(hL[1], hR[1]) - .02 * H, tx = (hL[0] + hR[0]) / 2;
    (P_tray.items || []).forEach((it, i, a) => { const ix = tx + (i - (a.length - 1) / 2) * .13 * H; if (it === 'cup') cup(ctx, ix, ty, H * .5); else plate(ctx, ix, ty, H * .5, true); });
    ctx.fillStyle = '#c9ccd6'; ctx.beginPath(); ctx.ellipse(tx, ty, .2 * H, .028 * H, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#eef0f6'; ctx.beginPath(); ctx.ellipse(tx, ty - .008 * H, .19 * H, .018 * H, 0, 0, 7); ctx.fill();
  }
  if (what === 'cup' && hR) cup(ctx, hR[0], hR[1] - .02 * H, H * .5);
  if (what === 'knife' && hR) { ctx.fillStyle = '#3a2a1e'; ctx.fillRect(hR[0] - .012 * H, hR[1] - .05 * H, .024 * H, .06 * H); ctx.fillStyle = '#dfe3ea'; ctx.beginPath(); ctx.moveTo(hR[0] - .01 * H, hR[1] + .01 * H); ctx.lineTo(hR[0] + .012 * H, hR[1] + .01 * H); ctx.lineTo(hR[0] + .02 * H, hR[1] + .13 * H); ctx.lineTo(hR[0] - .01 * H, hR[1] + .1 * H); ctx.closePath(); ctx.fill(); }
  if (what === 'coin' && hR) { ctx.fillStyle = '#e8c35a'; ctx.beginPath(); ctx.ellipse(hR[0], hR[1] + .03 * H, .028 * H, .022 * H, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#b8902e'; ctx.lineWidth = .006 * H; ctx.stroke(); }
}
// a plate with food (steam when hot)
export function plate(ctx, x, y, s, food = true, steam = 0, t = 0) {
  ctx.fillStyle = '#d9d4c8'; ctx.beginPath(); ctx.ellipse(x, y + .01 * s, .22 * s, .05 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#fbf8f1'; ctx.beginPath(); ctx.ellipse(x, y, .21 * s, .045 * s, 0, 0, 7); ctx.fill();
  if (food) { ctx.fillStyle = '#c8783a'; ctx.beginPath(); ctx.ellipse(x - .03 * s, y - .03 * s, .1 * s, .045 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5c9a45'; ctx.beginPath(); ctx.arc(x + .08 * s, y - .025 * s, .035 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8c35a'; ctx.beginPath(); ctx.arc(x + .02 * s, y - .05 * s, .03 * s, 0, 7); ctx.fill(); }
  if (steam > 0) { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${.35 * steam})`; ctx.lineWidth = .02 * s; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); const bx = x + i * .06 * s; ctx.moveTo(bx, y - .06 * s); for (let k = 1; k <= 6; k++) ctx.lineTo(bx + Math.sin(t * 4 + k + i * 2) * .025 * s, y - .06 * s - k * .05 * s); ctx.stroke(); } ctx.restore(); }
}
export function cup(ctx, x, y, s) {
  ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.ellipse(x, y, .16 * s, .035 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - .09 * s, y - .17 * s); ctx.lineTo(x + .09 * s, y - .17 * s); ctx.lineTo(x + .07 * s, y - .02 * s); ctx.lineTo(x - .07 * s, y - .02 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a321a'; ctx.beginPath(); ctx.ellipse(x, y - .17 * s, .09 * s, .022 * s, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = .025 * s; ctx.beginPath(); ctx.arc(x + .1 * s, y - .1 * s, .04 * s, -1.4, 1.4); ctx.stroke();
}

export function walkPose(phi, amt = 1) { return { phi, walk: amt }; }
