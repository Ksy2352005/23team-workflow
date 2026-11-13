// Más főnök (Same team, different boss): a remake of the user's reference (split-screen boss simulation, 2026-11-13) in the 23 Team mascot world.
// Top: the bad boss's wine-red room; he sits in his armchair and the profit pipe feeds every coin straight into his mouth. Bottom: the good boss's
// midnight-blue room; the pipe runs over the team and rains the coins down on them. Same shot order as the reference: both rooms, zoom into the
// bad boss („GYORSABBAN!”, „MINDENT ELVESZ.”), glide down to the good boss („MEGOSZTJA VELÜK.”), back to both rooms, then the months run:
// the bad boss's team quits, a help-wanted sign goes up and he turns grey while his money falls; the good boss pays a bonus, hires, upgrades,
// and his money keeps climbing. No voice (like the reference); the spoken call to action plays over the end card.
import { start, ss, seg, clamp, lerp, ease3, hash, K } from './kit.js';
import { drawMascot } from './char2d.js';
const STORY = 15.8, DUR = 20.6;   // DUR = STORY + 1.3 + call to action (line 2) + 1.5 s of the logo alone
const CREAM = '#f6efdc', GOLD = '#ffd36a', GOLD2 = '#e3a92f', NAVY = '#14205a', REDT = '#ff6060', GREENT = '#8ee6a6', BLUET = '#8cc4ff';
const TOP = { Y0: 330, kind: 'bad' }, BOT = { Y0: 990, kind: 'good' };
for (const R of [TOP, BOT]) R.FL = R.Y0 + 560;   // the floor line (feet) of each room; each room is 640 tall (wall 560 + floor 80)
const BIKES = [150, 290, 430, 570];
// —— helpers ——
const spring = (t, at, d = .35, b = .45) => { if (t < at) return 0; const u = (t - at) / d; return 1 - Math.exp(-4.5 * u) * Math.cos(u * Math.PI * (1 + b * 2)) ; };
const pop = (t, at, d = .3) => t < at ? 0 : Math.min(1.12, spring(t, at, d));
const rr = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
const ell = (c, x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); c.fill(); };
function text(c, s, x, y, size, col, align = 'center', o = {}) { c.save(); c.font = `${size}px "Lilita One"`; c.textAlign = align; c.textBaseline = 'middle'; if (o.ls) c.letterSpacing = o.ls + 'px';
  if (o.stroke) { c.lineJoin = 'round'; c.strokeStyle = o.stroke; c.lineWidth = o.sw || size * .16; c.strokeText(s, x, y); } c.fillStyle = 'rgba(5,6,25,.35)'; c.fillText(s, x + 2, y + 4); c.fillStyle = col; c.fillText(s, x, y); c.restore(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
const fmt = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft';
const KF = (t, keys) => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const u = ss(seg(t, keys[i - 1][0], keys[i][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); };
// —— the story's clock ——
const ZOOM_IN = 3.2, FASTER = 3.6, TAKES = 4.35, GLIDE = 5.6, SHARES = 6.15, ZOOM_OUT = 7.15, M1 = 7.9;
const MONTHS = [M1, 8.85, 9.75, 10.65, 11.55, 12.45];
const QUIT = [11.0, 9.95, 8.85];             // the bad boss's workers quit (index = bike): the third first, then the second, then the first
const ANGRY = [8.0, 8.85];                   // the bad boss jumps up and shouts at the third worker; then he sits back down
const HIRE = 9.75, UPGRADE = 10.7, SIGN = 11.9, GREY = 12.0;
const badActive = t => [0, 1, 2].filter(i => t < QUIT[i]).length, goodActive = t => t < HIRE + .75 ? 3 : 4;
// the camera: both rooms → zoom on the bad boss → glide down to the good boss → back to both rooms
const CAM = [[0, 540, 960, 1], [ZOOM_IN, 540, 960, 1], [ZOOM_IN + .6, 610, 660, 1.42], [GLIDE, 610, 660, 1.42], [GLIDE + .7, 600, 1320, 1.42], [ZOOM_OUT, 600, 1320, 1.42], [ZOOM_OUT + .6, 540, 960, 1]];
// money (forint): the bad boss races ahead early, peaks when his team starts to leave, then falls and freezes; the good boss climbs and keeps climbing
const BADM = t => t < 8.85 ? 6080000 * Math.pow(t / 8.85, 1.3) : lerp(6080000, 1800000, ss(seg(t, 8.85, 13.4)));
const GOODM = t => 16530310 * Math.pow(Math.min(t, 15.2) / 15.2, 2.1);
const pedal = (t, bad) => 9 * t + (bad ? 7 * (clamp(t, FASTER, GLIDE) - FASTER) : 0);
// —— the coins: emitted from each machine at a rate set by the working team (simulated once), then animated along the pipe ——
function emit(rate) { const out = []; let acc = 0; for (let t = 0; t < STORY; t += 1 / 240) { acc += rate(t) / 240; if (acc >= 1) { acc -= 1; out.push(+t.toFixed(4)); } } return out; }
const BAD_COINS = emit(t => badActive(t) * (t > FASTER && t < GLIDE ? 3.3 : 2.1));
const GOOD_COINS = emit(t => goodActive(t) * (t > UPGRADE ? 2.6 : 1.55)).map((te, k) => ({ te, w: k % goodActive(te) }));
const BILLS = [...[0, 1, 2].map(i => ({ te: SHARES - .15 + i * .22, w: i })), ...[0, 1, 2].map(i => ({ te: M1 - .1 + i * .2, w: i }))];
// bad room pipe: from the machine up, along, and down to a nozzle at the boss's mouth
const MX_B = 640, BOSS_B = 862, MX_G = 730, BOSS_G = 905;
function polyAt(pts, u) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const d = clamp(u) * L[L.length - 1];
  for (let i = 1; i < pts.length; i++) if (d <= L[i]) { const s = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [lerp(pts[i - 1][0], pts[i][0], s), lerp(pts[i - 1][1], pts[i][1], s)]; } return pts[pts.length - 1]; }
const pipeB = Y => [[MX_B, Y + 330], [MX_B, Y + 190], [785, Y + 190], [785, Y + 292]];
const pipeG = (Y, i) => [[MX_G, Y + 330], [MX_G, Y + 175], [BIKES[i], Y + 175], [BIKES[i], Y + 205]];
// —— the set ——
function roomSet(c, R, t) { const { Y0, FL, kind } = R, bad = kind === 'bad';
  const g = c.createLinearGradient(0, Y0, 0, FL); if (bad) { g.addColorStop(0, '#61203a'); g.addColorStop(1, '#3f1124'); } else { g.addColorStop(0, '#0a1d5e'); g.addColorStop(1, '#00113F'); }
  c.fillStyle = g; c.fillRect(-300, Y0, 1680, 560);
  if (!bad) { const gl = c.createRadialGradient(540, Y0 + 300, 30, 540, Y0 + 300, 620); gl.addColorStop(0, 'rgba(22,58,140,.75)'); gl.addColorStop(1, 'rgba(22,58,140,0)'); c.fillStyle = gl; c.fillRect(-300, Y0, 1680, 560); }
  else { const gl = c.createRadialGradient(560, Y0 + 300, 30, 560, Y0 + 300, 620); gl.addColorStop(0, 'rgba(150,50,70,.35)'); gl.addColorStop(1, 'rgba(150,50,70,0)'); c.fillStyle = gl; c.fillRect(-300, Y0, 1680, 560); }
  for (let x = -60; x < 1180; x += 132) { c.fillStyle = 'rgba(0,0,15,.2)'; c.fillRect(x, Y0, 5, 560); c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(x + 5, Y0, 3, 560); }   // wall panels
  rr(c, -300, Y0, 1680, 16, 0, bad ? '#2c0a17' : '#06103d');   // cornice
  if (!bad) for (const lx of [560, 790]) { const on = .85 + .15 * Math.sin(t * 2 + lx); const cg = c.createLinearGradient(0, Y0 + 40, 0, FL); cg.addColorStop(0, `rgba(255,236,190,${.13 * on})`); cg.addColorStop(1, 'rgba(255,236,190,0)');
    c.fillStyle = cg; c.beginPath(); c.moveTo(lx - 22, Y0 + 44); c.lineTo(lx + 22, Y0 + 44); c.lineTo(lx + 150, FL); c.lineTo(lx - 150, FL); c.closePath(); c.fill();
    rr(c, lx - 2, Y0 + 14, 4, 18, 2, '#0d1a4f'); c.fillStyle = '#16245e'; c.beginPath(); c.ellipse(lx, Y0 + 40, 28, 14, 0, Math.PI, 0); c.fill(); ell(c, lx, Y0 + 42, 12, 5, '#ffe6a8'); }
  // floor
  const f = c.createLinearGradient(0, FL, 0, FL + 80); if (bad) { f.addColorStop(0, '#2e0b18'); f.addColorStop(1, '#1f0710'); } else { f.addColorStop(0, '#0b1d5c'); f.addColorStop(1, '#061344'); }
  c.fillStyle = f; c.fillRect(-300, FL, 1680, 80); c.fillStyle = bad ? '#8a3046' : '#2e58c8'; c.fillRect(-300, FL - 2, 1680, 6);
  // the room's name
  c.save(); c.font = '46px "Lilita One"'; const w1 = c.measureText(bad ? 'ROSSZ ' : 'JÓ ').width; c.restore();
  text(c, bad ? 'ROSSZ ' : 'JÓ ', 92, Y0 + 62, 46, bad ? REDT : BLUET, 'left'); text(c, 'FŐNÖK', 92 + w1, Y0 + 62, 46, CREAM, 'left'); }
function bike(c, x, FL, phi, k = 1) { if (k <= 0) return; scaled(c, x, FL, Math.min(1, k), () => {
  const FR = '#aeb8d6', FR2 = '#7c87ab'; c.lineCap = 'round'; c.strokeStyle = FR2; c.lineWidth = 12; c.beginPath(); c.moveTo(x - 60, FL - 7); c.lineTo(x + 78, FL - 7); c.stroke();
  ell(c, x - 60, FL - 4, 14, 5, FR2); ell(c, x + 78, FL - 4, 14, 5, FR2);
  c.strokeStyle = FR; c.lineWidth = 10; c.beginPath(); c.moveTo(x - 14, FL - 8); c.lineTo(x - 8, FL - 96); c.stroke(); c.beginPath(); c.moveTo(x - 4, FL - 40); c.lineTo(x + 56, FL - 56); c.lineTo(x + 64, FL - 152); c.stroke();
  c.lineWidth = 9; c.beginPath(); c.moveTo(x + 50, FL - 156); c.lineTo(x + 80, FL - 150); c.stroke();
  ell(c, x - 6, FL - 100, 28, 9, '#2a2f48');   // saddle
  const wx = x + 50, wy = FL - 46; ell(c, wx, wy, 36, 36, '#272c45'); c.strokeStyle = '#c9d1ea'; c.lineWidth = 5; c.beginPath(); c.arc(wx, wy, 32, 0, 7); c.stroke();   // flywheel
  c.lineWidth = 3; c.strokeStyle = 'rgba(201,209,234,.7)'; for (let k2 = 0; k2 < 6; k2++) { const a = phi * .6 + k2 * Math.PI / 3; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * 30, wy + Math.sin(a) * 30); c.stroke(); } ell(c, wx, wy, 7, 7, '#c9d1ea');
  ell(c, x + 14, FL - 54, 9, 9, FR2); }); }
const crank = (x, FL) => [x + 14, FL - 54];
function machine(c, x, FL, t, on, gold = 0) { const w = 124, h = 210, X = x - w / 2, Y = FL - h;
  ell(c, x, FL + 4, 70, 9, 'rgba(0,0,15,.35)'); rr(c, X, Y, w, h, 14, gold ? '#e9b43c' : '#3b4160'); rr(c, X + 6, Y + 6, w - 12, 10, 5, gold ? '#ffd774' : '#4d5476');
  if (gold) { c.save(); c.globalAlpha = gold; rr(c, X, Y, w, h, 14, '#efbd45'); rr(c, X + 6, Y + 6, w - 12, 10, 5, '#ffe08a'); c.restore(); }
  rr(c, X + 20, Y + 24, w - 40, 26, 6, gold > .5 ? '#8a5a10' : '#262a40'); text(c, 'PROFIT', x, Y + 38, 20, gold > .5 ? '#ffe7a3' : GOLD);
  const fy = Y + 130; ell(c, x, fy, 44, 44, gold > .5 ? '#b47f1c' : '#262a40'); c.save(); c.translate(x, fy); c.rotate(on); c.fillStyle = gold > .5 ? '#ffe08a' : '#9aa3c4';
  for (let k = 0; k < 5; k++) { c.rotate(Math.PI * 2 / 5); c.beginPath(); c.ellipse(0, -20, 9, 19, 0, 0, 7); c.fill(); } c.restore(); ell(c, x, fy, 7, 7, gold > .5 ? '#fff1c4' : '#c9d1ea'); }
function pipe(c, pts, col = '#9aa3c4') { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#5d6688'; c.lineWidth = 22; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  c.strokeStyle = col; c.lineWidth = 15; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y - 4) : c.moveTo(x, y - 4)); c.stroke(); c.restore(); }
function coin(c, x, y, r = 12, k = 1) { if (k <= 0) return; ell(c, x, y + 2, r, r, '#a8741a'); ell(c, x, y, r, r, '#ffcf4a'); c.strokeStyle = '#e09a22'; c.lineWidth = r * .22; c.beginPath(); c.arc(x, y, r * .62, 0, 7); c.stroke(); ell(c, x - r * .35, y - r * .35, r * .22, r * .16, 'rgba(255,255,255,.7)'); }
function bill(c, x, y, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); rr(c, -24, -13, 48, 26, 4, '#5fbf7f'); rr(c, -20, -9, 40, 18, 3, '#7fd69a'); ell(c, 0, 0, 7, 7, '#3f9a5e'); c.restore(); }
function armchair(c, x, FL, part) { const red = '#c8424a', red2 = '#94283a', red3 = '#e0606a';
  if (part === 'back') { rr(c, x - 118, FL - 330, 236, 300, 50, red2); rr(c, x - 104, FL - 318, 208, 270, 42, red); rr(c, x - 90, FL - 300, 60, 210, 30, red3 + '55'); }
  else { rr(c, x - 132, FL - 150, 56, 150, 22, red2); rr(c, x + 76, FL - 150, 56, 150, 22, red2); rr(c, x - 128, FL - 146, 48, 40, 18, red3); rr(c, x + 80, FL - 146, 48, 40, 18, red3); rr(c, x - 84, FL - 70, 168, 62, 16, red); } }
function bubble(c, x, y, s, k) { if (k <= 0) return; scaled(c, x, y + 30, Math.min(1.1, k), () => { c.save(); c.font = '30px "Lilita One"'; const w = c.measureText(s).width + 36; c.restore();
  rr(c, x - w / 2, y - 26, w, 52, 14, '#ffffff'); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x - 10, y + 24); c.lineTo(x + 8, y + 24); c.lineTo(x - 4, y + 42); c.fill(); text(c, s, x, y + 1, 30, NAVY); }); }
function badge(c, s, x, y, k, col = GREENT) { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => text(c, s, x, y, 28, col, 'center', { stroke: 'rgba(5,10,40,.65)', sw: 6 })); }
function sign(c, x, y, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { c.save(); c.translate(x, y); c.rotate(-.07); c.fillStyle = 'rgba(0,0,15,.35)'; c.fillRect(-122, -58, 252, 128);
  rr(c, -126, -64, 252, 128, 8, '#f3e3bf'); rr(c, -118, -56, 236, 112, 6, '#ead6a8'); ell(c, 0, -52, 6, 6, '#7a5a34'); text(c, 'MUNKATÁRSAT', 0, -14, 30, '#a3343c'); text(c, 'KERESÜNK', 0, 24, 30, '#a3343c'); c.restore(); }); }
function brows(c, x, y, s, f, k) { if (k <= 0) return; const H = 210 * s * 1.08, R = .225 * H, cy = y, fx = x + f * .42 * R, sep = .34 * R * (1 - .5 * Math.abs(f)); c.save(); c.strokeStyle = '#151018'; c.lineWidth = .07 * R; c.lineCap = 'round'; c.globalAlpha = k;
  for (const sd of [-1, 1]) { const ex = fx + sd * sep; c.beginPath(); c.moveTo(ex - sd * .16 * R, cy - .2 * R); c.lineTo(ex + sd * .14 * R, cy - .3 * R); c.stroke(); } c.restore(); }
// —— the people ——
const SKINS = ['blue2', 'blue1', 'blue3', 'blue2'];
function rider(c, i, x, FL, t, phi, o = {}) { const s = 1.05, H = 210 * s * 1.08, [cx, cy] = crank(x, FL), r = 16;
  drawMascot(c, { id: 'w' + i + o.room, skin: SKINS[i], s, x, y: FL - 98 + .26 * H + 2 * Math.sin(phi * 2), f: .55, lean: .07, cap: o.cap, smile: o.smile ?? .75, sad: o.sad || 0, look: .15, blink: hash(i * 7 + Math.floor(t * 1.7 + i)) > .93 ? 1 : 0,
    footL: [cx + Math.cos(phi) * r, cy + Math.sin(phi) * r], footR: [cx + Math.cos(phi + Math.PI) * r, cy + Math.sin(phi + Math.PI) * r], handL: [x + 66, FL - 150], handR: [x + 72, FL - 152], shadow: false }); }
function walker(c, i, x, FL, t, dir, o = {}) { drawMascot(c, { id: 'q' + i + o.room, skin: SKINS[i], s: 1.05, x, y: FL, f: .7 * dir, walk: 1, phi: t * 13, smile: o.smile ?? .1, sad: o.sad ?? .6, look: 0, cap: o.cap }); }
// the bad room: three riders feeding the pipe into the boss's mouth
function badRoom(c, t) { const R = TOP, { Y0, FL } = R; roomSet(c, R, t); const ph = pedal(t, 1), act = badActive(t), anyOn = act > 0;
  const signK = pop(t, SIGN, .3); sign(c, 250, Y0 + 205, signK);
  pipe(c, pipeB(Y0)); text(c, 'PROFIT', MX_B - 70, Y0 + 165, 22, GOLD, 'center');
  machine(c, MX_B, FL, t, anyOn ? (t < 12 ? t * 6 : 12 * 6) + (t > FASTER && t < GLIDE ? (t - FASTER) * 6 : 0) : 12 * 6 + (QUIT[0] - 12) * 0, 0);
  for (let i = 0; i < 3; i++) { const q = QUIT[i]; bike(c, BIKES[i], FL, t < q ? ph + i : q * 9 + i);
    if (t < q + .45) { const faster = t > FASTER && t < GLIDE; rider(c, i, BIKES[i], FL, t, t < q ? ph + i * 1.7 : q * 9 + i * 1.7, { room: 'b', smile: faster ? .05 : .25, sad: faster ? .7 : .3 }); }
    bubble(c, BIKES[i] + 10, FL - 300, 'FELMONDOK', pop(t, q - .55) * (1 - ss(seg(t, q + .3, q + .5)))); }
  for (let i = 0; i < 3; i++) { const q = QUIT[i]; if (t >= q + .45 && t < q + 1.6) { const u = seg(t, q + .45, q + 1.6); walker(c, i, lerp(BIKES[i] - 40, -140, u), FL, t, -1, { room: 'b' }); } }
  // the boss: in his armchair; jumps up to shout at the third worker; grey and grim at the end
  armchair(c, BOSS_B, FL, 'back');
  const up = ss(seg(t, ANGRY[0], ANGRY[0] + .25)) * (1 - ss(seg(t, ANGRY[1] - .1, ANGRY[1] + .2))), shout = (t > FASTER && t < TAKES + .9) || up > .5, grey = ss(seg(t, GREY, GREY + .6));
  const bx = BOSS_B - up * 150, s = 1.5, H = 210 * s * 1.08, by = FL, f = -.35;
  const near = BAD_COINS.some(te => t - te > .95 && t - te < 1.08), eat = !shout && grey < .5 && near;
  c.save(); if (grey > 0) c.filter = `saturate(${1 - .8 * grey}) brightness(${1 - .38 * grey})`;
  drawMascot(c, { id: 'bossB', skin: 'owner', tache: true, bowtie: true, s, x: bx, y: by, f, sit: up > .5 ? 0 : 1, lean: up * -.12, smile: shout || grey > .3 ? 0 : .95, sad: grey > .3 ? .9 : (shout ? .2 : 0), o: eat ? .9 : (shout ? 1.1 + .2 * Math.sin(t * 30) : 0), look: .1, blink: 0,
    handL: shout ? [bx - 150, FL - 270 + 12 * Math.sin(t * 22)] : undefined, armR: shout ? .5 : .1, squash: up > 0 && up < 1 ? .05 : 0 });
  const headY = by - (up > .5 ? 0 : .05 * H) - .76 * H; brows(c, bx, headY, s, f, Math.max(shout ? 1 : 0, grey));
  c.restore(); armchair(c, BOSS_B, FL, 'front');
  if (up > .2) { const u = seg(t, ANGRY[0] + .25, ANGRY[0] + .7); for (let k = 0; k < 5; k++) { const a = -Math.PI * .9 + k * .35, d = 30 + 40 * u; c.save(); c.globalAlpha = Math.sin(u * Math.PI); c.strokeStyle = '#ff7a6a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 120 + Math.cos(a) * d, FL - 300 + Math.sin(a) * d); c.lineTo(bx - 120 + Math.cos(a) * (d + 24), FL - 300 + Math.sin(a) * (d + 24)); c.stroke(); c.restore(); } }
  // coins along the pipe into his mouth
  const mouth = [bx + f * .42 * .225 * H - 6, by - .05 * H - .76 * H + .32 * .225 * H];
  for (const te of BAD_COINS) { const a = t - te; if (a < 0 || a > 1.06) continue; if (a < .8) { const [x, y] = polyAt(pipeB(Y0), a / .8); coin(c, x, y - 14); } else { const u = (a - .8) / .26, p0 = pipeB(Y0)[3]; coin(c, lerp(p0[0], mouth[0], u), lerp(p0[1] + 6, mouth[1], u) - 12 * Math.sin(u * Math.PI), 12 * (1 - .55 * u)); } }
  // the money
  const v = BADM(t), falling = t > 8.85; text(c, fmt(v), 990, Y0 + 132, 58, falling ? REDT : GOLD, 'right', { stroke: 'rgba(30,5,12,.55)', sw: 8 }); }
// the good room: the pipe rains the coins down on the team; a bonus, a new hire, an upgraded machine
function goodRoom(c, t) { const R = BOT, { Y0, FL } = R; roomSet(c, R, t); const ph = pedal(t, 0), gold = ss(seg(t, UPGRADE, UPGRADE + .4));
  const hireBike = pop(t, HIRE - .1, .35); const nb = t < HIRE ? 3 : 4;
  pipe(c, [[MX_G, Y0 + 330], [MX_G, Y0 + 175], [BIKES[0] - 30, Y0 + 175]]); for (let i = 0; i < 4; i++) if (i < 3 || hireBike > .3) pipe(c, [[BIKES[i], Y0 + 175], [BIKES[i], Y0 + 205]]);
  text(c, 'PROFIT', 260, Y0 + 145, 22, GOLD); machine(c, MX_G, FL, t, t * 6 * (1 + gold * .6), gold);
  badge(c, 'FEJLESZTÉS', MX_G, FL - 250, pop(t, UPGRADE) * (1 - ss(seg(t, UPGRADE + 1.3, UPGRADE + 1.6))), GOLD);
  if (gold > 0 && gold < 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.sin(gold * Math.PI) * .6; const gg = c.createRadialGradient(MX_G, FL - 105, 10, MX_G, FL - 105, 190); gg.addColorStop(0, 'rgba(255,220,120,.9)'); gg.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gg; c.fillRect(MX_G - 200, FL - 300, 400, 400); c.restore(); }
  for (let i = 0; i < 4; i++) { const x = BIKES[i];
    if (i === 3) { bike(c, x, FL, ph + 3, hireBike); const u = seg(t, HIRE, HIRE + .75); if (t >= HIRE && u < 1) walker(c, 3, lerp(-140, x - 40, ease3(u)), FL, t, 1, { room: 'g', smile: .8, sad: 0 }); else if (u >= 1) rider(c, 3, x, FL, t, ph + 5, { room: 'g', smile: .85 });
      badge(c, 'ÚJ KOLLÉGA', x + 10, FL - 300, pop(t, HIRE + .6) * (1 - ss(seg(t, HIRE + 1.8, HIRE + 2.1)))); continue; }
    bike(c, x, FL, ph + i); rider(c, i, x, FL, t, ph + i * 1.7, { room: 'g', smile: .9, cap: i === 0 });
    badge(c, 'BÓNUSZ', x + 10, FL - 300, pop(t, M1 + .05 + i * .12) * (1 - ss(seg(t, M1 + 1.2, M1 + 1.5)))); }
  // the boss: stands beside the machine, smiling; points to the team when he shares; waves at the end
  const share = t > SHARES - .3 && t < ZOOM_OUT + .2, wave = t > 13.2;
  drawMascot(c, { id: 'bossG', skin: 'owner', bowtie: true, s: 1.22, x: BOSS_G, y: FL, f: -.3, smile: .92, look: .1, blink: hash(Math.floor(t * 1.4)) > .9 ? 1 : 0,
    handL: share ? [BOSS_G - 150, FL - 190] : undefined, armR: wave ? 2.4 + .35 * Math.sin(t * 9) : .12 });
  // coins and bonus notes travel along the pipe and drop onto the riders
  const drop = (te, w, draw) => { const a = t - te, path = pipeG(Y0, w), L = Math.abs(MX_G - BIKES[w]) + 190, tp = L / 820; if (a < 0) return; if (a < tp) { const [x, y] = polyAt(path, a / tp); draw(x, y - 14, 0); return; }
    const u = (a - tp) / .38; if (u > 1) return; const [x0, y0] = path[3], tgtY = FL - 255; draw(x0, lerp(y0 + 10, tgtY, u * u), u); };
  for (const g of GOOD_COINS) drop(g.te, g.w, (x, y, u) => coin(c, x, y, 12 * (1 - .4 * u)));
  for (const b of BILLS) drop(b.te, b.w, (x, y, u) => bill(c, x, y, u * 1.2));
  text(c, fmt(GOODM(t)), 990, Y0 + 132, 58, GREENT, 'right', { stroke: 'rgba(3,10,40,.6)', sw: 8 }); }
// —— the frame ——
function take(c, t) { const [cx, cy, z] = KF(t, CAM);
  c.save(); c.translate(540, 960); c.scale(z, z); c.translate(-cx, -cy);
  const fl = c.createLinearGradient(0, 1630, 0, 2200); fl.addColorStop(0, '#061344'); fl.addColorStop(1, '#00113F'); c.fillStyle = fl; c.fillRect(-300, 1630, 1680, 600);
  badRoom(c, t); goodRoom(c, t);
  rr(c, -300, TOP.Y0 + 640, 1680, 20, 0, '#1a0812'); c.fillStyle = '#2e58c8'; c.fillRect(-300, BOT.Y0 - 4, 1680, 4);   // the line between the rooms
  const mi = MONTHS.filter(m => t >= m).length; if (mi) { const k = pop(t, MONTHS[mi - 1], .3); scaled(c, 300, BOT.Y0 - 10, Math.min(1.1, .8 + .2 * k), () => { rr(c, 300 - 82, BOT.Y0 - 30, 164, 40, 12, GOLD); text(c, `${mi}. HÓNAP`, 300, BOT.Y0 - 9, 26, NAVY); }); }
  c.restore();
  // the title (fixed on screen) and the zoomed scenes' big words
  text(c, 'UGYANAZ A CSAPAT.', 540, 196, 62, CREAM); text(c, 'MÁS FŐNÖK.', 540, 266, 62, GOLD);
  const fk = pop(t, FASTER, .28) * (1 - ss(seg(t, GLIDE - .25, GLIDE + .1))); if (fk > 0) scaled(c, 380, 790, fk, () => text(c, 'GYORSABBAN!', 380, 790, 92, REDT, 'center', { stroke: '#3a0a14', sw: 14 }));
  const tk = pop(t, TAKES, .28) * (1 - ss(seg(t, GLIDE - .25, GLIDE + .1))); if (tk > 0) scaled(c, 540, 1350, tk, () => text(c, 'MINDENT ELVESZ.', 540, 1350, 70, REDT, 'center', { stroke: '#3a0a14', sw: 12 }));
  const sk = pop(t, SHARES, .28) * (1 - ss(seg(t, ZOOM_OUT - .2, ZOOM_OUT + .15))); if (sk > 0) scaled(c, 540, 1350, sk, () => text(c, 'MEGOSZTJA VELÜK.', 540, 1350, 70, BLUET, 'center', { stroke: '#06103d', sw: 12 })); }
await start({ scenes: [[0, take]], words: [], story: STORY, dur: DUR, stage: false });
// sound cues
window.EV = [
  ...BAD_COINS.map(te => ({ t: +(te + 1.0).toFixed(3), type: 'eat' })),
  ...GOOD_COINS.map(g => ({ t: +(g.te + (Math.abs(MX_G - BIKES[g.w]) + 190) / 820 + .38).toFixed(3), type: 'catch', x: BIKES[g.w] })),
  ...BILLS.map(b => ({ t: +(b.te + (Math.abs(MX_G - BIKES[b.w]) + 190) / 820 + .38).toFixed(3), type: 'bill', x: BIKES[b.w] })),
  { t: ZOOM_IN, type: 'zoom', d: .6 }, { t: GLIDE, type: 'zoom', d: .7 }, { t: ZOOM_OUT, type: 'zoom', d: .6 },
  { t: FASTER, type: 'stamp' }, { t: TAKES, type: 'stamp' }, { t: SHARES, type: 'stamp' },
  ...MONTHS.map(m => ({ t: m, type: 'month' })), ...QUIT.map((q, i) => ({ t: q - .55, type: 'quit', x: BIKES[i] })), ...QUIT.map((q, i) => ({ t: q + .45, type: 'leave', x: BIKES[i] })),
  { t: ANGRY[0], type: 'jump' }, { t: HIRE, type: 'hire' }, { t: UPGRADE, type: 'upgrade' }, { t: SIGN, type: 'sign' }, { t: GREY, type: 'grey' }].sort((p, q) => p.t - q.t);
window.ACT = { bad: [0, 1, 2].map(i => QUIT[i]), hire: HIRE, faster: [FASTER, GLIDE], upgrade: UPGRADE };
