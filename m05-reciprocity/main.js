// M05 Kölcsönösség (reciprocity), v2 (user 2026-11-16: v1's drawings did not tell the story): in the locked M03/M04 style on black, hairline white lines,
// one turquoise-glowing orb, but now ONE small story that shows every sentence literally: a shop owner behind a counter gives a customer gifts first,
// the customer wants to give back and buys; two friends on a balance scale (human nature); the circle of give and give back; trust, loyalty, purchase.
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
// —— the storyboard ——
const HOOK = .45, CX = 540, AX = 1600;
// 0 THE HOOK „Ha több eladást szeretnél” (frame one already moving): four sales bars rocket up from nothing and slam into place (flash, shockwave,
//   shake); an arrow sweeps over their tops and a burst of coins flies out of the tallest
const BARS = [[300, 200], [440, 320], [580, 450], [720, 640]];
const barH = (k, t) => BARS[k][1] * (t < HOOK ? Math.pow(t / HOOK, 1.6) : 1 + .07 * Math.sin((t - HOOK) * 30) * Math.exp(-(t - HOOK) * 7));
el([[[220, AX], [860, AX]]], 0, 1.0, { din: .01, dout: .35, quiet: 1 });
el(t => BARS.map(([x], k) => { const h = barH(k, t); return [[x - 45, AX], [x - 45, AX - h], [x + 45, AX - h], [x + 45, AX]]; }), 0, 1.0, { din: .01, dout: .35, quiet: 1 });
el(t => { const p = BARS.map(([x], k) => [x, AX - barH(k, t) - 50]); return [p, arrowHead(p[3], 140, -190, 40)]; }, HOOK - .05, 1.0, { din: .3, dout: .35, col: TURQ, quiet: 1 });
rays(720, AX - 640, 120, HOOK, { n: 16, len: 120 }); ripple(720, AX - 640, 80, HOOK);
const COINS = Array.from({ length: 9 }, (_, k) => ({ vx: (k - 4) * 115 + 30, vy: -620 - (k % 3) * 160 }));
function coinBurst(c, t) { const u = t - HOOK; if (u < 0 || u > 1.05) return; c.save(); pen(c, 1 - clamp((u - .7) / .35), LW, TURQ);
  COINS.forEach(({ vx, vy }) => coin(720 + vx * u, AX - 640 + vy * u + 1400 * u * u, 20).forEach(st => part(c, st, 0, 1))); c.restore(); }
// 1 „újra kell gondolnod a mostani stratégiádat”: a plan on a clipboard with a falling line; a turquoise X strikes it out; a new arrow turns upward
const CB = [CX, 1250];
el([rrect(CB[0] - 230, CB[1] - 300, 460, 600, 22), rrect(CB[0] - 80, CB[1] - 330, 160, 60, 12), [[CB[0] - 160, CB[1] - 170], [CB[0] + 40, CB[1] - 170]], [[CB[0] - 160, CB[1] - 120], [CB[0] - 20, CB[1] - 120]]], T(4), T(10) - .45, { din: .55, dout: .4 });
el([[[CB[0] - 160, CB[1] - 30], [CB[0] - 60, CB[1] + 30], [CB[0] + 20, CB[1] + 10], [CB[0] + 150, CB[1] + 180]], arrowHead([CB[0] + 150, CB[1] + 180], 130, 170, 34)], T(5) - .1, T(10) - .45, { din: .5, dout: .4, quiet: 1 });
el(xMark(CB[0], CB[1] + 70, 150), T(8) + .05, T(10) - .45, { din: .35, dout: .35, col: TURQ });
el([[[CB[0] - 120, CB[1] + 230], [CB[0] + 60, CB[1] + 60], [CB[0] + 150, CB[1] - 40]], arrowHead([CB[0] + 150, CB[1] - 40], 90, -100, 38)], T(9) + .3, T(10) - .45, { din: .35, dout: .3, col: TURQ, quiet: 1 });
// 2–5 THE SHOP: the owner (cap) behind the counter, a customer in front
const CT = 1420, CTB = 1700, OW = 290, CU = 820, PB = 1700;
const ownerHand = t => { const reach = ss(seg(t, T(11) - .3, T(11) + .1)) * (1 - ss(seg(t, T(15) + .1, T(15) + .5))) + ss(seg(t, T(36) - .3, T(36))) * (1 - ss(seg(t, T(38) + .3, T(38) + .6)));
  return [lerp(OW + 85, 470, reach), lerp(CT + 30, 1330, reach)]; };
const custHands = t => { const take = ss(seg(t, T(14) - .2, T(14) + .2)) * (1 - ss(seg(t, T(33) - .4, T(33)))), pay = ss(seg(t, T(36) - .3, T(36))) * (1 - ss(seg(t, T(38), T(38) + .3)));
  const hold = [[lerp(CU - 80, CU - 75, take), lerp(PB - 185, PB - 250, take)], [lerp(CU + 80, CU + 75, take), lerp(PB - 185, PB - 250, take)]];
  if (pay > 0) hold[0] = [lerp(hold[0][0], 640, pay), lerp(hold[0][1], 1330, pay)]; if (t > T(38)) hold[1] = [CU + 95, PB - 200]; return hold; };
el(counter(110, 560, CT, CTB), T(10), T(39) - .45, { din: .5, dout: .4, x: 330 });
el(t => person(OW, PB, 1.05, { cap: 1, noLegs: 1, look: .6, hr: ownerHand(t) }), T(10) + .05, T(39) - .45, { din: .55, dout: .4, quiet: 1, clipY: CT, x: OW });
el(t => { const [hl, hr] = custHands(t); return person(CU, PB, 1.05, { look: -.6, hl, hr }); }, T(10) + .15, T(39) - .45, { din: .55, dout: .4, x: CU });
// „Először te adj valamit a vásárlóidnak”: a turquoise „1” by the owner; the owner hands the customer a gift
el(one(OW - 10, 930, 58), T(10) + .3, T(13) + .3, { din: .35, dout: .3, col: TURQ, quiet: 1 });
const g1 = t => { const u = ss(seg(t, T(13) - .1, T(15) + .1)), a = ownerHand(t), b = [CU - 80, PB - 300]; return t < T(13) - .1 ? [a[0], a[1] - 50] : [lerp(470, b[0], u), lerp(1280, b[1], u) - 150 * Math.sin(u * Math.PI)]; };
el(t => { const [x, y] = g1(t); return giftAt(x, y, 1); }, T(11), T(17) - .3, { din: .35, dout: .35, col: TURQ, x: OW });
ripple(CU - 80, PB - 300, 90, T(15) + .25);
// „Egy ingyenes mintát, egy hasznos útmutatót vagy exkluzív tippeket”: each appears over the counter as it is said, then they fly into the customer's arms
const ITEMS = [[300, 1000, T(17) - .15], [540, 1000, T(21) - .15], [780, 990, T(23) - .1]];
const toArms = (k, t) => { const u = ss(seg(t, T(25) + k * .12, T(26) + .3 + k * .12)), [x, y] = ITEMS[k]; return [lerp(x, CU + (k - 1) * 70, u), lerp(y, PB - 300 - (k === 1 ? 50 : 0), u), lerp(1, .55, u)]; };
el(t => { const [x, y, s] = toArms(0, t); return [...sampleCup(x, y, s), ...steam(x, y - 70 * s, s, t)]; }, ITEMS[0][2], T(33) - .45, { din: .45, dout: .35, x: 300 });
el(t => { const [x, y, s] = toArms(1, t); return guide(x, y, s); }, ITEMS[1][2], T(33) - .45, { din: .45, dout: .35, x: 540 });
el(t => { const [x, y, s] = toArms(2, t); return [...bulb(x, y, 66 * s), star5(x, y - 120 * s, 26 * s)]; }, ITEMS[2][2], T(33) - .45, { din: .45, dout: .35, x: 780, col: TURQ });
// „Ha előre értéket adsz, az emberek szeretnék viszonozni”: a heart lights up in the customer; a turquoise arrow curves back to the owner, carrying a heart
const [chX, chY] = chestOf(CU, PB, 1.05);
el(t => [heart(chX, chY + 10, 34 * (1 + .12 * Math.sin((t - T(30)) * 8)))], T(30) - .1, T(33) - .45, { din: .35, dout: .35, col: TURQ, quiet: 1 });
const BACK = bez([CU - 40, 1080], [700, 760], [420, 760], [OW + 20, 1060], 40);
el([BACK, arrowHead(BACK[40], BACK[40][0] - BACK[37][0], BACK[40][1] - BACK[37][1], 36)], T(32) - .35, T(33) - .45, { din: .55, dout: .35, col: TURQ });
// „Például úgy, hogy megveszik a termékedet”: a till on the counter; the customer pays, the drawer opens, coins pop; the customer holds a bag with the product
el(t => register(430, CT, ss(seg(t, T(37), T(37) + .3))), T(33), T(39) - .45, { din: .5, dout: .4, x: 430 });
el(t => { const [x, y] = custHands(t)[0]; return coin(x, y - 30, 20); }, T(35), T(37) + .1, { din: .25, dout: .2, col: TURQ, quiet: 1 });
el(bag(CU + 95, PB - 110, 170, 190), T(36) - .1, T(39) - .45, { din: .4, dout: .4, x: CU });
el(P_PRODUCT.map(st => S(st, CU + 95, PB - 320, 55)), T(36) + .1, T(39) - .45, { din: .3, dout: .3, quiet: 1, clipY: PB - 302 });
el(t => [0, 1, 2].flatMap(k => { const u = clamp((t - T(38) - k * .1) / .7); return coin(430 + (k - 1) * 70, CT - 230 - 220 * Math.sin(u * Math.PI * .8), 20); }), T(38), T(39) - .45, { din: .2, dout: .3, col: TURQ, quiet: 1 });
rays(430, CT - 330, 80, T(38) + .2, { n: 12, len: 60 });
// 6 „Ez az emberi természet. Úgy érezzük, vissza kell adnunk valamit”: two friends and a balance scale. One puts a gift on his side: the scale tips;
//   the other feels he must give back: he puts a gift on the other side, and it levels
const FA = 130, FB2 = 950, FBASE = 1700, PIV = [CX, 1240];
const tilt = t => lerp(0, -.3, ss(seg(t, T(42) - .2, T(42) + .3))) * (1 - ss(seg(t, T(47), T(47) + .6)));
const panL = t => { const tl = tilt(t); return [PIV[0] - Math.cos(tl) * 220, PIV[1] - Math.sin(tl) * 220 + 140]; }, panR = t => { const tl = tilt(t); return [PIV[0] + Math.cos(tl) * 220, PIV[1] + Math.sin(tl) * 220 + 140]; };
const scale2 = (x, y, tilt) => { const L = 220, dx = Math.cos(tilt) * L, dy = Math.sin(tilt) * L, lx = x - dx, ly = y - dy, rx = x + dx, ry = y + dy;
  return [[[x, y + 420], [x, y]], [[x - 110, y + 420], [x + 110, y + 420]], ring(x, y, 12), [[lx, ly], [rx, ry]], ...[[lx, ly], [rx, ry]].flatMap(([px, py]) => [[[px, py], [px - 80, py + 140]], [[px, py], [px + 80, py + 140]], arc(px, py + 140, 95, 28, 0, Math.PI, 20)])]; };
el(t => scale2(PIV[0], PIV[1], tilt(t)), T(39), T(49) - .45, { din: .7, dout: .4 });
const giveA = t => ss(seg(t, T(41) - .1, T(42))), giveB = t => ss(seg(t, T(45) - .1, T(47)));
el(t => { const u = giveA(t), p = panL(t); return person(FA, FBASE, .95, { look: .7, hr: [lerp(FA + 90, p[0] - 60, u * (1 - ss(seg(t, T(42), T(42) + .4)))), lerp(FBASE - 180, p[1] - 40, u * (1 - ss(seg(t, T(42), T(42) + .4))))] }); }, T(39) + .1, T(49) - .45, { din: .55, dout: .4, x: FA });
el(t => { const u = giveB(t), p = panR(t); return person(FB2, FBASE, .95, { look: -.7, hl: [lerp(FB2 - 90, p[0] + 60, u * (1 - ss(seg(t, T(47), T(47) + .4)))), lerp(FBASE - 180, p[1] - 40, u * (1 - ss(seg(t, T(47), T(47) + .4))))] }); }, T(39) + .2, T(49) - .45, { din: .55, dout: .4, quiet: 1, x: FB2 });
el(t => { const u = giveA(t), p = panL(t); return giftAt(lerp(FA + 90, p[0], u), lerp(FBASE - 230, p[1] - 70, u) - 120 * Math.sin(u * Math.PI), .95); }, T(40) + .1, T(49) - .45, { din: .35, dout: .35, col: TURQ, quiet: 1 });
el(t => { const u = giveB(t), p = panR(t); return giftAt(lerp(FB2 - 90, p[0], u), lerp(FBASE - 230, p[1] - 70, u) - 120 * Math.sin(u * Math.PI), .95); }, T(44) + .1, T(49) - .45, { din: .35, dout: .35, col: TURQ, x: FB2 });
el(t => [heart(FB2, FBASE - .95 * 270 + 8, 26 * (1 + .1 * Math.sin(t * 8)))], T(43) - .1, T(49) - .45, { din: .3, dout: .3, col: TURQ, quiet: 1 });
ripple(PIV[0], PIV[1], 120, T(47) + .5);
// 7 „A neve: a kölcsönösség elve”: the two friends face each other; a gift and a heart travel round a circle between them: give, give back, give again
const RC = [CX, 1270], RR = 250;
el(person(170, FBASE, .95, { look: .7 }), T(49) + .05, T(54) - .45, { din: .5, dout: .35, x: 170 });
el(person(910, FBASE, .95, { look: -.7 }), T(49) + .1, T(54) - .45, { din: .5, dout: .35, quiet: 1, x: 910 });
el(t => cycle(RC[0], RC[1], RR, Math.PI * .95 + (t - T(50)) * 2.2, RR * .8), T(50) - .1, T(54) - .45, { din: .5, dout: .35 });
const onRing = (t, o) => { const a = Math.PI * .95 + (t - T(50)) * 2.2 + 1.2 + o; return [RC[0] + Math.cos(a) * RR, RC[1] + Math.sin(a) * RR * .8]; };
el(t => { const [x, y] = onRing(t, 0); return giftAt(x, y, .7); }, T(50) + .2, T(54) - .45, { din: .3, dout: .3, col: TURQ, quiet: 1 });
el(t => { const [x, y] = onRing(t, Math.PI); return [heart(x, y, 40)]; }, T(50) + .3, T(54) - .45, { din: .3, dout: .3, col: TURQ, quiet: 1 });
rays(RC[0], RC[1], 70, T(52) + .1, { n: 14, len: 70 });
// 8 „Használd a marketingedben”: a phone with a post that gives something (a gift) and gets likes; „bizalmat”: a handshake; „hűséget”: a loyalty card
//   fills with stamps; „ami vásárlásba fordul”: it all becomes a shopping bag with coins jumping out
const PH = [290, 1240], HS = [790, 1080], LC = [790, 1450];
el(phone(PH[0], PH[1]), T(54), T(63) - .3, { din: .55, dout: .35, x: PH[0] });
el(giftAt(PH[0], PH[1] - 50, 1), T(55), T(63) - .3, { din: .4, dout: .3, col: TURQ, quiet: 1 });
el(t => [0, 1, 2].map(k => { const u = clamp((t - T(57) - k * .25) / 1.1); return heart(PH[0] + 70 + 30 * Math.sin(u * 6 + k), PH[1] + 120 - u * 330, 16 * (1 - u * .3)); }).filter((_, k) => t > T(57) + k * .25), T(57), T(63) - .3, { din: .1, dout: .2, col: TURQ, quiet: 1 });
el(handshake(HS[0], HS[1], .95), T(59) - .15, T(63) - .3, { din: .5, dout: .35, x: HS[0] });
el(card(LC[0], LC[1]), T(61) - .2, T(63) - .3, { din: .4, dout: .35, quiet: 1, x: LC[0] });
el(t => [0, 1, 2, 3, 4].filter(k => t > T(61) + k * .14).map(k => heart(LC[0] - 112 + k * 56, LC[1] + 22, 13)), T(61), T(63) - .3, { din: .05, dout: .3, col: TURQ, quiet: 1 });
const BB = 1660;
el(bag(CX, BB, 440, 470), T(63) + .15, STORY - .5, { din: .55, dout: .45 });
el(P_PRODUCT.map(st => S(st, CX, BB - 500, 120)), T(63) + .3, STORY - .5, { din: .4, dout: .45, quiet: 1, clipY: BB - 468 });
el(t => [0, 1, 2].flatMap(k => { const u = clamp((t - T(65) - k * .12) / .9); return u > 0 ? coin(CX + (k - 1) * 120, BB - 470 - 60 - 230 * Math.sin(u * Math.PI * .75), 24) : []; }), T(65), STORY - .5, { din: .05, dout: .4, col: TURQ, quiet: 1 });
rays(CX, BB - 640, 120, T(65) + .1, { n: 14, len: 70 });
// the light's path: it rides the tallest bar, sits in each thing as it is said, rides the gifts and the heart
const g1A = g1(T(13) - .1), g1B = g1(T(15) + .1);
const ORB = orb([[HOOK, 720, AX - 640 - 50, 24], [1.0, 860, 760, 26], [1.4, 860, 760, 26], [T(4) + .3, CB[0], CB[1] - 30, 30], [T(8), CB[0], CB[1] + 70, 30], [T(9) + .4, CB[0] + 150, CB[1] - 40, 28], [T(10) - .3, CB[0] + 150, CB[1] - 40, 28],
  [T(11) + .2, g1A[0], g1A[1] - 100, 22], [T(13) - .1, g1A[0], g1A[1] - 100, 22], [T(15) + .1, g1B[0], g1B[1] - 100, 22], [T(17) - .3, g1B[0], g1B[1] - 100, 22],
  [T(17) + .1, 300, 1000, 26], [T(21) - .3, 300, 1000, 26], [T(21) + .1, 540, 1000, 26], [T(23) - .3, 540, 1000, 26], [T(23) + .1, 780, 990, 28], [T(25), 780, 990, 28], [T(26) + .5, CU, PB - 420, 22],
  [T(30) - .1, chX, chY + 10, 24], [T(32) - .3, chX, chY + 10, 24], [T(33) - .4, OW + 20, 1060, 24], [T(33) + .2, 480, CT - 190, 24], [T(37), 480, CT - 190, 24], [T(38) + .3, 430, CT - 420, 28], [T(39) - .4, 430, CT - 420, 28],
  [T(40), CX, PIV[1] - 20, 26], [T(45), CX, PIV[1] - 20, 26], [T(46), FB2, FBASE - 265, 22], [T(48), FB2, FBASE - 265, 22], [T(49) + .1, CX, PIV[1] - 20, 26],
  [T(50) - .1, RC[0], RC[1], 30], [T(54) - .4, RC[0], RC[1], 30], [T(54) + .3, PH[0], PH[1] - 50, 26], [T(59) - .3, PH[0], PH[1] - 50, 26], [T(59) + .2, HS[0], HS[1] - 20, 26], [T(61) - .3, HS[0], HS[1] - 20, 26], [T(62), LC[0] + 112, LC[1] + 22, 22],
  [T(63) - .1, LC[0] + 112, LC[1] + 22, 22], [T(64) + .2, CX, BB - 520, 28], [T(65) + .2, CX, BB - 640, 30]]);
const orbAt = t => {
  if (t < HOOK) return [720, AX - barH(3, t) - 50, 22];
  if (t >= T(13) - .1 && t <= T(15) + .1) { const [x, y] = g1(t); return [x, y - 100, 22]; }
  if (t >= T(32) - .35 && t <= T(33) - .4) { const p = polyAt(BACK, ss(seg(t, T(32) - .35, T(33) - .4))); return [p[0], p[1], 24]; }
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
