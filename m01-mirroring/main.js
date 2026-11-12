// M01 Tükrözés (mirroring), redone after the user's feedback: one continuous take that follows reference video 1 shot by shot.
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
function reflect(c, floor, a, f) { c.save(); c.translate(0, floor * 2); c.scale(1, -1); c.globalAlpha *= a; f(); c.restore(); const g = c.createLinearGradient(0, floor, 0, floor + 360); g.addColorStop(0, 'rgba(0,17,63,0)'); g.addColorStop(1, 'rgba(0,17,63,.95)'); c.fillStyle = g; c.fillRect(0, floor, 1080, 360); }
function frame(c, x, y, s, inner) { neon(c, () => { c.beginPath(); c.roundRect(x - 120 * s, y - 100 * s, 240 * s, 200 * s, 18 * s); c.stroke(); c.beginPath(); c.roundRect(x - 104 * s, y - 84 * s, 208 * s, 168 * s, 12 * s); c.stroke(); }, { w: 6, glow: 34 }); inner && inner(); }
function wave(c, x, y, w, t, amp) { neon(c, () => { c.beginPath(); for (let k = 0; k <= 60; k++) { const xx = x - w / 2 + k * w / 60, env = Math.sin(k / 60 * Math.PI); c.lineTo(xx, y + Math.sin(k * .9 + t * 14) * amp * env * (.5 + .5 * Math.sin(k * .37 + t * 5))); } c.stroke(); }, { w: 4, glow: 24 }); }
function personFill(c, x, y, s, tie = 0) { c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 40; c.beginPath(); c.arc(x, y - 70 * s, 52 * s, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - 120 * s, y + 90 * s); c.quadraticCurveTo(x - 120 * s, y - 6 * s, x - 40 * s, y - 10 * s); c.lineTo(x + 40 * s, y - 10 * s); c.quadraticCurveTo(x + 120 * s, y - 6 * s, x + 120 * s, y + 90 * s); c.closePath(); c.fill(); c.shadowBlur = 0;
  if (tie > 0) { c.globalAlpha = tie; c.strokeStyle = MID; c.fillStyle = MID; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x - 40 * s, y - 10 * s); c.lineTo(x, y + 40 * s); c.lineTo(x + 40 * s, y - 10 * s); c.stroke(); c.beginPath(); c.moveTo(x - 9 * s, y + 4 * s); c.lineTo(x + 9 * s, y + 4 * s); c.lineTo(x + 13 * s, y + 70 * s); c.lineTo(x, y + 84 * s); c.lineTo(x - 13 * s, y + 70 * s); c.closePath(); c.fill(); } c.restore(); }
function starShape(c, x, y, r, n, inner) { c.beginPath(); for (let k = 0; k < n * 2; k++) { const a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
function brain(c, x, y, s) { c.beginPath(); c.moveTo(x - 70 * s, y + 20 * s); c.bezierCurveTo(x - 100 * s, y - 10 * s, x - 80 * s, y - 70 * s, x - 30 * s, y - 70 * s); c.bezierCurveTo(x - 10 * s, y - 95 * s, x + 50 * s, y - 90 * s, x + 60 * s, y - 55 * s); c.bezierCurveTo(x + 100 * s, y - 45 * s, x + 100 * s, y + 20 * s, x + 60 * s, y + 30 * s); c.bezierCurveTo(x + 40 * s, y + 55 * s, x - 40 * s, y + 55 * s, x - 70 * s, y + 20 * s); c.stroke();
  for (const [a, b, d] of [[-50, -40, 1], [0, -55, -1], [30, -10, 1], [-30, 5, -1]]) { c.beginPath(); c.arc(x + a * s, y + b * s, 18 * s, d > 0 ? 0 : Math.PI, d > 0 ? Math.PI : Math.PI * 2); c.stroke(); } P(c, [[x - 4 * s, y + 40 * s], [x - 10 * s, y + 80 * s]]); }
function face(c, x, y, r, mood) { circle(c, x, y, r); c.beginPath(); const m = clamp(mood, -1, 1); c.moveTo(x - r * .45, y + r * .25 - m * r * .05); c.quadraticCurveTo(x, y + r * .25 + m * r * .45, x + r * .45, y + r * .25 - m * r * .05); c.stroke(); circle(c, x - r * .32, y - r * .2, r * .08, true); circle(c, x + r * .32, y - r * .2, r * .08, true); }
// —— the one continuous take ——
function scene(c, t) {
  // 1. more sales: a single tile in a selection box fills into a grid of coins; the cursor drags the corner and the grid grows big (0 – 3.6)
  const s1 = 1 - u(t, T(5) - .2, T(6) + .2);
  if (s1 > 0) { const grow = ue(t, T(3) - .2, T(4) + .5), n = t < .5 ? 1 : t < T(3) ? 3 : 5, cell = 128, size = lerp(360, 680, grow) * lerp(1, 1.25, 1 - s1), sc = size / (n * cell), arc = 1 - s1;
    c.save(); c.globalAlpha = s1; c.translate(X, Y); c.rotate(arc * .5); c.scale(1 + arc * .6, 1 + arc * .6); c.translate(-X, -Y);
    const fill = ue(t, .3, 1.2); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = clamp(fill * 2.2 - (i + j) * .12); if (k <= 0) continue; coin(c, X + (j - (n - 1) / 2) * cell * sc, Y + (i - (n - 1) / 2) * cell * sc, 48 * sc * Math.min(1.05, k)); }
    selBox(c, X, Y, size + 50, size + 50, 1); const dr = seg(t, T(3) - .6, T(4) + .5); if (dr > 0 && dr < 1) cursor(c, X + (size + 50) / 2 + 6, Y + (size + 50) / 2 + 6, 1 - ss(seg(dr, .85, 1))); c.restore(); }
  // 2. an instant connection, a strong technique: two arcs sweep round as the grid turns away; three gears with people turn together, linked (3.4 – 7.6)
  const s2 = u(t, T(5) - .4, T(6)) * (1 - u(t, T(11) - .3, T(13) - .2));
  if (s2 > 0) { const R = 300, sp = (t - 3) * .9; neon(c, () => { c.beginPath(); c.arc(X, Y, R, sp, sp + Math.PI * .75 * s2); c.stroke(); c.beginPath(); c.arc(X, Y, R, sp + Math.PI, sp + Math.PI + Math.PI * .75 * s2); c.stroke(); }, { w: 7, glow: 40, alpha: s2 });
    const G = [[X, Y - 115], [X - 120, Y + 90], [X + 120, Y + 90]]; G.forEach(([gx, gy], k) => { const a = ue(t, T(6) - .2 + k * .2, T(7) + k * .2), r = 96 * a; if (r > 1) neon(c, () => gear(c, gx, gy, r, (k % 2 ? -1 : 1) * t * .8), { w: 6, glow: 30, alpha: s2 }); }); }
  // 3. its name: mirroring: the gears break into light that flies together into the big word, mirrored on the floor (7.4 – 10.1)
  const s3 = u(t, T(11) - .4, T(12)) * (1 - u(t, T(14) - .3, T(14) + .3));
  if (s3 > 0) { const fl = seg(t, T(11) - .5, T(13)); if (fl > 0 && fl < 1) for (let k = 0; k < 70; k++) { const a = hash(k) * 7, sx = X + Math.cos(a) * (120 + hash(k + 2) * 200), sy = Y + Math.sin(a) * (120 + hash(k + 4) * 200), tx = X - 380 + (k % 14) * 58, ty = Y + (Math.floor(k / 14) - 2) * 20, e = ease3(clamp(fl * 1.3 - hash(k + 9) * .3)); glowDot(c, lerp(sx, tx, e), lerp(sy, ty, e), 5, 1 - ss(seg(fl, .85, 1))); }
    const word = scramble('TÜKRÖZÉS', t, T(13) - .4, .6), sq = u(t, T(14) - .3, T(14) + .3), wy = Y;
    c.save(); c.globalAlpha = s3; c.translate(X, wy); c.scale(1 - sq * .8, 1 - sq * .8); c.translate(-X, -wy); txt(c, word, X, wy, 128, { glow: 40 }); reflect(c, wy + 70, .35, () => txt(c, word, X, wy, 128, { glow: 20 })); c.restore(); }
  // 4. reflect your customer's tone, style and mood: the word folds into a mirror-bright orb on a reflecting floor; frames slide in above it: a voice wave, a person, a star (10.0 – 15.0)
  const s4 = u(t, T(14) - .2, T(14) + .4) * (1 - u(t, T(26) - .2, T(26) + .2));
  if (s4 > 0) { const floor = Y + 210, oy = Y + 90 + 8 * Math.sin(t * 2), or = lerp(40, 110, ue(t, T(14) - .2, T(15) + .4)) * (1 - .7 * u(t, T(25) + .6, T(26) + .1));
    const fr = ue(t, T(21) - .3, T(22) + .1), fx = lerp(X + 700, X, fr), fy = Y - 210, kind = t < T(23) - .1 ? 0 : t < T(25) - .1 ? 1 : 2, flip = 1 - Math.abs(Math.sin(Math.PI * Math.min(1, Math.max(seg(t, T(23) - .3, T(23) + .1), seg(t, T(25) - .3, T(25) + .1)) * 1)));
    const draw = (ry) => { c.save(); c.globalAlpha *= s4; orb(c, X, ry, or); if (fr > 0) { c.save(); c.translate(fx, fy); c.scale(1, flip); c.translate(-fx, -fy); frame(c, fx, fy, 1.25, () => { if (kind === 0) wave(c, fx, fy, 210, t, 60); if (kind === 1) personFill(c, fx, fy + 30, .62); if (kind === 2) { c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 30; starShape(c, fx, fy + 6, 72, 5, .45); c.fill(); c.restore(); } }); c.restore(); } c.restore(); };
    draw(oy); reflect(c, floor, .3, () => draw(oy)); }
  // 5. if they're relaxed, be relaxed: the orb sinks to a point of light, swells into a soft glowing sun; a calm ring breathes out wide (15.0 – 17.9)
  const s5 = u(t, T(26) - .2, T(26) + .2) * (1 - u(t, T(32) - .2, T(33)));
  if (s5 > 0) { const r = lerp(8, 92, ue(t, T(27) - .2, T(27) + .6)), spikes = u(t, T(32) - .3, T(33) + .2); c.save(); c.globalAlpha = s5; glowDot(c, X, Y, r, 1); const rg = seg(t, T(30) - .2, T(31) + 1.0); if (rg > 0 && rg < 1) neon(c, () => circle(c, X, Y, r + ease3(rg) * 380), { w: 6, glow: 36, alpha: 1 - ss(seg(rg, .6, 1)) }); c.restore(); }
  // 6. if they're formal, be professional too: the sun sharpens into a crisp star, which settles into a person in a suit and tie (17.8 – 20.4)
  const s6 = u(t, T(32) - .2, T(33)) * (1 - u(t, T(38) - .2, T(39)));
  if (s6 > 0) { const st = ue(t, T(33) - .3, T(33) + .4), pr = ue(t, T(34), T(37) + .2); c.save(); c.globalAlpha = s6;
    if (pr < 1) { c.save(); c.globalAlpha *= 1 - pr; c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 50; starShape(c, X, Y, lerp(92, 130, st), 8, lerp(1, .55, st)); c.fill(); c.restore(); }
    if (pr > 0) { c.save(); c.globalAlpha *= pr; personFill(c, X, Y + 40, lerp(.6, 1.6, pr), ss(seg(pr, .6, 1))); c.restore(); } c.restore(); }
  // 7. mirror their lifestyle, thoughts and interests: square frames spin out round a bright core, filling the frame; the core splits in three (20.3 – 24.6)
  const s7 = u(t, T(38) - .2, T(39)) * (1 - u(t, T(47) - .3, T(47) + .1));
  if (s7 > 0) { const tun = ue(t, T(38) - .1, T(41) + .4), split = ue(t, T(43) - .3, T(46) + .2), back = u(t, T(43) - .4, T(43) + .3); c.save(); c.globalAlpha = s7;
    if (back < 1) neon(c, () => { for (let k = 0; k < 6; k++) { const r = (90 + k * 120) * (.4 + .6 * tun) * (1 + .15 * Math.sin(t * .7)), rot = (t - 20) * (.15 + k * .03) * (k % 2 ? -1 : 1); c.save(); c.translate(X, Y); c.rotate(rot); c.beginPath(); c.roundRect(-r, -r, 2 * r, 2 * r, 18); c.stroke(); c.restore(); } }, { w: 6, glow: 36, alpha: 1 - back });
    glowDot(c, X, Y, 64, 1); for (const d of [-1, 1]) { const x = X + d * 230 * split; if (split > 0) neon(c, () => circle(c, x, Y + d * -40 * (1 - split) * 0, 58), { w: 6, glow: 30, alpha: split }); } c.restore(); }
  // 8. trust grows at once: the middle core swells big and bright between its two companions (24.5 – 26.6)
  const s8 = u(t, T(47) - .3, T(47) + .1) * (1 - u(t, T(51) - .2, T(51) + .3));
  if (s8 > 0) { const g = ue(t, T(48) - .2, T(50) + .4); c.save(); c.globalAlpha = s8; glowDot(c, X, Y, lerp(64, 150, g), 1); for (const d of [-1, 1]) neon(c, () => circle(c, X + d * lerp(230, 310, g), Y, 58), { w: 6, glow: 30 }); c.restore(); }
  // 9. why does it work? simple psychology: the bright core dims into a brain with sparks inside; dotted waves flow above and below; then it shatters (26.5 – 30.0)
  const s9 = u(t, T(51) - .2, T(51) + .4) * (1 - u(t, T(55) + .2, T(56) - .1));
  if (s9 > 0) { const br = ue(t, T(51) - .1, T(52) + .3), shat = seg(t, T(55), T(56) + .4); c.save(); c.globalAlpha = s9;
    for (const d of [-1, 1]) { c.save(); c.setLineDash([3, 12]); neon(c, () => { c.beginPath(); for (let k = 0; k <= 50; k++) { const x = -60 + k * 24, ph = (t - 26.5) * 1.3; c.lineTo(x, Y + d * 400 + Math.sin(k * .25 + ph + d) * 110 * br); } c.stroke(); }, { w: 6, glow: 30 }); c.restore(); }
    if (shat <= 0) { neon(c, () => brain(c, X, Y, 3.3 * br), { w: 7, glow: 36 }); for (let k = 0; k < 4; k++) glowDot(c, X - 90 + hash(k + Math.floor(t * 2)) * 180, Y - 150 + hash(k + 7 + Math.floor(t * 2)) * 180, 13, br); }
    else for (let k = 0; k < 40; k++) { const a = hash(k) * 7, d = ease3(shat) * (100 + hash(k + 3) * 700); c.save(); c.translate(X + Math.cos(a) * d, Y + Math.sin(a) * d); c.rotate(shat * 6 * hash(k + 5)); c.globalAlpha *= 1 - shat; c.fillStyle = 'rgba(230,236,255,.9)'; c.beginPath(); c.moveTo(0, -18); c.lineTo(14, 10); c.lineTo(-12, 12); c.closePath(); c.fill(); c.restore(); }
    c.restore(); }
  // 10. people are naturally drawn to what feels familiar: the screen floods with soft light; two soft discs drift, find each other and overlap (29.9 – 33.6)
  const s10 = u(t, T(55) + .2, T(56)) * (1 - u(t, T(64) - .1, T(65)));
  if (s10 > 0) { c.save(); c.globalAlpha = s10 * .9; const fg = c.createLinearGradient(0, 620, 0, 820); fg.addColorStop(0, 'rgba(223,230,246,0)'); fg.addColorStop(1, 'rgba(223,230,246,1)'); c.fillStyle = fg; c.fillRect(0, 620, 1080, 200); c.fillStyle = '#dfe6f6'; c.fillRect(0, 820, 1080, 1100); c.restore(); const pull = ue(t, T(60) - .4, T(63) + .4), big = ue(t, T(63) - .2, T(64) + .3);
    c.save(); c.globalAlpha = s10; [[-1, -60], [1, 60]].forEach(([d, oy], k) => { const x = X + d * lerp(230, 70, pull) + 30 * Math.sin(t * .9 + k), y = Y + oy * (1 - pull) + 20 * Math.cos(t * .8 + k), r = lerp(150, 420, big); c.fillStyle = k ? 'rgba(120,134,170,.45)' : 'rgba(150,164,198,.55)'; c.beginPath(); c.ellipse(x, y, r * (k ? 1 : .9), r * 1.1, 0, 0, 7); c.fill(); }); c.restore(); }
  // 11. mirror your audience gently and they feel understood: three faces; the middle one smiles, the others mirror it, flipping like reflections; all smile (33.5 – 37.9)
  const s11 = u(t, T(65) - .2, T(65) + .4) * (1 - u(t, T(75) - .3, T(75) + .1));
  if (s11 > 0) { c.save(); c.globalAlpha = s11; for (let k = 0; k < 3; k++) { const a = ue(t, T(65) + k * .15, T(66) + k * .15), x = X + (k - 1) * 250, flipT = [T(67), T(69), T(73)][k], fp = seg(t, flipT - .25, flipT + .25), sy = Math.cos(fp * Math.PI), mood = t < flipT ? (k === 1 ? .2 : -.8) : 1;
      neon(c, () => { c.save(); c.translate(x, Y); c.scale(1, Math.abs(sy) < .05 ? .05 : sy); c.translate(-x, -Y); face(c, x, Y, 92 * a, sy < 0 ? -mood : mood); c.restore(); }, { w: 6, glow: 30 }); } reflect(c, Y + 130, .25, () => { for (let k = 0; k < 3; k++) neon(c, () => face(c, X + (k - 1) * 250, Y, 92, 1), { w: 5, glow: 20 }); }); c.restore(); }
  // 12. use it, and watch what happens: one by one the faces turn into glowing forint coins (37.8 – 40.4)
  const s12 = u(t, T(75) - .3, T(75) + .1);
  if (s12 > 0) { c.save(); c.globalAlpha = s12; for (let k = 0; k < 3; k++) { const at = [T(75), T(77), T(79)][k], f = seg(t, at - .2, at + .2), x = X + (k - 1) * 250, sx = Math.cos(f * Math.PI); c.save(); c.translate(x, Y); c.scale(Math.max(.05, Math.abs(sx)), 1); c.translate(-x, -Y); if (f < .5) neon(c, () => face(c, x, Y, 92, 1), { w: 6, glow: 30 }); else { glowDot(c, x, Y, 60, .4); coin(c, x, Y, 92); } c.restore(); } c.restore(); }
}
// the bloom: the take is drawn off-screen, then laid down twice: a wide soft glow and the crisp picture
function take(c, t) { oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height); oc.setTransform(K, 0, 0, K, 0, 0); scene(oc, t);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55; c.filter = `blur(${26 * K}px)`; c.drawImage(off, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.drawImage(off, 0, 0); c.restore(); }
start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
