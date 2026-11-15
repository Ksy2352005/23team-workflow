// M04 Marketingmix (the four P's), in the locked M03 style on black: hairline white lines, one turquoise-glowing orb, hand-built drawings per sentence.
// Hook (user 2026-11-13: "always start with a visual hook"): the four P's streak in from the corners and slam together (flash, shockwave, shake).
// Voice pauses tightened by loudness (refs/voiceover-hu-x1.10-tight.mp3). Call to action: line 3.
import { WORDS } from './captions.js';
import { start, ss, seg, clamp, lerp, ease3, WHITE, MID, K } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 43.5, DUR = 48.9;   // the call to action (line 3) 1.3 s into the end card, then 1.5 s of the logo alone
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
const el = (strokes, a, b, o = {}) => { const e = { col: o.col, strokes, a, b, din: o.din ?? .8, dout: o.dout ?? .55, alpha: o.alpha ?? 1, x: o.x ?? 540, tag: o.tag, quiet: o.quiet }; ELS.push(e); return e; };
function drawEl(c, e, t) { if (t < e.a || t > e.b + e.dout) return; const S = typeof e.strokes === 'function' ? e.strokes(t) : e.strokes, n = S.length, st = Math.min(.12, .45 / n);
  const pin = ss(seg(t, e.a, e.a + e.din)), pout = ss(seg(t, e.b, e.b + e.dout)); c.save(); pen(c, e.alpha * (1 - pout * .35), LW, e.col || WHITE); if (e.col) c.shadowColor = 'rgba(46,211,198,.7)';
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
// the four P's as unit drawings (about 2 units wide, centred on 0, 0)
const P_PRODUCT = [close([[-.8, -.45], [0, -.85], [.8, -.45], [0, -.05]]), [[-.8, -.45], [-.8, .5], [0, .9], [0, -.05]], [[.8, -.45], [.8, .5], [0, .9]], [[-.4, -.65], [.4, -.25], [.4, .05]]];   // a box
const P_PRICE = [close([[-.9, -.25], [-.3, -.75], [.85, -.75], [.85, .75], [-.3, .75], [-.9, .25]]), ring(-.35, 0, .15), [[.15, -.3], [.6, -.3]], [[.15, 0], [.6, 0]], [[.15, .3], [.45, .3]]];   // a price tag
const P_PLACE = [[...arc(0, -.25, .6, .6, Math.PI * .85, Math.PI * 2.15, 40), [0, .95], arc(0, -.25, .6, .6, Math.PI * .85, Math.PI * .85, 1)[0]], ring(0, -.25, .24)];   // a map pin
const P_PROMO = [close([[-.85, -.2], [-.2, -.2], [.6, -.75], [.6, .75], [-.2, .2], [-.85, .2]]), [[-.6, .2], [-.45, .75], [-.2, .75], [-.3, .2]], arc(.6, 0, .35, .45, -Math.PI / 2.6, Math.PI / 2.6, 12), arc(.6, 0, .6, .75, -Math.PI / 2.6, Math.PI / 2.6, 16)];   // a megaphone
const PS = [P_PRODUCT, P_PRICE, P_PLACE, P_PROMO];
const placeP = (k, x, y, s) => PS[k].map(st => S(st, x, y, s));
const GRID = [[-170, -170], [170, -170], [-170, 170], [170, 170]];   // the 2×2 grid of the four P's around the centre
const CX = 540, CY = 1150;
const keyShape = (x, y, s) => [ring(x, y, 60 * s), [[x + 60 * s, y], [x + 330 * s, y]], [[x + 270 * s, y], [x + 270 * s, y + 55 * s]], [[x + 320 * s, y], [x + 320 * s, y + 75 * s]]];
const shopMini = (x, base, s = 1) => { const w = 120 * s, h = 110 * s; return [close([[x - w / 2, base], [x - w / 2, base - h], [x + w / 2, base - h], [x + w / 2, base]]), [[x - w / 2 - 10 * s, base - h], [x - w / 2 - 10 * s, base - h - 30 * s], [x + w / 2 + 10 * s, base - h - 30 * s], [x + w / 2 + 10 * s, base - h]], [[x - 18 * s, base], [x - 18 * s, base - 55 * s], [x + 18 * s, base - 55 * s], [x + 18 * s, base]]]; };
const funnel = (x, y) => [[[x - 260, y - 180], [x - 40, y + 60], [x - 40, y + 200]], [[x + 260, y - 180], [x + 40, y + 60], [x + 40, y + 200]], arc(x, y - 180, 260, 36, 0, Math.PI * 2, 80)];
const book = (x, y, open = 1) => { const w = 210, h = 290, a = lerp(0, 1, open); return [[[x, y - h / 2], [x, y + h / 2]], [[x, y - h / 2], ...bez([x, y - h / 2], [x - w * .4, y - h / 2 - 30 * a], [x - w * .8, y - h / 2 - 10 * a], [x - w, y - h / 2]).slice(1), [x - w, y + h / 2], ...bez([x - w, y + h / 2], [x - w * .8, y + h / 2 - 10 * a], [x - w * .4, y + h / 2 - 30 * a], [x, y + h / 2]).slice(1)], [[x, y - h / 2], ...bez([x, y - h / 2], [x + w * .4, y - h / 2 - 30 * a], [x + w * .8, y - h / 2 - 10 * a], [x + w, y - h / 2]).slice(1), [x + w, y + h / 2], ...bez([x + w, y + h / 2], [x + w * .8, y + h / 2 - 10 * a], [x + w * .4, y + h / 2 - 30 * a], [x, y + h / 2]).slice(1)], [[x - w * .8, y - 60], [x - w * .2, y - 70]], [[x - w * .8, y], [x - w * .2, y - 8]], [[x + w * .2, y - 70], [x + w * .8, y - 60]], [[x + w * .2, y - 8], [x + w * .8, y]]]; };
const temple = (x, base) => { const cols = [-285, -95, 95, 285], h = 330; return [close([[x - 400, base - h - 20], [x, base - h - 190], [x + 400, base - h - 20]]), [[x - 420, base - h], [x + 420, base - h]], [[x - 440, base], [x + 440, base]], ...cols.flatMap(c => [[[x + c - 40, base], [x + c - 40, base - h]], [[x + c + 40, base], [x + c + 40, base - h]]])]; };
const puzzleFrame = (x, y, s) => { const P = (a, b) => [x + a * s, y + b * s]; return [[P(-1, -1), P(1, -1), P(1, 1), P(-1, 1), P(-1, -1)], [P(.05, -.2), P(.05, .55), P(.75, .55), P(.75, -.2), P(.55, -.2), ...arc(x + .4 * s, y - .2 * s, .15 * s, .15 * s, 0, -Math.PI, 12).slice(1), P(.05, -.2)]]; };
const puzzlePiece = (x, y, s) => [[[x - .35 * s, y - .375 * s], [x - .35 * s, y + .375 * s], [x + .35 * s, y + .375 * s], [x + .35 * s, y - .375 * s], [x + .15 * s, y - .375 * s], ...arc(x, y - .375 * s, .15 * s, .15 * s, 0, -Math.PI, 12).slice(1), [x - .35 * s, y - .375 * s]]];
const scaleBeam = (x, y, tilt) => { const L = 280, dx = Math.cos(tilt) * L, dy = Math.sin(tilt) * L, lx = x - dx, ly = y - dy, rx = x + dx, ry = y + dy;
  return [[[x, y + 380], [x, y]], [[x - 120, y + 380], [x + 120, y + 380]], [[lx, ly], [rx, ry]], [[lx, ly], [lx - 90, ly + 150]], [[lx, ly], [lx + 90, ly + 150]], arc(lx, ly + 150, 110, 30, 0, Math.PI, 20), [[rx, ry], [rx - 90, ry + 150]], [[rx, ry], [rx + 90, ry + 150]], arc(rx, ry + 150, 110, 30, 0, Math.PI, 20)]; };
const streets = () => [[[140, 1000], [940, 1000]], [[140, 1300], [940, 1300]], [[330, 820], [330, 1560]], [[750, 820], [750, 1560]], [[140, 1560], [940, 1560]]];
const stairs = (x0, y0, n, w, h) => { const p = [[x0, y0]]; for (let k = 0; k < n; k++) { p.push([x0 + k * w, y0 - (k + 1) * h]); p.push([x0 + (k + 1) * w, y0 - (k + 1) * h]); } return [p]; };
const flagAt = (x, base) => [[[x, base], [x, base - 170]], [[x, base - 170], [x + 110, base - 140], [x, base - 110]]];
const playCard = (x, y) => [rrect(x - 95, y - 70, 190, 140, 18), close([[x - 18, y - 28], [x - 18, y + 28], [x + 30, y]])];
// —— the storyboard ——
// 0 THE HOOK (frame one already moving): the four P's streak in from the four corners and slam together into a 2×2 block (flash, shockwave, shake);
//   on „kulcsstratégia” a key draws itself through the light; on „minden sikeres vállalkozásban közös” a ring of shops lights up, each with the same star
const HOOK = .5;
const START = [[-700, -900], [1780, -900], [-700, 3200], [1780, 3200]];
function hookShards(c, t) { if (t > T(8) - .05) return; const u = ease3(clamp(t / HOOK)), out = ss(seg(t, T(8) - .45, T(8) - .05));
  for (let k = 0; k < 4; k++) { const [gx, gy] = GRID[k], x = lerp(START[k][0], CX + gx, u), y = lerp(START[k][1], CY + gy, u), s = lerp(260, 110, u) * (1 - out);
    if (s < 2) continue; c.save(); pen(c, 1 - out, LW * (1 + (1 - u) * 1.5), k % 2 ? TURQ : WHITE); placeP(k, x, y, s).forEach(st => part(c, st, 0, 1));
    if (u < 1) { c.globalAlpha = .5 * (1 - u); c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(START[k][0], CX + gx, Math.max(0, u - .25)), lerp(START[k][1], CY + gy, Math.max(0, u - .25))); c.stroke(); } c.restore(); } }
rays(CX, CY, 260, HOOK, { n: 18, len: 120 }); ripple(CX, CY, 120, HOOK); ripple(CX, CY, 40, HOOK + .12);
el(keyShape(CX - 160, CY, 1.1), T(8) - .05, T(10) - .1, { din: .5, dout: .4, col: TURQ });
const RING = Array.from({ length: 6 }, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 3; return [CX + Math.cos(a) * 330, CY + 60 + Math.sin(a) * 300]; });
RING.forEach(([x, y], k) => { el(shopMini(x, y + 55, .9), T(10) - .05 + k * .07, T(14) - .2, { din: .4, quiet: k > 0, x }); el([star5(x, y - 80, 18)], T(12) + k * .07, T(14) - .25, { din: .25, quiet: 1, col: TURQ }); });
// 1 „A neve marketingmix”: the four P's drop into a funnel and mix; „ez a kézikönyved”: a book opens; „hogy a terméked a megfelelő emberek elé kerüljön”:
//   a box rises from the book and glides to three people; a turquoise target ring lands on them
el(funnel(CX, 1150), T(14) + .1, T(17) + .1, { din: .5 });
const fall = (k, t) => { const u = ss(seg(t, T(15) + .1 + k * .12, T(16) + .4 + k * .12)); return [lerp(CX + [-200, -70, 70, 200][k], CX, u), lerp(860, 1250, u * u), lerp(70, 20, u), 1 - ss(seg(t, T(16) + .3 + k * .12, T(16) + .5 + k * .12))]; };
el(book(320, 1220, 1), T(17) + .3, T(29) - .2, { din: .7, x: 320 });
el(t => { const u = ss(seg(t, T(24) - .1, T(26) + .2)); return placeP(0, lerp(320, 640, u), lerp(1030, 1040, u) - 120 * Math.sin(u * Math.PI), 70); }, T(24) - .2, T(29) - .25, { din: .3, quiet: 1 });
[740, 860, 980].forEach((x, k) => el(figure(x - 70, 1560, 1.25), T(25) - .1 + k * .1, T(29) - .2, { din: .5, quiet: k > 0, x }));
el([ring(790, 1190, 230, 230)], T(26) - .05, T(29) - .25, { din: .45, quiet: 1, col: TURQ });
// 2 „A négy P… termék, ár, értékesítési hely, promóció”: each P draws itself into the 2×2 as it is said; „minden sikeres üzleti stratégia alapja”:
//   they become the columns that hold a roof
[[0, 35], [1, 37], [2, 39], [3, 43]].forEach(([k, w]) => el(placeP(k, CX + GRID[k][0], CY + GRID[k][1], 120), T(w) - .1, T(45) - .1, { din: .45, x: CX + GRID[k][0], col: k === 2 || k === 1 ? undefined : undefined }));
el(temple(CX, 1500), T(45) + .25, T(49) - .2, { din: .8 });
[-285, -95, 95, 285].forEach((c, k) => el(placeP(k, CX + c, 1500 - 180, 32), T(46) + k * .1, T(49) - .25, { din: .3, quiet: 1, col: TURQ }));
rays(CX, 1500 - 400, 180, T(48) + .05, { n: 14, len: 60 });
// 3 „A termék … mit kínálsz, és milyen problémát old meg?”: a big box; a puzzle with a missing piece; the piece flies out of the box into the gap
el(placeP(0, 330, 1250, 150), T(49) + .05, T(62) - .2, { din: .6, x: 330 });
el(puzzleFrame(760, 1180, 190), T(58) - .15, T(62) - .2, { din: .6, x: 760 });
el(t => { const u = ss(seg(t, T(60) - .1, T(61) + .3)); return puzzlePiece(lerp(330, 760 + .4 * 190, u), lerp(1130, 1180 + .175 * 190, u) - 220 * Math.sin(u * Math.PI), 190); }, T(59) + .1, T(62) - .25, { din: .3, quiet: 1, col: TURQ });
ripple(760, 1180, 120, T(61) + .35);
// 4 „Az ár … mennyit ér ez a vásárlóidnak, és passzol-e az értékéhez?”: a balance; the price tag drops on one pan, a diamond (value) on the other, and it levels
const tilt = t => lerp(0, -.28, ss(seg(t, T(67), T(68) + .3))) * (1 - ss(seg(t, T(75), T(75) + .7)));
el(t => scaleBeam(CX, 1060, tilt(t)), T(62) + .05, T(76) - .2, { din: .8 });
el(t => { const u = ss(seg(t, T(67) - .3, T(67) + .2)), tl = tilt(t), lx = CX - Math.cos(tl) * 280, ly = 1060 - Math.sin(tl) * 280; return placeP(1, lx, lerp(760, ly + 95, u), 70); }, T(66) - .1, T(76) - .25, { din: .3, quiet: 1 });
el(t => { const u = ss(seg(t, T(74) - .3, T(75) + .1)), tl = tilt(t), rx = CX + Math.cos(tl) * 280, ry = 1060 + Math.sin(tl) * 280; return diamond(rx, lerp(760, ry + 70, u), .8); }, T(74) - .4, T(76) - .25, { din: .3, quiet: 1, col: TURQ });
// 5 „Az értékesítési hely … hol találnak meg a vásárlóid, és hogyan teszed elérhetővé?”: a street map; a pin drops on a shop; a dotted path leads a person there; the door opens
el(streets(), T(76) + .05, T(89) - .2, { din: .7 });
el(shopMini(540, 1300, 1.3), T(78) - .1, T(89) - .2, { din: .5, quiet: 1 });
el(t => placeP(2, 540, lerp(900, 1090, ss(seg(t, T(80) - .1, T(80) + .25))), 80), T(80) - .25, T(89) - .25, { din: .25, x: 540, col: TURQ });
el([Array.from({ length: 30 }, (_, i) => polyAt([[200, 1560], [330, 1560], [330, 1300], [470, 1300]], i / 29))], T(84) - .1, T(89) - .25, { din: .7, quiet: 1 });
el(t => { const u = ss(seg(t, T(88) - .1, T(88) + .5)); return [[[540 - 23, 1300], [540 - 23 + 46 * Math.cos(u * 1.2) * .8, 1300 - 71 + 0 * u]]]; }, T(88) - .15, T(89) - .2, { din: .2, quiet: 1, col: TURQ });
// 6 „A promóció pedig arra felel: hogyan mondod el a világnak?”: a megaphone; its waves travel across to the Earth, which lights up
el(placeP(3, 290, 1180, 150), T(89) + .05, T(99) - .1, { din: .6, x: 290 });
el(globe(790, 1180, 170), T(96) - .1, T(99) - .1, { din: .7, x: 790 });
el(t => { const u = seg(t, T(93), T(98)); return [0, 1, 2].map(k => { const v = ((u * 2.5 + k / 3) % 1); return arc(430 + v * 260, 1180, 60 + v * 60, 90 + v * 90, -Math.PI / 3, Math.PI / 3, 14); }); }, T(93), T(99) - .2, { din: .2, quiet: 1, col: TURQ });
ripple(790, 1180, 170, T(98) + .05);
// 7 „Hangold össze ezt a négy P-t, és közelebb kerülsz az üzleti sikerhez”: the four P's circle and lock into the 2×2; a staircase rises to a flag
el(t => { const sp = 1 - ss(seg(t, T(100), T(104) + .3)), a0 = (t - T(99)) * 4 * sp; return [0, 1, 2, 3].flatMap(k => { const a = a0 + k * Math.PI / 2 + Math.PI / 4, r = lerp(240, 240, 0), x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r; return placeP(k, x, y, 90); }); }, T(99) + .05, T(105) - .1, { din: .5 });
ripple(CX, CY, 260, T(104) + .3);
el(stairs(250, 1560, 4, 140, 110), T(105) + .15, T(111) - .2, { din: .7 });
el(flagAt(830, 1120), T(108) + .1, T(111) - .2, { din: .4, col: TURQ });
rays(880, 1000, 90, T(110) + .1, { n: 12, len: 50 });
// 8 „Maradj velem, a következő videókban mindegyiket megnézzük részletesen”: four video cards, one per P; the light hops across them
const CARDS = [195, 425, 655, 885];
CARDS.forEach((x, k) => { el(playCard(x, 1150), T(111) + .1 + k * .1, STORY + .4, { din: .4, quiet: k > 0, x }); el(placeP(k, x, 1300, 40), T(112) + k * .15, STORY + .4, { din: .3, quiet: 1, col: TURQ }); });
// the light's path
const ORB = orb([[0, CX, CY, 10], [HOOK, CX, CY, 46], [T(8) - .1, CX, CY, 34], [T(8) + .25, CX - 160, CY, 30], [T(10) - .1, CX - 160, CY, 30], [T(10) + .3, CX, CY + 60, 28], [T(14), CX, CY + 60, 28],
  [T(14) + .4, CX, 1290, 24], [T(17) + .1, CX, 1340, 24], [T(17) + .5, 320, 1220, 26], [T(24) - .2, 320, 1220, 26], [T(26) + .2, 640, 1040, 24], [T(27), 640, 1040, 24], [T(27) + .4, 790, 1190, 26], [T(30) - .1, 790, 1190, 26],
  [T(30) + .4, CX, CY, 30], [T(45) + .1, CX, CY, 30], [T(45) + .5, CX, 1500 - 420, 26], [T(49) - .1, CX, 1500 - 420, 26], [T(49) + .4, 330, 1250, 28], [T(59), 330, 1250, 28],
  [T(62) - .1, 760, 1180, 24], [T(62) + .4, CX, 1060, 22], [T(76) - .1, CX, 1060, 22], [T(76) + .4, 200, 1560, 22], [T(84) - .1, 200, 1560, 22], [T(87), 470, 1300, 22], [T(88) + .3, 540, 1250, 22], [T(89) - .1, 540, 1250, 22],
  [T(89) + .4, 290, 1180, 26], [T(93), 290, 1180, 26], [T(98), 790, 1180, 30], [T(99) - .1, 790, 1180, 30], [T(99) + .4, CX, CY, 30], [T(105) - .1, CX, CY, 30], [T(105) + .4, 250, 1560, 22], [T(110) - .2, 830, 1120 - 170, 24], [T(111) - .1, 830, 950, 24]]);
const orbAt = t => { if (t >= T(111) + .2) { const k = Math.min(3, Math.floor(clamp((t - T(113)) / .6, 0, 3.99))), u = ss(seg(t, T(113) + k * .6 - .25, T(113) + k * .6)); const x0 = k ? CARDS[k - 1] : 830, x1 = t < T(113) - .25 ? (t < T(111) + .6 ? lerp(830, CARDS[0], ss(seg(t, T(111) + .2, T(111) + .6))) : CARDS[0]) : CARDS[k];
    if (t < T(113) - .25) return [x1, t < T(111) + .6 ? lerp(950, 1150, ss(seg(t, T(111) + .2, T(111) + .6))) : 1150, 24]; return [lerp(x0, x1, u), 1150 - 70 * Math.sin(u * Math.PI), 24]; }
  return track(ORB, t); };
function funnelFall(c, t) { for (let k = 0; k < 4; k++) { const [x, y, s, a] = fall(k, t); if (t < T(15) || a <= 0) continue; c.save(); pen(c, a, LW, k % 2 ? TURQ : WHITE); placeP(k, x, y, s).forEach(st => part(c, st, 0, 1)); c.restore(); } }
function take(c, t) { const shake = t > HOOK && t < HOOK + .25 ? 12 * (1 - (t - HOOK) / .25) : 0;
  c.save(); c.translate(540 + shake * Math.sin(t * 95), 1160 + shake * Math.cos(t * 83)); c.scale(.92, .92); c.translate(-540, -1160);   // safe zone (and the hook's impact shake)
  hookShards(c, t);
  for (const e of ELS) drawEl(c, e, t);
  for (const A of ACC) drawAcc(c, A, t);
  funnelFall(c, t);
  const [x, y, r] = orbAt(t), fade = 1 - ss(seg(t, STORY - .5, STORY)), flash = t > HOOK && t < HOOK + .3 ? 1 + 1.6 * (1 - (t - HOOK) / .3) : 1;
  orbDraw(c, x, y + 6 * Math.sin(t * 1.6), r * flash * (1 + .04 * Math.sin(t * 2.3)), fade);
  c.restore();
  const fl = t > HOOK && t < HOOK + .22 ? .32 * (1 - (t - HOOK) / .22) : 0; if (fl > 0) { c.save(); c.globalAlpha = fl; c.fillStyle = '#bff7f1'; c.fillRect(0, 0, 1080, 1920); c.restore(); }   // the hook's impact flash
}
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
window.EV = [{ t: 0, type: 'rush', d: HOOK }, { t: HOOK, type: 'impact' }, { t: T(15) + .1, type: 'rise', d: 1.2 },
  ...ELS.filter(e => !e.quiet).map(e => ({ t: +e.a.toFixed(3), type: 'in', x: e.x, d: e.din })), ...glides.filter(g => g.t > .7).map(g => ({ t: +g.t.toFixed(3), type: 'glide', d: +g.d.toFixed(3), x: g.x })),
  ...ACC.filter(A => A.at > HOOK + .05).map(A => ({ t: +A.at.toFixed(3), type: A.k }))].sort((p, q) => p.t - q.t);
