// M05 Kölcsönösség (reciprocity), v3 (user 2026-11-16: "the idea is very good, just a bit messy: one visual at a time, faster, more engaging").
// The v2 story, told as single big centred drawings in quick succession, in the locked M03/M04 style on black: hairline white lines, one turquoise-glowing orb.
// Hook: sales bars rocket up from nothing on frame one and slam into an impact (flash, shockwave, shake, a burst of coins).
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
const scaleBeam = (x, y, tilt) => { const L = 280, dx = Math.cos(tilt) * L, dy = Math.sin(tilt) * L, lx = x - dx, ly = y - dy, rx = x + dx, ry = y + dy;
  return [[[x, y + 380], [x, y]], [[x - 120, y + 380], [x + 120, y + 380]], [[lx, ly], [rx, ry]], [[lx, ly], [lx - 90, ly + 150]], [[lx, ly], [lx + 90, ly + 150]], arc(lx, ly + 150, 110, 30, 0, Math.PI, 20), [[rx, ry], [rx - 90, ry + 150]], [[rx, ry], [rx + 90, ry + 150]], arc(rx, ry + 150, 110, 30, 0, Math.PI, 20)]; };
// —— the people: a friendly line figure (head with a smile, torso, arms that reach to a hand point, legs); s = 1 is 420 px tall ——
function person(cx, base, s = 1, o = {}) { const P = (x, y) => [cx + x * s, base + y * s], hy = base - 378 * s, out = [];
  out.push(ring(cx, hy, 42 * s), arc(cx + (o.look || 0) * 8 * s, hy + 6 * s, 16 * s, 11 * s, Math.PI * .15, Math.PI * .85, 16), [[cx - 14 * s + (o.look || 0) * 8 * s, hy - 10 * s], [cx - 14 * s + (o.look || 0) * 8 * s, hy - 3 * s]], [[cx + 14 * s + (o.look || 0) * 8 * s, hy - 10 * s], [cx + 14 * s + (o.look || 0) * 8 * s, hy - 3 * s]]);
  if (o.cap) out.push(arc(cx, hy - 26 * s, 42 * s, 30 * s, Math.PI, Math.PI * 2, 24), [[cx - 46 * s, hy - 26 * s], [cx + 70 * s, hy - 26 * s]]);
  out.push([P(0, -336), P(0, -320)], close([P(-62, -320), P(62, -320), P(48, -170), P(-48, -170)]));
  if (!o.noLegs) out.push([P(-60, 0), P(-30, 0), P(-24, -170)], [P(24, -170), P(30, 0), P(60, 0)]);
  [[-1, o.hl], [1, o.hr]].forEach(([side, h]) => { const sh = P(side * 62, -312), hd = h || P(side * 80, -185), el = [(sh[0] + hd[0]) / 2 + side * 14 * s, (sh[1] + hd[1]) / 2 + 26 * s];
    out.push([sh, el, hd], ring(hd[0], hd[1], 9 * s)); });
  return out; }
const headOf = (cx, base, s = 1) => [cx, base - 378 * s], chestOf = (cx, base, s = 1) => [cx, base - 270 * s];
// —— the objects ——
const counter = (l, r, top, base) => [close([[l, top + 22], [r, top + 22], [r, base], [l, base]]), close([[l - 20, top], [r + 20, top], [r + 20, top + 22], [l - 20, top + 22]])];
const sampleCup = (x, y, s = 1) => [close([[x - 60 * s, y - 50 * s], [x + 60 * s, y - 50 * s], [x + 44 * s, y + 50 * s], [x - 44 * s, y + 50 * s]]), [[x - 60 * s, y - 30 * s], [x + 60 * s, y - 30 * s]], [[x + 20 * s, y - 50 * s], [x + 48 * s, y - 110 * s]], arc(x + 52 * s, y - 118 * s, 10 * s, 10 * s, 0, Math.PI * 2, 16)];
const steam = (x, y, s, t) => [-1, 1].map(k => Array.from({ length: 17 }, (_, i) => { const u = i / 16; return [x + k * 22 * s + 10 * s * Math.sin(u * 7 + t * 5 + k), y - u * 80 * s]; }));
const guide = (x, y, s = 1) => [rrect(x - 70 * s, y - 95 * s, 140 * s, 190 * s, 10 * s), ...[0, 1, 2].flatMap(k => { const yy = y - 45 * s + k * 50 * s; return [[[x - 46 * s, yy], [x - 34 * s, yy + 12 * s], [x - 16 * s, yy - 12 * s]], [[x - 2 * s, yy], [x + 46 * s, yy]]]; })];
const register = (x, base, open = 0) => [close([[x - 130, base], [x - 108, base - 130], [x + 108, base - 130], [x + 130, base]]), [[x + 50, base - 130], [x + 50, base - 165]], rrect(x - 10, base - 215, 120, 50, 8),
  ...[0, 1, 2].map(k => [[x - 80 + k * 6, base - 98 + k * 30], [x + 20 - k * 6, base - 98 + k * 30]]), close([[x - 110, base + 4 + 60 * open], [x + 110, base + 4 + 60 * open], [x + 110, base + 44 + 60 * open], [x - 110, base + 44 + 60 * open]])];
const coin = (x, y, r = 22) => [ring(x, y, r), ring(x, y, r * .62)];
const phone = (x, y) => [rrect(x - 125, y - 225, 250, 450, 34), [[x - 30, y - 200], [x + 30, y - 200]], rrect(x - 95, y - 160, 190, 230, 14), [[x - 95, y + 110], [x + 40, y + 110]], [[x - 95, y + 145], [x + 10, y + 145]]];
const handshake = (x, y, s = 1) => { const P = (a, b) => [x + a * s, y + b * s];
  return [close([P(-250, -10), P(-150, -60), P(-115, 10), P(-215, 60)]), close([P(250, -10), P(150, -60), P(115, 10), P(215, 60)]),
    [P(-140, -40), ...bez(P(-140, -40), P(-80, -100), P(40, -95), P(140, -40)).slice(1)], [P(-122, 10), ...bez(P(-122, 10), P(-60, 70), P(60, 80), P(122, 10)).slice(1)],
    bez(P(-70, -78), P(-20, -110), P(40, -100), P(70, -62)), ...[0, 1, 2, 3].map(k => arc(-60 * s + x + k * 40 * s, y - 20 * s + k * 6 * s, 20 * s, 34 * s, -Math.PI * .5, Math.PI * .5, 14))]; };
const card = (x, y) => [rrect(x - 160, y - 92, 320, 184, 18), [[x - 130, y - 52], [x - 30, y - 52]], ...[0, 1, 2, 3, 4].map(k => ring(x - 112 + k * 56, y + 22, 21))];
const xMark = (x, y, r) => [[[x - r, y - r], [x + r, y + r]], [[x + r, y - r], [x - r, y + r]]];
const one = (x, y, r) => [ring(x, y, r), [[x - r * .25, y - r * .35], [x + r * .08, y - r * .55], [x + r * .08, y + r * .55]], [[x - r * .25, y + r * .55], [x + r * .38, y + r * .55]]];
const giftAt = (x, y, s) => gift(x, y + 58 * s, 116 * s, 92 * s);   // a gift centred on x, y
const scaleL = (x, y, tilt, L = 300, drop = 160, pw = 120) => { const dx = Math.cos(tilt) * L, dy = Math.sin(tilt) * L, lx = x - dx, ly = y - dy, rx = x + dx, ry = y + dy;
  return [[[x, y + 470], [x, y]], [[x - 130, y + 470], [x + 130, y + 470]], ring(x, y, 14), [[lx, ly], [rx, ry]], ...[[lx, ly], [rx, ry]].flatMap(([px, py]) => [[[px, py], [px - pw * .8, py + drop]], [[px, py], [px + pw * .8, py + drop]], arc(px, py + drop, pw, 32, 0, Math.PI, 20)])]; };
// —— the storyboard: ONE big drawing at a time, centred, drawn on and erased quickly; the light glides from one to the next ——
const HOOK = .45, CX = 540, CY = 1250, AX = 1640;
const BEATS = [];   // [from, to, x, y, r]: where the light rests in each drawing
const beat = (a, b, x = CX, y = CY, r = 30) => BEATS.push([a, b, x, y, r]);
// 0 THE HOOK „Ha több eladást szeretnél” (frame one already moving): four sales bars rocket up from nothing and slam into place (flash, shockwave,
//   shake); an arrow sweeps over their tops and coins burst out of the tallest
const BARS = [[270, 240], [430, 380], [590, 530], [750, 740]];
const barH = (k, t) => BARS[k][1] * (t < HOOK ? Math.pow(t / HOOK, 1.6) : 1 + .07 * Math.sin((t - HOOK) * 30) * Math.exp(-(t - HOOK) * 7));
el([[[170, AX], [910, AX]]], 0, 1.0, { din: .01, dout: .3, quiet: 1 });
el(t => BARS.map(([x], k) => { const h = barH(k, t); return [[x - 55, AX], [x - 55, AX - h], [x + 55, AX - h], [x + 55, AX]]; }), 0, 1.0, { din: .01, dout: .3, quiet: 1 });
el(t => { const p = BARS.map(([x], k) => [x, AX - barH(k, t) - 55]); return [p, arrowHead(p[3], 140, -200, 44)]; }, HOOK - .05, 1.0, { din: .3, dout: .3, col: TURQ, quiet: 1 });
rays(750, AX - 740, 130, HOOK, { n: 16, len: 130 }); ripple(750, AX - 740, 90, HOOK);
const COINS = Array.from({ length: 9 }, (_, k) => ({ vx: (k - 4) * 120 + 20, vy: -640 - (k % 3) * 170 }));
function coinBurst(c, t) { const u = t - HOOK; if (u < 0 || u > 1.0) return; c.save(); pen(c, 1 - clamp((u - .65) / .35), LW, TURQ);
  COINS.forEach(({ vx, vy }) => coin(750 + vx * u, AX - 740 + vy * u + 1400 * u * u, 22).forEach(st => part(c, st, 0, 1))); c.restore(); }
// 1 „újra kell gondolnod a mostani stratégiádat”: the plan on a clipboard, its line falling; a turquoise X strikes it out
el([rrect(CX - 270, CY - 350, 540, 700, 26), rrect(CX - 95, CY - 385, 190, 70, 14), [[CX - 190, CY - 200], [CX + 50, CY - 200]], [[CX - 190, CY - 140], [CX - 20, CY - 140]]], T(4), T(10) - .4, { din: .45, dout: .3 });
el([[[CX - 190, CY - 30], [CX - 70, CY + 40], [CX + 20, CY + 15], [CX + 180, CY + 220]], arrowHead([CX + 180, CY + 220], 160, 205, 40)], T(5) - .1, T(10) - .4, { din: .45, dout: .3, quiet: 1 });
el(xMark(CX, CY + 60, 190), T(8) + .05, T(10) - .4, { din: .3, dout: .3, col: TURQ });
beat(T(4) + .2, T(8), CX - 70, CY + 40); beat(T(8) + .2, T(10) - .4, CX, CY + 60, 32);
// 2 „Először te adj valamit a vásárlóidnak”: a big gift with a turquoise „1”; on „valamit” its lid lifts and light pours out
const lidUp = t => ease3(seg(t, T(13) - .1, T(13) + .45));
el(t => gift(CX, CY + 250, 470, 360, 120 * lidUp(t), -.18 * lidUp(t)), T(10), T(16) - .35, { din: .5, dout: .3 });
el(one(CX + 330, CY - 260, 70), T(10) + .25, T(16) - .35, { din: .3, dout: .3, col: TURQ, quiet: 1 });
rays(CX, CY - 110, 120, T(13) + .3, { n: 14, len: 110 });
beat(T(10) + .3, T(13), CX, CY + 70, 30); beat(T(13) + .35, T(16) - .35, CX, CY - 150, 34);
// 3 „Egy ingyenes mintát”: a sample cup, steaming; „egy hasznos útmutatót”: a checklist guide; „vagy exkluzív tippeket”: a light bulb with a star
el(t => [...sampleCup(CX, CY + 80, 2.6), ...steam(CX, CY - 110, 2.2, t)], T(16), T(20) - .35, { din: .45, dout: .3 });
el(guide(CX, CY, 2.4), T(20), T(23) - .4, { din: .45, dout: .3 });
el(t => [...bulb(CX, CY - 40, 170), star5(CX, CY - 330, 50)], T(23) - .1, T(25) - .35, { din: .45, dout: .3, col: TURQ });
rays(CX, CY - 40, 210, T(24), { n: 14, len: 80 });
beat(T(16) + .2, T(20) - .35, CX, CY + 60); beat(T(20) + .2, T(23) - .4, CX + 110, CY - 110, 26); beat(T(23) + .15, T(25) - .35, CX, CY - 40, 36);
// 4 „Ha előre értéket adsz”: a big diamond (value); „az emberek szeretnék viszonozni”: a heart, and an arrow that turns back round to where it came from
el(diamond(CX, CY - 20, 2.6), T(25), T(29) - .35, { din: .45, dout: .3 });
rays(CX, CY - 20, 260, T(27) + .1, { n: 14, len: 70 });
el(t => [heart(CX, CY + 20, 190 * (1 + .06 * Math.sin((t - T(29)) * 8)))], T(29), T(33) - .35, { din: .45, dout: .3, col: TURQ });
el(t => { const a0 = -Math.PI * .15, a1 = a0 + Math.PI * 1.25 * ss(seg(t, T(31) - .1, T(32) + .3)), p = arc(CX, CY + 20, 330, 330, a0, Math.max(a0 + .01, a1), 50), E = p[p.length - 1]; return [p, arrowHead(E, -Math.sin(a1), Math.cos(a1), 40)]; }, T(31) - .1, T(33) - .35, { din: .05, dout: .3, quiet: 1 });
beat(T(25) + .2, T(29) - .35, CX, CY - 60, 32); beat(T(29) + .15, T(31) - .1, CX, CY + 40, 34);
const backRide = t => { const a = -Math.PI * .15 + Math.PI * 1.25 * ss(seg(t, T(31) - .1, T(32) + .3)); return [CX + Math.cos(a) * 330, CY + 20 + Math.sin(a) * 330, 24]; };
// 5 „Például úgy, hogy megveszik a termékedet”: a shopping bag; your product drops into it; coins jump out
const BB = CY + 330;
el(bag(CX, BB, 520, 560), T(33), T(39) - .35, { din: .5, dout: .3 });
const prodY = t => lerp(CY - 620, BB - 585, ss(seg(t, T(36) - .25, T(36) + .3)) ** 1.6);
el(t => P_PRODUCT.map(st => S(st, CX, prodY(t), 150)), T(35) - .2, T(39) - .35, { din: .25, dout: .25, quiet: 1, clipY: BB - 558 });
el(t => [0, 1, 2].flatMap(k => { const u = clamp((t - T(38) - k * .1) / .7); return u > 0 ? coin(CX + (k - 1) * 150, BB - 600 - 260 * Math.sin(u * Math.PI * .8), 30) : []; }), T(38), T(39) - .35, { din: .05, dout: .3, col: TURQ, quiet: 1 });
rays(CX, BB - 700, 110, T(38) + .15, { n: 12, len: 70 });
beat(T(33) + .2, T(36) - .25, CX, CY - 500, 28); beat(T(36) + .3, T(39) - .35, CX, BB - 585, 32);
// 6 „Ez az emberi természet”: a person with a glowing heart; „Úgy érezzük, vissza kell adnunk valamit”: a balance scale: a gift lands on one side and it
//   tips; we feel we must give back: a gift lands on the other side and it levels
el(person(CX, CY + 420, 1.75, { look: 0 }), T(39), T(43) - .35, { din: .5, dout: .3 });
el(t => [heart(CX, CY + 420 - 270 * 1.75 + 10, 48 * (1 + .12 * Math.sin((t - T(41)) * 8)))], T(41) - .15, T(43) - .35, { din: .3, dout: .25, col: TURQ, quiet: 1 });
const PIV = [CX, CY - 160], tilt = t => lerp(0, -.28, ss(seg(t, T(44) + .1, T(44) + .5))) * (1 - ss(seg(t, T(47) - .1, T(47) + .5)));
const pan = (t, k) => { const tl = tilt(t), d = k ? 1 : -1; return [PIV[0] + d * Math.cos(tl) * 300, PIV[1] + d * Math.sin(tl) * 300 + 160]; };
el(t => scaleL(PIV[0], PIV[1], tilt(t)), T(43) - .05, T(49) - .35, { din: .5, dout: .3 });
el(t => { const p = pan(t, 0), u = ss(seg(t, T(43) + .15, T(44) + .2)); return giftAt(p[0], lerp(p[1] - 500, p[1] - 75, u * u), 1.05); }, T(43) + .15, T(49) - .35, { din: .2, dout: .3, col: TURQ, quiet: 1 });
el(t => { const p = pan(t, 1), u = ss(seg(t, T(45) + .1, T(47) - .15)); return giftAt(p[0], lerp(p[1] - 500, p[1] - 75, u * u), 1.05); }, T(45) + .1, T(49) - .35, { din: .2, dout: .3, col: TURQ });
ripple(PIV[0], PIV[1], 120, T(47) + .45);
beat(T(39) + .2, T(41) - .15, CX, CY - 220, 28); beat(T(41), T(43) - .35, CX, CY + 420 - 270 * 1.75 + 10, 28); beat(T(43) + .1, T(49) - .35, PIV[0], PIV[1], 26);
// 7 „A neve: a kölcsönösség elve”: the circle of giving: two big arrows chase each other round, carrying a gift and a heart
const RR = 330, rA = t => Math.PI * .9 + (t - T(49)) * 2.2;
el(t => cycle(CX, CY, RR, rA(t), RR), T(49) + .05, T(54) - .35, { din: .45, dout: .3 });
el(t => { const a = rA(t) + 1.25; return giftAt(CX + Math.cos(a) * RR, CY + Math.sin(a) * RR, .85); }, T(50) - .1, T(54) - .35, { din: .25, dout: .3, col: TURQ, quiet: 1 });
el(t => { const a = rA(t) + 1.25 + Math.PI; return [heart(CX + Math.cos(a) * RR, CY + Math.sin(a) * RR, 56)]; }, T(50), T(54) - .35, { din: .25, dout: .3, col: TURQ, quiet: 1 });
rays(CX, CY, 90, T(52) + .1, { n: 16, len: 110 });
beat(T(49) + .2, T(54) - .35, CX, CY, 40);
// 8 „Használd a marketingedben”: a phone with a post that gives (a gift) and gets hearts; „bizalmat”: a handshake; „és hűséget”: a loyalty card fills with
//   stamps; „ami vásárlásba fordul”: a shopping bag with coins jumping out
const phoneS = (x, y, s) => phone(0, 0).map(st => st.map(([a, b]) => [x + a * s, y + b * s]));
el(phoneS(CX, CY, 1.45), T(54), T(59) - .35, { din: .45, dout: .3 });
el(giftAt(CX, CY - 75, 1.35), T(55) - .1, T(59) - .35, { din: .35, dout: .3, col: TURQ, quiet: 1 });
el(t => [0, 1, 2, 3].filter(k => t > T(57) + k * .2).map(k => { const u = clamp((t - T(57) - k * .2) / 1.1); return heart(CX + 120 + 40 * Math.sin(u * 6 + k), CY + 160 - u * 420, 24 * (1 - u * .3)); }), T(57), T(59) - .35, { din: .05, dout: .2, col: TURQ, quiet: 1 });
el([...shield(CX, CY - 20, 260), ...check(CX, CY + 40, 190)], T(59) - .15, T(61) - .2, { din: .35, dout: .25 });   // trust: a shield with a check
el(card(0, 0).map(st => st.map(([a, b]) => [CX + a * 1.8, CY + b * 1.8])), T(61) - .05, T(63) - .2, { din: .3, dout: .25 });
el(t => [0, 1, 2, 3, 4].filter(k => t > T(61) + .2 + k * .12).map(k => heart(CX + (-112 + k * 56) * 1.8, CY + 22 * 1.8, 23)), T(61) + .2, T(63) - .2, { din: .05, dout: .25, col: TURQ, quiet: 1 });
el(bag(CX, BB, 500, 540), T(63) + .1, STORY - .5, { din: .45, dout: .45 });
el(P_PRODUCT.map(st => S(st, CX, BB - 590, 140)), T(63) + .25, STORY - .5, { din: .35, dout: .45, quiet: 1, clipY: BB - 538 });
el(t => [0, 1, 2].flatMap(k => { const u = clamp((t - T(65) - k * .12) / .9); return u > 0 ? coin(CX + (k - 1) * 150, BB - 560 - 80 - 260 * Math.sin(u * Math.PI * .75), 30) : []; }), T(65), STORY - .5, { din: .05, dout: .4, col: TURQ, quiet: 1 });
rays(CX, BB - 760, 130, T(65) + .1, { n: 14, len: 80 });
beat(T(54) + .2, T(57), CX, CY - 75, 30); beat(T(57) + .1, T(59) - .35, CX + 120, CY + 150, 24); beat(T(59), T(61) - .2, CX, CY - 30, 30); beat(T(61) + .1, T(63) - .2, CX + 112 * 1.8, CY + 40, 26); beat(T(63) + .3, STORY, CX, BB - 760, 32);
// the light: it rides the tallest bar, rests in each drawing (BEATS) and glides between them
const KEYS = [[HOOK, 750, AX - 740 - 55, 26], [1.0, 920, 840, 26]]; BEATS.sort((p, q) => p[0] - q[0]).forEach(([a, b, x, y, r]) => KEYS.push([a, x, y, r], [b, x, y, r]));
const ORB = orb(KEYS);
const orbAt = t => { if (t < HOOK) return [750, AX - barH(3, t) - 55, 22];
  if (t >= T(31) - .1 && t <= T(32) + .3) return backRide(t);
  return track(ORB, t); };
function take(c, t) { const shake = t > HOOK && t < HOOK + .25 ? 14 * (1 - (t - HOOK) / .25) : 0;
  c.save(); c.translate(540 + shake * Math.sin(t * 95), 1160 + shake * Math.cos(t * 83)); c.scale(.92, .92); c.translate(-540, -1160);   // safe zone (and the hook's impact shake)
  for (const e of ELS) drawEl(c, e, t);
  for (const A of ACC) drawAcc(c, A, t);
  coinBurst(c, t);
  const [x, y, r] = orbAt(t), fade = 1 - ss(seg(t, STORY - .5, STORY)), flash = t > HOOK && t < HOOK + .3 ? 1 + 1.8 * (1 - (t - HOOK) / .3) : 1;
  orbDraw(c, x, y + 5 * Math.sin(t * 1.6), r * flash * (1 + .04 * Math.sin(t * 2.3)), fade);
  c.restore();
  const fl = t > HOOK && t < HOOK + .22 ? .32 * (1 - (t - HOOK) / .22) : 0; if (fl > 0) { c.save(); c.globalAlpha = fl; c.fillStyle = '#bff7f1'; c.fillRect(0, 0, 1080, 1920); c.restore(); }   // the hook's impact flash
}
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
window.EV = [{ t: 0, type: 'rush', d: HOOK }, { t: HOOK, type: 'impact' }, { t: HOOK - .05, type: 'rise', d: .5 },
  ...ELS.filter(e => !e.quiet).map(e => ({ t: +e.a.toFixed(3), type: 'in', x: e.x, d: e.din })), ...glides.filter(g => g.t > .7).map(g => ({ t: +g.t.toFixed(3), type: 'glide', d: +g.d.toFixed(3), x: g.x })),
  ...ACC.filter(A => A.at > HOOK + .05).map(A => ({ t: +A.at.toFixed(3), type: A.k }))].sort((p, q) => p.t - q.t);
