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
const back = x => { const c1 = 1.70158, c3 = c1 + 1; x = clamp(x); return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bounce = x => { x = clamp(x); const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const M = {
  fill: [.3, 1.2], drag: [T(3) - .5, T(4) + .5], sweep: [T(5) - .35, T(5) + .55], gears: [T(5), T(6) + .8],
  squeeze: [T(11) - .45, T(12) - .05], scan: [T(12) - .05, T(13) + .25], melt: [T(14) - .35, T(14) + .3], drop: [T(14) - .15, T(14) + .85],
  slideIn: [T(21) - .35, T(21) + .1], flip1: [T(23) - .25, T(23) + .15], flip2: [T(25) - .25, T(25) + .15], slideOut: [T(25) + .55, T(25) + .95], shrink: [T(25) + .7, T(26) + .1],
  grow: [T(27) - .2, T(27) + .6], ring: [T(30) - .2, T(31) + 1.0], star: [T(33) - .3, T(33) + .4], person: [T(34), T(37) + .2],
  zoomIn: [T(38) - .3, T(39) + .4], zoomOut: [T(43) - .45, T(43) + .3], split: [T(43) - .3, T(46) + .2], swell: [T(48) - .2, T(50) + .4],
  morph: [T(51) - .25, T(52) + .45], shatter: [T(55), T(56) + .4], iris: [T(55) + .15, T(56) + .35], pull: [T(60) - .4, T(63) + .4], merge: [T(63) - .2, T(64) + .3], irisOut: [T(64) + .1, T(65) + .05],
  faces: [T(65) - .25, T(66) + .2], f1: [T(67) - .25, T(67) + .25], f2: [T(69) - .25, T(69) + .25], f3: [T(73) - .25, T(73) + .25], c1: [T(75) - .2, T(75) + .2], c2: [T(77) - .2, T(77) + .2], c3: [T(79) - .2, T(79) + .2] };
const m = (t, k) => seg(t, M[k][0], M[k][1]);
// —— the one continuous take ——
function scene(c, t) {
  // 1. more sales: a tile fills into a grid of coins; the cursor drags the corner, the grid grows big; a bright arc sweeps round and wipes it away
  const sw = ease3(m(t, 'sweep')), swA = -Math.PI / 2 + sw * Math.PI * 2;
  if (sw < 1) { const grow = ease3(m(t, 'drag')), n = t < .5 ? 1 : t < T(3) ? 3 : 5, cell = 128, size = lerp(360, 680, grow), sc = size / (n * cell), fill = ease3(m(t, 'fill'));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = clamp(fill * 2.2 - (i + j) * .12), x = X + (j - (n - 1) / 2) * cell * sc, y = Y + (i - (n - 1) / 2) * cell * sc; let ang = Math.atan2(y - Y, x - X) + Math.PI / 2; if (ang < 0) ang += Math.PI * 2; const gone = sw > 0 ? clamp((sw * Math.PI * 2 - ang) / .6) : 0; if (k <= 0 || gone >= 1) continue; c.save(); c.globalAlpha = 1 - gone; coin(c, x, y, 48 * sc * Math.min(1.05, k) * (1 + .3 * gone)); c.restore(); }
    selBox(c, X, Y, size + 50, size + 50, 1 - sw); const dr = m(t, 'drag'); if (dr > 0 && dr < 1) cursor(c, X + (size + 50) / 2 + 6, Y + (size + 50) / 2 + 6, 1 - ss(seg(dr, .85, 1))); }
  // 2. an instant connection, a strong technique: the sweeping arcs keep circling; three linked gears grow out where the arc passed and turn together
  const sq = ease3(m(t, 'squeeze'));
  if (sw > 0 && sq < 1) { const R = 330, sp = swA + Math.max(0, t - M.sweep[1]) * 1.1; c.save(); c.translate(X, Y); c.scale(1 - sq, 1); c.translate(-X, -Y);
    neon(c, () => { c.beginPath(); c.arc(X, Y, R, sp - Math.PI * .7, sp); c.stroke(); if (sw >= 1) { c.beginPath(); c.arc(X, Y, R, sp + Math.PI * .3, sp + Math.PI); c.stroke(); } }, { w: 8, glow: 44 });
    if (sw < 1) glowDot(c, X + Math.cos(swA) * R, Y + Math.sin(swA) * R, 18, 1);
    [[X, Y - 115], [X - 120, Y + 90], [X + 120, Y + 90]].forEach(([gx, gy], k) => { const a = back(seg(t, M.gears[0] + k * .22, M.gears[0] + k * .22 + .6)); if (a > 0) neon(c, () => gear(c, gx, gy, 96 * a, (k % 2 ? -1 : 1) * (t * .8 + sq * 8)), { w: 6, glow: 30 }); }); c.restore(); }
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
  const swl = back(m(t, 'swell')), mo = ease3(m(t, 'morph'));
  if (m(t, 'swell') > 0 && mo < 1) { glowDot(c, X, Y, lerp(64, 150, swl) * (1 - mo * .6), 1 - mo); for (const d of [-1, 1]) neon(c, () => circle(c, X + d * (lerp(230, 310, swl) + mo * 500), Y, 58), { w: 6, glow: 30, alpha: 1 - mo }); }
  // 9. why does it work? simple psychology: the core dims into a brain drawn in light, sparks inside; dotted waves flow in from the edges; it shatters into light
  const sh = m(t, 'shatter'), ir = m(t, 'iris');
  if (mo > 0 && ir < 1) {
    for (const d of [-1, 1]) { c.save(); c.setLineDash([3, 12]); neon(c, () => { c.beginPath(); const n = Math.floor(50 * mo); for (let k = 0; k <= n; k++) { const x = d < 0 ? -60 + k * 24 : 1140 - k * 24, ph = (t - 26.5) * 1.3; c.lineTo(x, Y + d * 400 + Math.sin(k * .25 + ph + d) * 110); } c.stroke(); }, { w: 6, glow: 30, alpha: 1 - sh }); c.restore(); }
    if (sh <= 0) { c.save(); c.setLineDash([2200 * mo, 2200]); neon(c, () => brain(c, X, Y, 3.3), { w: 7, glow: 36 }); c.restore(); if (mo >= 1) for (let k = 0; k < 4; k++) glowDot(c, X - 90 + hash(k + Math.floor(t * 2)) * 180, Y - 150 + hash(k + 7 + Math.floor(t * 2)) * 180, 13, 1); }
    else for (let k = 0; k < 46; k++) { const a = hash(k) * 7, d = ease3(sh) * (100 + hash(k + 3) * 760); c.save(); c.translate(X + Math.cos(a) * d, Y + Math.sin(a) * d); c.rotate(sh * 6 * hash(k + 5)); c.globalAlpha *= 1 - sh; c.fillStyle = 'rgba(230,236,255,.95)'; c.beginPath(); c.moveTo(0, -20); c.lineTo(16, 12); c.lineTo(-14, 14); c.closePath(); c.fill(); c.restore(); } }
  // 10. people are drawn to what feels familiar: the light opens out from the centre like an iris; two soft discs drift, find each other and overlap; the iris closes again
  const io = ease3(m(t, 'irisOut'));
  if (ir > 0 && io < 1) { const R = lerp(0, 1500, ease3(ir)) * (1 - io); c.save(); c.beginPath(); c.rect(0, 720, 1080, 1300); c.clip(); c.beginPath(); c.arc(X, Y, R, 0, 7); c.clip(); c.fillStyle = '#dfe6f6'; c.fillRect(0, 0, 1080, 1920);
    const pull = ease3(m(t, 'pull')), big = ease3(m(t, 'merge')); [[-1, -60], [1, 60]].forEach(([d, oy], k) => { const x = X + d * lerp(230, 70, pull) + 30 * Math.sin(t * .9 + k), y = Y + oy * (1 - pull) + 20 * Math.cos(t * .8 + k), r = lerp(150, 420, big); c.fillStyle = k ? 'rgba(120,134,170,.45)' : 'rgba(150,164,198,.55)'; c.beginPath(); c.ellipse(x, y, r * (k ? 1 : .9), r * 1.1, 0, 0, 7); c.fill(); });
    const g = c.createLinearGradient(0, 720, 0, 840); g.addColorStop(0, 'rgba(0,17,63,1)'); g.addColorStop(1, 'rgba(0,17,63,0)'); c.fillStyle = g; c.fillRect(0, 720, 1080, 120); c.restore(); }
  // 11. mirror your audience gently and they feel understood: three faces appear as the iris closes; the middle one smiles, the others flip like reflections to match; all smile
  const fa = m(t, 'faces');
  if (fa > 0 && m(t, 'c3') < 1) { for (let k = 0; k < 3; k++) { const a = back(seg(t, M.faces[0] + k * .12, M.faces[0] + k * .12 + .5)), x = X + (k - 1) * 250, fk = ['f2', 'f1', 'f3'][k], fp = m(t, fk), sy = Math.cos(fp * Math.PI), mood = fp < .5 ? (k === 1 ? .2 : -.8) : 1, ck = m(t, ['c1', 'c2', 'c3'][k]), sx = Math.cos(ck * Math.PI);
      c.save(); c.translate(x, Y); c.scale(Math.max(.05, Math.abs(sx)), Math.max(.05, Math.abs(sy))); c.translate(-x, -Y); if (ck < .5) neon(c, () => face(c, x, Y, 92 * a, mood), { w: 6, glow: 30 }); else { glowDot(c, x, Y, 60, .4); coin(c, x, Y, 92); } c.restore(); }
    reflect(c, Y + 130, .25 * clamp(fa * 2), (c) => { for (let k = 0; k < 3; k++) neon(c, () => face(c, X + (k - 1) * 250, Y, 92, 1), { w: 5, glow: 20 }); }); }
}
// the bloom: the take is drawn off-screen, then laid down twice: a wide soft glow and the crisp picture
function take(c, t) { oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height); oc.setTransform(K, 0, 0, K, 0, 0); scene(oc, t);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55; c.filter = `blur(${26 * K}px)`; c.drawImage(off, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.drawImage(off, 0, 0); c.restore(); }
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
// the sound cues: every motion's start and end, so mix.py lands each sound on its frame
window.EV = Object.entries(M).flatMap(([k, [a, b]]) => [{ t: +a.toFixed(3), type: k, end: +b.toFixed(3) }]).sort((p, q) => p.t - q.t);
