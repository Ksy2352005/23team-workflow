// M01 Tükrözés (mirroring), redone after the user's feedback (v2: motion-driven transitions, sound cues): one continuous take that follows reference video 1 shot by shot.
// Big, bold glowing shapes filling the frame, each one growing or morphing into the next (no cuts, nothing popping in), a bloom pass, mirror reflections.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, scramble, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID, K } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 40.4, DUR = 42.9, X = 540, Y = 1160;
const u = (t, a, b) => ss(seg(t, a, b)), ue = (t, a, b) => ease3(seg(t, a, b));
const off = document.createElement('canvas'); off.width = innerWidth; off.height = innerHeight; const oc = off.getContext('2d');
// —— shapes ——
function coin(c, x, y, r) { neon(c, () => circle(c, x, y, r), { w: r * .12, glow: 26 }); txt(c, 'Ft', x, y + r * .06, r * .78, { font: 'Inter', weight: 800, glow: 14 }); }
function selBox(c, x, y, w, h, a) { c.save(); c.setLineDash([12, 10]); neon(c, () => c.strokeRect(x - w / 2, y - h / 2, w, h), { w: 4, alpha: a }); c.restore(); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.save(); c.globalAlpha = a; c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 20; c.fillRect(x + dx * w / 2 - 14, y + dy * h / 2 - 14, 28, 28); c.restore(); } }
function cursor(c, x, y, a = 1, s = 1.4) { c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); c.fillStyle = WHITE; c.strokeStyle = MID; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 56); c.lineTo(14, 43); c.lineTo(25, 66); c.lineTo(34, 62); c.lineTo(23, 39); c.lineTo(41, 39); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function gear(c, x, y, r, rot) { c.beginPath(); for (let k = 0; k <= 64; k++) { const a = k / 64 * Math.PI * 2 + rot, rr = (Math.floor(k / 4) % 2) ? r : r * 1.17; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.stroke(); circle(c, x, y, r * .74); circle(c, x, y - r * .18, r * .2); c.beginPath(); c.arc(x, y + r * .42, r * .38, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
function orb(c, x, y, r, a = 1) { if (r <= 0 || a <= 0) return; c.save(); c.globalAlpha *= a; const halo = c.createRadialGradient(x, y, r * .9, x, y, r * 2); halo.addColorStop(0, 'rgba(220,230,255,.22)'); halo.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = halo; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  const g = c.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#e6ecfa'); g.addColorStop(.8, '#8f9bbd'); g.addColorStop(1, '#4b5680'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = r * .05; c.beginPath(); c.arc(x, y, r * .7, Math.PI * .15, Math.PI * .55); c.stroke(); c.restore(); }
const rcv = document.createElement('canvas'); rcv.width = innerWidth; rcv.height = innerHeight; const rc = rcv.getContext('2d');
function reflect(c, floor, a, f) {   // a mirror image under the floor, fading out with a soft alpha mask (no band edge)
  const tr = c.getTransform(); rc.setTransform(1, 0, 0, 1, 0, 0); rc.globalCompositeOperation = 'source-over'; rc.clearRect(0, 0, rcv.width, rcv.height); rc.setTransform(tr); rc.translate(0, floor * 2); rc.scale(1, -1);
  f(rc); rc.setTransform(tr); rc.globalCompositeOperation = 'destination-in'; const g = rc.createLinearGradient(0, floor, 0, floor + 380); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); rc.fillStyle = g; rc.fillRect(0, floor, 1080, 1920 - floor); rc.fillStyle = 'rgba(0,0,0,0)'; rc.clearRect(0, 0, 1080, floor);
  rc.globalCompositeOperation = 'source-over'; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha *= a; c.drawImage(rcv, 0, 0); c.restore(); }
function frame(c, x, y, s, inner) { neon(c, () => { c.beginPath(); c.roundRect(x - 120 * s, y - 100 * s, 240 * s, 200 * s, 18 * s); c.stroke(); c.beginPath(); c.roundRect(x - 104 * s, y - 84 * s, 208 * s, 168 * s, 12 * s); c.stroke(); }, { w: 6, glow: 34 }); inner && inner(); }
function wave(c, x, y, w, t, amp) { neon(c, () => { c.beginPath(); for (let k = 0; k <= 60; k++) { const xx = x - w / 2 + k * w / 60, env = Math.sin(k / 60 * Math.PI); c.lineTo(xx, y + Math.sin(k * .9 + t * 14) * amp * env * (.5 + .5 * Math.sin(k * .37 + t * 5))); } c.stroke(); }, { w: 4, glow: 24 }); }
function personFill(c, x, y, s, tie = 0) { c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 40; c.beginPath(); c.arc(x, y - 70 * s, 52 * s, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - 120 * s, y + 90 * s); c.quadraticCurveTo(x - 120 * s, y - 6 * s, x - 40 * s, y - 10 * s); c.lineTo(x + 40 * s, y - 10 * s); c.quadraticCurveTo(x + 120 * s, y - 6 * s, x + 120 * s, y + 90 * s); c.closePath(); c.fill(); c.shadowBlur = 0;
  if (tie > 0) { c.globalAlpha = tie; c.strokeStyle = MID; c.fillStyle = MID; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x - 40 * s, y - 10 * s); c.lineTo(x, y + 40 * s); c.lineTo(x + 40 * s, y - 10 * s); c.stroke(); c.beginPath(); c.moveTo(x - 9 * s, y + 4 * s); c.lineTo(x + 9 * s, y + 4 * s); c.lineTo(x + 13 * s, y + 70 * s); c.lineTo(x, y + 84 * s); c.lineTo(x - 13 * s, y + 70 * s); c.closePath(); c.fill(); } c.restore(); }
function starShape(c, x, y, r, n, inner) { c.beginPath(); for (let k = 0; k < n * 2; k++) { const a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
function brain(c, x, y, s) { c.beginPath(); c.moveTo(x - 70 * s, y + 20 * s); c.bezierCurveTo(x - 100 * s, y - 10 * s, x - 80 * s, y - 70 * s, x - 30 * s, y - 70 * s); c.bezierCurveTo(x - 10 * s, y - 95 * s, x + 50 * s, y - 90 * s, x + 60 * s, y - 55 * s); c.bezierCurveTo(x + 100 * s, y - 45 * s, x + 100 * s, y + 20 * s, x + 60 * s, y + 30 * s); c.bezierCurveTo(x + 40 * s, y + 55 * s, x - 40 * s, y + 55 * s, x - 70 * s, y + 20 * s); c.stroke();
  for (const [a, b, d] of [[-50, -40, 1], [0, -55, -1], [30, -10, 1], [-30, 5, -1]]) { c.beginPath(); c.arc(x + a * s, y + b * s, 18 * s, d > 0 ? 0 : Math.PI, d > 0 ? Math.PI : Math.PI * 2); c.stroke(); } P(c, [[x - 4 * s, y + 40 * s], [x - 10 * s, y + 80 * s]]); }
function face(c, x, y, r, mood) { circle(c, x, y, r); c.beginPath(); const m = clamp(mood, -1, 1); c.moveTo(x - r * .45, y + r * .25 - m * r * .05); c.quadraticCurveTo(x, y + r * .25 + m * r * .45, x + r * .45, y + r * .25 - m * r * .05); c.stroke(); circle(c, x - r * .32, y - r * .2, r * .08, true); circle(c, x + r * .32, y - r * .2, r * .08, true); }
// —— timing of every motion (also written out as sound cues, so each sound lands on its frame) ——
const back = x => { const c1 = 1.70158, c3 = c1 + 1; x = clamp(x); if (x <= 0) return 0; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bounce = x => { x = clamp(x); const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const M = {
  fill: [.3, 1.2], drag: [T(3) - .5, T(4) + .5], vortex: [T(5) - .3, T(5) + .45], gears: [T(5) - .05, T(5) + .55], arcs: [T(5) + .3, T(6) + .3],
  squeeze: [T(11) - .45, T(12) - .05], scan: [T(12) - .05, T(13) + .25], melt: [T(14) - .35, T(14) + .3], drop: [T(14) - .15, T(14) + .85],
  slideIn: [T(21) - .35, T(21) + .1], flip1: [T(23) - .25, T(23) + .15], flip2: [T(25) - .25, T(25) + .15], slideOut: [T(25) + .55, T(25) + .95], shrink: [T(25) + .7, T(26) + .1],
  grow: [T(27) - .2, T(27) + .6], ring: [T(30) - .2, T(31) + 1.0], star: [T(33) - .3, T(33) + .4], person: [T(34), T(37) + .2],
  zoomIn: [T(38) - .3, T(39) + .4], zoomOut: [T(43) - .45, T(43) + .3], split: [T(43) - .3, T(46) + .2], swell: [T(48) - .2, T(50) + .4],
  qmark: [T(51) - .3, T(53) + .2], neuron: [T(54) - .15, T(55) + .9], retract: [T(56) - .5, T(56) + .05], shapes: [T(56) - .1, T(58) + .2], pull: [T(60) - .35, T(63) - .05], lock: [T(63) - .05, T(64) + .25],
  mirror: [T(65) - .45, T(66) + .05], figL: [T(66) - .15, T(66) + .45], figR: [T(67) - .35, T(67) + .3], handL: [T(68) - .1, T(69) + .25], handR: [T(68) + .15, T(69) + .5], touch: [T(71) - .3, T(73) - .05], flash: [T(73) - .05, T(73) + .7],
  c1: [T(75) - .3, T(75) + .25], c2: [T(77) - .3, T(77) + .25], c3: [T(79) - .3, T(79) + .25] };
const m = (t, k) => seg(t, M[k][0], M[k][1]);
// —— the one continuous take ——
function scene(c, t) {
  // 1. more sales: a tile fills into a grid of coins; the cursor drags the corner and the grid grows big; then it swirls into a quick vortex
  const vx = m(t, 'vortex'), ve = ss(vx), GC = [[X, Y - 115], [X - 120, Y + 90], [X + 120, Y + 90]];
  if (vx < 1) { const grow = ease3(m(t, 'drag')), n = t < .5 ? 1 : t < T(3) ? 3 : 5, cell = 128, size = lerp(360, 680, grow), sc = size / (n * cell), fill = ease3(m(t, 'fill'));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = clamp(fill * 2.2 - (i + j) * .12); if (k <= 0) continue; const dx = (j - (n - 1) / 2) * cell * sc, dy = (i - (n - 1) / 2) * cell * sc, rot = ve * 2.4, rx = (dx * Math.cos(rot) - dy * Math.sin(rot)) * (1 - ve), ry = (dx * Math.sin(rot) + dy * Math.cos(rot)) * (1 - ve);
      const g = GC[(i * n + j) % 3], e = ease3(vx), x = lerp(X + rx, g[0], e * e), y = lerp(Y + ry, g[1], e * e); c.save(); c.globalAlpha = 1 - ss(seg(vx, .55, .95)); coin(c, x, y, 48 * sc * Math.min(1.05, k) * (1 - .6 * ve)); c.restore(); }
    c.save(); c.globalAlpha = 1 - ss(clamp(vx * 3)); c.translate(X, Y); c.rotate(ve * 1.2); c.scale(1 - ve * .4, 1 - ve * .4); c.translate(-X, -Y); selBox(c, X, Y, size + 50, size + 50, 1); c.restore(); const dr = m(t, 'drag'); if (dr > 0 && dr < 1) cursor(c, X + (size + 50) / 2 + 6, Y + (size + 50) / 2 + 6, 1 - ss(seg(dr, .85, 1))); }
  // 2. an instant connection, a strong technique: out of the vortex three linked gears spring up and turn together; two arcs draw round them and keep circling
  const sq = ease3(m(t, 'squeeze'));
  if (vx > 0 && sq < 1) { const R = 330, ar = ease3(m(t, 'arcs')), sp = (t - T(5)) * 1.1; c.save(); c.translate(X, Y); c.scale(1 - sq, 1); c.translate(-X, -Y);
    if (ar > 0) neon(c, () => { c.beginPath(); c.arc(X, Y, R, sp, sp + Math.PI * .7 * ar); c.stroke(); c.beginPath(); c.arc(X, Y, R, sp + Math.PI, sp + Math.PI + Math.PI * .7 * ar); c.stroke(); }, { w: 8, glow: 44 });
    GC.forEach(([gx, gy], k) => { const a = back(seg(t, M.gears[0] + k * .08, M.gears[1] + k * .08)); if (a > 0) neon(c, () => gear(c, gx, gy, 96 * a, (k % 2 ? -1 : 1) * (t * .8 + (1 - ve) * 3 + sq * 8)), { w: 6, glow: 30 }); }); c.restore(); }
  // 3. its name: mirroring: the gears squeeze into a line of light; it splits and two light bars run outward, revealing the word; it is mirrored on the floor
  const sc3 = m(t, 'scan'), melt = m(t, 'melt');
  if (sq > .9 && melt < 1) { const half = 440 * ease3(sc3), wy = Y - 60;
    if (sc3 <= 0) { c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 40; c.fillRect(X - 4, wy - 120, 8, 240); c.restore(); }
    const draw = (c) => { c.save(); c.beginPath(); c.rect(X - half, 0, 2 * half, 1920); c.clip(); txt(c, 'TÜKRÖZÉS', X, wy, 128, { glow: 40 }); c.restore(); };
    c.save(); c.globalAlpha = 1 - melt; c.translate(X, wy - 70); c.scale(1, 1 + 1.8 * ease3(melt)); c.translate(-X, -(wy - 70)); draw(c); c.restore();
    if (melt <= 0) reflect(c, wy + 75, .35, draw);
    if (sc3 > 0 && sc3 < 1) for (const d of [-1, 1]) { c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 50; c.fillRect(X + d * half - 3, wy - 110, 6, 220); c.restore(); }
    if (melt > 0) for (let k = 0; k < 16; k++) { const x = X - 400 + k * 53, len = ease3(melt) * (120 + hash(k) * 260); c.save(); c.globalAlpha = (1 - melt) * .9; const g = c.createLinearGradient(0, wy, 0, wy + len); g.addColorStop(0, 'rgba(240,244,255,.9)'); g.addColorStop(1, 'rgba(240,244,255,0)'); c.fillStyle = g; c.fillRect(x - 3, wy, 6, len); c.restore(); } }
  // 4. reflect your customer's tone, style and mood: a mirror-bright orb drops in and bounces onto a reflecting floor; a frame snaps in above it: a voice wave, a person, a star; it slides away and the orb sinks to a point
  const dp = m(t, 'drop'), so = ease3(m(t, 'slideOut')), shr = ease3(m(t, 'shrink'));
  if (dp > 0 && shr < 1) { const floor = Y + 210, rest = Y + 90, oy = lerp(Y - 760, rest, bounce(dp)) + (dp >= 1 ? 8 * Math.sin((t - M.drop[1]) * 2) : 0), or = 110 * (1 - shr);
    const si = back(m(t, 'slideIn')), fx = lerp(X + 760, X, si) - 900 * so * so, fy = Y - 230, kind = t < M.flip1[0] + .2 ? 0 : t < M.flip2[0] + .2 ? 1 : 2, fl = Math.max(m(t, 'flip1'), m(t, 'flip2')), flip = Math.abs(Math.cos(fl * Math.PI));
    const draw = (c) => { orb(c, X, oy, or); if (si > 0 && so < 1) { c.save(); c.translate(fx, fy); c.scale(1, Math.max(.04, flip)); c.translate(-fx, -fy); frame(c, fx, fy, 1.25, () => { if (kind === 0) wave(c, fx, fy, 210, t, 60); if (kind === 1) personFill(c, fx, fy + 30, .62); if (kind === 2) { c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 30; starShape(c, fx, fy + 6, 72, 5, .45); c.fill(); c.restore(); } }); c.restore(); } };
    draw(c); reflect(c, floor, .3 * clamp(dp * 2), draw); if (shr > .7) glowDot(c, X, oy, 12, 1); }
  // 5. if they're relaxed, be relaxed: the point of light swells into a soft sun; a calm ring breathes out wide
  const gr = ease3(m(t, 'grow')), stK = ease3(m(t, 'star'));
  if (shr >= 1 && stK < 1) { const r = lerp(12, 92, back(m(t, 'grow'))); glowDot(c, X, lerp(Y + 90, Y, gr), r, 1); const rg = m(t, 'ring'); if (rg > 0 && rg < 1) neon(c, () => { for (let k = 0; k < 2; k++) { const q = clamp(rg * 1.3 - k * .25); if (q > 0 && q < 1) { c.globalAlpha = 1 - q; circle(c, X, Y, r + ease3(q) * 400); } } }, { w: 6, glow: 36 }); }
  // 6. if they're formal, be professional: the sun sharpens into a crisp star, which grows into a person in a suit and tie
  const pr = ease3(m(t, 'person')), zi = ease3(m(t, 'zoomIn'));
  if (stK > 0 && zi < 1) { c.save(); if (pr < 1) { c.save(); c.globalAlpha = 1 - pr; c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 50; starShape(c, X, Y, lerp(92, 130, stK), 8, lerp(1, .55, stK)); c.fill(); c.restore(); }
    if (pr > 0) { const s = lerp(.6, 1.6, pr) * (1 - zi * .85); c.save(); c.globalAlpha = pr; personFill(c, X, Y + 40 * (1 - zi), s, ss(seg(pr, .6, 1))); c.restore(); } c.restore(); }
  // 7. mirror their lifestyle, thoughts and interests: the person shrinks into a bright core; square frames spin out of it and fill the frame; they rush past and the core splits in three
  const zo = ease3(m(t, 'zoomOut')), sp = ease3(m(t, 'split'));
  if (zi > 0 && m(t, 'swell') <= 0) { glowDot(c, X, Y, lerp(30, 64, zi), 1);
    if (zo < 1) neon(c, () => { for (let k = 0; k < 6; k++) { const r = (90 + k * 120) * zi * (1 + .12 * Math.sin(t * .7)) * (1 + zo * 2.5), rot = (t - 20) * (.15 + k * .03) * (k % 2 ? -1 : 1); c.save(); c.translate(X, Y); c.rotate(rot); c.beginPath(); c.roundRect(-r, -r, 2 * r, 2 * r, 18); c.stroke(); c.restore(); } }, { w: 6, glow: 36, alpha: 1 - zo });
    for (const d of [-1, 1]) if (sp > 0) neon(c, () => circle(c, X + d * 230 * back(m(t, 'split')), Y, 58 * sp), { w: 6, glow: 30 }); }
  // 8. trust grows at once: the middle core swells big and bright, pushing its two companions out
  const swl = back(m(t, 'swell')), mo = ease3(seg(t, M.qmark[0], M.qmark[0] + .5));
  if (m(t, 'swell') > 0 && mo < 1) { glowDot(c, X, Y, lerp(64, 150, swl) * (1 - mo * .6), 1 - mo); for (const d of [-1, 1]) neon(c, () => circle(c, X + d * (lerp(230, 310, swl) + mo * 500), Y, 58), { w: 6, glow: 30, alpha: 1 - mo }); }
  // 9. why does it work? the bright core draws a question mark out of itself; simple psychology: its dot sends out a neuron, branch after branch lighting up, pulses running along
  const qm = m(t, 'qmark'), nr = m(t, 'neuron'), rt = ease3(m(t, 'retract'));
  if (mo > 0 && rt < 1) { const dotY = Y + 170; c.save(); c.globalAlpha = 1 - rt;
    if (nr < .35) { c.save(); c.setLineDash([1300 * ease3(qm), 1300]); c.globalAlpha *= 1 - ss(seg(nr, 0, .35)); neon(c, () => { c.beginPath(); c.arc(X, Y - 150, 120, Math.PI * 1.05, Math.PI * 2.25); c.quadraticCurveTo(X + 30, Y - 10, X, Y + 50); c.lineTo(X, Y + 80); c.stroke(); }, { w: 14, glow: 44 }); c.restore(); }
    glowDot(c, X, dotY * (1 - rt) + Y * rt, 26 + 10 * Math.sin(t * 4) * (nr > 0 ? 1 : 0), 1);
    if (nr > 0) { const br = (x, y, a, len, d, k) => { const u = clamp(nr * 3.2 - d * .45 - rt * 3); if (u <= 0 || d > 4) return; const L = len * ease3(u) * (1 - rt), x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L; c.lineWidth = Math.max(2, 9 - d * 1.8); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + x2) / 2 + Math.sin(k * 3) * 30, (y + y2) / 2 + Math.cos(k * 2) * 30, x2, y2); c.stroke(); if (u >= 1) { br(x2, y2, a - .5 - hash(k) * .3, len * .66, d + 1, k * 2 + 1); br(x2, y2, a + .45 + hash(k + 9) * .3, len * .66, d + 1, k * 2 + 2); } };
      neon(c, () => { for (let k = 0; k < 6; k++) br(X, dotY, -Math.PI / 2 + (k - 2.5) * .62 + (k > 2 ? 0 : 0) + (k % 2 ? .1 : -.1) + (k >= 3 ? Math.PI : 0) * 0, 220, 0, k + 1); }, { w: 8, glow: 34 });
      for (let k = 0; k < 8; k++) { const q = ((t * .8 + k / 8) % 1), a = -Math.PI / 2 + (k - 3.5) * .4; if (nr > .5) glowDot(c, X + Math.cos(a) * q * 520, dotY + Math.sin(a) * q * 520, 9, Math.sin(q * Math.PI) * (1 - rt)); } }
    c.restore(); }
  // 10. people are drawn to what feels familiar: the neuron pulls back into one ring; shapes drift around it; only the circles feel the pull, glide in and lock into an orbit; the rest drift away
  const sh = m(t, 'shapes'), pl = ease3(m(t, 'pull')), lk = back(m(t, 'lock')), mi = ease3(m(t, 'mirror'));
  if (rt > 0 && mi < 1) { c.save(); c.globalAlpha = 1 - mi; neon(c, () => circle(c, X, Y, 70 * Math.min(1, rt * 1.3)), { w: 7, glow: 40 });
    for (let k = 0; k < 12; k++) { const isC = k % 2 === 0, a0 = k / 12 * Math.PI * 2 + .3, r0 = 330 + hash(k) * 120, drift = t * .25 + k, bx = X + Math.cos(a0) * r0 + Math.sin(drift) * 30, by = Y + Math.sin(a0) * r0 * 1.05 + Math.cos(drift * 1.2) * 30, ap = back(seg(t, M.shapes[0] + k * .06, M.shapes[0] + k * .06 + .5)); if (ap <= 0) continue;
      let x = bx, y = by, al = 1; if (isC) { const oa = (k / 12) * Math.PI * 2 + (t - T(63)) * .6 * lk, tx = X + Math.cos(oa) * 220, ty = Y + Math.sin(oa) * 220; x = lerp(bx, tx, pl); y = lerp(by, ty, pl); } else { x = bx + (bx - X) * pl * .8; y = by + (by - Y) * pl * .8; al = 1 - pl; }
      const cx = lerp(x, X, mi * (isC ? 1 : 0)), cy = lerp(y, Y, mi);
      neon(c, () => { c.save(); c.translate(cx, cy); c.rotate(isC ? 0 : t * .6 + k); const s = 46 * ap; if (isC) circle(c, 0, 0, s * (1 + .15 * lk * (isC ? 1 : 0))); else if (k % 4 === 1) c.strokeRect(-s, -s, 2 * s, 2 * s); else P(c, [[0, -s * 1.1], [s, s * .8], [-s, s * .8]], true); c.restore(); }, { w: 6, glow: isC ? 26 + 24 * lk : 22, alpha: al });
    } if (lk > 0) neon(c, () => circle(c, X, Y, 220), { w: 2, glow: 30, alpha: .5 * lk * (1 - mi) }); c.restore(); }
  // 11. mirror your audience gently and they feel understood: the orbit closes into a mirror of light; a figure steps up on each side; one raises a hand and the other copies it; their hands meet on the mirror in a flash
  const fL = back(m(t, 'figL')), fR = back(m(t, 'figR')), hL = ease3(m(t, 'handL')), hR = ease3(m(t, 'handR')), tc = ease3(m(t, 'touch')), fl = m(t, 'flash'), c1 = m(t, 'c1');
  if (mi > 0) { const ly = Y - 330 + 660 * (1 - mi) * 0, lh = 700 * mi, mfade = 1 - ss(seg(fl, 0, .5)); c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 40; c.globalAlpha = mfade; c.fillRect(X - 3, Y - lh / 2, 6, lh); c.restore();
    const fig = (x, d, s, hand, reach) => { if (s <= .01) return; const hy = Y - 210, sx = x, shY = Y - 120; neon(c, () => { circle(c, sx, hy, 54 * s); P(c, [[sx, hy + 54 * s], [sx, Y + 120 * s]]); P(c, [[sx, Y + 120 * s], [sx - 60 * s, Y + 300 * s]]); P(c, [[sx, Y + 120 * s], [sx + 60 * s, Y + 300 * s]]); P(c, [[sx, shY], [sx - d * 90 * s, shY + 150 * s]]);
      const ex = lerp(sx + d * 90 * s, sx + d * 110 * s, hand), ey = lerp(shY + 150 * s, shY - 140 * s, hand), tx = lerp(ex, X - d * 8, reach), ty = lerp(ey, Y - 150, reach); P(c, [[sx, shY], [tx, ty]]); circle(c, tx, ty, 14 * s, true); }, { w: 8, glow: 34, alpha: c1 > 0 ? 1 - ss(c1 * 2) : 1 }); };
    const gap = lerp(330, 190, tc); fig(X - gap, 1, fL, hL, tc); fig(X + gap, -1, fR, hR, tc);
    if (fl > 0) { const b = Math.sin(clamp(fl) * Math.PI); glowDot(c, X, Y - 150, 30 + 60 * b, 1 - ss(seg(fl, .7, 1)) + (c1 > 0 ? 0 : 0)); c.save(); c.globalAlpha = .5 * b; const g = c.createRadialGradient(X, Y - 150, 0, X, Y - 150, 600); g.addColorStop(0, 'rgba(235,242,255,.8)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.fillRect(0, 700, 1080, 1220); c.restore(); } }
  // 12. use it, and watch what happens: from the meeting point three forint coins rise and spread into a row, turning bright one by one
  if (c1 > 0) for (let k = 0; k < 3; k++) { const q = m(t, ['c1', 'c2', 'c3'][k]), up = ease3(seg(t, M.c1[0], M.c1[0] + .6)), x = X + (k - 1) * 250 * up, y = lerp(Y - 150, Y, up), turn = Math.cos(q * Math.PI);
    c.save(); c.translate(x, y); c.scale(Math.max(.05, Math.abs(turn)), 1); c.translate(-x, -y); if (q < .5) neon(c, () => circle(c, x, y, 92 * up), { w: 6, glow: 30 }); else { glowDot(c, x, y, 60, .4); coin(c, x, y, 92); } c.restore(); }
}
// the bloom: the take is drawn off-screen, then laid down twice: a wide soft glow and the crisp picture
function take(c, t) { oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height); oc.setTransform(K, 0, 0, K, 0, 0); scene(oc, t);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55; c.filter = `blur(${26 * K}px)`; c.drawImage(off, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.drawImage(off, 0, 0); c.restore(); }
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
// the sound cues: every motion's start and end, so mix.py lands each sound on its frame
window.EV = Object.entries(M).flatMap(([k, [a, b]]) => [{ t: +a.toFixed(3), type: k, end: +b.toFixed(3) }]).sort((p, q) => p.t - q.t);
