// M03 Halo-hatás (the halo effect), in the locked M02 v4 style: hairline white lines, one soft glowing orb leading the eye, hand-built
// drawings that say what each sentence says. User 2026-11-13: "always start with a visual hook": frame one is already a tunnel of halo rings
// rushing into the light, an impact, and a sales chart shooting up with the light on its tip. Voice pauses tightened (refs/…-tight.mp3).
import { WORDS } from './captions.js';
import { start, ss, seg, clamp, lerp, ease3, WHITE, MID, K } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 52.1, DUR = 56.9;   // DUR = STORY + 1.3 + call to action (line 2) + 1.5 s of the logo alone
const LW = 3.2;
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
// —— M03's own drawings ——
const rrect = (x, y, w, h, r) => close([[x + r, y], [x + w - r, y], ...arc(x + w - r, y + r, r, r, -Math.PI / 2, 0, 8).slice(1), [x + w, y + h - r], ...arc(x + w - r, y + h - r, r, r, 0, Math.PI / 2, 8).slice(1), [x + r, y + h], ...arc(x + r, y + h - r, r, r, Math.PI / 2, Math.PI, 8).slice(1), [x, y + r], ...arc(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, 8).slice(1)]);
const star5 = (x, y, r) => close(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; }));
const halo = (cx, cy, rx, ry = rx * .26) => [ring(cx, cy, rx, ry, Math.PI)];
const bust = (cx, cy, r) => [ring(cx, cy, r), bez([cx - 60, cy + r - 8], [cx - 62, cy + r + 30], [cx - 70, cy + r + 62], [cx - 85, cy + r + 90]), bez([cx + 60, cy + r - 8], [cx + 62, cy + r + 30], [cx + 70, cy + r + 62], [cx + 85, cy + r + 90]), bez([cx - 85, cy + r + 90], [cx - 210, cy + r + 120], [cx - 285, cy + r + 180], [cx - 305, cy + r + 320]), bez([cx + 85, cy + r + 90], [cx + 210, cy + r + 120], [cx + 285, cy + r + 180], [cx + 305, cy + r + 320])];
const card = (x, y, s = 200) => [rrect(x - s / 2, y - s / 2, s, s, 24)];
const bag = (x, y, w = 190, h = 210) => [rrect(x - w / 2, y - h / 2, w, h, 18), arc(x, y - h / 2, 48, 52, Math.PI, Math.PI * 2, 30)];
const logoBadge = (x, y, r = 95) => [ring(x, y, r), star5(x, y, r * .5)];
const gift = (x, base, w = 330, h = 250, lid = 0) => { const top = base - h, ly = top - lid; return [rrect(x - w / 2, top, w, h, 14), rrect(x - w / 2 - 18, ly - 60, w + 36, 60, 12), [[x, top], [x, base]], [[x, ly - 60], [x, ly]], [...bez([x, ly - 60], [x - 90, ly - 150], [x - 140, ly - 40], [x, ly - 60]), ...bez([x, ly - 60], [x + 140, ly - 40], [x + 90, ly - 150], [x, ly - 60]).slice(1)]]; };
const bottle = (x, base, h = 330) => { const w = 120, top = base - h; return [[[x - 22, top], [x - 22, top + 70], ...bez([x - 22, top + 70], [x - w / 2, top + 95], [x - w / 2, top + 110], [x - w / 2, top + 140]).slice(1), [x - w / 2, base - 16], ...arc(x - w / 2 + 16, base - 16, 16, 16, Math.PI, Math.PI / 2, 8).slice(1), [x + w / 2 - 16, base], ...arc(x + w / 2 - 16, base - 16, 16, 16, Math.PI / 2, 0, 8).slice(1), [x + w / 2, top + 140], ...bez([x + w / 2, top + 140], [x + w / 2, top + 110], [x + w / 2, top + 95], [x + 22, top + 70]).slice(1), [x + 22, top]], rrect(x - 28, top - 34, 56, 34, 6), rrect(x - 40, top + 170, 80, 90, 8)]; };
const browser = (x, y, w, h) => { const l = x - w / 2, tp = y - h / 2; return [rrect(l, tp, w, h, 20), [[l, tp + 56], [l + w, tp + 56]], ring(l + 34, tp + 28, 9), ring(l + 62, tp + 28, 9), ring(l + 90, tp + 28, 9)]; };
const pageLines = (x, y, w, h) => { const l = x - w / 2 + 34, tp = y - h / 2 + 90; return [rrect(l, tp, w - 68, 150, 12), [[l, tp + 190], [l + w * .55, tp + 190]], [[l, tp + 230], [l + w * .7, tp + 230]], [[l, tp + 270], [l + w * .45, tp + 270]], rrect(l, tp + 315, 180, 56, 28)]; };
const cursor = (x, y) => [close([[x, y], [x, y + 64], [x + 16, y + 49], [x + 28, y + 76], [x + 38, y + 71], [x + 26, y + 45], [x + 47, y + 45]])];
const shield = (x, y, s = 1) => { const P = (a, b) => [x + a * s, y + b * s]; return [close([P(0, -150), P(120, -105), P(112, 30), ...bez(P(112, 30), P(100, 110), P(40, 150), P(0, 175)).slice(1), ...bez(P(0, 175), P(-40, 150), P(-100, 110), P(-112, 30)).slice(1), P(-120, -105)]), [P(-50, 10), P(-12, 52), P(58, -40)]]; };
const sealed = (x, base, w = 340, h = 260) => [rrect(x - w / 2, base - h, w, h, 12), [[x - w / 2, base - h + 70], [x + w / 2, base - h + 70]], [[x - 40, base - h], [x - 40, base - h + 70]], [[x + 40, base - h], [x + 40, base - h + 70]]];
const crosshair = (x, y, r) => [ring(x, y, r), [[x - r - 50, y], [x - r + 25, y]], [[x + r - 25, y], [x + r + 50, y]], [[x, y - r - 50], [x, y - r + 25]], [[x, y + r - 25], [x, y + r + 50]]];
const PATH = [...bez([170, 1580], [420, 1600], [380, 1380], [560, 1300]), ...bez([560, 1300], [740, 1220], [920, 1240], [880, 1060]).slice(1), ...bez([880, 1060], [840, 900], [500, 960], [420, 840]).slice(1)];
function polyAt(pts, u) { const L = lens(pts), d = clamp(u) * L[L.length - 1]; for (let i = 1; i < pts.length; i++) if (d <= L[i]) { const s = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [lerp(pts[i - 1][0], pts[i][0], s), lerp(pts[i - 1][1], pts[i][1], s)]; } return pts[pts.length - 1]; }
const CHART = [[190, 1560], [330, 1420], [430, 1480], [580, 1250], [690, 1330], [890, 900]];
const arrowHead = [[[830, 905], [890, 900], [880, 962]]];
// —— the storyboard ——
const F = 1650, S2 = 2.65, HX = 540;
// 0 THE HOOK (frame one already moving): a tunnel of halo rings rushes at the viewer into the light, it hits with a shockwave,
//   then a sales chart shoots up with the light on its tip („Növeld az eladásaidat és a profitodat”); on „halo-hatással” the light
//   jumps above a person and becomes a glowing halo, a cone of light falls on them
const HOOK = .42;
rays(540, 1150, 70, HOOK, { n: 16, len: 110 }); ripple(540, 1150, 40, HOOK); ripple(540, 1150, 10, HOOK + .12);
el([CHART, ...arrowHead], .66, T(7) - .05, { din: 1.0, dout: .4 });
el(figure(HX, F), T(7) + .05, T(9) + .1, { din: .6, x: HX });
el(halo(HX, above(HX, F)[1] - 6, 120), T(7) + .4, T(9) + .15, { din: .35, quiet: 1 });
rays(HX, above(HX, F)[1] - 6, 140, T(7) + .45, { n: 14, len: 70 });
// 1 „A halo-hatás egy gondolkodási torzítás”: a head with a halo above it, the light is its mind; on „torzítás” the straight lines in its mind bend
el(bust(540, 1080, 175), T(9) + .35, T(13) - .2, { din: .8 });
el(halo(540, 865, 125), T(9) + .6, T(13) - .2, { din: .4, quiet: 1 });
el(t => { const a = 26 * ss(seg(t, T(12) - .1, T(12) + .5)); return [0, 1].map(k => Array.from({ length: 41 }, (_, i) => [445 + i * 4.75, 1050 + k * 60 + a * Math.sin(i / 40 * Math.PI * 3 + k)])); }, T(11), T(13) - .25, { din: .5, quiet: 1 });
// 2 „ha valami egy dologban jó benyomást kelt, az a többiről … is befolyásolja”: four cards; a star lights the first, then the glow spreads to the others
const CX = [180, 420, 660, 900], CY = 1200;
CX.forEach((x, k) => el(card(x, CY), T(13) + .15 + k * .1, T(27) - .25, { din: .5, quiet: k > 0, x }));
CX.forEach((x, k) => el([star5(x, CY, 62)], k ? T(22) + (k - 1) * .45 : T(17), T(27) - .3, { din: .35, quiet: 1 }));
rays(CX[0], CY, 120, T(17) + .1, { n: 10, len: 50 });
// 3 „ha a vásárlóknak tetszik a márkád egyik része, valószínűleg a többit is pozitívan látják”: a customer on the left, three parts of a brand on the right;
//   a heart on the customer, a heart on one part, then hearts on all of them
const PX = 790, PY = [930, 1210, 1490];
el(figure(300, F), T(27) + .1, T(47) - .2, { din: .7, x: 300 });
el([heart(...chest(300, F), 34)], T(36) - .05, T(47) - .25, { din: .5, quiet: 1 });
el(logoBadge(PX, PY[0], 85), T(29) - .1, T(47) - .2, { din: .6, x: PX });
el(bag(PX, PY[1], 170, 180), T(29) + .15, T(47) - .2, { din: .6, quiet: 1 });
el([...browser(PX, PY[2], 260, 180)], T(29) + .4, T(47) - .2, { din: .6, quiet: 1 });
PY.forEach((y, k) => el([heart(PX + 170, y - 40, 30)], k ? T(45) + (k - 1) * .3 : T(39), T(47) - .3, { din: .35, quiet: 1 }));
// 4 „Ha például a csomagolás szép és minőségi, a vásárlók azt feltételezik, hogy maga a termék is az”: a gift box sparkles; its lid lifts, the product rises and gets the same halo
const lidUp = t => 220 * ease3(seg(t, T(57) - .1, T(57) + .5));
el(t => gift(540, 1560, 360, 270, lidUp(t)), T(47) + .1, T(64) - .2, { din: .8 });
rays(540, 1360, 230, T(51) + .05, { n: 14, len: 60 });
el(t => { const r = ss(seg(t, T(58) - .2, T(60) + .1)); return bottle(540, 1560 - 30 - 230 * r, 300); }, T(58) - .2, T(64) - .25, { din: .5, quiet: 1 });
el(halo(540, 1000, 105), T(60) + .1, T(64) - .2, { din: .35, quiet: 1 });
rays(540, 1000, 120, T(61) + .05, { n: 14, len: 60 });
// 5 „Gondolj a boltodra vagy a weboldaladra”: a shop, then a website
el(shop(320, 1430, 320, 320), T(64) - .05, T(70) - .2, { x: 320, din: .6 });
el(browser(770, 1270, 330, 330), T(67) - .1, T(70) - .2, { x: 770, din: .6 });
// 6 „Ha tiszta, modern és könnyű használni … profi és megbízható”: the website grows big and lays itself out cleanly; a cursor clicks; then a shield with a check
el(browser(540, 1180, 640, 600), T(70) + .05, T(83) - .3, { din: .7 });
el(pageLines(540, 1180, 640, 600), T(71) - .05, T(83) - .3, { din: .8, quiet: 1 });
el(t => { const u = ease3(seg(t, T(74) - .1, T(75) + .2)); return cursor(lerp(860, 400, u), lerp(1500, 1420, u)); }, T(74) - .1, T(83) - .3, { din: .2, quiet: 1 });
ripple(410, 1420, 10, T(75) + .25);
el(shield(540, 1180, 1.6), T(83) - .05, T(86) - .2, { din: .7 });
rays(540, 1180, 300, T(85) + .05, { n: 16, len: 60 });
// 7 „Ez a jó érzés elhiteti velük, hogy a termékeid nagyszerűek, még mielőtt kipróbálták volna őket”: a heart, then a still-sealed box gets five stars above it
el([heart(540, 1150, 230)], T(86) + .05, T(90) + .2, { din: .7 });
el(sealed(540, 1600), T(90) + .45, T(101) - .2, { din: .7 });
[0, 1, 2, 3, 4].forEach(k => el([star5(330 + k * 105, 1150, 40)], T(95) + k * .12, T(101) - .25, { din: .3, quiet: k > 0, x: 330 + k * 105 }));
// 8 „Az így kialakuló pozitív benyomás a vásárlóid más véleményeire is hatással lesz”: a person with a halo; the halo ripples out and halos appear over two more people
el(figure(540, F), T(101) + .05, T(113) - .2, { din: .6 });
el(halo(540, above(540, F)[1] - 6, 110), T(102) + .2, T(113) - .2, { din: .35, quiet: 1 });
el(figure(220, F, 2.2), T(103), T(113) - .2, { din: .6, quiet: 1, x: 220 });
el(figure(860, F, 2.2), T(103) + .15, T(113) - .2, { din: .6, quiet: 1, x: 860 });
ripple(540, above(540, F)[1], 60, T(105));
el(halo(220, above(220, F, 2.2)[1] - 6, 90), T(108), T(113) - .25, { din: .35, quiet: 1 });
el(halo(860, above(860, F, 2.2)[1] - 6, 90), T(108) + .25, T(113) - .25, { din: .35, quiet: 1 });
// 9 „Koncentrálj a kiváló brandingre és a nagyszerű vásárlói élményre”: a focus ring around the light, then a cut diamond (branding) and a heart (experience)
el(crosshair(540, 1150, 110), T(113) - .05, T(116) - .3, { din: .5 });
el(diamond(330, 1220, 2.1), T(116) - .1, T(122) - .2, { din: .7, x: 330 });
el([heart(770, 1220, 150)], T(121) - .35, T(122) + .05, { din: .55, x: 770 });
// 10 „Ez olyan tartós benyomást kelt, ami minden további találkozást pozitívan befolyásol”: a winding path with stops; the light travels along it and each stop lights up
const STOPS = [.12, .34, .56, .78, 1];
el([PATH], T(122) + .1, T(135) - .25, { din: .9 });
STOPS.forEach((u, k) => { const [x, y] = polyAt(PATH, u); el([ring(x, y, 26)], T(122) + .3 + k * .08, T(135) - .3, { din: .3, quiet: 1 }); el([star5(x, y, 20)], T(128) + k * .55, T(135) - .3, { din: .25, quiet: 1 }); });
// 11 „Szóval használd ki.”: the light comes to the middle and a big halo snaps on above it; rays
el(halo(540, 1060, 170), T(136) - .25, STORY + .4, { din: .4 });
rays(540, 1150, 120, T(136) + .1, { n: 18, len: 90 });
// the light's path
const tip = t => polyAt(CHART, ss(ss(seg(t, .66, 1.66))));
const ORB = orb([[0, 540, 1150, 14], [HOOK, 540, 1150, 40], [.5, 540, 1150, 34], [.66, 190, 1560, 22], [T(7) - .1, 890, 900, 24], [T(7) + .35, HX, above(HX, F)[1], 26], [T(9) + .1, HX, above(HX, F)[1], 26],
  [T(9) + .55, 540, 1080, 30], [T(13) - .1, 540, 1080, 30], [T(13) + .4, CX[0], CY, 24], [T(22), CX[0], CY, 24], [T(22) + .45, CX[1], CY, 22], [T(22) + .9, CX[2], CY, 22], [T(23) + .9, CX[3], CY, 22], [T(27) - .2, CX[3], CY, 22],
  [T(27) + .4, 300, above(300, F)[1], 24], [T(38), 300, above(300, F)[1], 24], [T(39) + .1, PX, PY[0], 22], [T(45), PX, PY[0], 22], [T(45) + .3, PX, PY[1] - 30, 20], [T(45) + .6, PX, PY[2], 20], [T(47) - .2, PX, PY[2], 20],
  [T(47) + .35, 540, 1430, 26], [T(57) - .1, 540, 1430, 26], [T(60), 540, 1000, 26], [T(64) - .1, 540, 1000, 26], [T(64) + .4, 320, 1340, 22], [T(67) - .1, 320, 1340, 22], [T(67) + .4, 770, 1260, 22], [T(70) - .1, 770, 1260, 22],
  [T(70) + .4, 540, 1050, 22], [T(83) - .1, 540, 1050, 22], [T(83) + .4, 540, 1170, 30], [T(86) - .1, 540, 1170, 30], [T(86) + .4, 540, 1160, 32], [T(90) + .2, 540, 1160, 32], [T(90) + .8, 540, 1440, 26], [T(95) - .1, 540, 1440, 26],
  [T(95) + .6, 750, 1150, 18], [T(101) - .2, 750, 1150, 18], [T(101) + .4, 540, above(540, F)[1], 26], [T(113) - .2, 540, above(540, F)[1], 26], [T(113) + .3, 540, 1150, 30], [T(116) - .2, 540, 1150, 30],
  [T(116) + .3, 330, 1170, 24], [T(120), 330, 1170, 24], [T(121) - .1, 770, 1210, 26], [T(122) - .1, 770, 1210, 26], [T(122) + .4, ...polyAt(PATH, 0), 22]]);
const pathRide = t => polyAt(PATH, STOPS[Math.min(4, Math.floor(clamp((t - T(128)) / .55, 0, 4.99)))] * ss(seg(t, T(128) - .4, T(128) + 2.6)));
const orbAt = t => { if (t > .66 && t < T(7) - .1) { const [x, y] = tip(t); return [x, y, 22]; }
  if (t >= T(122) + .4 && t < T(135) - .1) { const [x, y] = polyAt(PATH, ss(seg(t, T(128) - .3, T(128) + 2.4))); return [x, y, 22]; }
  if (t >= T(135) - .1) { const u = ss(seg(t, T(135) - .1, T(136) - .2)); const [x0, y0] = polyAt(PATH, 1); return [lerp(x0, 540, u), lerp(y0, 1150, u), lerp(22, 44, u)]; }
  return track(ORB, t); };
// the hook's tunnel of rings rushing at the viewer
function tunnel(c, t) { if (t > HOOK + .1) return; c.save(); for (let k = 0; k < 9; k++) { const u = ((t / HOOK) * 1.6 + k / 9) % 1, z = Math.pow(1 - u, 2.2), r = 30 + 1500 * z; if (r > 1600) continue;
  pen(c, Math.min(1, (1 - z) * 1.4) * (t > HOOK ? 1 - (t - HOOK) / .1 : 1), LW * (1 + 2 * z)); c.beginPath(); c.ellipse(540, 1150, r, r * .9, 0, 0, 7); c.stroke(); }
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2 + .2, u = ((t * 2.6 + k * .37) % 1), r0 = 900 * (1 - u), r1 = r0 + 160 * (1 - u); pen(c, .5 * u, LW); c.beginPath(); c.moveTo(540 + Math.cos(a) * r0, 1150 + Math.sin(a) * r0); c.lineTo(540 + Math.cos(a) * r1, 1150 + Math.sin(a) * r1); c.stroke(); } c.restore(); }
// coins pop off the chart as it climbs („profitodat”)
function chartCoins(c, t) { [[330, 1420], [580, 1250], [890, 900]].forEach(([x, y], k) => { const u = seg(t, 1.0 + k * .28, 1.0 + k * .28 + .7); if (u <= 0 || u >= 1 || t > T(7)) return; c.save(); pen(c, Math.sin(u * Math.PI)); c.beginPath(); c.arc(x + 40 * u, y - 90 * ease3(u), 18, 0, 7); c.stroke(); c.beginPath(); c.arc(x + 40 * u, y - 90 * ease3(u), 9, 0, 7); c.stroke(); c.restore(); }); }
function take(c, t) { const shake = t > HOOK && t < HOOK + .25 ? 10 * (1 - (t - HOOK) / .25) : 0;
  c.save(); c.translate(540 + shake * Math.sin(t * 95), 1160 + shake * Math.cos(t * 83)); c.scale(.92, .92); c.translate(-540, -1160);   // safe zone (and the hook's impact shake)
  tunnel(c, t);
  for (const e of ELS) drawEl(c, e, t);
  for (const A of ACC) drawAcc(c, A, t);
  chartCoins(c, t);
  // a soft cone of light from the halo onto the person (the hook) and onto the product (the box)
  const cone = (x, y0, y1, w, a) => { if (a <= 0) return; c.save(); c.globalAlpha = a * .5; const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(235,242,255,.55)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 110, y0); c.lineTo(x + 110, y0); c.lineTo(x + w, y1); c.lineTo(x - w, y1); c.closePath(); c.fill(); c.restore(); };
  cone(HX, above(HX, F)[1] - 6, F + 10, 300, ss(seg(t, T(7) + .45, T(7) + .8)) * (1 - ss(seg(t, T(9), T(9) + .3))));
  cone(540, 1000, 1560, 260, ss(seg(t, T(60) + .2, T(60) + .6)) * (1 - ss(seg(t, T(64) - .3, T(64)))));
  // the heart fills with warm light on „jó érzés”
  const hf = ss(seg(t, T(88), T(89) + .3)) * (1 - ss(seg(t, T(90), T(90) + .4))); if (hf > 0) { c.save(); c.globalAlpha = hf * .2; c.fillStyle = WHITE; c.beginPath(); heart(540, 1150, 230).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.fill(); c.restore(); }
  const [x, y, r] = orbAt(t), fade = 1 - ss(seg(t, STORY - .5, STORY)), flash = t > HOOK && t < HOOK + .3 ? 1 + 1.6 * (1 - (t - HOOK) / .3) : 1;
  orbDraw(c, x, y + (t > .58 && t < T(7) ? 0 : 6 * Math.sin(t * 1.6)), r * flash * (1 + .04 * Math.sin(t * 2.3)), fade);
  c.restore();
  const fl = t > HOOK && t < HOOK + .22 ? .45 * (1 - (t - HOOK) / .22) : 0; if (fl > 0) { c.save(); c.globalAlpha = fl; c.fillStyle = '#eaf0ff'; c.fillRect(0, 0, 1080, 1920); c.restore(); }   // the hook's impact flash
}
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
// sound cues: the hook (tunnel rush, impact, chart rise), each drawing's draw-on, each glide of the light, rays and ripples
window.EV = [{ t: 0, type: 'rush', d: HOOK }, { t: HOOK, type: 'impact' }, { t: .6, type: 'rise', d: 1.0 },
  ...ELS.filter(e => !e.quiet).map(e => ({ t: +e.a.toFixed(3), type: 'in', x: e.x, d: e.din })), ...glides.filter(g => g.t > .7).map(g => ({ t: +g.t.toFixed(3), type: 'glide', d: +g.d.toFixed(3), x: g.x })),
  ...ACC.filter(A => A.at > HOOK + .05).map(A => ({ t: +A.at.toFixed(3), type: A.k }))].sort((p, q) => p.t - q.t);
