// Painted sets for The Lemonade Sign, pre-rendered once into canvases (seeded, so every worker paints the same pictures).
// One street: a family house behind a picket fence, the pavement where the boy's stand is, the road in front.
// 60-30-10: navy and blue (sky, roof, trees, pavement, road) 60 · cream and wood (house walls, fence, stand, paper) 30 · gold (sun, lemons, lemonade, coins) 10.
import { mulberry } from '/core/lib.js';

export const WW = 1700, WH = 2700;
export const G = { wallTop: 1020, base: 1490, house: [380, 1220], door: { x0: 520, x1: 620, y0: 1300, y1: 1490 }, fenceY: 1600, fenceH: 78,
  gate: [596, 692], walkTop: 1600, curb: 1822, road: [1838, 2210], tree: [1360, 1585] };
const LOOK = {
  day:  { sky: ['#17337f', '#2f5fb8', '#79a6e6'], wall: '#b9c7e8', wallLo: '#9aaad6', roof: '#1d2a62', tree: ['#1c4f66', '#2b6c7e', '#3f8a92'], lawn: ['#235a68', '#2f7180'],
          walk: '#e0d1b2', walkHi: '#ece0c6', road: '#18214d', tint: null },
  gold: { sky: ['#1a3078', '#3c5fae', '#e6b98a'], wall: '#c3c2df', wallLo: '#a3a6cf', roof: '#1f2a5e', tree: ['#1b4660', '#2a6274', '#4b8486'], lawn: ['#22505f', '#2d6676'],
          walk: '#dfc8a2', walkHi: '#ead9b8', road: '#19204a', tint: 'rgba(255,170,90,.10)' },
  dusk: { sky: ['#0b1440', '#1d2c6e', '#7a6aa0'], wall: '#5a6494', wallLo: '#475282', roof: '#111a44', tree: ['#10283f', '#173a52', '#22505e'], lawn: ['#132f40', '#1a3d4e'],
          walk: '#7d7590', walkHi: '#8d86a0', road: '#0d1434', tint: 'rgba(10,16,60,.25)' },
};
function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
const lin = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
export function glowSprite(col = '255,190,110') {
  const [c, x] = cnv(256, 256); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(.25, `rgba(${col},.45)`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return c;
}
// the whole setting sits a step darker than the characters and the stand, so they stand out
function dim(x, look) { x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(6,10,40,${look === 'dusk' ? .14 : .3})`; x.fillRect(0, 0, WW, WH); x.restore(); }
function blob(x, cx, cy, r, n, rnd) { x.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r * (.82 + .3 * rnd()); x[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .85); } x.closePath(); x.fill(); }
function canopy(x, cx, cy, r, cols, seed) {   // a round tree crown: dark mass, mid clumps, a few lit clumps on the sun side
  const rnd = mulberry(seed);
  x.fillStyle = cols[0]; for (let i = 0; i < 9; i++) blob(x, cx + (rnd() - .5) * r * 1.3, cy + (rnd() - .5) * r * .9, r * (.45 + .2 * rnd()), 14, rnd);
  x.fillStyle = cols[1]; for (let i = 0; i < 8; i++) blob(x, cx - r * .15 + (rnd() - .5) * r * 1.1, cy - r * .15 + (rnd() - .5) * r * .7, r * (.3 + .15 * rnd()), 12, rnd);
  x.fillStyle = cols[2]; for (let i = 0; i < 6; i++) blob(x, cx - r * .35 + (rnd() - .5) * r * .6, cy - r * .35 + (rnd() - .5) * r * .4, r * (.16 + .1 * rnd()), 10, rnd);
}

// the sky and everything far away (neighbours' roofs, far trees), drawn behind the house
export function skySet(look) {
  const L = LOOK[look], [c, x] = cnv(WW, WH), rnd = mulberry(7);
  x.fillStyle = lin(x, 0, 0, 0, 1450, [[0, L.sky[0]], [.6, L.sky[1]], [1, L.sky[2]]]); x.fillRect(0, 0, WW, WH);
  if (look !== 'dusk') { x.fillStyle = look === 'gold' ? 'rgba(255,225,200,.5)' : 'rgba(240,246,255,.55)';
    for (const [cx, cy, s] of [[260, 620, 1], [1280, 470, .8], [820, 760, .6]]) for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(cx + (i - 2.5) * 46 * s, cy - Math.sin(i / 5 * Math.PI) * 34 * s, 62 * s, 34 * s, 0, 0, 7); x.fill(); } }
  else { x.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) { x.globalAlpha = .3 + .6 * rnd(); x.beginPath(); x.arc(rnd() * WW, rnd() * 900, 1 + rnd() * 1.6, 0, 7); x.fill(); } x.globalAlpha = 1; }
  // far trees and roofs on the horizon
  for (let i = 0; i < 14; i++) { x.fillStyle = L.tree[0]; x.globalAlpha = .55; blob(x, i * 130 + rnd() * 60, 1330 + rnd() * 40, 90 + rnd() * 50, 12, rnd); }
  x.globalAlpha = 1;
  for (const [x0, w, h] of [[-40, 300, 260], [1260, 330, 300], [1560, 240, 220]]) {
    x.fillStyle = L.roof; x.beginPath(); x.moveTo(x0 - 20, 1490 - h + 130); x.lineTo(x0 + w / 2, 1490 - h); x.lineTo(x0 + w + 20, 1490 - h + 130); x.fill();
    x.fillStyle = look === 'dusk' ? '#2b3a74' : '#3b55a0'; x.fillRect(x0, 1490 - h + 120, w, h - 120);
    x.fillStyle = look === 'dusk' ? '#f0c060' : '#1b2a62'; for (const wx of [x0 + 40, x0 + w - 100]) x.fillRect(wx, 1490 - h + 170, 60, 80);
  }
  dim(x, look);
  return c;
}

// the house, the front garden, the fence (without its gate), the pavement and the road
export function streetSet(look) {
  const L = LOOK[look], [c, x] = cnv(WW, WH), rnd = mulberry(23), [hx0, hx1] = G.house, d = G.door;
  // the tree behind the fence (trunk here, crown drawn over the top later)
  x.fillStyle = look === 'dusk' ? '#2a2030' : '#5a3d2a'; x.beginPath(); x.moveTo(G.tree[0] - 26, G.tree[1]); x.quadraticCurveTo(G.tree[0] - 12, 1300, G.tree[0] - 40, 1080); x.lineTo(G.tree[0] + 30, 1080); x.quadraticCurveTo(G.tree[0] + 14, 1300, G.tree[0] + 30, G.tree[1]); x.fill();
  // house walls
  x.fillStyle = lin(x, hx0, 0, hx1, 0, [[0, L.wall], [1, L.wallLo]]); x.fillRect(hx0, G.wallTop, hx1 - hx0, G.base - G.wallTop);
  x.fillStyle = 'rgba(0,0,30,.18)'; x.fillRect(hx0, G.wallTop, hx1 - hx0, 26);
  x.fillStyle = L.wallLo; x.fillRect(hx0 - 6, G.base - 46, hx1 - hx0 + 12, 46);   // plinth
  // roof (hipped) with a chimney
  x.fillStyle = L.roof; x.beginPath(); x.moveTo(hx0 - 50, G.wallTop + 4); x.lineTo(hx0 + 260, 790); x.lineTo(hx1 - 260, 790); x.lineTo(hx1 + 50, G.wallTop + 4); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 3; for (let yy = 820; yy < G.wallTop; yy += 30) { x.beginPath(); x.moveTo(hx0 - 50 + (G.wallTop - yy) * 0, yy); x.lineTo(hx1 + 50, yy); x.stroke(); }
  x.fillStyle = L.roof; x.beginPath(); x.moveTo(hx0 - 50, G.wallTop + 4); x.lineTo(hx0 + 260, 790); x.lineTo(hx0 + 300, 790); x.lineTo(hx0 - 20, G.wallTop + 4); x.fill();
  x.fillStyle = L.wallLo; x.fillRect(hx1 - 330, 720, 60, 110); x.fillStyle = L.roof; x.fillRect(hx1 - 338, 712, 76, 16);
  x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(hx0 - 50, G.wallTop + 4, hx1 - hx0 + 100, 10);
  // windows with shutters and window boxes
  for (const wx of [720, 980]) {
    const wy = 1140, ww = 130, wh = 180, lit = look === 'dusk';
    x.fillStyle = '#26346f'; x.fillRect(wx - 44, wy - 6, 40, wh + 12); x.fillRect(wx + ww + 4, wy - 6, 40, wh + 12);
    x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 3; for (let k = 0; k < 9; k++) for (const sx of [wx - 44, wx + ww + 4]) { x.beginPath(); x.moveTo(sx + 6, wy + 12 + k * 20); x.lineTo(sx + 34, wy + 12 + k * 20); x.stroke(); }
    x.fillStyle = '#f7f0de'; x.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
    x.fillStyle = lit ? lin(x, 0, wy, 0, wy + wh, [[0, '#ffd890'], [1, '#e9a654']]) : lin(x, 0, wy, 0, wy + wh, [[0, '#4e70b8'], [1, '#1d2d68']]); x.fillRect(wx, wy, ww, wh);
    if (!lit) { x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(wx + 10, wy + wh - 20); x.lineTo(wx + 60, wy + 10); x.lineTo(wx + 85, wy + 10); x.lineTo(wx + 35, wy + wh - 20); x.fill(); }
    x.fillStyle = '#f7f0de'; x.fillRect(wx + ww / 2 - 4, wy, 8, wh); x.fillRect(wx, wy + wh * .42, ww, 8);
    x.fillStyle = '#8a5a34'; x.fillRect(wx - 12, wy + wh + 6, ww + 24, 26);
    x.fillStyle = L.tree[1]; for (let k = 0; k < 7; k++) { x.beginPath(); x.arc(wx - 4 + k * 23, wy + wh + 4, 14, 0, 7); x.fill(); }
  }
  // the front door with a step, a little porch lamp beside it
  x.fillStyle = '#f7f0de'; x.fillRect(d.x0 - 12, d.y0 - 12, d.x1 - d.x0 + 24, d.y1 - d.y0 + 12);
  x.fillStyle = L.wallLo; x.fillRect(d.x0 - 26, d.y1 - 8, d.x1 - d.x0 + 52, 14);
  x.fillStyle = '#c9a04a'; x.fillRect(d.x1 + 26, d.y0 + 30, 16, 30); x.fillStyle = look === 'dusk' ? '#ffe0a0' : '#f7f0de'; x.fillRect(d.x1 + 28, d.y0 + 36, 12, 18);
  // the front garden: lawn, the stone path from the door to the gate
  x.fillStyle = lin(x, 0, G.base, 0, G.fenceY, [[0, L.lawn[0]], [1, L.lawn[1]]]); x.fillRect(0, G.base, WW, G.fenceY - G.base + 4);
  x.fillStyle = L.tree[2]; x.globalAlpha = .5; for (let i = 0; i < 260; i++) { const gx = rnd() * WW, gy = G.base + 6 + rnd() * (G.fenceY - G.base - 6); x.fillRect(gx, gy, 2, -6 - rnd() * 6); } x.globalAlpha = 1;
  x.fillStyle = L.walkHi; for (let k = 0; k < 4; k++) { const t = k / 3, px = 570 + (644 - 570) * t, py = G.base + 14 + t * 80; x.beginPath(); x.ellipse(px, py, 34 + t * 8, 9 + t * 2, 0, 0, 7); x.fill(); }
  // hedges and a few rose-free shrubs along the house
  x.fillStyle = L.tree[1]; for (const [bx, r] of [[430, 46], [470, 38], [1130, 52], [1180, 40]]) { x.beginPath(); x.arc(bx, G.base - 6, r, Math.PI, 0); x.fill(); }
  // the pavement: big slabs, a little perspective in the joints
  x.fillStyle = L.walk; x.fillRect(0, G.walkTop, WW, G.curb - G.walkTop);
  x.strokeStyle = 'rgba(90,60,30,.22)'; x.lineWidth = 3;
  for (const yy of [1670, 1745]) { x.beginPath(); x.moveTo(0, yy); x.lineTo(WW, yy); x.stroke(); }
  for (let i = -6; i < 20; i++) { const bx = i * 140; x.beginPath(); x.moveTo(bx + 30, G.walkTop); x.lineTo(bx - 10, G.curb); x.stroke(); }
  x.fillStyle = L.walkHi; x.fillRect(0, G.curb - 4, WW, 18); x.fillStyle = 'rgba(0,0,30,.35)'; x.fillRect(0, G.curb + 12, WW, 6);
  // the road, a dashed middle line, the far kerb and a hedge beyond
  x.fillStyle = L.road; x.fillRect(0, G.road[0], WW, G.road[1] - G.road[0]);
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(255,255,255,${.02 + rnd() * .04})`; x.fillRect(rnd() * WW, G.road[0] + rnd() * (G.road[1] - G.road[0]), 3, 3); }
  x.fillStyle = look === 'dusk' ? '#8a8496' : '#e9dcc0'; for (let i = 0; i < 12; i++) x.fillRect(i * 170 + 20, 2020, 100, 12);
  x.fillStyle = '#56649a'; x.fillRect(0, G.road[1], WW, 20); x.fillStyle = '#44528a'; x.fillRect(0, G.road[1] + 20, WW, 200);
  x.fillStyle = L.tree[0]; for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(i * 115 + 40, G.road[1] + 300, 95, Math.PI, 0); x.fill(); } x.fillRect(0, G.road[1] + 300, WW, 400);
  if (L.tint) { x.fillStyle = L.tint; x.fillRect(0, 0, WW, WH); }
  dim(x, look);
  return c;
}
// the fence in front of the garden (the gate is drawn live, it opens)
export function fenceSet(look) {
  const L = LOOK[look], [c, x] = cnv(WW, WH), fy = G.fenceY, fh = G.fenceH, col = look === 'dusk' ? '#a49eb0' : '#efe4cb', shade = look === 'dusk' ? '#7d7890' : '#cdbd9a';
  x.fillStyle = shade; x.fillRect(0, fy - fh * .72, WW, 10); x.fillRect(0, fy - fh * .28, WW, 10);
  for (let px = 8; px < WW; px += 34) { if (px > G.gate[0] - 20 && px < G.gate[1] + 4) continue;
    x.fillStyle = col; x.beginPath(); x.moveTo(px, fy); x.lineTo(px, fy - fh + 10); x.lineTo(px + 11, fy - fh); x.lineTo(px + 22, fy - fh + 10); x.lineTo(px + 22, fy); x.closePath(); x.fill();
    x.fillStyle = 'rgba(0,0,40,.12)'; x.fillRect(px + 15, fy - fh + 10, 7, fh - 10); }
  for (const gx of [G.gate[0] - 14, G.gate[1] + 2]) { x.fillStyle = shade; x.fillRect(gx, fy - fh - 14, 14, fh + 14); x.fillStyle = col; x.fillRect(gx - 2, fy - fh - 20, 18, 8); }
  if (L.tint) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = L.tint; x.fillRect(0, 0, WW, WH); }
  dim(x, look);
  return c;
}
// the tree's crown, drawn over everything behind the fence
export function crownSet(look) {
  const L = LOOK[look], [c, x] = cnv(WW, WH);
  canopy(x, G.tree[0], 980, 260, L.tree, 11);
  if (L.tint) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = L.tint; x.fillRect(0, 0, WW, WH); }
  dim(x, look);
  return c;
}
// top-down close-ups: a wooden table (for the writing and the painting)
export function deskSet(w, h) {
  const [c, x] = cnv(w, h), rnd = mulberry(5);
  x.fillStyle = lin(x, 0, 0, w, h, [[0, '#a9774c'], [1, '#8a5a34']]); x.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { const yy = i / 26 * h; x.fillStyle = `rgba(60,30,10,${.08 + rnd() * .1})`; x.fillRect(0, yy, w, 3 + rnd() * 4); }
  x.strokeStyle = 'rgba(40,20,5,.35)'; x.lineWidth = 3; for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(0, i * h / 5 + rnd() * 20); x.lineTo(w, i * h / 5 + rnd() * 20); x.stroke(); }
  const v = x.createRadialGradient(w / 2, h / 2, h * .2, w / 2, h / 2, h * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,10,40,.45)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
  return c;
}
