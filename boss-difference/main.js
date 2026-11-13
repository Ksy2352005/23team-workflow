// Más főnök (Same team, different boss): a remake of the user's reference (split-screen boss simulation, 2026-11-13) in the 23 Team mascot world.
// Top: the bad boss's wine-red room; he sits in his armchair and the profit pipe feeds every coin straight into his mouth. Bottom: the good boss's
// midnight-blue room; the pipe runs over the team and rains the coins down on them. Same shot order as the reference: both rooms, zoom into the
// bad boss („GYORSABBAN!”, „MINDENT ELVESZ.”), glide down to the good boss („MEGOSZTJA VELÜK.”), back to both rooms, then the months run:
// the bad boss's team quits, a help-wanted sign goes up and he turns grey while his money falls; the good boss pays a bonus, hires, upgrades,
// and his money keeps climbing. No voice (like the reference); the spoken call to action plays over the end card.
import { start, ss, seg, clamp, lerp, ease3, hash, K } from './kit.js';
import { drawMascot } from './char2d.js';
await document.fonts.load('700 40px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű');
const STORY = 15.1, DUR = 15.1;   // exactly the reference's length (it loops there): no end card, no call to action (user 2026-11-13)
const CREAM = '#f6efdc', GOLD = '#ffd36a', GOLD2 = '#e3a92f', NAVY = '#14205a', REDT = '#ff6060', GREENT = '#8ee6a6', BLUET = '#8cc4ff';
const DY = 130;   // user 2026-11-13: everything a little lower (the title was in Instagram's top red zone, too much empty space below)
const TOP = { Y0: 330 + DY, kind: 'bad' }, BOT = { Y0: 990 + DY, kind: 'good' };
for (const R of [TOP, BOT]) R.FL = R.Y0 + 560;   // the floor line (feet) of each room; each room is 640 tall (wall 560 + floor 80)
const BIKES = [150, 290, 430, 570];
const CLAPS = [[.3, 1.2], [5.0, 5.9], [7.35, 8.1], [9.3, 9.9], [10.25, 11.0], [12.7, 13.5], [14.3, 15.1]], HEARTS = [1.4, 6.05, 8.5, 10.0, 11.35, 12.2, 13.85];   // the good boss claps for his team and sends them hearts
function heartShape(c, x, y, r, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = '#ff7aa2'; c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.3, y, x - r * .8, y - r, x, y - r * .35); c.bezierCurveTo(x + r * .8, y - r, x + r * 1.3, y, x, y + r * .9); c.fill(); c.restore(); }
// —— helpers ——
const spring = (t, at, d = .35, b = .45) => { if (t < at) return 0; const u = (t - at) / d; return 1 - Math.exp(-4.5 * u) * Math.cos(u * Math.PI * (1 + b * 2)) ; };
const pop = (t, at, d = .3) => t < at ? 0 : Math.min(1.12, spring(t, at, d));
const rr = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
const ell = (c, x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); c.fill(); };
function text(c, s, x, y, size, col, align = 'center', o = {}) { c.save(); c.font = `700 ${size}px "Montserrat"`; c.textAlign = align; c.textBaseline = 'middle'; if (o.ls) c.letterSpacing = o.ls + 'px';
  if (o.stroke) { c.lineJoin = 'round'; c.strokeStyle = o.stroke; c.lineWidth = o.sw || size * .16; c.strokeText(s, x, y); } c.fillStyle = 'rgba(5,6,25,.35)'; c.fillText(s, x + 2, y + 4); c.fillStyle = col; c.fillText(s, x, y); c.restore(); }
function star(c, x, y, r) { c.fillStyle = '#ffd36a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
const fmt = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft';
const KF = (t, keys) => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const u = ss(seg(t, keys[i - 1][0], keys[i][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); };
// —— the story's clock ——
// every time below is the reference's own (its frame time minus 0.433 s, where its counters start from zero)
const ZOOM_IN = 1.9, TAKES = 2.25, FASTER = 2.75, GLIDE = 3.65, SHARES = 3.85, ZOOM_OUT = 4.85, M1 = 4.95;   // the two close-ups held longer (user)
const MONTHS = [[M1, 1], [7.0, 3], [8.75, 6]];   // the reference shows months 1, 3 and 6
const QUIT = [9.2, 8.0, 6.6], BUB = [8.75, 7.25, 6.15], BUBEND = [9.7, 8.6, 7.4];   // the workers stop and walk out (index = bike): the third, then the second, then the first; their „I quit” bubbles
const STAND = 4.9, WALK = [4.95, 5.2], HITS = [5.28, 5.8], HIT = 5.28, BACK = [6.15, 6.45], SIT = 6.5;   // a punch, a pause, then the kick (user)   // two hits (user: more dramatic)   // the bad boss gets up, walks to the third worker, hits him, walks back and sits down
const ANGRY = [STAND, SIT];
const HIRE = 6.85, UPGRADE = 9.0, SIGN = 9.75, GREY = 9.7;
const BADFACES = [[0, 'glare'], [1.0, 'smirk'], [SIT, 'glare'], [7.2, 'smirk'], [8.25, 'pout'], [9.0, 'glare']];   // dark, angry, evil; never a smile (user)   // user: the bad boss never smiles, a run of funny evil faces
const badFace = t => BADFACES.filter(f => t >= f[0]).pop()[1];
const badActive = t => [0, 1, 2].filter(i => t < (i === 2 ? HITS[1] : QUIT[i])).length, goodActive = t => t < HIRE + .4 ? 3 : 4;
// the camera: both rooms → zoom on the bad boss → glide down to the good boss → back to both rooms
const CAM = [[0, 540, 960, 1], [ZOOM_IN, 540, 960, 1], [ZOOM_IN + .3, 780, 610 + DY, 2.6], [FASTER - .05, 790, 600 + DY, 2.75], [GLIDE, 800, 590 + DY, 2.9], [GLIDE + .2, 760, 1310 + DY, 1.75], [ZOOM_OUT, 760, 1310 + DY, 1.75], [ZOOM_OUT + .2, 540, 960, 1], [5.1, 540, 960, 1], [5.24, 540, 860 + DY * .5, 1.5], [6.15, 520, 860 + DY * .5, 1.5], [6.4, 540, 960, 1]];   // a punch-in on the hit and the kick   // close on the bad boss's face, then on the good boss
// money (forint): the bad boss races ahead early, peaks when his team starts to leave, then falls and freezes; the good boss climbs and keeps climbing
const LIN = (t, K) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K[K.length - 1][1]; };
const BADM = t => LIN(t, [[0, 11018], [2.0, 181146], [4.5, 471137], [5.0, 502587], [6.75, 612661], [7.0, 612666], [9.25, 499000], [13.0, 180000], [15.1, 180000]]);   // the reference's numbers (read off its frames)
const GOODM = t => LIN(t, [[0, 5333], [1.75, 75333], [4.5, 189083], [5.0, 222266], [6.75, 338407], [7.0, 365995], [7.25, 403206], [8.75, 626471], [9.25, 710345], [14.75, 1664597], [15.1, 1725300]]);
const STEP = t => Math.floor(t * 10) / 10;
const pedal = (t, bad) => 9 * t + (bad ? 7 * (clamp(t, FASTER, GLIDE) - FASTER) : 0);
// —— the coins: emitted from each machine at a rate set by the working team (simulated once), then animated along the pipe ——
function emit(rate) { const out = []; let acc = 0; for (let t = 0; t < STORY; t += 1 / 240) { acc += rate(t) / 240; if (acc >= 1) { acc -= 1; out.push(+t.toFixed(4)); } } return out; }
const BAD_COINS = emit(t => badActive(t) * (t > FASTER && t < GLIDE ? 3.3 : 2.1));
const GOOD_COINS = emit(t => goodActive(t) * (t > UPGRADE ? 2.6 : 1.55)).map((te, k) => ({ te, w: k % goodActive(te) }));
const BILLS = [...[0, 1, 2].map(i => ({ te: GLIDE - .1 + i * .18, w: i })), ...[0, 1, 2].map(i => ({ te: 3.95 + i * .15, w: i }))];
// bad room pipe: from the machine up, along, and down to a nozzle at the boss's mouth
const MX_B = 610, BOSS_B = 852, MX_G = 730, BOSS_G = 905;
function polyAt(pts, u) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const d = clamp(u) * L[L.length - 1];
  for (let i = 1; i < pts.length; i++) if (d <= L[i]) { const s = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [lerp(pts[i - 1][0], pts[i][0], s), lerp(pts[i - 1][1], pts[i][1], s)]; } return pts[pts.length - 1]; }
const pipeB = Y => [[MX_B, Y + 330], [MX_B, Y + 190], [722, Y + 190], [722, Y + 370]];
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
  c.save(); c.font = '700 46px "Montserrat"'; const w1 = c.measureText(bad ? 'ROSSZ ' : 'JÓ ').width; c.restore();
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
  if (part === 'back') { rr(c, x - 140, FL - 340, 280, 310, 56, red2); rr(c, x - 126, FL - 328, 252, 280, 48, red); rr(c, x - 110, FL - 310, 66, 220, 32, red3 + '55'); }
  else { rr(c, x - 152, FL - 150, 56, 150, 22, red2); rr(c, x + 96, FL - 150, 56, 150, 22, red2); rr(c, x - 148, FL - 146, 48, 40, 18, red3); rr(c, x + 100, FL - 146, 48, 40, 18, red3); rr(c, x - 104, FL - 70, 208, 62, 16, red); } }
function bubble(c, x, y, s, k) { if (k <= 0) return; scaled(c, x, y + 30, Math.min(1.1, k), () => { c.save(); c.font = '700 28px "Montserrat"'; const w = c.measureText(s).width + 36; c.restore();
  rr(c, x - w / 2, y - 26, w, 52, 14, '#ffffff'); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x - 10, y + 24); c.lineTo(x + 8, y + 24); c.lineTo(x - 4, y + 42); c.fill(); text(c, s, x, y + 1, 28, NAVY); }); }
function badge(c, s, x, y, k, col = GREENT, sz = 28) { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => text(c, s, x, y, sz, col, 'center', { stroke: 'rgba(5,10,40,.65)', sw: 6 })); }
function sign(c, x, y, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { c.save(); c.translate(x, y); c.rotate(-.07); c.fillStyle = 'rgba(0,0,15,.35)'; c.fillRect(-122, -58, 252, 128);
  rr(c, -126, -64, 252, 128, 8, '#f3e3bf'); rr(c, -118, -56, 236, 112, 6, '#ead6a8'); ell(c, 0, -52, 6, 6, '#7a5a34'); text(c, 'MUNKATÁRSAT', 0, -14, 30, '#a3343c'); text(c, 'KERESÜNK', 0, 24, 30, '#a3343c'); c.restore(); }); }
function brows(c, x, y, s, f, k) { if (k <= 0) return; const H = 210 * s * 1.08, R = .225 * H, cy = y, fx = x + f * .42 * R, sep = .34 * R * (1 - .5 * Math.abs(f)); c.save(); c.strokeStyle = '#151018'; c.lineWidth = .07 * R; c.lineCap = 'round'; c.globalAlpha = k;
  for (const sd of [-1, 1]) { const ex = fx + sd * sep; c.beginPath(); c.moveTo(ex - sd * .16 * R, cy - .2 * R); c.lineTo(ex + sd * .14 * R, cy - .3 * R); c.stroke(); } c.restore(); }
// —— the bosses (after the reference: the bad boss fat in a navy suit and gold tie, the good boss slim in a suit and blue tie; big expressive faces) ——
const SUIT = ['#3f58b8', '#2a3e8f', '#18245c'];
function limb(c, x0, y0, x1, y1, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
function headBall(c, x, y, R, grey) { const g = c.createRadialGradient(x - R * .35, y - R * .45, R * .1, x, y, R * 1.05);
  if (grey) { g.addColorStop(0, '#b9bcc4'); g.addColorStop(.5, '#8d9099'); g.addColorStop(1, '#5d606b'); } else { g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#eeeeea'); g.addColorStop(1, '#aeb4c8'); }
  c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill(); }
function face(c, x, y, R, f, kind, o = {}) { const fx = x + f * R * .35, INK = '#151018'; c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.dark && kind !== 'grim') { c.save(); c.beginPath(); c.arc(x, y, R, 0, 7); c.clip(); const g = c.createLinearGradient(0, y - R, 0, y + .15 * R); g.addColorStop(0, 'rgba(40,0,10,.55)'); g.addColorStop(.7, 'rgba(40,0,10,.35)'); g.addColorStop(1, 'rgba(40,0,10,0)'); c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 1.15 * R); c.restore(); }
  const blush = () => { for (const sd of [-1, 1]) ell(c, fx + sd * .56 * R, y + .2 * R, .14 * R, .08 * R, 'rgba(232,120,140,.45)'); };
  const happyEyes = (w = .075) => { c.strokeStyle = INK; c.lineWidth = w * R; for (const sd of [-1, 1]) { c.beginPath(); c.arc(fx + sd * .3 * R, y - .05 * R, .13 * R, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } };
  const angryBrows = () => { c.strokeStyle = INK; c.lineWidth = .13 * R; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(fx + sd * .52 * R, y - .4 * R); c.lineTo(fx + sd * .1 * R, y - .2 * R); c.stroke(); } };
  const angryEyes = (look = 0) => { for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .07 * R, .14 * R, .1 * R, '#ffffff'); ell(c, fx + sd * .3 * R + f * .05 * R, y - .06 * R + look * .04 * R, .06 * R, .06 * R, INK); } };
  if (kind === 'greedy') {   // laughing with a mouth full of coins
    happyEyes(.09); blush(); const op = o.open ?? 1, top = y + .1 * R, bot = y + (.32 + .3 * op) * R, w = .44 * R;
    c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - w, top); c.lineTo(fx + w, top); c.quadraticCurveTo(fx + w, bot, fx, bot); c.quadraticCurveTo(fx - w, bot, fx - w, top); c.fill();
    c.save(); c.clip(); rr(c, fx - w, top, 2 * w, .1 * R, 0, '#ffffff'); for (const k of [-1, 0, 1]) coin(c, fx + k * .19 * R, bot - .12 * R - (k ? 0 : .04 * R), .12 * R); c.restore(); }
  if (kind === 'gobble') {   // gobbling the coins: furious little eyes, puffed cheeks, a round mouth full of gold (no smile)
    angryBrows(); for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .06 * R, .1 * R, .05 * R, INK); ell(c, fx + sd * .6 * R, y + .22 * R, .16 * R, .12 * R, 'rgba(255,255,255,.55)'); }
    const op = o.open ?? 1, rx = .2 * R * (.7 + .3 * op), ry = .19 * R * (.6 + .4 * op), my = y + .38 * R; ell(c, fx, my, rx, ry, '#3b1220'); c.save(); c.beginPath(); c.ellipse(fx, my, rx, ry, 0, 0, 7); c.clip(); for (const k of [-1, 0, 1]) coin(c, fx + k * .12 * R, my + .06 * R - (k ? 0 : .05 * R), .1 * R); c.restore(); }
  if (kind === 'coins') {   // the close-up: his eyes turn into spinning gold coins, he gobbles and drools (greedy, evil, funny)
    angryBrows(); const sp = Math.abs(Math.cos((o.t || 0) * 9)); for (const sd of [-1, 1]) { const ex = fx + sd * .3 * R, ey = y - .07 * R; c.save(); c.translate(ex, ey); c.scale(.35 + .65 * sp, 1); coin(c, 0, 0, .15 * R); c.restore(); }
    const op = o.open ?? 1, rx = .24 * R, ry = .2 * R * (.6 + .4 * op), my = y + .42 * R; ell(c, fx, my, rx, ry, '#3b1220'); c.save(); c.beginPath(); c.ellipse(fx, my, rx, ry, 0, 0, 7); c.clip(); for (const k of [-1, 0, 1]) coin(c, fx + k * .13 * R, my + .07 * R - (k ? 0 : .05 * R), .1 * R); c.restore();
    ell(c, fx + .12 * R, my + ry + .04 * R, .07 * R, .05 * R, '#d9566a'); const dl = ((o.t || 0) * .9) % 1; ell(c, fx + .18 * R, my + ry + (.05 + .35 * dl) * R, .035 * R, (.05 + .05 * dl) * R, 'rgba(170,215,255,.85)'); }
  if (kind === 'glare') {   // a dark, furious glare: low heavy brows, red pupils, a clenched frown
    angryBrows(); for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .06 * R, .14 * R, .06 * R, '#ffffff'); ell(c, fx + sd * .3 * R + f * .04 * R, y - .055 * R, .05 * R, .05 * R, '#d81e2a'); }
    c.strokeStyle = INK; c.lineWidth = .06 * R; c.beginPath(); c.moveTo(fx - .26 * R, y + .44 * R); c.quadraticCurveTo(fx, y + .26 * R, fx + .26 * R, y + .44 * R); c.stroke();
    c.lineWidth = .03 * R; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(fx + sd * .3 * R, y + .38 * R); c.lineTo(fx + sd * .36 * R, y + .5 * R); c.stroke(); } }
  if (kind === 'side') {     // a suspicious side-eye: one brow up, one down, a wobbly flat mouth
    const tw = Math.sin((o.t || 0) * 22) * .03 * R; c.strokeStyle = INK; c.lineWidth = .09 * R; c.beginPath(); c.moveTo(fx - .5 * R, y - .3 * R + tw); c.lineTo(fx - .12 * R, y - .38 * R + tw); c.stroke(); c.beginPath(); c.moveTo(fx + .1 * R, y - .22 * R); c.lineTo(fx + .5 * R, y - .26 * R); c.stroke();
    for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .07 * R, .14 * R, sd < 0 ? .12 * R : .07 * R, '#ffffff'); ell(c, fx + sd * .3 * R - .07 * R, y - .06 * R, .055 * R, .055 * R, INK); }
    c.lineWidth = .05 * R; c.beginPath(); c.moveTo(fx - .2 * R, y + .34 * R); for (let k = 1; k <= 4; k++) c.lineTo(fx - .2 * R + k * .1 * R, y + .34 * R + (k % 2 ? .04 : -.02) * R); c.stroke(); }
  if (kind === 'smirk') {    // an evil lopsided sneer with sharp little teeth and narrow red-eyed slits (scheming)
    angryBrows(); for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .07 * R, .13 * R, .045 * R, '#ffffff'); ell(c, fx + sd * .3 * R - .03 * R, y - .065 * R, .04 * R, .04 * R, '#d81e2a'); }
    c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - .3 * R, y + .36 * R); c.quadraticCurveTo(fx, y + .42 * R, fx + .34 * R, y + .2 * R); c.quadraticCurveTo(fx + .05 * R, y + .32 * R, fx - .3 * R, y + .36 * R); c.fill();
    c.fillStyle = '#ffffff'; for (const k of [0, 1, 2]) { const bx = fx - .14 * R + k * .13 * R, by = y + .36 * R - k * .045 * R; c.beginPath(); c.moveTo(bx - .04 * R, by - .03 * R); c.lineTo(bx + .04 * R, by - .045 * R); c.lineTo(bx, by + .03 * R); c.fill(); } }
  if (kind === 'pout') {     // a red, furious pout
    angryBrows(); angryEyes(); for (const sd of [-1, 1]) ell(c, fx + sd * .56 * R, y + .22 * R, .15 * R, .09 * R, 'rgba(232,80,90,.55)');
    c.strokeStyle = INK; c.lineWidth = .06 * R; c.beginPath(); c.moveTo(fx - .16 * R, y + .44 * R); c.quadraticCurveTo(fx, y + .3 * R, fx + .16 * R, y + .44 * R); c.stroke(); }
  if (kind === 'yell') {     // furious, shouting
    angryBrows(); angryEyes(); const top = y + .16 * R, bot = y + .64 * R, wt = .38 * R, wb = .26 * R;
    c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - wt, top); c.lineTo(fx + wt, top); c.quadraticCurveTo(fx + wt, bot, fx + wb, bot); c.lineTo(fx - wb, bot); c.quadraticCurveTo(fx - wt, bot, fx - wt, top); c.fill();
    c.save(); c.clip(); rr(c, fx - wt, top, 2 * wt, .1 * R, 0, '#ffffff'); rr(c, fx - wt, bot - .08 * R, 2 * wt, .08 * R, 0, '#ffffff'); ell(c, fx, bot - .1 * R, .16 * R, .08 * R, '#d9566a'); c.restore();
    for (let k = 0; k < 5; k++) { const u2 = (((o.t || 0) * 2.4 + k / 5) % 1); ell(c, fx - .2 * R - u2 * .8 * R + k * .06 * R, y + .4 * R - .3 * R * Math.sin(u2 * Math.PI) + k * .03 * R, .035 * R * (1 - u2 * .5), .035 * R * (1 - u2 * .5), 'rgba(190,225,255,.9)'); }   // spit
    c.strokeStyle = '#e8414a'; c.lineWidth = .06 * R; const vx = x - f * .5 * R + .2 * R, vy = y - .62 * R; for (const a of [0, Math.PI / 2]) { c.beginPath(); c.moveTo(vx + Math.cos(a) * .1 * R, vy + Math.sin(a) * .1 * R); c.lineTo(vx - Math.cos(a) * .1 * R, vy - Math.sin(a) * .1 * R); c.stroke(); } }
  if (kind === 'grim') {     // grey, gritting his teeth
    angryBrows(); angryEyes(1); const mx = fx - .34 * R, my = y + .24 * R, mw = .68 * R, mh = .24 * R; rr(c, mx, my, mw, mh, .06 * R, '#f2f2f2'); c.strokeStyle = INK; c.lineWidth = .035 * R; c.beginPath(); c.roundRect(mx, my, mw, mh, .06 * R); c.stroke();
    c.beginPath(); c.moveTo(mx, my + mh / 2); c.lineTo(mx + mw, my + mh / 2); for (let k = 1; k < 5; k++) { c.moveTo(mx + mw * k / 5, my); c.lineTo(mx + mw * k / 5, my + mh); } c.stroke(); }
  if (kind === 'cheer') {    // the good boss cheering for his team: big open smile
    happyEyes(.07); blush(); const top = y + .16 * R, w = .3 * R; c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - w, top); c.quadraticCurveTo(fx, top + .46 * R, fx + w, top); c.closePath(); c.fill();
    c.save(); c.clip(); rr(c, fx - w, top, 2 * w, .07 * R, 0, '#ffffff'); ell(c, fx, top + .28 * R, .15 * R, .08 * R, '#d9566a'); c.restore(); }
  if (kind === 'kind') {     // the good boss: closed happy eyes and a warm open smile
    happyEyes(.07); blush(); const top = y + .18 * R, w = .24 * R; c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - w, top); c.quadraticCurveTo(fx, top + .34 * R, fx + w, top); c.closePath(); c.fill();
    c.save(); c.clip(); ell(c, fx, top + .2 * R, .12 * R, .07 * R, '#d9566a'); c.restore(); }
  c.restore(); }
function suitTorso(c, x, top, bot, w, tie, shape) {   // a suit jacket with a white shirt V, a tie, lapels and buttons
  const g = c.createRadialGradient(x - w * .35, top + (bot - top) * .3, 10, x, (top + bot) / 2, w * 1.2); g.addColorStop(0, SUIT[0]); g.addColorStop(.55, SUIT[1]); g.addColorStop(1, SUIT[2]); c.fillStyle = g;
  c.beginPath(); if (shape === 'fat') c.ellipse(x, (top + bot) / 2, w, (bot - top) / 2, 0, 0, 7); else c.roundRect(x - w, top, 2 * w, bot - top, w * .6); c.fill();
  const vb = top + (bot - top) * .5; c.fillStyle = '#f4f4f0'; c.beginPath(); c.moveTo(x - w * .34, top + 6); c.lineTo(x + w * .34, top + 6); c.lineTo(x, vb); c.closePath(); c.fill();
  c.fillStyle = tie; c.beginPath(); c.moveTo(x - w * .09, top + 10); c.lineTo(x + w * .09, top + 10); c.lineTo(x + w * .06, top + 26); c.lineTo(x - w * .06, top + 26); c.fill();
  c.beginPath(); c.moveTo(x - w * .06, top + 26); c.lineTo(x + w * .06, top + 26); c.lineTo(x + w * .13, vb + (bot - top) * .1); c.lineTo(x, vb + (bot - top) * .2); c.lineTo(x - w * .13, vb + (bot - top) * .1); c.closePath(); c.fill();
  c.strokeStyle = SUIT[2]; c.lineWidth = 4; c.beginPath(); c.moveTo(x - w * .5, top + 14); c.lineTo(x - w * .02, vb + 4); c.moveTo(x + w * .5, top + 14); c.lineTo(x + w * .02, vb + 4); c.stroke();
  for (const k of [0, 1]) ell(c, x + w * .2, vb + 20 + k * 26, 4, 4, SUIT[2]); }
function boss(c, o) { const { x, FL, u, fat } = o, sit = o.sit || 0, lift = (1 - sit) * 34 * u, sh = o.shake ? Math.sin(o.t * 46) * 4 * u : 0;
  const R = (fat ? 82 : 60) * u, hx = x + sh + (o.lean || 0) * 40 * u, hy = FL - (fat ? 312 : 325) * u - lift;
  const shY = FL - (fat ? 242 : 255) * u - lift, shX = (fat ? 108 : 44) * u, legTop = FL - (fat ? 100 : 125) * u - (fat ? lift : 0);
  for (const sd of [-1, 1]) { const lx = x + sd * (fat ? 50 : 17) * u, st = o.walk ? Math.sin(o.walk + (sd > 0 ? Math.PI : 0)) * 16 * u : 0, kk = sd < 0 ? (o.kick || 0) : 0;
    if (kk > 0) { const ex = lx - 150 * u * kk, ey = FL - 16 * u - 110 * u * kk; limb(c, lx, legTop, ex, ey, 36 * u, SUIT[2]); ell(c, ex - 12 * u, ey, 27 * u, 13 * u, '#14121c'); continue; }
    limb(c, lx, legTop, lx + sd * (fat ? 6 : 2) * u + st, FL - 16 * u - Math.max(0, st) * .5, (fat ? 34 : 27) * u, SUIT[2]); ell(c, lx + sd * 4 * u - 6 * u, FL - 9 * u, 25 * u, 12 * u, '#14121c'); }
  const hand = (sd, tgt, rest) => { const sx = x + sd * shX, sy = shY + 8 * u; let [tx, ty] = tgt || rest; const L = (fat ? 112 : 100) * u, d = Math.hypot(tx - sx, ty - sy); if (d > L) { tx = sx + (tx - sx) / d * L; ty = sy + (ty - sy) / d * L; }
    limb(c, sx, sy, tx, ty, (fat ? 30 : 24) * u, SUIT[1]); ell(c, tx, ty, (fat ? 18 : 15) * u, (fat ? 18 : 15) * u, '#eeeeea'); };
  const restL = fat ? [x - 80 * u, FL - 150 * u - lift] : [x - 50 * u, FL - 140 * u], restR = fat ? [x + 80 * u, FL - 150 * u - lift] : [x + 50 * u, FL - 140 * u];
  const back = o.handR && !fat && !o.front; if (back) hand(1, o.handR, restR);
  if (fat) { suitTorso(c, x, FL - 292 * u - lift, FL - 58 * u - lift, 134 * u, '#f2c230', 'fat'); ell(c, x + 30 * u, FL - 118 * u - lift, 9 * u, 9 * u, '#f4f4f0'); c.strokeStyle = '#f4f4f0'; c.lineWidth = 3; for (const a of [-.6, 0, .6]) { c.beginPath(); c.moveTo(x + 30 * u + Math.cos(a) * 14 * u, FL - 118 * u - lift + Math.sin(a) * 14 * u); c.lineTo(x + 30 * u + Math.cos(a) * 22 * u, FL - 118 * u - lift + Math.sin(a) * 22 * u); c.stroke(); } } else suitTorso(c, x, FL - 272 * u, FL - 112 * u, 46 * u, '#5aa2f2', 'slim');
  hand(-1, o.handL, restL); if (!back) hand(1, o.handR, restR);
  if (fat) { c.save(); c.fillStyle = o.grey > .5 ? '#80838c' : '#d6d8de'; c.beginPath(); c.ellipse(hx + (o.f ?? -.3) * R * .2, hy + R * .78, R * .62, R * .3, 0, 0, Math.PI); c.fill(); c.restore(); }   // double chin
  headBall(c, hx, hy, R, o.grey > .5); if (o.grey > 0 && o.grey < 1) { c.save(); c.globalAlpha = o.grey; headBall(c, hx, hy, R, true); c.restore(); }
  if (o.flush > 0) { c.save(); c.globalAlpha = o.flush * .78; const g = c.createRadialGradient(hx, hy + R * .2, R * .1, hx, hy, R); g.addColorStop(0, 'rgba(235,40,40,1)'); g.addColorStop(1, 'rgba(200,30,40,.55)'); c.fillStyle = g; c.beginPath(); c.arc(hx, hy, R, 0, 7); c.fill(); c.restore(); }
  face(c, hx, hy, R, o.f ?? -.3, o.face, o); if (o.stache) villainStache(c, hx + (o.f ?? -.3) * R * .35, hy + R * .2, R, o.t, o.grey > .5); return { mouth: [hx + (o.f ?? -.3) * R * .35, hy + .38 * R], head: [hx, hy], R }; }
// the bad boss's curly villain moustache (it twitches)
function villainStache(c, x, y, R, t = 0, grey) { const tw = Math.sin(t * 9) * .04 * R; c.save(); c.fillStyle = grey ? '#2a2a30' : '#1d1418';
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x, y - .02 * R); c.bezierCurveTo(x + sd * .2 * R, y - .1 * R, x + sd * .42 * R, y - .02 * R, x + sd * .5 * R, y - .16 * R + tw);
    c.bezierCurveTo(x + sd * .6 * R, y - .3 * R + tw, x + sd * .44 * R, y - .32 * R + tw, x + sd * .44 * R, y - .22 * R + tw); c.bezierCurveTo(x + sd * .5 * R, y - .26 * R + tw, x + sd * .5 * R, y - .1 * R, x + sd * .38 * R, y + .06 * R); c.bezierCurveTo(x + sd * .24 * R, y + .1 * R, x + sd * .1 * R, y + .06 * R, x, y + .04 * R); c.fill(); } c.restore(); }
// —— the people ——
const SKINS = ['blue2', 'blue1', 'blue3', 'blue2'];
const ACC_B = [{ helmet: true }, { fem: 'bun' }, { specs: true, tache: true }], ACC_G = [{ cap: true }, { fem: 'pony' }, { fem: 'beret' }, { fem: 'band' }];   // user: give the workers accessories so they all look different
function rider(c, i, x, FL, t, phi, o = {}) { const s = 1.05, H = 210 * s * 1.08, [cx, cy] = crank(x, FL), r = 16;
  drawMascot(c, { id: 'w' + i + o.room, skin: SKINS[i], s, x, y: FL - 98 + .26 * H + 2 * Math.sin(phi * 2), f: .55, lean: .07, ...(o.acc || {}), smile: o.smile ?? .75, sad: o.sad || 0, look: .15, blink: hash(i * 7 + Math.floor(t * 1.7 + i)) > .93 ? 1 : 0,
    footL: [cx + Math.cos(phi) * r, cy + Math.sin(phi) * r], footR: [cx + Math.cos(phi + Math.PI) * r, cy + Math.sin(phi + Math.PI) * r], handL: [x + 66, FL - 150], handR: [x + 72, FL - 152], shadow: false });
  if (o.sweat) { const hx = x + 6, hy = FL - 98 + .26 * H - .76 * H; for (let k = 0; k < 3; k++) { const u = ((t * 1.6 + k / 3 + i * .37) % 1); c.save(); c.globalAlpha = Math.sin(u * Math.PI); c.fillStyle = '#9fd3ff';
    const dx = hx - 50 - 40 * u - k * 6, dy = hy - 40 + 60 * u * u - k * 10; c.beginPath(); c.moveTo(dx, dy - 12); c.quadraticCurveTo(dx + 8, dy, dx, dy + 6); c.quadraticCurveTo(dx - 8, dy, dx, dy - 12); c.fill(); c.restore(); } } }
const KNOCK = (t, FL) => { const k = HITS[1], u = seg(t, k, k + .36), up = ss(seg(t, 6.3, 6.55)); return { x: lerp(BIKES[2], BIKES[2] - 120, ease3(u)), y: lerp(FL - 60, FL, u) - 150 * Math.sin(u * Math.PI) - 34 * (1 - up) * (u >= 1 ? 1 : 0), rot: lerp(0, -1.5, ss(u)) * (1 - up) - 2 * Math.PI * ss(u) * (u < 1 ? 1 : 0) }; };
function knocked(c, t, FL) { const K2 = KNOCK(t, FL); drawMascot(c, { id: 'k2', skin: SKINS[2], s: 1.05, x: K2.x, y: K2.y, f: -.3, rot: K2.rot, smile: 0, sad: .95, o: .8, ...ACC_B[2] }); }
function walker(c, i, x, FL, t, dir, o = {}) { drawMascot(c, { id: 'q' + i + o.room, skin: SKINS[i], s: 1.05, x, y: FL, f: .7 * dir, walk: 1, phi: t * 13, ...(o.acc || {}), smile: o.smile ?? .1, sad: o.sad ?? .6, look: 0, cap: o.cap }); }
// the bad room: three riders feeding the pipe into the boss's mouth
function badRoom(c, t) { const R = TOP, { Y0, FL } = R; roomSet(c, R, t); const ph = pedal(t, 1), act = badActive(t), anyOn = act > 0;
  const signK = pop(t, SIGN, .3); sign(c, 250, Y0 + 205, signK);
  pipe(c, pipeB(Y0)); text(c, 'PROFIT', MX_B - 70, Y0 + 165, 22, GOLD, 'center');
  machine(c, MX_B, FL, t, anyOn ? (t < 12 ? t * 6 : 12 * 6) + (t > FASTER && t < GLIDE ? (t - FASTER) * 6 : 0) : 12 * 6 + (QUIT[0] - 12) * 0, 0);
  for (let i = 0; i < 3; i++) { const q = QUIT[i]; bike(c, BIKES[i], FL, t < q ? ph + i : q * 9 + i);
    if (i === 2 && t >= HITS[1] && t < q) { knocked(c, t, FL); }
    else if (t < q) { const faster = t > FASTER && t < GLIDE, hitK = i === 2 ? Math.max(Math.sin(clamp((t - HITS[0]) / .3) * Math.PI) * .6, Math.sin(clamp((t - HITS[1]) / .5) * Math.PI) * 1.3) : 0; if (hitK > 0) { c.save(); c.translate(BIKES[i], FL - 150); c.rotate(-.18 * hitK); c.translate(-BIKES[i], -(FL - 150)); }
      rider(c, i, BIKES[i], FL, t, ph + i * 1.7, { room: 'b', acc: ACC_B[i], smile: 0, sad: .95, sweat: true }); if (hitK > 0) c.restore(); }
    bubble(c, BIKES[i] - (i === 2 ? 130 : 0), FL - 300, 'FELMONDOK', pop(t, BUB[i]) * (1 - ss(seg(t, BUBEND[i] - .15, BUBEND[i])))); }
  for (let i = 0; i < 3; i++) { const q = QUIT[i]; if (t >= q && t < q + .7) { const u = seg(t, q, q + .7); walker(c, i, lerp(i === 2 ? BIKES[2] - 120 : BIKES[i] - 30, -140, u), FL, t, -1, { room: 'b', acc: ACC_B[i] }); } }
  // the boss: in his armchair; jumps up to shout at the third worker; grey and grim at the end
  armchair(c, BOSS_B, FL, 'back');
  const up = ss(seg(t, STAND - .1, STAND + .1)) * (1 - ss(seg(t, SIT - .08, SIT + .05))), faster = t > FASTER && t < GLIDE, shout = faster || (up > .3 && t < BACK[0] + .2), grey = ss(seg(t, GREY, GREY + .5));
  const wk = ss(seg(t, WALK[0], WALK[1])) * (1 - ss(seg(t, BACK[0], BACK[1]))), walking = (t > WALK[0] && t < WALK[1]) || (t > BACK[0] && t < BACK[1]), swing = t > HITS[0] - .12 && t < HITS[0] + .16 ? Math.sin(clamp((t - HITS[0] + .12) / .28) * Math.PI) : 0;   // a punch, then a kick
  const bx = lerp(BOSS_B - up * 60, BIKES[2] + 205, wk), last = BAD_COINS.filter(te => te + 1.06 <= t).pop() ?? -9, chomp = 1 - .3 * Math.max(0, 1 - (t - last - 1.06) / .15);
  const B = boss(c, { t, x: bx, FL, u: 1, fat: true, sit: 1 - up, f: -.3, lean: up * -.3, face: grey > .4 ? 'grim' : (shout ? 'yell' : (t > ZOOM_IN + .1 && t < FASTER ? 'smirk' : badFace(t))), stache: false, dark: true, flush: grey > .4 ? 0 : (faster || (t > ZOOM_IN && t < GLIDE) || (up > .3 && t < BACK[0]) ? 1 : .5), kick: Math.sin(clamp((t - HITS[1] + .1) / .32) * Math.PI) * (t > HITS[1] - .1 && t < HITS[1] + .22 ? 1 : 0), open: chomp, grey, shake: shout && !walking, walk: walking ? t * 14 : 0,
    handL: swing > 0 ? [bx - 150, FL - 250 - 70 * (1 - swing)] : (t > ZOOM_IN && t < FASTER ? [bx - 68, FL - 150 + 10 * Math.sin(t * 14)] : shout ? [bx - 200, FL - 280 + 10 * Math.sin(t * 20)] : (badFace(t) === 'smirk' && up < .5 ? [bx - 18 + 10 * Math.sin(t * 16), FL - 200] : undefined)),
    handR: badFace(t) === 'smirk' && up < .5 && grey < .4 && !shout ? [bx + 18 - 10 * Math.sin(t * 16), FL - 196] : undefined });
  if ((badFace(t) === 'pout' && !shout) || grey > .4) for (let k = 0; k < 4; k++) { const u = ((t * 1.3 + k / 4) % 1), sd = k % 2 ? 1 : -1; c.save(); c.globalAlpha = .55 * Math.sin(u * Math.PI); ell(c, B.head[0] + sd * (B.R * .95 + 18 * u), B.head[1] - B.R * .2 - 70 * u, 12 + 16 * u, 10 + 12 * u, '#f3f0ea'); c.restore(); }   // steam from his ears
  for (const [n, h] of HITS.entries()) if (t > h && t < h + .45) { const u = seg(t, h, h + .45), sx = BIKES[2] + 30, sy = FL - 262, big = n ? 1.5 : 1;   // a comic burst on each hit
    c.save(); c.globalAlpha = 1 - u; c.translate(sx, sy); c.rotate(n * .4); c.scale(big * (.6 + .6 * ease3(u)), big * (.6 + .6 * ease3(u))); c.fillStyle = '#ffd36a'; c.beginPath(); for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2, r = k % 2 ? 26 : 58; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2, r = k % 2 ? 12 : 30; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); c.restore(); }
  if (t > HITS[1] + .3 && t < QUIT[2] + .7) { const kk = KNOCK(t, FL), hx = t < QUIT[2] ? kk.x + (t < 6.3 ? -60 : 0) : lerp(BIKES[2] - 120, -140, seg(t, QUIT[2], QUIT[2] + .7)), hy = t < 6.3 ? FL - 120 : FL - 300; for (let k = 0; k < 3; k++) { const a = t * 7 + k * 2.1; star(c, hx + Math.cos(a) * 44, hy + Math.sin(a) * 12, 13); } }   // dizzy stars
  // coins along the pipe into his mouth
  const nIn = BAD_COINS.filter(te => te + 1.06 <= t).length, bulge = Math.min(1.8, 1 + nIn * .012), pk = [bx - 70, FL - 128 - (up > .5 ? 34 : 0)];   // his bulging jacket pocket
  c.save(); c.translate(pk[0], pk[1]); c.scale(bulge, bulge); ell(c, 0, 6, 34, 22, '#22337a'); rr(c, -30, -4, 60, 10, 4, '#101a48'); coin(c, -8, -6, 9); coin(c, 9, -8, 9); c.restore();
  const mouth = pk;
  for (const te of BAD_COINS) { const a = t - te; if (a < 0 || a > 1.06) continue; if (a < .8) { const [x, y] = polyAt(pipeB(Y0), a / .8); coin(c, x, y - 14); } else { const u = (a - .8) / .26, p0 = pipeB(Y0)[3]; coin(c, lerp(p0[0], mouth[0], u), lerp(p0[1] + 6, mouth[1], u) - 30 * Math.sin(u * Math.PI), 12 * (1 - .4 * u)); } }
  if (up < .5) armchair(c, BOSS_B, FL, 'front');
  // the money
  const v = BADM(STEP(t)), falling = t > 7.0; if (CNT > 0) { c.save(); c.globalAlpha = CNT; text(c, fmt(v), 990, Y0 + 100, 58, falling ? REDT : GOLD, 'right', { stroke: 'rgba(30,5,12,.55)', sw: 8 }); c.restore(); } }
// the good room: the pipe rains the coins down on the team; a bonus, a new hire, an upgraded machine
function goodRoom(c, t) { const R = BOT, { Y0, FL } = R; roomSet(c, R, t); const ph = pedal(t, 0), gold = ss(seg(t, UPGRADE, UPGRADE + .4));
  const hireBike = pop(t, HIRE - .05, .3); const nb = t < HIRE ? 3 : 4;
  pipe(c, [[MX_G, Y0 + 330], [MX_G, Y0 + 175], [BIKES[0] - 30, Y0 + 175]]); for (let i = 0; i < 4; i++) if (i < 3 || hireBike > .3) pipe(c, [[BIKES[i], Y0 + 175], [BIKES[i], Y0 + 205]]);
  text(c, 'PROFIT', 260, Y0 + 145, 22, GOLD); machine(c, MX_G, FL, t, t * 6 * (1 + gold * .6), gold);
  badge(c, 'FEJLESZTÉS', MX_G, FL - 250, pop(t, UPGRADE) * (1 - ss(seg(t, 10.2, 10.4))), GOLD);
  if (gold > 0 && gold < 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.sin(gold * Math.PI) * .6; const gg = c.createRadialGradient(MX_G, FL - 105, 10, MX_G, FL - 105, 190); gg.addColorStop(0, 'rgba(255,220,120,.9)'); gg.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gg; c.fillRect(MX_G - 200, FL - 300, 400, 400); c.restore(); }
  for (let i = 0; i < 4; i++) { const x = BIKES[i];
    if (i === 3) { bike(c, x, FL, ph + 3, hireBike); const u = seg(t, HIRE, HIRE + .4); if (t >= HIRE && u < 1) walker(c, 3, lerp(-140, x - 40, ease3(u)), FL, t, 1, { room: 'g', smile: .8, sad: 0, acc: ACC_G[3] }); else if (u >= 1) rider(c, 3, x, FL, t, ph + 5, { room: 'g', smile: 1, acc: ACC_G[3] });
      badge(c, 'ÚJ KOLLÉGA', x + 10, FL - 300, pop(t, HIRE + .4) * (1 - ss(seg(t, 8.0, 8.2)))); continue; }
    bike(c, x, FL, ph + i); rider(c, i, x, FL, t, ph + i * 1.7, { room: 'g', smile: 1, acc: ACC_G[i] });
    badge(c, 'BÓNUSZ', x + 6, FL - 300 - (i % 2) * 30, pop(t, 3.95 + i * .05) * (1 - ss(seg(t, 6.4, 6.65))), GREENT, 24); }
  // the boss: stands beside the machine, smiling; points to the team when he shares; waves at the end
  const share = t > GLIDE && t < ZOOM_OUT + .15, wave = false;
  const clap = CLAPS.find(([a, b]) => t > a && t < b), throwH = HEARTS.find(h => t > h - .25 && t < h + .3), cp = clap ? Math.abs(Math.sin((t - clap[0]) * Math.PI / .26)) : 0, gu = .78;
  const G = boss(c, { t, x: BOSS_G, FL, u: gu, fat: false, f: -.25, face: clap ? 'cheer' : 'kind', front: !!clap,
    handL: share ? [BOSS_G - 140, FL - 210] : clap ? [BOSS_G - 8 - 34 * cp, FL - 230 * gu] : throwH ? [BOSS_G - 120, FL - 300] : undefined, handR: clap ? [BOSS_G + 8 + 34 * cp, FL - 232 * gu] : undefined });
  if (clap && cp < .12) for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .45; c.save(); c.strokeStyle = '#ffe7a3'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(BOSS_G + Math.cos(a) * 30, FL - 230 * gu - 10 + Math.sin(a) * 30); c.lineTo(BOSS_G + Math.cos(a) * 48, FL - 230 * gu - 10 + Math.sin(a) * 48); c.stroke(); c.restore(); }
  for (const h of HEARTS) for (let w = 0; w < goodActive(h); w++) { const u = seg(t, h + w * .08, h + w * .08 + .9); if (u <= 0 || u >= 1) continue; const x0 = BOSS_G - 60, y0 = FL - 300, x1 = BIKES[w] + 8, y1 = FL - 300;
    heartShape(c, lerp(x0, x1, u), lerp(y0, y1, u) - 150 * Math.sin(u * Math.PI), 26 * (u > .85 ? 1 + (u - .85) * 4 : 1), u > .85 ? 1 - (u - .85) / .15 : 1); }
  // coins and bonus notes travel along the pipe and drop onto the riders
  const drop = (te, w, draw) => { const a = t - te, path = pipeG(Y0, w), L = Math.abs(MX_G - BIKES[w]) + 190, tp = L / 820; if (a < 0) return; if (a < tp) { const [x, y] = polyAt(path, a / tp); draw(x, y - 14, 0); return; }
    const u = (a - tp) / .38; if (u > 1) return; const [x0, y0] = path[3], tgtY = FL - 255; draw(x0, lerp(y0 + 10, tgtY, u * u), u); };
  for (const g of GOOD_COINS) drop(g.te, g.w, (x, y, u) => coin(c, x, y, 12 * (1 - .4 * u)));
  for (const b of BILLS) drop(b.te, b.w, (x, y, u) => bill(c, x, y, u * 1.2));
  if (CNT > 0) { c.save(); c.globalAlpha = CNT; text(c, fmt(GOODM(STEP(t))), 990, Y0 + 100, 58, GREENT, 'right', { stroke: 'rgba(3,10,40,.6)', sw: 8 }); c.restore(); } }
// —— the frame ——
let CNT = 1;
function take(c, t) { const [cx, cy, z] = KF(t, CAM); CNT = clamp(1 - (z - 1) / .25);
  const shk = HITS.reduce((a, h, n) => a + (t > h && t < h + .22 ? (n ? 14 : 8) * (1 - (t - h) / .22) : 0), 0);
  c.save(); c.translate(540 + shk * Math.sin(t * 90), 960 + shk * Math.cos(t * 77)); c.scale(z, z); c.translate(-cx, -cy);
  const fl = c.createLinearGradient(0, 1630 + DY, 0, 2300); fl.addColorStop(0, '#061344'); fl.addColorStop(1, '#00113F'); c.fillStyle = fl; c.fillRect(-300, 1630 + DY, 1680, 600);
  badRoom(c, t); goodRoom(c, t);
  rr(c, -300, TOP.Y0 + 640, 1680, 20, 0, '#1a0812'); c.fillStyle = '#2e58c8'; c.fillRect(-300, BOT.Y0 - 4, 1680, 4);   // the line between the rooms
  const mi = MONTHS.filter(m => t >= m[0]).length; if (mi) { const [mt, mn] = MONTHS[mi - 1], k = pop(t, mt, .3); scaled(c, 300, BOT.Y0 - 10, Math.min(1.1, .8 + .2 * k), () => { rr(c, 300 - 82, BOT.Y0 - 30, 164, 40, 12, GOLD); text(c, `${mn}. HÓNAP`, 300, BOT.Y0 - 9, 26, NAVY); }); }
  c.restore();
  // the title (fixed on screen) and the zoomed scenes' big words
  const ta = 1 - ss(seg(t, 5.1, 5.24)) * (1 - ss(seg(t, 6.15, 6.35))); if (ta > 0) { c.save(); c.globalAlpha = ta; text(c, 'UGYANAZ A CSAPAT.', 540, 196 + DY, 62, CREAM); text(c, 'MÁS FŐNÖK.', 540, 266 + DY, 62, GOLD); c.restore(); }
  const fk = pop(t, FASTER, .28) * (1 - ss(seg(t, GLIDE - .05, GLIDE + .15))); if (fk > 0) scaled(c, 440, 540, fk, () => text(c, 'GYORSABBAN!', 440, 540, 80, REDT, 'center', { stroke: '#3a0a14', sw: 14 }));
  const tk = pop(t, ZOOM_IN + .15, .28) * (1 - ss(seg(t, GLIDE - .05, GLIDE + .15))); if (tk > 0) scaled(c, 540, 1640, tk, () => text(c, 'MINDENT ELVESZ.', 540, 1640, 70, REDT, 'center', { stroke: '#3a0a14', sw: 12 }));
  const sk = pop(t, GLIDE + .12, .28) * (1 - ss(seg(t, ZOOM_OUT - .05, ZOOM_OUT + .15))); if (sk > 0) scaled(c, 540, 1480, sk, () => text(c, 'MEGOSZTJA VELÜK.', 540, 1480, 68, BLUET, 'center', { stroke: '#06103d', sw: 12 })); }
await start({ scenes: [[0, take]], words: [], story: STORY, dur: DUR, stage: false, ending: false });
// sound cues
window.EV = [
  ...BAD_COINS.map(te => ({ t: +(te + 1.0).toFixed(3), type: 'eat' })),
  ...GOOD_COINS.map(g => ({ t: +(g.te + (Math.abs(MX_G - BIKES[g.w]) + 190) / 820 + .38).toFixed(3), type: 'catch', x: BIKES[g.w] })),
  ...BILLS.map(b => ({ t: +(b.te + (Math.abs(MX_G - BIKES[b.w]) + 190) / 820 + .38).toFixed(3), type: 'bill', x: BIKES[b.w] })),
  { t: ZOOM_IN, type: 'zoom', d: .6 }, { t: GLIDE, type: 'zoom', d: .7 }, { t: ZOOM_OUT, type: 'zoom', d: .6 },
  { t: FASTER, type: 'stamp' }, { t: TAKES, type: 'stamp' }, { t: SHARES, type: 'stamp' },
  ...MONTHS.map(m => ({ t: m[0], type: 'month' })), ...BUB.map((q, i) => ({ t: q, type: 'quit', x: BIKES[i] })), ...QUIT.map((q, i) => ({ t: q, type: 'leave', x: BIKES[i] })), ...HITS.map(h => ({ t: h, type: 'hit' })),
  { t: ANGRY[0], type: 'jump' }, { t: HIRE, type: 'hire' }, { t: UPGRADE, type: 'upgrade' }, { t: SIGN, type: 'sign' }, { t: GREY, type: 'grey' }].sort((p, q) => p.t - q.t);
window.ACT = { bad: [0, 1, 2].map(i => QUIT[i]), hire: HIRE, faster: [FASTER, GLIDE], upgrade: UPGRADE };
