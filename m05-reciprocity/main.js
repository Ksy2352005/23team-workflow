// M05 Kölcsönösség (reciprocity), in the locked M03/M04 style on black: hairline white lines, one turquoise-glowing orb, hand-built drawings per sentence.
// Hook (user 2026-11-13: "always start with a visual hook"): a gift box falls from the sky and slams down (flash, shockwave, shake); the lid flies off, the light bursts out and shoots up a sales arrow.
// Voice and call to action (line 1) spoken in ONE ElevenLabs request (CLAUDE.md 2026-11-15), pauses tightened (tools/motion-kit/voice_with_cta.py).
import { WORDS } from './captions.js';
import { start, ss, seg, clamp, lerp, ease3, WHITE, MID, K } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 25.4, DUR = 29.9;   // the call to action (line 1) 1.3 s into the end card, then 1.5 s of the logo alone
const LW = 3.2, TURQ = '#2ED3C6';   // the brand's turquoise: the light's glow, halos, rays and ripples
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
function pen(c, a = 1, w = LW, col = WHITE) { c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = 'rgba(190,210,255,.55)'; c.shadowBlur = 7 * K; }
// an element: strokes (or a function of t), drawn on from `a` over `din` s (strokes staggered), held, and drawn off (erased from its start) from `b` over `dout` s
const ELS = [];
const el = (strokes, a, b, o = {}) => { const e = { col: o.col, strokes, a, b, din: o.din ?? .8, dout: o.dout ?? .55, alpha: o.alpha ?? 1, x: o.x ?? 540, tag: o.tag, quiet: o.quiet, clipY: o.clipY /* drawn only above this line (things dropping into a bag) */ }; ELS.push(e); return e; };
function drawEl(c, e, t) { if (t < e.a || t > e.b + e.dout) return; const S = typeof e.strokes === 'function' ? e.strokes(t) : e.strokes, n = S.length, st = Math.min(.12, .45 / n);
  const pin = ss(seg(t, e.a, e.a + e.din)), pout = ss(seg(t, e.b, e.b + e.dout)); c.save(); if (e.clipY) { c.beginPath(); c.rect(-2000, -2000, 5000, e.clipY + 2000); c.clip(); } pen(c, e.alpha * (1 - pout * .35), LW, e.col || WHITE); if (e.col) c.shadowColor = 'rgba(46,211,198,.7)';
  S.forEach((s, k) => { const fi = clamp((pin - k * st) / (1 - (n - 1) * st)), fo = clamp((pout - k * st) / (1 - (n - 1) * st)); part(c, s, ss(fo), ss(fi)); }); c.restore(); }
// the orb: one soft light that travels through the whole film (key frames: time, x, y, radius; eased between)
function orbDraw(c, x, y, r, a = 1, dark = 0) { if (r <= .3 || a <= 0) return; c.save(); c.globalAlpha = a;
  const g = c.createRadialGradient(x, y, r * .6, x, y, r * 3.4); g.addColorStop(0, 'rgba(46,211,198,.42)'); g.addColorStop(1, 'rgba(46,211,198,0)'); c.fillStyle = g; c.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8);
  c.fillStyle = WHITE; c.shadowColor = 'rgba(46,211,198,.95)'; c.shadowBlur = 22 * K; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  if (dark > 0) { c.shadowBlur = 0; c.globalAlpha = a * dark; c.fillStyle = MID; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.fill(); } c.restore(); }
function track(keys, t) { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const u = ss(seg(t, keys[i - 1][0], keys[i][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); }
const glides = [];   // orb moves that cover a real distance (each gets a soft whoosh)
const orb = keys => { for (let i = 1; i < keys.length; i++) { const d = Math.hypot(keys[i][1] - keys[i - 1][1], keys[i][2] - keys[i - 1][2]); if (d > 120) glides.push({ t: keys[i - 1][0], d: keys[i][0] - keys[i - 1][0], x: keys[i][1] }); } return keys; };
// accents: rays of light, a ripple ring, a soft cone of light, a warm fill
const ACC = [];
const rays = (x, y, r0, at, o = {}) => ACC.push({ k: 'rays', x, y, r0, at, n: o.n ?? 12, len: o.len ?? 70 });
const ripple = (x, y, r0, at) => ACC.push({ k: 'ripple', x, y, r0, at });
function drawAcc(c, A, t) { const u = seg(t, A.at, A.at + 1.3); if (u <= 0 || u >= 1) return; c.save();
  if (A.k === 'rays') { pen(c, Math.sin(u * Math.PI), LW * .9, TURQ); for (let k = 0; k < A.n; k++) { const an = k / A.n * Math.PI * 2 - Math.PI / 2, r0 = A.r0 + 40 * ease3(u), r1 = r0 + A.len * Math.sin(u * Math.PI);
    c.beginPath(); c.moveTo(A.x + Math.cos(an) * r0, A.y + Math.sin(an) * r0); c.lineTo(A.x + Math.cos(an) * r1, A.y + Math.sin(an) * r1); c.stroke(); } }
  if (A.k === 'ripple') { pen(c, (1 - u) * .8, LW * .8, TURQ); c.beginPath(); c.arc(A.x, A.y, A.r0 + 260 * ease3(u), 0, 7); c.stroke(); } c.restore(); }
// —— M04's own drawings ——
const rrect = (x, y, w, h, r) => close([[x + r, y], [x + w - r, y], ...arc(x + w - r, y + r, r, r, -Math.PI / 2, 0, 8).slice(1), [x + w, y + h - r], ...arc(x + w - r, y + h - r, r, r, 0, Math.PI / 2, 8).slice(1), [x + r, y + h], ...arc(x + r, y + h - r, r, r, Math.PI / 2, Math.PI, 8).slice(1), [x, y + r], ...arc(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, 8).slice(1)]);
const star5 = (x, y, r) => close(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; }));
function polyAt(pts, u) { const L = lens(pts), d = clamp(u) * L[L.length - 1]; for (let i = 1; i < pts.length; i++) if (d <= L[i]) { const s = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [lerp(pts[i - 1][0], pts[i][0], s), lerp(pts[i - 1][1], pts[i][1], s)]; } return pts[pts.length - 1]; }
const S = (pts, x, y, s) => pts.map(([a, b]) => [x + a * s, y + b * s]);   // a unit drawing placed at x, y, scale s
const P_PRODUCT = [close([[-.8, -.45], [0, -.85], [.8, -.45], [0, -.05]]), [[-.8, -.45], [-.8, .5], [0, .9], [0, -.05]], [[.8, -.45], [.8, .5], [0, .9]], [[-.4, -.65], [.4, -.25], [.4, .05]]];   // a box
const P_PROMO = [close([[-.85, -.2], [-.2, -.2], [.6, -.75], [.6, .75], [-.2, .2], [-.85, .2]]), [[-.6, .2], [-.45, .75], [-.2, .75], [-.3, .2]], arc(.6, 0, .35, .45, -Math.PI / 2.6, Math.PI / 2.6, 12), arc(.6, 0, .6, .75, -Math.PI / 2.6, Math.PI / 2.6, 16)];   // a megaphone
// —— M05's own drawings ——
const rot = (pts, cx, cy, a) => pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const arrowHead = (E, dx, dy, len = 30) => { const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; return [[E[0] - ux * len - uy * len * .6, E[1] - uy * len + ux * len * .6], E, [E[0] - ux * len + uy * len * .6, E[1] - uy * len - ux * len * .6]]; };
// a gift box: body, ribbon, lid (lifted by `lift`, turned by `turn`) and a bow; base = the bottom line
function gift(cx, base, w, h, lift = 0, turn = 0) { const l = cx - w / 2, r = cx + w / 2, top = base - h, lh = h * .26, lt = top - lh - lift, lc = [cx, lt + lh / 2];
  const lid = [close([[l - 14, lt], [r + 14, lt], [r + 14, lt + lh], [l - 14, lt + lh]]), [[cx, lt], [cx, lt + lh]], leaf(cx, lt, cx - w * .32, lt - h * .3, h * .11), leaf(cx, lt, cx + w * .32, lt - h * .3, h * .11)].map(s => rot(s, lc[0], lc[1], turn));
  return [close([[l, top], [r, top], [r, base], [l, base]]), [[cx, top], [cx, base]], ...lid]; }
const chartUp = (x0, y0, x1, y1) => { const p = [[x0, y0], [lerp(x0, x1, .3), lerp(y0, y1, .45)], [lerp(x0, x1, .48), lerp(y0, y1, .32)], [x1, y1]]; return [p, arrowHead(p[3], x1 - p[2][0], y1 - p[2][1], 44)]; };
// a turning "think again" arrow pair around a point (two arcs with heads)
const cycle = (cx, cy, r, a0, ry = r) => [0, Math.PI].flatMap(o => { const a = a0 + o, e = a + 2.4, E = [cx + Math.cos(e) * r, cy + Math.sin(e) * ry]; return [arc(cx, cy, r, ry, a, e, 40), arrowHead(E, -Math.sin(e) * r, Math.cos(e) * ry, 34)]; });
const bookS = (x, y, s) => book(x, y, 1).map(st => st.map(([a, b]) => [x + (a - x) * s, y + (b - y) * s]));
const book = (x, y, open = 1) => { const w = 210, h = 290, a = lerp(0, 1, open); return [[[x, y - h / 2], [x, y + h / 2]], [[x, y - h / 2], ...bez([x, y - h / 2], [x - w * .4, y - h / 2 - 30 * a], [x - w * .8, y - h / 2 - 10 * a], [x - w, y - h / 2]).slice(1), [x - w, y + h / 2], ...bez([x - w, y + h / 2], [x - w * .8, y + h / 2 - 10 * a], [x - w * .4, y + h / 2 - 30 * a], [x, y + h / 2]).slice(1)], [[x, y - h / 2], ...bez([x, y - h / 2], [x + w * .4, y - h / 2 - 30 * a], [x + w * .8, y - h / 2 - 10 * a], [x + w, y - h / 2]).slice(1), [x + w, y + h / 2], ...bez([x + w, y + h / 2], [x + w * .8, y + h / 2 - 10 * a], [x + w * .4, y + h / 2 - 30 * a], [x, y + h / 2]).slice(1)], [[x - w * .8, y - 60], [x - w * .2, y - 70]], [[x - w * .8, y], [x - w * .2, y - 8]], [[x + w * .2, y - 70], [x + w * .8, y - 60]], [[x + w * .2, y - 8], [x + w * .8, y]]]; };
const bulb = (cx, cy, r) => [[[cx - r * .45, cy + r * 1.25], ...arc(cx, cy, r, r, Math.PI * .75, Math.PI * 2.25, 60), [cx + r * .45, cy + r * 1.25]], [[cx - r * .45, cy + r * 1.25], [cx + r * .45, cy + r * 1.25]], [[cx - r * .38, cy + r * 1.45], [cx + r * .38, cy + r * 1.45]], [[cx - r * .2, cy + r * 1.65], [cx + r * .2, cy + r * 1.65]], [[cx - r * .3, cy + r * 1.1], [cx - r * .3, cy + r * .2], [cx - r * .15, cy - r * .05], [cx, cy + r * .2], [cx + r * .15, cy - r * .05], [cx + r * .3, cy + r * .2], [cx + r * .3, cy + r * 1.1]]];
const bag = (cx, base, w, h) => { const l = cx - w / 2, r = cx + w / 2, top = base - h; return [close([[l + 16, top], [r - 16, top], [r, base], [l, base]]), arc(cx, top, w * .2, h * .3, Math.PI, Math.PI * 2, 30)]; };
const check = (cx, cy, s) => [[[cx - .5 * s, cy], [cx - .15 * s, cy + .35 * s], [cx + .55 * s, cy - .45 * s]]];
const shield = (cx, cy, s) => [[[cx, cy - s], [cx + .8 * s, cy - .72 * s], [cx + .8 * s, cy], ...bez([cx + .8 * s, cy], [cx + .8 * s, cy + .55 * s], [cx + .3 * s, cy + .85 * s], [cx, cy + 1.05 * s]).slice(1), ...bez([cx, cy + 1.05 * s], [cx - .3 * s, cy + .85 * s], [cx - .8 * s, cy + .55 * s], [cx - .8 * s, cy]).slice(1), [cx - .8 * s, cy - .72 * s], [cx, cy - s]]];
const lem = (cx, cy, a, p) => { const d = 1 + Math.sin(p) ** 2; return [cx + a * Math.cos(p) / d, cy + a * Math.sin(p) * Math.cos(p) / d]; };
const infinity = (cx, cy, a) => [Array.from({ length: 161 }, (_, i) => lem(cx, cy, a, i / 160 * Math.PI * 2))];
// —— the storyboard ——
const HOOK = .45, BASE = 1560, CX = 540;
// 0 THE HOOK (frame one already moving): „Ha több eladást szeretnél”: a gift box falls from the sky and slams down (flash, shockwave, shake);
//   its lid flies off, the light bursts out and shoots up a rising sales arrow
const boxBase = t => t < HOOK ? lerp(-260, BASE, (t / HOOK) ** 2) : BASE + 18 * Math.sin(clamp((t - HOOK) / .3) * Math.PI) * (1 - clamp((t - HOOK) / .3));
const lidU = t => ease3(seg(t, HOOK + .03, HOOK + .55));
el(t => gift(CX, boxBase(t), 400, 310).slice(0, 2), 0, 1.0, { din: .01, dout: .4, quiet: 1 });
el(t => { const u = lidU(t); return gift(CX, boxBase(t), 400, 310, 1000 * u, -1.6 * u).slice(2); }, 0, 1.0, { din: .01, dout: .3, quiet: 1 });
rays(CX, BASE - 155, 250, HOOK, { n: 16, len: 130 }); ripple(CX, BASE - 155, 150, HOOK); ripple(CX, BASE - 155, 50, HOOK + .12);
el(chartUp(CX - 80, BASE - 330, 860, 860), .6, 1.05, { din: .35, dout: .35, col: TURQ, quiet: 1 });
// 1 „újra kell gondolnod a mostani stratégiádat”: a figure; two arrows turn around its head (think again), the light sits in its mind
const FB = 1700;
el(figure(CX, FB, 2.4), T(4) + .08, T(10) - .45, { din: .55, dout: .4 });
el(t => cycle(CX, FB - 218 * 2.4, 175, t * 2.6, 150), T(5), T(10) - .45, { din: .45, dout: .4, col: TURQ, quiet: 1 });
// 2 „Először te adj valamit a vásárlóidnak”: you on the left, the customer on the right; a gift travels from you to them
const YOU = 260, THEM = 820, FS = 1.9, CHEST = FB - 163 * FS, TOPH = FB - 277 * FS;
el(figure(YOU, FB, FS), T(10), T(16) - .55, { din: .5, dout: .4, x: YOU });
el(figure(THEM, FB, FS), T(10) + .1, T(16) - .55, { din: .5, dout: .4, quiet: 1, x: THEM });
const giftU = t => ss(seg(t, T(13), T(15) + .1)), giftAt = u => [lerp(YOU, THEM, u), TOPH - 30 - 240 * Math.sin(u * Math.PI)];
el(t => { const [x, y] = giftAt(giftU(t)); return gift(x, y + 70, 150, 116); }, T(11) - .1, T(16) - .55, { din: .35, dout: .4, col: TURQ, x: YOU });
ripple(THEM, TOPH - 60, 110, T(15) + .3);
// 3 „Egy ingyenes mintát, egy hasznos útmutatót vagy exkluzív tippeket”: a sample jar, a guide book, a light bulb with a star, each as it is said
el(jar(205, 1250, 1.15), T(17) - .15, T(25) - .45, { din: .5, dout: .4, x: 205 });
el(bookS(CX, 1250, .85), T(20) - .15, T(25) - .45, { din: .5, dout: .4, x: CX });
el(bulb(860, 1180, 92), T(23) - .1, T(25) - .45, { din: .5, dout: .4, x: 850 });
el([star5(860, 960, 40)], T(24) - .05, T(25) - .45, { din: .3, dout: .3, col: TURQ, quiet: 1 });
rays(860, 1180, 130, T(24), { n: 12, len: 50 });
// 4 „Ha előre értéket adsz, az emberek szeretnék viszonozni”: you give a diamond (value) first; a heart comes back
el(figure(YOU, FB, FS), T(25), T(33) - .45, { din: .5, dout: .4, x: YOU });
el(figure(THEM, FB, FS), T(25) + .1, T(33) - .45, { din: .5, dout: .4, quiet: 1, x: THEM });
const diaU = t => ss(seg(t, T(27), T(28) + .2)), diaAt = u => [lerp(YOU, THEM, u), TOPH - 70 - 220 * Math.sin(u * Math.PI)];
el(t => { const [x, y] = diaAt(diaU(t)); return diamond(x, y, .8); }, T(26) - .1, T(33) - .45, { din: .35, dout: .35, col: TURQ, x: YOU });
const hrtU = t => ss(seg(t, T(31) - .2, T(32) + .2)), hrtAt = u => [lerp(THEM, YOU, u), TOPH - 70 - 220 * Math.sin(u * Math.PI)];
el(t => { const [x, y] = hrtAt(hrtU(t)); return [heart(x, y, 70)]; }, T(30) + .1, T(33) - .45, { din: .35, dout: .35, col: TURQ, x: THEM });
ripple(YOU, TOPH - 70, 110, T(32) + .2);
// 5 „Például úgy, hogy megveszik a termékedet”: a shopping bag; your product drops into it; a check
const BAGB = 1700, BAGW = 500, BAGH = 520, BAGTOP = BAGB - BAGH;
el(bag(CX, BAGB, BAGW, BAGH), T(33), T(39) - .45, { din: .6, dout: .4 });
const prodY = t => lerp(880, BAGTOP + 260, ss(seg(t, T(36) - .2, T(37))) ** 1.6);
el(t => P_PRODUCT.map(st => S(st, CX, prodY(t), 130)), T(35) - .1, T(39) - .45, { din: .3, dout: .3, quiet: 1, clipY: BAGTOP + 2 });
el(check(CX, BAGB - 210, 140), T(38) - .05, T(39) - .45, { din: .3, dout: .3, col: TURQ });
ripple(CX, BAGB - 210, 150, T(38) + .1);
// 6 „Ez az emberi természet. Úgy érezzük, vissza kell adnunk valamit”: a figure with a glowing heart; two arrows circle round it (give and give back)
const F6 = 1720, F6S = 2.4, CH6 = F6 - 163 * F6S;
el(figure(CX, F6, F6S), T(39), T(49) - .45, { din: .6, dout: .4 });
el(t => [heart(CX, CH6 - 12, 52 * (1 + .1 * Math.sin((t - T(41)) * 7)))], T(41) - .1, T(49) - .45, { din: .4, dout: .3, col: TURQ, quiet: 1 });
el(t => cycle(CX, 1380, 420, -Math.PI / 2 + (t - T(45)) * 1.1, 440), T(45) - .1, T(49) - .45, { din: .6, dout: .4 });
// 7 „A neve: a kölcsönösség elve”: an infinity loop with a small figure in each loop; the light runs round and round between them
const LX = CX, LY = 1220, LA = 450;
el(infinity(LX, LY, LA), T(49) + .05, T(54) - .45, { din: .7, dout: .4 });
el(figure(LX - 300, LY + 115, .85), T(50), T(54) - .45, { din: .45, dout: .35, quiet: 1 });
el(figure(LX + 300, LY + 115, .85), T(50) + .1, T(54) - .45, { din: .45, dout: .35, quiet: 1 });
rays(LX, LY, 80, T(52) + .1, { n: 14, len: 80 });
const lemP = t => Math.PI * 2 * ss(seg(t, T(50), T(53) + .25));
// 8 „Használd a marketingedben, hogy olyan bizalmat és hűséget építs, ami vásárlásba fordul”:
//   a megaphone sends waves; a shield (trust) and a heart (loyalty); both drop into a shopping bag; a check
el(P_PROMO.map(st => S(st, 290, 1200, 190)), T(54), T(58) - .1, { din: .5, dout: .4, x: 300 });
el(t => { const u = seg(t, T(55), T(58)); return [0, 1, 2].map(k => { const v = (u * 2.4 + k / 3) % 1; return arc(420 + v * 400, 1200, 70 + v * 80, 110 + v * 130, -Math.PI / 3, Math.PI / 3, 14); }); }, T(55), T(58) - .1, { din: .2, dout: .3, col: TURQ, quiet: 1 });
const mergeU = t => ss(seg(t, T(63) - .1, T(64) + .5)), B8 = 1720, B8T = B8 - 460;
el(t => { const u = mergeU(t); return shield(lerp(330, CX - 60, u), lerp(1130, B8T + 260, u ** 1.5), lerp(160, 90, u)); }, T(59) - .15, STORY - .5, { din: .45, dout: .4, x: 330, clipY: B8T + 2 });
el(t => { const u = mergeU(t); return [heart(lerp(760, CX + 70, u), lerp(1160, B8T + 270, u ** 1.5), lerp(110, 60, u))]; }, T(61) - .1, STORY - .5, { din: .45, dout: .4, col: TURQ, x: 760, clipY: B8T + 2 });
el(bag(CX, B8, 440, 460), T(63) - .2, STORY - .5, { din: .5, dout: .45 });
el(check(CX, B8 - 180, 130), T(65) - .1, STORY - .5, { din: .3, dout: .4, col: TURQ });
rays(CX, B8 - 180, 140, T(65) + .05, { n: 14, len: 60 });
// the light's path (key frames), with rides where it travels with a gift, a diamond, a heart or round the infinity loop
const gA = giftAt(0), gB = giftAt(1), dA = diaAt(0), dB = diaAt(1), hA = hrtAt(0), hB = hrtAt(1), L0 = lem(LX, LY, LA, 0);
const ORB = orb([[HOOK, CX, BASE - 155, 24], [.68, CX, 1180, 28], [1.0, 860, 860, 24], [1.35, 860, 860, 24], [T(4) + .3, CX, FB - 218 * 2.4, 32], [T(10) - .5, CX, FB - 218 * 2.4, 32],
  [T(11) + .2, gA[0], gA[1] - 40, 22], [T(13), gA[0], gA[1] - 40, 22], [T(15) + .1, gB[0], gB[1] - 40, 22], [T(16) - .5, gB[0], gB[1] - 40, 22],
  [T(17) + .2, 205, 1250, 28], [T(20) - .2, 205, 1250, 28], [T(20) + .25, CX, 1230, 26], [T(23) - .2, CX, 1230, 26], [T(23) + .25, 860, 1170, 30], [T(25) - .4, 860, 1170, 30],
  [T(26) + .1, dA[0], dA[1], 20], [T(27), dA[0], dA[1], 20], [T(28) + .2, dB[0], dB[1], 20], [T(31) - .2, hA[0], hA[1], 20], [T(32) + .2, hB[0], hB[1], 20], [T(33) - .4, hB[0], hB[1], 20],
  [T(35) - .1, CX, 800, 24], [T(36) - .2, CX, 800, 24], [T(37), CX, BAGTOP + 160, 26], [T(38), CX, BAGB - 210, 30], [T(39) - .4, CX, BAGB - 210, 30],
  [T(41) - .1, CX, CH6 - 12, 28], [T(49) - .4, CX, CH6 - 12, 28], [T(50), L0[0], L0[1], 24], [T(53) + .25, L0[0], L0[1], 24],
  [T(54) + .3, 290 + 114, 1200, 28], [T(58) - .2, 290 + 114, 1200, 28], [T(59) + .1, 330, 1130, 28], [T(61) - .2, 330, 1130, 28], [T(61) + .2, 760, 1160, 28], [T(63) - .1, 760, 1160, 28], [T(64) + .5, CX, B8T + 230, 28], [T(65), CX, B8 - 180, 30]]);
const orbAt = t => {
  if (t < HOOK) return [CX, boxBase(t) - 155, 22];
  const ride = (a, b, f) => t >= a && t <= b ? f : null;
  const g = ride(T(13), T(15) + .1, 1) && giftAt(giftU(t)); if (g) return [g[0], g[1] - 40, 22];
  const d = ride(T(27), T(28) + .2, 1) && diaAt(diaU(t)); if (d) return [d[0], d[1], 20];
  const h = ride(T(31) - .2, T(32) + .2, 1) && hrtAt(hrtU(t)); if (h) return [h[0], h[1], 20];
  if (t >= T(50) && t <= T(53) + .25) { const p = lem(LX, LY, LA, lemP(t)); return [p[0], p[1], 24]; }
  return track(ORB, t); };
function take(c, t) { const shake = t > HOOK && t < HOOK + .25 ? 14 * (1 - (t - HOOK) / .25) : 0;
  c.save(); c.translate(540 + shake * Math.sin(t * 95), 1160 + shake * Math.cos(t * 83)); c.scale(.92, .92); c.translate(-540, -1160);   // safe zone (and the hook's impact shake)
  for (const e of ELS) drawEl(c, e, t);
  for (const A of ACC) drawAcc(c, A, t);
  const [x, y, r] = orbAt(t), fade = 1 - ss(seg(t, STORY - .5, STORY)), flash = t > HOOK && t < HOOK + .3 ? 1 + 1.8 * (1 - (t - HOOK) / .3) : 1;
  orbDraw(c, x, y + 5 * Math.sin(t * 1.6), r * flash * (1 + .04 * Math.sin(t * 2.3)), fade);
  c.restore();
  const fl = t > HOOK && t < HOOK + .22 ? .32 * (1 - (t - HOOK) / .22) : 0; if (fl > 0) { c.save(); c.globalAlpha = fl; c.fillStyle = '#bff7f1'; c.fillRect(0, 0, 1080, 1920); c.restore(); }   // the hook's impact flash
}
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
window.EV = [{ t: 0, type: 'rush', d: HOOK }, { t: HOOK, type: 'impact' }, { t: .6, type: 'rise', d: .5 },
  ...ELS.filter(e => !e.quiet).map(e => ({ t: +e.a.toFixed(3), type: 'in', x: e.x, d: e.din })), ...glides.filter(g => g.t > .7).map(g => ({ t: +g.t.toFixed(3), type: 'glide', d: +g.d.toFixed(3), x: g.x })),
  ...ACC.filter(A => A.at > HOOK + .05).map(A => ({ t: +A.at.toFixed(3), type: A.k }))].sort((p, q) => p.t - q.t);
