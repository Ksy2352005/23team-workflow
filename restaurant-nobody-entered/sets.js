// Painted sets for the 2D film, pre-rendered once into canvases (seeded, so every worker paints the same pictures).
// Interior: we look at the restaurant's front wall from inside (door left, arched window right, the street beyond).
// Exterior: we look at the facade from the street (door left, window right, the room beyond).
import { mulberry } from '/core/lib.js';

export const IN = { W: 1500, H: 2500, top: 240, floor: 1360, rail: 990,
  door: { x0: 150, x1: 390, y0: 920, y1: 1360 }, win: { x0: 640, x1: 1180, cx: 910, r: 270, spring: 880, sill: 1270 },
  pendants: [[430, 545], [910, 560], [1345, 545]] };
export const EX = { W: 2400, H: 3500, ox: 300, oy: 1000,   // canvas pixel = world + (ox, oy)
  ground: 1660, feet: 1722, door: { x0: 640, x1: 810, y0: 1290, y1: 1660 }, win: { x0: 900, x1: 1260, cx: 1080, r: 180, spring: 1330, sill: 1580 },
  lanterns: [[612, 1310], [838, 1310]], lamps: [[420, 1150], [1490, 1150]], fac: { x0: 560, x1: 1320 } };

function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
const lin = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rad = (ctx, x, y, r0, r1, stops) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
function archPath(ctx, x0, x1, spring, bottom, inset = 0) {
  const cx = (x0 + x1) / 2, r = (x1 - x0) / 2 - inset;
  ctx.beginPath(); ctx.moveTo(x0 + inset, bottom); ctx.lineTo(x0 + inset, spring); ctx.arc(cx, spring, r, Math.PI, 0); ctx.lineTo(x1 - inset, bottom); ctx.closePath();
}
export function winPath(ctx, w, inset = 0) { archPath(ctx, w.x0, w.x1, w.spring, w.sill, inset); }
export function glowSprite(col = '255,190,110') {
  const [c, x] = cnv(256, 256); x.fillStyle = rad(x, 128, 128, 0, 128, [[0, `rgba(${col},1)`], [.25, `rgba(${col},.45)`], [.6, `rgba(${col},.12)`], [1, `rgba(${col},0)`]]); x.fillRect(0, 0, 256, 256); return c;
}
function windowsGrid(x, R, x0, y0, w, h, cols, rows, wall, lit, litCol = '#f6b85c', frame = '#f3e6c8') {
  const cw = w / cols, rh = h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const wx = x0 + i * cw + cw * .25, wy = y0 + j * rh + rh * .2, ww = cw * .5, wh = rh * .58, on = R() < lit;
    x.fillStyle = frame; x.fillRect(wx - 7, wy - 12, ww + 14, 9); x.fillRect(wx - 5, wy + wh, ww + 10, 8);
    x.fillStyle = on ? lin(x, 0, wy, 0, wy + wh, [[0, '#ffd690'], [1, litCol]]) : '#1a2350'; x.fillRect(wx, wy, ww, wh);
    x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(wx + ww / 2 - 2, wy, 4, wh); x.fillRect(wx, wy + wh * .4, ww, 3);
  }
}
export function chalkboard(x, x0, y0, w, h, frame = '#8a5a2e') {
  x.fillStyle = frame; x.beginPath(); x.roundRect(x0 - 10, y0 - 10, w + 20, h + 20, 8); x.fill();
  x.fillStyle = lin(x, 0, y0, 0, y0 + h, [[0, '#2b3330'], [1, '#1d2422']]); x.fillRect(x0, y0, w, h);
  x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 30; i++) x.fillRect(x0 + (i * 37) % w, y0 + (i * 53) % h, 18, 2);
  x.fillStyle = '#f2efe6'; x.font = `${Math.round(w * .2)}px "Fredoka"`; x.textAlign = 'center'; x.fillText('MENÜ', x0 + w / 2, y0 + w * .25);
  x.strokeStyle = 'rgba(242,239,230,.85)'; x.lineWidth = 2.5; x.lineCap = 'round';
  const cy = y0 + h * .45, s = w / 160;
  x.beginPath(); x.moveTo(x0 + 30 * s, cy); x.lineTo(x0 + 62 * s, cy); x.lineTo(x0 + 58 * s, cy + 26 * s); x.lineTo(x0 + 34 * s, cy + 26 * s); x.closePath(); x.stroke(); x.beginPath(); x.arc(x0 + 66 * s, cy + 10 * s, 6 * s, -1.4, 1.4); x.stroke();
  for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(x0 + (40 + k * 8) * s, cy - 6 * s); x.quadraticCurveTo(x0 + (44 + k * 8) * s, cy - 14 * s, x0 + (40 + k * 8) * s, cy - 22 * s); x.stroke(); }
  x.beginPath(); x.ellipse(x0 + 112 * s, cy + 18 * s, 28 * s, 8 * s, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(x0 + 112 * s, cy + 10 * s, 14 * s, 8 * s, 0, Math.PI, 0); x.stroke();
  x.fillStyle = 'rgba(242,239,230,.75)'; for (let k = 0; k < 3; k++) { x.fillRect(x0 + 24 * s, y0 + h * .72 + k * 16 * s, (70 + (k * 23) % 40) * s, 3); x.fillRect(x0 + w - 40 * s, y0 + h * .72 + k * 16 * s, 18 * s, 3); }
}

// the bar counter, drawn in depth order with the people (someone can stand behind it)
export function counter(x) {
  const cx0 = 1225, cx1 = 1500, ct = 1215, cb = 1430;
    x.fillStyle = lin(x, 0, ct, 0, cb, [[0, '#8a5530'], [1, '#5a3418']]); x.fillRect(cx0, ct, cx1 - cx0, cb - ct);
    for (let px = cx0 + 14; px < cx1 - 30; px += 70) { x.strokeStyle = 'rgba(255,220,170,.18)'; x.lineWidth = 3; x.strokeRect(px, ct + 30, 54, cb - ct - 50); }
    x.fillStyle = '#3a2414'; x.fillRect(cx0 - 12, ct - 18, cx1 - cx0 + 24, 22); x.fillStyle = 'rgba(255,230,190,.25)'; x.fillRect(cx0 - 12, ct - 18, cx1 - cx0 + 24, 5);
    x.fillStyle = 'rgba(5,6,25,.3)'; x.fillRect(cx0 - 10, cb, cx1 - cx0 + 20, 16);
    // espresso machine
    x.fillStyle = lin(x, 1270, 0, 1350, 0, [[0, '#d9b45a'], [.5, '#f3dc96'], [1, '#a8822e']]); x.beginPath(); x.roundRect(1268, 1105, 84, 92, 10); x.fill();
    x.fillStyle = '#2a2a33'; x.fillRect(1282, 1160, 56, 10); x.fillRect(1300, 1170, 8, 16); x.fillRect(1318, 1170, 8, 16); x.fillStyle = '#e8e4da'; x.beginPath(); x.arc(1310, 1128, 12, 0, 7); x.fill();
    // a cake under a glass dome
    x.fillStyle = '#e9c08a'; x.fillRect(1395, 1168, 60, 26); x.fillStyle = '#f6efe2'; x.fillRect(1395, 1162, 60, 8); x.fillStyle = '#c4566a'; x.beginPath(); x.arc(1425, 1158, 6, 0, 7); x.fill();
    x.strokeStyle = 'rgba(220,235,255,.6)'; x.lineWidth = 3; x.beginPath(); x.ellipse(1425, 1194, 44, 58, 0, Math.PI, 0); x.stroke(); x.fillStyle = 'rgba(220,235,255,.12)'; x.fill(); 
}
const LOOK = {
  morning: { sky: ['#5f88d6', '#a9c3ec', '#f2cfae'], wallTint: 'rgba(120,150,230,.10)', lampK: .45, outLit: .1, night: 0 },
  dawn: { sky: ['#152d78', '#3f62b5', '#d3a19a'], wallTint: 'rgba(40,60,140,.25)', lampK: .8, outLit: .45, night: .4 },
  dusk: { sky: ['#0f1d58', '#2b438f', '#b07a86'], wallTint: 'rgba(20,30,90,.18)', lampK: 1, outLit: .55, night: .6 },
  night: { sky: ['#050b2c', '#0d1b55', '#1d2d6c'], wallTint: 'rgba(10,15,60,.25)', lampK: 1, outLit: .55, night: 1 },
};

// —— the room, seen from inside ——
export function interiorWall(lookName) {
  const L = LOOK[lookName], R = mulberry(3), [c, x] = cnv(IN.W, IN.H), d = IN.door, w = IN.win;
  // ceiling with beams
  x.fillStyle = lin(x, 0, 0, 0, IN.top, [[0, '#120c10'], [1, '#2a1d1c']]); x.fillRect(0, 0, IN.W, IN.top);
  for (let i = 0; i < 6; i++) { x.fillStyle = '#3a2820'; x.fillRect(i * 290 - 20, 0, 60, IN.top); }
  x.fillStyle = '#4a3427'; x.fillRect(0, IN.top - 26, IN.W, 26);
  // upper wall: deep navy, warmed by the lamps
  x.fillStyle = lin(x, 0, IN.top, 0, IN.rail, [[0, '#18235a'], [1, '#22317a']]); x.fillRect(0, IN.top, IN.W, IN.rail - IN.top);
  for (const [px, py] of IN.pendants) { x.fillStyle = rad(x, px, py + 40, 10, 520, [[0, `rgba(255,170,90,${.45 * L.lampK})`], [1, 'rgba(255,170,90,0)']]); x.fillRect(0, IN.top, IN.W, IN.floor - IN.top); }
  // a subtle damask pattern
  x.fillStyle = 'rgba(255,255,255,.03)';
  for (let yy = IN.top + 40; yy < IN.rail; yy += 90) for (let xx = (yy / 90 % 2) * 45; xx < IN.W; xx += 90) { x.beginPath(); x.ellipse(xx, yy, 10, 18, 0, 0, 7); x.fill(); }
  // wainscot
  x.fillStyle = lin(x, 0, IN.rail, 0, IN.floor, [[0, '#ecdcb8'], [1, '#c9b48c']]); x.fillRect(0, IN.rail, IN.W, IN.floor - IN.rail);
  for (let px = 20; px < IN.W; px += 160) { x.strokeStyle = 'rgba(120,90,50,.35)'; x.lineWidth = 4; x.strokeRect(px, IN.rail + 40, 120, IN.floor - IN.rail - 90); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2; x.strokeRect(px + 3, IN.rail + 43, 120, IN.floor - IN.rail - 90); }
  x.fillStyle = '#f4e8cc'; x.fillRect(0, IN.rail - 10, IN.W, 18); x.fillStyle = 'rgba(80,50,20,.35)'; x.fillRect(0, IN.rail + 8, IN.W, 4);
  x.fillStyle = '#5a3d26'; x.fillRect(0, IN.floor - 26, IN.W, 26);
  // painting between door and window
  chalkboard(x, 440, 560, 160, 230);
  // shelf with jars right of the window, coat hooks left of the door
  x.fillStyle = '#6b4526'; x.fillRect(1240, 760, 220, 16);
  for (let i = 0; i < 5; i++) { x.fillStyle = ['#d9b45a', '#e8e2d0', '#2f7a4b', '#b8673a', '#e8e2d0'][i]; x.fillRect(1255 + i * 42, 700 + (i % 2) * 14, 28, 60 - (i % 2) * 14); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(1259 + i * 42, 706 + (i % 2) * 14, 6, 40); }
  for (const hx of [40, 95]) { x.fillStyle = '#c9a04a'; x.beginPath(); x.arc(hx, 820, 9, 0, 7); x.fill(); }
  // door trim and transom
  x.fillStyle = '#f2e5c6'; x.fillRect(d.x0 - 26, d.y0 - 30, d.x1 - d.x0 + 52, d.y1 - d.y0 + 30); x.fillStyle = 'rgba(90,60,30,.3)'; x.fillRect(d.x0 - 8, d.y0 - 12, d.x1 - d.x0 + 16, d.y1 - d.y0 + 12);
  // window frame and sill
  x.fillStyle = '#f2e5c6'; archPath(x, w.x0 - 28, w.x1 + 28, w.spring, w.sill + 22); x.fill();
  x.fillStyle = '#1b2350'; archPath(x, w.x0 - 6, w.x1 + 6, w.spring, w.sill + 6); x.fill();
  x.fillStyle = '#f6ecd4'; x.fillRect(w.x0 - 46, w.sill + 4, w.x1 - w.x0 + 92, 20); x.fillStyle = 'rgba(80,50,20,.35)'; x.fillRect(w.x0 - 46, w.sill + 24, w.x1 - w.x0 + 92, 6);
  // cut the openings
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
  x.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0); winPath(x, w, 14); x.fill(); x.restore();
  // window bars drawn over the opening
  x.fillStyle = '#1b2350';
  for (const mx of [w.cx - 92, w.cx + 92]) { const top = w.spring - Math.sqrt(w.r * w.r - (mx - w.cx) ** 2) + 8; x.fillRect(mx - 7, top, 14, w.sill - top); }
  x.fillRect(w.x0, w.spring - 6, w.x1 - w.x0, 12);
  // floor: honey planks in perspective
  const vp = [750, 760];
  x.fillStyle = lin(x, 0, IN.floor, 0, IN.H, [[0, '#a8682f'], [.5, '#c88a48'], [1, '#d99c58']]); x.fillRect(0, IN.floor, IN.W, IN.H - IN.floor);
  for (let i = -30; i <= 30; i++) { const bx = 750 + i * 70; x.strokeStyle = 'rgba(70,35,10,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(vp[0] + (bx - vp[0]) * (IN.floor - vp[1]) / (IN.H - vp[1]), IN.floor); x.lineTo(bx, IN.H); x.stroke(); }
  for (let k = 0, yy = IN.floor + 14; yy < IN.H; k++, yy += 14 + k * 9) { x.strokeStyle = 'rgba(70,35,10,.18)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, yy); x.lineTo(IN.W, yy); x.stroke(); }
  for (const [px] of IN.pendants) { x.fillStyle = rad(x, px, 1560, 10, 420, [[0, `rgba(255,190,110,${.32 * L.lampK})`], [1, 'rgba(255,190,110,0)']]); x.save(); x.translate(px, 1560); x.scale(1, .35); x.translate(-px, -1560); x.fillRect(px - 450, 1100, 900, 900); x.restore(); }
  // plants
  const plant = (px, py, s) => { x.fillStyle = lin(x, 0, py - 70 * s, 0, py, [[0, '#2f3f86'], [1, '#1c2658']]); x.beginPath(); x.moveTo(px - 45 * s, py - 80 * s); x.lineTo(px + 45 * s, py - 80 * s); x.lineTo(px + 35 * s, py); x.lineTo(px - 35 * s, py); x.fill();
    for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (R() - .5) * 2.4, l = (90 + R() * 90) * s; x.fillStyle = ['#3f7f3a', '#5b9a45', '#2f6a33'][i % 3]; x.save(); x.translate(px, py - 80 * s); x.rotate(a + Math.PI / 2); x.beginPath(); x.ellipse(0, -l / 2, 16 * s, l / 2, 0, 0, 7); x.fill(); x.restore(); } };
  plant(60, IN.floor + 40, 1.0);

  // cool tint for the morning, deeper navy at night
  x.fillStyle = L.wallTint; x.globalCompositeOperation = 'source-atop'; x.fillRect(0, 0, IN.W, IN.H); x.globalCompositeOperation = 'source-over';
  // pendant lamps
  for (const [px, py] of IN.pendants) {
    x.strokeStyle = '#0e0a0c'; x.lineWidth = 3; x.beginPath(); x.moveTo(px, IN.top - 20); x.lineTo(px, py - 40); x.stroke();
    x.fillStyle = '#c9a04a'; x.beginPath(); x.moveTo(px - 16, py - 44); x.lineTo(px + 16, py - 44); x.lineTo(px + 22, py - 28); x.lineTo(px - 22, py - 28); x.fill();
  }
  return c;
}
// the street seen through the window and the door
export function interiorOutside(lookName) {
  const L = LOOK[lookName], R = mulberry(9), [c, x] = cnv(IN.W, IN.H);
  x.fillStyle = lin(x, 0, 200, 0, 1240, [[0, L.sky[0]], [.6, L.sky[1]], [1, L.sky[2]]]); x.fillRect(0, 0, IN.W, IN.H);
  const cols = ['#d9c39a', '#c9a465', '#d7b3a0', '#cfc4a6'];
  for (let bx = -40, i = 0; bx < IN.W; i++) { const bw = 240 + R() * 140, top = 470 + R() * 160, col = cols[i % 4];
    x.fillStyle = col; x.fillRect(bx, top, bw, 1240 - top); x.fillStyle = `rgba(10,15,60,${.25 + .45 * L.night})`; x.fillRect(bx, top, bw, 1240 - top);
    windowsGrid(x, R, bx + 10, top + 30, bw - 20, 1180 - top, 3, 4, col, L.outLit); x.fillStyle = `rgba(10,15,60,${.15 * L.night})`; x.fillRect(bx, top, bw, 1240 - top);
    x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(bx, top, bw, 8); bx += bw + 6; }
  x.fillStyle = lin(x, 0, 1240, 0, 1300, [[0, '#30365a'], [1, '#454b70']]); x.fillRect(0, 1240, IN.W, 60);
  x.fillStyle = lin(x, 0, 1300, 0, IN.floor, [[0, '#5c6286'], [1, '#727899']]); x.fillRect(0, 1300, IN.W, IN.floor - 1300);
  for (const lx of [560, 1120]) { x.fillStyle = '#121528'; x.fillRect(lx - 5, 900, 10, 400); x.fillStyle = '#ffd796'; x.fillRect(lx - 16, 880, 32, 34); x.fillStyle = '#121528'; x.beginPath(); x.moveTo(lx - 24, 880); x.lineTo(lx + 24, 880); x.lineTo(lx, 856); x.fill();
    x.fillStyle = rad(x, lx, 897, 0, 140, [[0, `rgba(255,200,120,${.6 * L.lampK})`], [1, 'rgba(255,200,120,0)']]); x.fillRect(lx - 140, 757, 280, 280); }
  if (L.night > .5) for (const lx of [560, 1120]) { x.fillStyle = lin(x, 0, 1240, 0, 1360, [[0, 'rgba(255,190,110,.35)'], [1, 'rgba(255,190,110,0)']]); x.fillRect(lx - 14, 1240, 28, 120); }
  return c;
}

// —— the street, seen from outside ——
function cobbles(x, R, y0, y1, x0, x1, night) {
  for (let k = 0, yy = y0; yy < y1; k++) { const h = 18 + k * 2.2, cw = h * 2.1; for (let xx = x0 - (k % 2) * cw / 2; xx < x1; xx += cw) {
    x.fillStyle = `hsl(228,${18 + R() * 6}%,${(night ? 26 : 38) + R() * 8}%)`; x.beginPath(); x.roundRect(xx + 3, yy + 3, cw - 6, h - 5, h * .35); x.fill();
    x.fillStyle = 'rgba(255,255,255,.07)'; x.beginPath(); x.roundRect(xx + 6, yy + 5, cw - 16, h * .3, 4); x.fill(); } yy += h; }
}
export function exteriorSky(lookName) {
  const L = LOOK[lookName], R = mulberry(4), [c, x] = cnv(EX.W, EX.H);
  x.fillStyle = lin(x, 0, 0, 0, 1400 + EX.oy, [[0, L.sky[0]], [.6, L.sky[1]], [1, L.sky[2]]]); x.fillRect(0, 0, EX.W, EX.H);
  if (L.night > .3) for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,255,255,${.2 + R() * .6 * L.night})`; x.beginPath(); x.arc(R() * EX.W, R() * 1300, .8 + R() * 1.6, 0, 7); x.fill(); }
  x.fillStyle = rad(x, 1750 + EX.ox, -500 + EX.oy, 0, 60, [[0, 'rgba(255,248,225,.95)'], [.6, 'rgba(255,248,225,.9)'], [1, 'rgba(255,248,225,0)']]); x.fillRect(1600 + EX.ox, -650 + EX.oy, 300, 300);
  return c;
}
export function exteriorSkyline(lookName) {
  const L = LOOK[lookName], R = mulberry(8), [c, x] = cnv(EX.W, EX.H), O = (px, py) => [px + EX.ox, py + EX.oy];
  // far rooftops with chimneys, and a few soft clouds
  x.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 7; i++) { const cx = -200 + R() * 2200, cy = -700 + R() * 600; x.beginPath(); x.ellipse(...O(cx, cy), 160 + R() * 120, 30 + R() * 16, 0, 0, 7); x.fill(); }
  x.fillStyle = '#16205a';
  for (let px = -300; px < 2100;) { const w = 120 + R() * 160, top = 200 + R() * 120; x.fillRect(...O(px, top), w, 1700); x.beginPath(); x.moveTo(...O(px - 10, top)); x.lineTo(...O(px + w / 2, top - 50 - R() * 30)); x.lineTo(...O(px + w + 10, top)); x.fill();
    if (R() < .7) x.fillRect(...O(px + w * .7, top - 70), 18, 60); if (R() < .4) { x.fillStyle = `rgba(255,190,110,${.5 * L.outLit + .1})`; x.fillRect(...O(px + w * .3, top + 30), 14, 18); x.fillStyle = '#16205a'; } px += w; }
  x.fillStyle = `rgba(10,20,70,${.15 + .15 * L.night})`; x.fillRect(0, 0, EX.W, EX.H);
  return c;
}
export function exteriorStreet(lookName) {
  const L = LOOK[lookName], R = mulberry(12), [c, x] = cnv(EX.W, EX.H), d = EX.door, w = EX.win, F = EX.fac;
  x.translate(EX.ox, EX.oy);
  // neighbours
  const bld = (x0, x1, top, col, cols, seed) => { const RR = mulberry(seed); x.fillStyle = col; x.fillRect(x0, top, x1 - x0, EX.ground - top);
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(x0 - 8, top - 18, x1 - x0 + 16, 22);
    windowsGrid(x, RR, x0 + 20, top + 50, x1 - x0 - 40, 1140 - top - 60, cols, 4, col, L.outLit);
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(x0, 1140, x1 - x0, EX.ground - 1140);
    for (let i = 0; i < cols; i++) { const sx = x0 + 30 + i * (x1 - x0 - 60) / cols; x.fillStyle = '#1a2350'; x.fillRect(sx + 20, 1300, (x1 - x0 - 60) / cols - 40, 300); x.fillStyle = `rgba(255,190,110,${RR() < .5 ? .5 * L.outLit : 0})`; x.fillRect(sx + 26, 1306, (x1 - x0 - 60) / cols - 52, 288); } };
  bld(-300, 560, 380, '#d6ad68', 3, 31); bld(1320, 2100, 270, '#dcb6a0', 4, 37);
  // the restaurant building
  x.fillStyle = lin(x, 0, 300, 0, EX.ground, [[0, '#efdcb0'], [1, '#e2c995']]); x.fillRect(F.x0, 300, F.x1 - F.x0, EX.ground - 300);
  x.fillStyle = '#f7ecd2'; x.fillRect(F.x0 - 16, 286, F.x1 - F.x0 + 32, 26); x.fillRect(F.x0 - 10, 1120, F.x1 - F.x0 + 20, 22);
  windowsGrid(x, R, F.x0 + 30, 350, F.x1 - F.x0 - 60, 620, 3, 3, '#efdcb0', .55 * L.outLit + .15);
  for (const px of [F.x0 + 4, 870, F.x1 - 26]) { x.fillStyle = '#f5e8c8'; x.fillRect(px, 1142, 22, EX.ground - 1142); }
  x.fillStyle = '#c4b08a'; x.fillRect(F.x0, EX.ground - 34, F.x1 - F.x0, 34);
  // door frame, window frame
  x.fillStyle = '#f5e8c8'; x.fillRect(d.x0 - 18, d.y0 - 24, d.x1 - d.x0 + 36, d.y1 - d.y0 + 24);
  x.fillStyle = '#f5e8c8'; archPath(x, w.x0 - 22, w.x1 + 22, w.spring, w.sill + 20); x.fill();
  x.fillStyle = '#1b2350'; archPath(x, w.x0 - 4, w.x1 + 4, w.spring, w.sill + 4); x.fill();
  x.fillStyle = '#f8eed6'; x.fillRect(w.x0 - 34, w.sill + 2, w.x1 - w.x0 + 68, 18);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0); winPath(x, w, 10); x.fill(); x.restore();
  x.fillStyle = '#1b2350'; for (const mx of [w.cx - 62, w.cx + 62]) { const top = w.spring - Math.sqrt(w.r * w.r - (mx - w.cx) ** 2) + 6; x.fillRect(mx - 5, top, 10, w.sill - top); } x.fillRect(w.x0, w.spring - 4, w.x1 - w.x0, 8);
  // awning
  const ay0 = 1150, ay1 = 1236, ax0 = F.x0 + 10, ax1 = F.x1 - 10, n = 14, sw = (ax1 - ax0) / n;
  for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? '#f1e6cb' : '#1d2c70'; x.beginPath(); x.moveTo(ax0 + i * sw + 8, ay0); x.lineTo(ax0 + (i + 1) * sw + 8, ay0); x.lineTo(ax0 + (i + 1) * sw, ay1); x.arc(ax0 + i * sw + sw / 2, ay1, sw / 2, 0, Math.PI); x.closePath(); x.fill(); }
  x.fillStyle = lin(x, 0, ay0, 0, ay1 + 20, [[0, 'rgba(255,255,255,.18)'], [1, 'rgba(0,0,30,.25)']]); x.fillRect(ax0, ay0, ax1 - ax0 + 8, ay1 - ay0 + 20);
  x.fillStyle = 'rgba(0,0,20,.25)'; x.fillRect(ax0, ay1 + 18, ax1 - ax0, 30);
  // potted trees
  const tree = (tx) => { x.fillStyle = '#26347a'; x.beginPath(); x.moveTo(tx - 34, 1600); x.lineTo(tx + 34, 1600); x.lineTo(tx + 26, 1666); x.lineTo(tx - 26, 1666); x.fill(); x.fillStyle = '#5a4330'; x.fillRect(tx - 4, 1440, 8, 160);
    for (let i = 0; i < 16; i++) { x.fillStyle = ['#3f6f3a', '#57894a', '#6e9a4f'][i % 3]; x.beginPath(); x.arc(tx + (R() - .5) * 90, 1420 + (R() - .5) * 90, 26 + R() * 16, 0, 7); x.fill(); } };
  tree(588); tree(1318);
  // the sign above the awning
  { const sx0 = 640, sx1 = 1240, sy0 = 985, sy1 = 1105;
    x.fillStyle = 'rgba(0,0,20,.35)'; x.fillRect(sx0 + 8, sy0 + 10, sx1 - sx0, sy1 - sy0);
    x.fillStyle = '#c9a04a'; x.beginPath(); x.roundRect(sx0 - 8, sy0 - 8, sx1 - sx0 + 16, sy1 - sy0 + 16, 12); x.fill();
    x.fillStyle = lin(x, 0, sy0, 0, sy1, [[0, '#1e2f7c'], [1, '#14205a']]); x.beginPath(); x.roundRect(sx0, sy0, sx1 - sx0, sy1 - sy0, 8); x.fill();
    x.fillStyle = '#f2c46e'; x.font = '74px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RESTAURANT', (sx0 + sx1) / 2, sy0 + 50);
    x.font = '26px "Fredoka"'; x.fillStyle = '#e9dcc0'; x.fillText('· ÉTTEREM ·', (sx0 + sx1) / 2, sy0 + 95); }
  // a chalkboard menu on the pavement
  { const bx = 1400, by = 1560; x.fillStyle = '#7a4e28'; x.beginPath(); x.moveTo(bx - 70, 1726); x.lineTo(bx - 52, by - 10); x.lineTo(bx + 52, by - 10); x.lineTo(bx + 70, 1726); x.lineTo(bx + 60, 1726); x.lineTo(bx + 44, by); x.lineTo(bx - 44, by); x.lineTo(bx - 60, 1726); x.fill();
    chalkboard(x, bx - 44, by, 88, 120, '#7a4e28'); }
  // lanterns by the door
  for (const [lx, ly] of EX.lanterns) { x.fillStyle = '#151826'; x.fillRect(lx - 3, ly - 50, 6, 20); x.fillRect(lx - 20, ly - 34, 40, 8); x.fillStyle = '#ffd796'; x.fillRect(lx - 14, ly - 26, 28, 40); x.fillStyle = '#151826'; x.fillRect(lx - 16, ly + 14, 32, 6); }
  // pavement, kerb, road
  x.fillStyle = lin(x, 0, EX.ground, 0, 1790, [[0, '#6e7496'], [1, '#5d6386']]); x.fillRect(-300, EX.ground, 2400, 130);
  for (let px = -300; px < 2100; px += 120) { x.strokeStyle = 'rgba(20,25,60,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px, EX.ground); x.lineTo(px - 20, 1790); x.stroke(); }
  x.fillStyle = '#9095b0'; x.fillRect(-300, 1784, 2400, 16); x.fillStyle = '#2b3052'; x.fillRect(-300, 1800, 2400, 700);
  cobbles(x, R, 1806, 2500, -300, 2100, L.night > .5);
  // street lamps
  for (const [lx, ly] of EX.lamps) { x.fillStyle = '#121528'; x.fillRect(lx - 8, ly + 40, 16, EX.feet - ly - 40); x.fillRect(lx - 22, EX.feet - 40, 44, 40); x.fillRect(lx - 14, ly + 30, 28, 14);
    x.fillStyle = '#ffd796'; x.beginPath(); x.moveTo(lx - 26, ly - 30); x.lineTo(lx + 26, ly - 30); x.lineTo(lx + 18, ly + 30); x.lineTo(lx - 18, ly + 30); x.fill();
    x.fillStyle = '#121528'; x.beginPath(); x.moveTo(lx - 40, ly - 30); x.lineTo(lx + 40, ly - 30); x.lineTo(lx, ly - 70); x.fill(); x.fillRect(lx - 3, ly - 88, 6, 20); }
  // night: wash the whole set in navy, keep the lit things lit
  if (L.night > 0) { x.fillStyle = `rgba(12,20,75,${.42 * L.night})`; x.globalCompositeOperation = 'multiply'; x.fillRect(-300, -1000, 2400, 3500); x.globalCompositeOperation = 'source-over'; }
  else { x.fillStyle = 'rgba(40,60,150,.2)'; x.globalCompositeOperation = 'multiply'; x.fillRect(-300, -1000, 2400, 3500); x.globalCompositeOperation = 'source-over'; }
  return c;
}
// the warm room as seen through the glass from the street (characters are drawn on top by the caller)
export function insideFromStreet(lookName) {
  const [c, x] = cnv(EX.W, EX.H); x.translate(EX.ox, EX.oy);
  x.fillStyle = lin(x, 0, 1150, 0, 1660, [[0, '#2a1d38'], [.45, '#7a4a32'], [1, '#c98b4e']]); x.fillRect(560, 1100, 760, 600);
  x.fillStyle = '#1d2a66'; x.fillRect(560, 1150, 760, 230); x.fillStyle = '#e6d2a6'; x.fillRect(560, 1380, 760, 160);
  x.fillStyle = '#6b4526'; x.fillRect(1180, 1300, 120, 10); for (let i = 0; i < 3; i++) { x.fillStyle = ['#d9b45a', '#2f7a4b', '#e8e2d0'][i]; x.fillRect(1190 + i * 36, 1262, 22, 38); }
  x.fillStyle = '#a8682f'; x.fillRect(560, 1540, 760, 160);
  for (const [px, py] of [[1000, 1250], [1180, 1240], [720, 1245]]) { x.fillStyle = rad(x, px, py, 0, 200, [[0, 'rgba(255,190,110,.55)'], [1, 'rgba(255,190,110,0)']]); x.fillRect(px - 200, py - 200, 400, 400); x.fillStyle = '#ffe2a8'; x.beginPath(); x.arc(px, py, 16, 0, 7); x.fill(); x.strokeStyle = '#111'; x.lineWidth = 2; x.beginPath(); x.moveTo(px, 1100); x.lineTo(px, py - 16); x.stroke(); }
  return c;
}

// —— the owner's flat: a desk with his savings and a sketch of the dream, and his bed by the window ——
export const HOME = { floor: 1500, desk: [200, 600, 1415], jar: [556, 1415], sketch: [240, 860, 560, 1150], bed: [820, 1380], pillow: [1320, 1300], clock: [1305, 1258], win: [980, 1260, 640, 1040] };
export function homeSet(lookName) {
  const night = lookName === 'night', R = mulberry(17), [c, x] = cnv(1500, 2500), w = HOME.win;
  x.fillStyle = lin(x, 0, 0, 0, HOME.floor, [[0, night ? '#151d4a' : '#2a3a7a'], [1, night ? '#24306a' : '#3d4f92']]); x.fillRect(0, 0, 1500, HOME.floor);
  x.fillStyle = 'rgba(255,255,255,.035)'; for (let yy = 40; yy < HOME.floor; yy += 80) for (let xx = (yy / 80 % 2) * 40; xx < 1500; xx += 80) { x.beginPath(); x.arc(xx, yy, 6, 0, 7); x.fill(); }
  x.fillStyle = '#e6d6b2'; x.fillRect(0, HOME.floor - 40, 1500, 40);
  x.fillStyle = lin(x, 0, HOME.floor, 0, 2500, [[0, '#7a4a24'], [1, '#a8682f']]); x.fillRect(0, HOME.floor, 1500, 1000);
  for (let yy = HOME.floor + 20, k = 0; yy < 2500; k++, yy += 20 + k * 8) { x.fillStyle = 'rgba(40,20,5,.25)'; x.fillRect(0, yy, 1500, 2); }
  // window with the sky
  x.fillStyle = '#e6d6b2'; x.fillRect(w[0] - 24, w[2] - 24, w[1] - w[0] + 48, w[3] - w[2] + 48);
  x.fillStyle = lin(x, 0, w[2], 0, w[3], night ? [[0, '#050b2c'], [1, '#14246a']] : [[0, '#3b5bb0'], [.7, '#9db3e6'], [1, '#f2c7a2']]); x.fillRect(w[0], w[2], w[1] - w[0], w[3] - w[2]);
  if (night) { for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(255,255,255,${.3 + R() * .6})`; x.beginPath(); x.arc(w[0] + R() * (w[1] - w[0]), w[2] + R() * 250, 1 + R() * 1.5, 0, 7); x.fill(); } x.fillStyle = '#fff6dc'; x.beginPath(); x.arc(w[1] - 70, w[2] + 80, 26, 0, 7); x.fill(); }
  x.fillStyle = night ? '#0d1540' : '#26346e'; for (let i = 0; i < 4; i++) { const bx = w[0] + i * 75, bh = 60 + R() * 90; x.fillRect(bx, w[3] - bh, 70, bh); }
  x.fillStyle = '#e6d6b2'; x.fillRect((w[0] + w[1]) / 2 - 6, w[2], 12, w[3] - w[2]); x.fillRect(w[0], (w[2] + w[3]) / 2 - 6, w[1] - w[0], 12);
  x.fillStyle = '#f2e6c8'; x.fillRect(w[0] - 40, w[3] + 20, w[1] - w[0] + 80, 16);
  // the sketch of the restaurant pinned to the wall
  { const [a, b, cc, d] = HOME.sketch; x.fillStyle = '#f4ecd8'; x.save(); x.translate((a + cc) / 2, (b + d) / 2); x.rotate(-.025); x.translate(-(a + cc) / 2, -(b + d) / 2); x.fillRect(a, b, cc - a, d - b);
    x.strokeStyle = '#4a4a5a'; x.lineWidth = 3; const cx = (a + cc) / 2;
    x.strokeRect(a + 40, b + 70, cc - a - 80, d - b - 90); x.strokeRect(a + 70, b + 20, cc - a - 140, 40);
    x.fillStyle = '#4a4a5a'; x.font = '26px "Lilita One"'; x.textAlign = 'center'; x.fillText('RESTAURANT', cx, b + 50);
    for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(a + 45 + i * 30, b + 75); x.lineTo(a + 40 + i * 30, b + 105); x.stroke(); }
    x.strokeRect(a + 60, b + 130, 60, 130); x.beginPath(); x.moveTo(a + 150, d - 20); x.lineTo(a + 150, b + 180); x.arc(a + 210, b + 180, 60, Math.PI, 0); x.lineTo(a + 270, d - 20); x.stroke();
    x.fillStyle = '#c4566a'; x.beginPath(); x.moveTo(cc - 34, b + 14); x.bezierCurveTo(cc - 50, b - 2, cc - 70, b + 20, cc - 34, b + 40); x.bezierCurveTo(cc + 2, b + 20, cc - 18, b - 2, cc - 34, b + 14); x.fill();
    x.restore(); x.fillStyle = '#c4364a'; x.beginPath(); x.arc((a + cc) / 2, b + 6, 9, 0, 7); x.fill(); }
  // desk
  { const [a, b, top] = HOME.desk; x.fillStyle = '#5a3418'; x.fillRect(a + 10, top, 20, HOME.floor - top); x.fillRect(b - 30, top, 20, HOME.floor - top); x.fillStyle = lin(x, 0, top - 18, 0, top + 6, [[0, '#b47a40'], [1, '#7a4a24']]); x.fillRect(a - 10, top - 18, b - a + 20, 24);
    x.fillStyle = '#2a2a33'; x.fillRect(a + 40, top - 26, 50, 8); x.fillStyle = '#d9b45a'; x.fillRect(a + 52, top - 120, 8, 100); x.beginPath(); x.moveTo(a + 30, top - 120); x.lineTo(a + 100, top - 120); x.lineTo(a + 82, top - 170); x.lineTo(a + 46, top - 170); x.fill(); }
  // bed and nightstand
  { const [a, b] = HOME.bed; x.fillStyle = '#5a3418'; x.fillRect(b - 10, 1120, 46, HOME.floor - 1120); x.fillRect(a, 1330, 22, HOME.floor - 1330); x.fillStyle = lin(x, 0, 1330, 0, 1420, [[0, '#7a4a24'], [1, '#5a3418']]); x.fillRect(a, 1380, b - a, 60);
    x.fillStyle = '#efe8da'; x.beginPath(); x.roundRect(a + 10, 1325, b - a - 20, 60, 20); x.fill();
    x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(HOME.pillow[0] + 10, HOME.pillow[1] + 12, 62, 26, 0, 0, 7); x.fill();
    x.fillStyle = '#6b4526'; x.fillRect(1405, 1350, 90, 150); x.fillStyle = '#7a5030'; x.fillRect(1400, 1342, 100, 14); x.fillStyle = '#5c9a45'; x.beginPath(); x.arc(1450, 1320, 22, 0, 7); x.fill(); x.fillStyle = '#2b3b7a'; x.fillRect(1436, 1322, 28, 22); }
  if (night) { x.fillStyle = 'rgba(5,8,40,.3)'; x.globalCompositeOperation = 'multiply'; x.fillRect(0, 0, 1500, 2500); x.globalCompositeOperation = 'source-over'; }
  return c;
}
export function blanket(x, a, b, sitUp) {   // the blanket over the sleeper (drawn after him)
  x.fillStyle = lin(x, 0, 1300, 0, 1400, [[0, '#3a5ad0'], [1, '#22348a']]); x.beginPath(); x.moveTo(a + 14, 1400); x.lineTo(a + 14, 1330);
  x.bezierCurveTo(a + 200, 1300 - 10 * sitUp, b - 300, 1295, b - 150 - 40 * sitUp, 1320 + 20 * sitUp); x.lineTo(b - 120 - 40 * sitUp, 1400); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 4; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(a + i * 80, 1318); x.lineTo(a + i * 80, 1398); x.stroke(); }
}

// —— the kitchen behind the counter ——
export const KIT = { counterTop: 1385, board: [630, 810], stove: [1060, 1340], pot: [1200, 1220] };
export function kitchenSet() {
  const R = mulberry(23), [c, x] = cnv(1500, 2500);
  x.fillStyle = '#efe9dc'; x.fillRect(0, 0, 1500, 1500);
  for (let yy = 0; yy < 1500; yy += 60) for (let xx = (yy / 60 % 2) * 30; xx < 1500; xx += 60) { x.strokeStyle = 'rgba(120,130,170,.25)'; x.lineWidth = 2; x.strokeRect(xx, yy, 60, 60); if (R() < .08) { x.fillStyle = 'rgba(40,70,170,.35)'; x.fillRect(xx + 4, yy + 4, 52, 52); } }
  x.fillStyle = lin(x, 0, 0, 0, 1500, [[0, 'rgba(255,190,110,.0)'], [1, 'rgba(255,190,110,.18)']]); x.fillRect(0, 0, 1500, 1500);
  // shelves with jars and pans
  for (const sy of [760, 980]) { x.fillStyle = '#6b4526'; x.fillRect(120, sy, 760, 18);
    for (let i = 0; i < 9; i++) { const jx = 150 + i * 80; x.fillStyle = ['#d9b45a', '#c8743a', '#5c9a45', '#e8e2d0', '#b8673a'][i % 5]; x.beginPath(); x.roundRect(jx, sy - 70 + (i % 3) * 8, 46, 70 - (i % 3) * 8, 8); x.fill(); x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(jx + 6, sy - 60 + (i % 3) * 8, 8, 40); } }
  for (let i = 0; i < 4; i++) { x.strokeStyle = '#2a2a33'; x.lineWidth = 6; x.beginPath(); x.moveTo(980 + i * 90, 560); x.lineTo(980 + i * 90, 640); x.stroke(); x.fillStyle = '#9aa0ae'; x.beginPath(); x.arc(980 + i * 90, 680, 34 + i * 4, 0, 7); x.fill(); x.fillStyle = '#6a7080'; x.beginPath(); x.arc(980 + i * 90, 680, 22 + i * 4, 0, 7); x.fill(); }
  x.fillStyle = '#9aa0ae'; x.beginPath(); x.moveTo(1010, 860); x.lineTo(1390, 860); x.lineTo(1340, 960); x.lineTo(1060, 960); x.fill();
  x.fillStyle = '#2a2a33'; x.fillRect(1050, 1240, 300, 30);
  x.fillStyle = lin(x, 1120, 0, 1280, 0, [[0, '#6a7080'], [.5, '#b8bdc8'], [1, '#5a6070']]); x.beginPath(); x.roundRect(1120, 1140, 160, 100, 10); x.fill(); x.fillStyle = '#4a5060'; x.fillRect(1110, 1132, 180, 14);
  x.fillStyle = 'rgba(255,120,40,.6)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(1140 + i * 30, 1238, 10, 6, 0, 0, 7); x.fill(); }
  x.fillStyle = lin(x, 0, 1500, 0, 2500, [[0, '#7a4a24'], [1, '#a8682f']]); x.fillRect(0, 1500, 1500, 1000);
  return c;
}
