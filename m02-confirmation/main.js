// M02 Megerősítés (confirmation), v4 (user 2026-11-13: "not thick and shiny; draw nicer visuals with lines, follow the inspiration, each visual
// related to what is said, aesthetic, smooth transitions"). The reference's own language: hairline white lines, one soft glowing orb that leads
// the eye through every scene, simple geometric drawings (an angular figure, a house, a globe, a diamond, a mirror, a key, a heart) that draw
// themselves on and off while the orb glides from one scene into the next. No icon set, no heavy glow. Safe zone 0.92.
import { WORDS } from './captions.js';
import { start, ss, seg, clamp, lerp, ease3, WHITE, MID, K } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 38.8, DUR = 43.1;
const LW = 3.2;   // hairline (the reference's 1 px line at 576 px wide, scaled to 1080 and the 0.92 safe zone)
// —— line geometry: every drawing is a list of strokes, every stroke a list of points, so it can draw itself on and off by length ——
const arc = (cx, cy, rx, ry, a0, a1, n = 64) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const ring = (cx, cy, r, ry = r, a0 = -Math.PI / 2) => arc(cx, cy, r, ry, a0, a0 + Math.PI * 2, 96);
const bez = (p0, p1, p2, p3, n = 32) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [0, 1].map(k => v * v * v * p0[k] + 3 * v * v * u * p1[k] + 3 * v * u * u * p2[k] + u * u * u * p3[k]); });
const close = p => [...p, p[0]];
const heart = (cx, cy, s) => Array.from({ length: 121 }, (_, i) => { const a = i / 120 * Math.PI * 2; return [cx + s * 16 * Math.pow(Math.sin(a), 3) / 16, cy - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]; });
// the reference's geometric figure (arms raised around the head, holding the light above it), base = feet line, s = scale (1 = 270 px tall)
function figure(cx, base, s = S2) { const P = (x, y) => [cx + (x - 1512) * s, base - (515 - y) * s];
  return [close([P(1490, 332), P(1536, 332), P(1528, 372), P(1497, 372)]), close([P(1497, 386), P(1528, 386), P(1527, 399), P(1512, 406), P(1497, 399)]),
    [P(1500, 408), P(1481, 515)], [P(1525, 408), P(1545, 515)], ring(P(1512, 297)[0], P(1512, 297)[1], 17 * s),
    [P(1490, 330), P(1474, 318), P(1467, 298), P(1488, 264)], [P(1534, 330), P(1550, 318), P(1557, 298), P(1536, 264)]]; }
const head = (cx, base, s = S2) => [cx, base - 218 * s], above = (cx, base, s = S2) => [cx, base - 277 * s], chest = (cx, base, s = S2) => [cx, base - 163 * s];
const shop = (cx, base, w = 300, h = 300) => { const l = cx - w / 2, r = cx + w / 2, top = base - h, aw = top + 70;
  const sc = []; for (let k = 0; k < 5; k++) { const x0 = l + w * k / 5; sc.push(...arc(x0 + w / 10, aw, w / 10, 26, Math.PI, 0, 16).reverse()); }
  return [[[l - 14, top], [r + 14, top], [r + 14, aw], ...[...sc].reverse(), [l - 14, aw], [l - 14, top]], [[l, aw + 26], [l, base], [r, base], [r, aw + 26]], [[cx + 20, base], [cx + 20, base - 130], [r - 30, base - 130], [r - 30, base]], close([[l + 30, base - 150], [cx - 20, base - 150], [cx - 20, base - 70], [l + 30, base - 70]])]; };
const house = (cx, base, w = 280, h = 320) => { const l = cx - w / 2, r = cx + w / 2, eave = base - h * .58;
  return [[[l - 30, eave + 10], [cx, base - h], [r + 30, eave + 10]], [[l, eave - 10], [l, base], [r, base], [r, eave - 10]], [[cx - 40, base], [cx - 40, base - 120], [cx + 40, base - 120], [cx + 40, base]], [[r - 70, base - h * .78], [r - 70, base - h * .95], [r - 30, base - h * .95], [r - 30, base - h * .62]]]; };
const jar = (cx, cy, s = 1) => { const w = 200 * s, h = 300 * s, top = cy - h / 2, bot = cy + h / 2;
  return [[[cx - w / 2 + 20, top + 50], [cx - w / 2, top + 90], [cx - w / 2, bot - 24], ...arc(cx - w / 2 + 24, bot - 24, 24, 24, Math.PI, Math.PI / 2, 10), [cx + w / 2 - 24, bot], ...arc(cx + w / 2 - 24, bot - 24, 24, 24, Math.PI / 2, 0, 10), [cx + w / 2, top + 90], [cx + w / 2 - 20, top + 50]],
    close([[cx - w / 2 + 10, top], [cx + w / 2 - 10, top], [cx + w / 2 - 10, top + 50], [cx - w / 2 + 10, top + 50]]),
    [...bez([cx, cy + 70 * s], [cx - 80 * s, cy + 40 * s], [cx - 60 * s, cy - 60 * s], [cx, cy - 70 * s]), ...bez([cx, cy - 70 * s], [cx + 60 * s, cy - 60 * s], [cx + 80 * s, cy + 40 * s], [cx, cy + 70 * s]).slice(1)], [[cx, cy + 95 * s], [cx, cy - 35 * s]]]; };
const leaf = (x0, y0, x1, y1, bulge) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny);
  const c = [mx + nx / L * bulge, my + ny / L * bulge], d = [mx - nx / L * bulge, my - ny / L * bulge]; return [...bez([x0, y0], c, c, [x1, y1], 20), ...bez([x1, y1], d, d, [x0, y0], 20).slice(1)]; };
const globe = (cx, cy, r) => [ring(cx, cy, r), arc(cx, cy, r, r * .3, 0, Math.PI * 2, 96), arc(cx, cy, r * .42, r, -Math.PI / 2, Math.PI * 1.5, 96), [[cx - r, cy], [cx + r, cy]].length ? arc(cx, cy - r * .55, r * .83, r * .16, 0, Math.PI * 2, 80) : [], arc(cx, cy + r * .55, r * .83, r * .16, 0, Math.PI * 2, 80)];
const sprout = (cx, base, h) => [bez([cx, base], [cx - 10, base - h * .4], [cx + 14, base - h * .7], [cx, base - h]), leaf(cx, base - h * .55, cx - h * .55, base - h * .9, h * .16), leaf(cx + 2, base - h * .72, cx + h * .5, base - h * 1.05, h * .15)];
const diamond = (cx, cy, s) => { const P = (x, y) => [cx + x * s, cy + y * s];
  return [close([P(-100, -40), P(-55, -95), P(55, -95), P(100, -40), P(0, 110)]), [P(-100, -40), P(100, -40)], [P(-55, -95), P(-30, -40), P(0, -95), P(30, -40), P(55, -95)], [P(-30, -40), P(0, 110), P(30, -40)]]; };
const crown = (cx, cy, s) => { const P = (x, y) => [cx + x * s, cy + y * s]; return [close([P(-60, 30), P(-70, -30), P(-32, 0), P(0, -45), P(32, 0), P(70, -30), P(60, 30)]), [P(-60, 42), P(60, 42)]]; };
const mirror = (cx, cy, w, h) => { const r = w / 2; return [[[cx - r, cy + h / 2], [cx - r, cy - h / 2 + r], ...arc(cx, cy - h / 2 + r, r, r, Math.PI, Math.PI * 2, 40).slice(1), [cx + r, cy + h / 2], [cx - r, cy + h / 2]], [[cx - r - 40, cy + h / 2 + 24], [cx + r + 40, cy + h / 2 + 24]]]; };
const key = (bx, by, r, len) => [ring(bx, by, r, r, 0), [[bx + r, by], [bx + r + len, by]], [[bx + r + len - 70, by], [bx + r + len - 70, by + 60]], [[bx + r + len - 10, by], [bx + r + len - 10, by + 80]], [[bx + r + len - 130, by], [bx + r + len - 130, by + 40]]];
const flag = (px, base, h, t) => { const top = base - h, w = 165, fl = Array.from({ length: 21 }, (_, i) => { const u = i / 20; return [px + u * w, top + 12 * Math.sin(u * 5 - t * 3.2) * u]; });
  return [[[px, base], [px, top - 10]], [...fl, ...fl.map(([x, y]) => [x, y + 130]).reverse(), fl[0]]]; };
const ground = (cx, y, rx, ry = rx * .12) => [ring(cx, y, rx, ry, Math.PI / 2)];
// —— the drawing engine ——
function lens(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; }
function part(c, pts, f0, f1) {   // the stretch of a stroke between fractions f0 and f1 of its length
  if (f1 <= f0 || pts.length < 2) return; const L = lens(pts), tot = L[L.length - 1], a = f0 * tot, b = f1 * tot; c.beginPath(); let started = false;
  for (let i = 1; i < pts.length; i++) { const l0 = L[i - 1], l1 = L[i]; if (l1 < a || l0 > b) continue; const s0 = clamp((a - l0) / (l1 - l0 || 1)), s1 = clamp((b - l0) / (l1 - l0 || 1));
    const p = [lerp(pts[i - 1][0], pts[i][0], s0), lerp(pts[i - 1][1], pts[i][1], s0)], q = [lerp(pts[i - 1][0], pts[i][0], s1), lerp(pts[i - 1][1], pts[i][1], s1)]; if (!started) { c.moveTo(...p); started = true; } c.lineTo(...q); }
  c.stroke(); }
function pen(c, a = 1, w = LW) { c.globalAlpha = a; c.strokeStyle = WHITE; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = 'rgba(190,210,255,.55)'; c.shadowBlur = 7 * K; }
// an element: strokes (or a function of t), drawn on from `a` over `din` s (strokes staggered), held, and drawn off (erased from its start) from `b` over `dout` s
const ELS = [];
const el = (strokes, a, b, o = {}) => { const e = { strokes, a, b, din: o.din ?? .8, dout: o.dout ?? .55, alpha: o.alpha ?? 1, x: o.x ?? 540, tag: o.tag, quiet: o.quiet }; ELS.push(e); return e; };
function drawEl(c, e, t) { if (t < e.a || t > e.b + e.dout) return; const S = typeof e.strokes === 'function' ? e.strokes(t) : e.strokes, n = S.length, st = Math.min(.12, .45 / n);
  const pin = ss(seg(t, e.a, e.a + e.din)), pout = ss(seg(t, e.b, e.b + e.dout)); c.save(); pen(c, e.alpha * (1 - pout * .35));
  S.forEach((s, k) => { const fi = clamp((pin - k * st) / (1 - (n - 1) * st)), fo = clamp((pout - k * st) / (1 - (n - 1) * st)); part(c, s, ss(fo), ss(fi)); }); c.restore(); }
// the orb: one soft light that travels through the whole film (key frames: time, x, y, radius; eased between)
function orbDraw(c, x, y, r, a = 1, dark = 0) { if (r <= .3 || a <= 0) return; c.save(); c.globalAlpha = a;
  const g = c.createRadialGradient(x, y, r * .6, x, y, r * 3.4); g.addColorStop(0, 'rgba(225,235,255,.38)'); g.addColorStop(1, 'rgba(225,235,255,0)'); c.fillStyle = g; c.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8);
  c.fillStyle = WHITE; c.shadowColor = 'rgba(210,222,255,.9)'; c.shadowBlur = 22 * K; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  if (dark > 0) { c.shadowBlur = 0; c.globalAlpha = a * dark; c.fillStyle = MID; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.fill(); } c.restore(); }
function track(keys, t) { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const u = ss(seg(t, keys[i - 1][0], keys[i][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); }
const glides = [];   // orb moves that cover a real distance (each gets a soft whoosh)
const orb = keys => { for (let i = 1; i < keys.length; i++) { const d = Math.hypot(keys[i][1] - keys[i - 1][1], keys[i][2] - keys[i - 1][2]); if (d > 120) glides.push({ t: keys[i - 1][0], d: keys[i][0] - keys[i - 1][0], x: keys[i][1] }); } return keys; };
// accents: rays of light, a ripple ring, a soft cone of light, a warm fill
const ACC = [];
const rays = (x, y, r0, at, o = {}) => ACC.push({ k: 'rays', x, y, r0, at, n: o.n ?? 12, len: o.len ?? 70 });
const ripple = (x, y, r0, at) => ACC.push({ k: 'ripple', x, y, r0, at });
function drawAcc(c, A, t) { const u = seg(t, A.at, A.at + 1.3); if (u <= 0 || u >= 1) return; c.save();
  if (A.k === 'rays') { pen(c, Math.sin(u * Math.PI), LW * .9); for (let k = 0; k < A.n; k++) { const an = k / A.n * Math.PI * 2 - Math.PI / 2, r0 = A.r0 + 40 * ease3(u), r1 = r0 + A.len * Math.sin(u * Math.PI);
    c.beginPath(); c.moveTo(A.x + Math.cos(an) * r0, A.y + Math.sin(an) * r0); c.lineTo(A.x + Math.cos(an) * r1, A.y + Math.sin(an) * r1); c.stroke(); } }
  if (A.k === 'ripple') { pen(c, (1 - u) * .8, LW * .8); c.beginPath(); c.arc(A.x, A.y, A.r0 + 260 * ease3(u), 0, 7); c.stroke(); } c.restore(); }
// —— the storyboard ——
const F = 1650, S2 = 2.65;   // figure feet line and scale
// 1 „Amit most elmondok… pszichológiai trükk”: the light appears; a person's head and shoulders draw around it (the light is their mind);
//   small rings orbit it (psychology), and on „trükk” the light turns dark with a keyhole: a secret
el([ring(540, 1030, 170), bez([480, 1192], [478, 1230], [470, 1262], [455, 1290]), bez([600, 1192], [602, 1230], [610, 1262], [625, 1290]), bez([455, 1290], [330, 1320], [255, 1380], [235, 1520]), bez([625, 1290], [750, 1320], [825, 1380], [845, 1520])], .5, 4.05, { din: 1.1 });
const orbit = t => { const u = t * 1.4; return [0, 1, 2, 3].map(k => { const an = k * Math.PI / 2 + u, x = 540 + Math.cos(an) * 110, y = 1030 + Math.sin(an) * 40; return ring(x, y, 16, 9, 0); }); };
el(orbit, 2.2, 3.0, { din: .4, dout: .35, quiet: 1 });
// 2 „üzletben és a magánéletedben”: a shop on the left, a home on the right; the light visits one, then the other
el(shop(310, 1440, 340, 340), T(10) - .3, T(16) + .05, { x: 320 });
el(house(770, 1440, 310, 360), T(13) - .25, T(16) + .1, { x: 760 });
el(ground(540, 1440, 470, 1).map(s => s), T(10) - .2, T(16) + .15, { quiet: 1 });
// 3 „bizalmat és mélyebb kapcsolatokat”: two people face each other; a bridge of light joins their minds and the light crosses it
el(figure(330, F, S2), T(16) - .05, T(21) + .05, { x: 330 });
el(figure(750, F, S2), T(16) + .15, T(21) + .1, { x: 750 });
el([arc(540, head(0, F)[1] + 10, 210, 150, Math.PI, Math.PI * 2, 64)], T(19) - .1, T(21) + .2, { din: .7, quiet: 1 });
// 4 „Az emberek imádják az információkat, amelyek megerősítik, amit már hisznek”: one person, their belief is the light in their head;
//   a heart draws on their chest (they love it), a piece of information flies in, matches the belief and joins it: rays
el(figure(540, F, S2), T(22) + .15, T(36) - .35, { x: 540 });
el([heart(...chest(540, F), 34)], T(24) - .05, T(36) - .45, { din: .6, quiet: 1 });
el(ground(540, F + 8, 300), T(22) + .3, T(36) - .3, { quiet: 1 });
rays(...head(540, F), 70, T(29) + .02);
// 5 „környezetbarát termékeket árulsz”: a jar with a leaf on it; „mondd el a vásárlóidnak”: a customer appears and the light carries the message;
//   „hozzájárulnak a környezet védelméhez”: the jar and the customer give way to the Earth, a sprout grows on it, and the light settles in it
el(jar(540, 1200, 1.6), T(37) - .25, T(41) - .1, { x: 540 });
el(jar(300, 1300, 1.2), T(41) - .1, T(45) + .05, { x: 330, din: .01, dout: .5, quiet: 1 });
el(figure(770, F), T(41) + .05, T(45) + .15, { x: 760 });
el(globe(540, 1300, 290), T(45) + .15, T(50) + .05, { din: 1.0 });
el(sprout(540, 1010, 260), T(48) - .2, T(50) - .05, { din: .9 });
ripple(540, 1300, 290, T(49) + .1);
// 6 „luxustermékeket”: the Earth gives way to a cut diamond; „erősítsd meg, hogy kiváló az ízlésük”: a person, a crown is drawn above them and a soft light falls on them
el(diamond(540, 1200, 3.2), T(50) + .3, T(53) - .45, { din: .9 });
rays(540, 1100, 340, T(51) + .5, { n: 16, len: 60 });
el(t => figure(slide(t), F, S2), T(53), T(66) - .2, { x: 540 });
el(crown(540, 820, 1.8), T(55) - .1, T(59) - .05, { din: .7 });
el(ground(540, F + 8, 300), T(53), T(59) + .1, { quiet: 1 });
// 7 „Ha visszaadod a meggyőződéseiket”: the person steps to the left of a mirror and their reflection appears on the right;
//   „azonnal bizalmat építesz”: the two lights meet in the mirror and become one: a ripple of trust
const slide = t => lerp(540, 300, ss(seg(t, T(59) + .15, T(60) + .2)));
el(mirror(540, 1330, 190, 640), T(59) + .25, T(66) - .1, { din: .9 });
el(figure(780, F, S2), T(60) + .2, T(66) - .15, { alpha: .5, x: 780, din: 1.0 });
ripple(540, 1110, 30, T(64) + .05);
// 8 „Szóval itt a lényeg”: everything gathers into the light, and it becomes the head of a key
el(key(330, 1200, 85, 400), T(66) + .15, T(70) - .25, { din: .65 });
// 9 „Állj ki ugyanazért, amiért ők”: two people side by side, one flag between them; „kapcsolódni fognak hozzád”: an arc joins them, they share one ground
el(figure(250, F, S2), T(70) + .1, T(79) - .5, { x: 290 });
el(figure(830, F, S2), T(70) + .25, T(79) - .45, { x: 790 });
el(t => flag(540, F, 720, t), T(72) - .1, T(79) - .5, { din: .8 });
el([arc(540, 960, 290, 150, Math.PI, Math.PI * 2, 64)], T(76) - .1, T(79) - .4, { din: .7, quiet: 1 });
el(ground(540, F + 8, 400), T(76) + .2, T(79) - .4, { quiet: 1 });
// 10 „Egyszerűen azért, mert jó érzés”: one heart is drawn around the light; on „jó érzés” it fills with warm light
el([heart(540, 1220, 330)], T(79) + .1, STORY + .4, { din: 1.1 });
rays(540, 1220, 390, T(82) - .1, { n: 16, len: 70 });
const ORB = orb([[0, 540, 1030, 0], [.45, 540, 1030, 30], [T(8) - .1, 540, 1030, 30], [T(8) + .25, 540, 1030, 48], [3.9, 540, 1030, 48], [T(10) - .3, 540, 1030, 30], [T(11) - .05, 402, 1360, 22], [T(13) - .1, 402, 1360, 22], [T(14) + .05, 770, 1280, 22],
  [T(16) - .1, 770, 1280, 22], [T(16) + .5, 330, above(330, F)[1], 24], [T(19), 330, above(330, F)[1], 24], [T(20) + .5, 750, above(750, F)[1], 24], [T(21) + .2, 750, above(750, F)[1], 24],
  [T(22) + .3, 540, head(540, F)[1], 24], [T(36) - .3, 540, head(540, F)[1], 24], [T(37) + .3, 540, 1150, 20], [T(41) - .1, 540, 1150, 20], [T(41) + .3, 300, 1258, 18], [T(42) - .1, 300, 1258, 18],
  [T(44) + .1, 770, above(770, F)[1], 22], [T(45) + .1, 770, above(770, F)[1], 22], [T(46) + .2, 540, 1300, 30], [T(50) + .1, 540, 1300, 30], [T(50) + .7, 540, 1100, 26], [T(53) - .2, 540, 1100, 26],
  [T(53) + .4, 540, above(540, F)[1], 24], [T(59) + .15, 540, above(540, F)[1], 24], [T(60) + .2, 300, above(300, F)[1], 24], [T(63) + .2, 300, above(300, F)[1], 24], [T(64) + .05, 540, 1110, 30],
  [T(66) + .1, 540, 1110, 30], [T(66) + .8, 330, 1200, 36], [T(70) - .2, 330, 1200, 36], [T(70) + .6, 250, above(250, F)[1], 24], [T(73) + .2, 250, above(250, F)[1], 24], [T(74) + .2, 540, 810, 24],
  [T(76) - .1, 540, 810, 24], [T(77) - .1, 830, above(830, F)[1], 24], [T(79) - .4, 830, above(830, F)[1], 24], [T(79) + .4, 540, 1220, 34], [T(82) - .1, 540, 1220, 42], [STORY, 540, 1220, 42]]);
// the other lights: the reflection's dim light, the incoming piece of information, the second person's light
const LIGHTS = [
  t => { if (t < T(10) - .3 || t > T(16) + .2) return; const sh = ss(seg(t, T(11) - .2, T(11) + .2)) * (1 - ss(seg(t, T(13), T(13) + .4))), ho = ss(seg(t, T(14), T(14) + .4)) * (1 - ss(seg(t, T(16), T(16) + .3)));   // windows light up as the orb visits
    return [[395, 1310, 0, 0], sh, ho]; },
  t => { const a = ss(seg(t, T(27) - .3, T(27))), m = ss(seg(t, T(28) - .1, T(29) + .02)); if (a <= 0 || t > T(29) + .1) return; return [lerp(900, 540, m), lerp(1000, head(540, F)[1], m), lerp(18, 12, m), a]; },
  t => { const a = ss(seg(t, T(60) + .2, T(60) + 1.1)) * (1 - ss(seg(t, T(63) + .2, T(64) + .05))); if (a <= 0) return; const m = ss(seg(t, T(63) + .2, T(64) + .05)); return [lerp(780, 540, m), lerp(above(780, F)[1], 1110, m), 24, a * .55]; },
  t => { const a = ss(seg(t, T(70) + .3, T(70) + 1)) * (1 - ss(seg(t, T(79) - .5, T(79)))); if (a <= 0) return; return [830, above(830, F)[1], 24, a * (t > T(77) - .1 ? 1 - ss(seg(t, T(77) - .1, T(77) + .2)) : 1)]; } ];
function take(c, t) { c.save(); c.translate(540, 1160); c.scale(.92, .92); c.translate(-540, -1160);   // safe zone
  for (const e of ELS) drawEl(c, e, t);
  for (const A of ACC) drawAcc(c, A, t);
  // shop and home windows light softly when the light visits
  const w = LIGHTS[0](t); if (w) { c.save(); c.fillStyle = 'rgba(244,247,255,.16)'; c.globalAlpha = w[1]; c.fillRect(170, 1290, 120, 80); c.globalAlpha = w[2]; c.fillRect(730, 1320, 80, 120); c.restore(); }
  // a soft cone of light falls on the person with the crown („kiváló az ízlésük”)
  const cn = ss(seg(t, T(56) - .1, T(56) + .5)) * (1 - ss(seg(t, T(58) + .4, T(59) + .05))); if (cn > 0) { c.save(); c.globalAlpha = cn * .55; const [ox, oy] = above(540, F); const g = c.createLinearGradient(0, oy, 0, F + 8); g.addColorStop(0, 'rgba(235,242,255,.55)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + 300, F + 8); c.lineTo(ox - 300, F + 8); c.closePath(); c.fill(); c.restore(); }
  // the heart fills with warm light on „jó érzés”
  const hf = ss(seg(t, T(82) - .2, T(82) + .6)); if (hf > 0) { c.save(); c.globalAlpha = hf * .22; c.fillStyle = 'rgba(244,247,255,1)'; c.beginPath(); heart(540, 1220, 330).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.fill(); c.restore(); }
  for (const L of LIGHTS.slice(1)) { const v = L(t); if (v) orbDraw(c, v[0], v[1], v[2], v[3]); }
  const [x, y, r] = track(ORB, t), dark = ss(seg(t, T(8) - .1, T(8) + .25)) * (1 - ss(seg(t, 3.85, 4.3))), fade = 1 - ss(seg(t, STORY - .5, STORY));
  const oy = y + 6 * Math.sin(t * 1.6), orr = r * (1 + .04 * Math.sin(t * 2.3)); orbDraw(c, x, oy, orr, fade, dark);
  if (dark > .05) { c.save(); pen(c, dark, 2.4); c.shadowBlur = 0; part(c, [...arc(x, oy - orr * .22, orr * .26, orr * .26, Math.PI * .7, Math.PI * 2.3, 30), [x + orr * .14, oy + orr * .5], [x - orr * .14, oy + orr * .5], [x - orr * .14 - .01, oy - orr * .02]], 0, ss(seg(t, T(8), T(8) + .35))); c.restore(); }
  c.restore(); }
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
// sound cues: each drawing's draw-on (except the small quiet details), each glide of the light, each burst of rays and each ripple
window.EV = [...ELS.filter(e => !e.quiet).map(e => ({ t: +e.a.toFixed(3), type: 'in', x: e.x, d: e.din })), ...glides.map(g => ({ t: +g.t.toFixed(3), type: 'glide', d: +g.d.toFixed(3), x: g.x })),
  ...ACC.map(A => ({ t: +A.at.toFixed(3), type: A.k })), { t: +(T(8) - .1).toFixed(3), type: 'dark' }, { t: +(T(82) - .2).toFixed(3), type: 'fill' }].sort((p, q) => p.t - q.t);
