// Painted set for The Popcorn Choice: a cinema lobby, pre-rendered once (seeded, so every worker paints the same picture).
// The concession counter with its menu board of three sizes, a popcorn machine, posters, the door into screen 1, a patterned carpet.
// 60-30-10: navy (walls, carpet, ceiling) 60 · cream and wood (counter, board, frames) 30 · gold (popcorn, bulbs, lights) 10.
// The room sits a step darker than the counter, the board and the characters, so they lead.
import { mulberry } from '/core/lib.js';

export const WW = 1500, WH = 2600;
export const L = { floor: 1560, counter: { x0: 300, x1: 1180, top: 1420, front: 1560 }, board: { x0: 380, x1: 1120, y0: 760, y1: 1130 }, panels: [505, 750, 995],
  machine: { x0: 1030, x1: 1170, y0: 1215 }, register: [735, 1420], door: { x0: 1265, x1: 1445, y0: 1185, y1: 1560 } };
export const NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc';
function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
const lin = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
export function glowSprite(col = '255,190,110') {
  const [c, x] = cnv(256, 256); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(.25, `rgba(${col},.45)`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return c;
}
// a popcorn bucket: navy and cream stripes, a gold dome of popcorn; base centre (x, y), height h (it holds more as it gets bigger)
export function bucket(x, cx, y, h, fill = 1, seed = 1) {
  const tw = h * .42, bw = h * .3, top = y - h, rnd = mulberry(seed);
  if (fill > 0) { const dome = h * .32 * fill; for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI, r = rnd(), px = cx + Math.cos(a) * tw * .95 * r, py = top - Math.sin(a) * dome * (1 - r * .5) + 2;
    x.fillStyle = rnd() > .3 ? '#f7dd8a' : GOLD; x.beginPath(); x.arc(px, py, h * (.075 + .04 * rnd()), 0, 7); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(cx - tw * .3, top - dome * .6, h * .05, 0, 7); x.fill(); }
  x.save(); x.beginPath(); x.moveTo(cx - tw, top); x.lineTo(cx + tw, top); x.lineTo(cx + bw, y); x.lineTo(cx - bw, y); x.closePath(); x.clip();
  for (let i = -4; i <= 4; i++) { x.fillStyle = i % 2 ? CREAM : '#26346f'; x.beginPath(); x.moveTo(cx + i * tw / 4.5, top); x.lineTo(cx + (i + 1) * tw / 4.5, top); x.lineTo(cx + (i + 1) * bw / 4.5, y); x.lineTo(cx + i * bw / 4.5, y); x.fill(); }
  x.fillStyle = 'rgba(0,0,30,.18)'; x.fillRect(cx, top, tw, h); x.restore();
  x.fillStyle = CREAM; x.beginPath(); x.ellipse(cx, top, tw, h * .045, 0, 0, 7); x.fill();
}
export function lobby() {
  const [c, x] = cnv(WW, WH), R = mulberry(23), F = L.floor;
  // the back wall: deep navy with soft vertical panels and a dado
  x.fillStyle = lin(x, 0, 0, 0, F, [[0, '#0f1638'], [.5, '#1d2a64'], [1, '#26346f']]); x.fillRect(0, 0, WW, F);
  x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 3; for (let px = 40; px < WW; px += 150) { x.strokeRect(px, 380, 110, 1000); }
  x.fillStyle = '#18204a'; x.fillRect(0, 1380, WW, F - 1380); x.fillStyle = 'rgba(217,163,50,.5)'; x.fillRect(0, 1376, WW, 6);
  // the ceiling with a row of round lights
  x.fillStyle = '#0a0f2c'; x.fillRect(0, 0, WW, 300); x.fillStyle = '#26346f'; x.fillRect(0, 296, WW, 10);
  // posters: a starry film and a rocket film, in cream frames
  const poster = (x0, y0, w, h, kind) => { x.fillStyle = '#c9a04a'; x.fillRect(x0 - 12, y0 - 12, w + 24, h + 24); x.fillStyle = '#efe4c8'; x.fillRect(x0 - 6, y0 - 6, w + 12, h + 12);
    x.fillStyle = lin(x, 0, y0, 0, y0 + h, [[0, '#13205c'], [1, '#2f4aa0']]); x.fillRect(x0, y0, w, h);
    x.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 25; i++) { x.beginPath(); x.arc(x0 + R() * w, y0 + R() * h * .6, 1 + R() * 2, 0, 7); x.fill(); }
    if (kind === 0) { x.fillStyle = GOLD; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 22 : 52; x.lineTo(x0 + w / 2 + Math.cos(a) * r, y0 + h * .42 + Math.sin(a) * r); } x.closePath(); x.fill(); }
    else { x.fillStyle = CREAM; x.beginPath(); x.ellipse(x0 + w / 2, y0 + h * .42, 22, 60, .5, 0, 7); x.fill(); x.fillStyle = GOLD; x.beginPath(); x.moveTo(x0 + w / 2 - 34, y0 + h * .42 + 40); x.lineTo(x0 + w / 2 - 60, y0 + h * .42 + 90); x.lineTo(x0 + w / 2 - 10, y0 + h * .42 + 60); x.fill(); }
    x.fillStyle = CREAM; x.fillRect(x0 + 24, y0 + h - 70, w - 48, 14); x.fillRect(x0 + 50, y0 + h - 44, w - 100, 9); };
  poster(70, 720, 220, 330, 0); poster(1230, 640, 230, 330, 1);
  // the door into screen 1, with its sign
  { const d = L.door; x.fillStyle = '#efe4c8'; x.fillRect(d.x0 - 14, d.y0 - 14, d.x1 - d.x0 + 28, d.y1 - d.y0 + 14); x.fillStyle = '#0a0d24'; x.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0);
    x.fillStyle = '#26346f'; x.fillRect(d.x0 + 10, 1060, d.x1 - d.x0 - 20, 70); x.fillStyle = CREAM; x.font = '44px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TEREM 1', (d.x0 + d.x1) / 2, 1097); }
  // the carpet: navy with a small gold-and-cream repeat, in perspective rows
  x.fillStyle = lin(x, 0, F, 0, WH, [[0, '#1a2258'], [1, '#121a46']]); x.fillRect(0, F, WW, WH - F);
  for (let r = 0, y = F + 22; y < WH; r++, y += 34 + r * 3) for (let px = (r % 2) * 50; px < WW; px += 100) { x.fillStyle = r % 3 ? 'rgba(217,163,50,.32)' : 'rgba(239,228,200,.22)'; x.save(); x.translate(px, y); x.rotate(Math.PI / 4); x.fillRect(-5 - r * .4, -5 - r * .4, 10 + r * .8, 10 + r * .8); x.restore(); }
  x.fillStyle = 'rgba(0,0,20,.35)'; x.fillRect(0, F, WW, 10);
  // the room steps back so the counter, the board and the people lead
  x.fillStyle = 'rgba(6,10,40,.32)'; x.fillRect(0, 0, WW, WH);
  // the menu board (kept bright): cream panels in a navy frame, a size word and a bucket in each; the prices are put up live
  { const b = L.board; x.fillStyle = 'rgba(0,0,20,.4)'; x.fillRect(b.x0 + 8, b.y0 + 12, b.x1 - b.x0, b.y1 - b.y0);
    x.fillStyle = '#121a46'; x.fillRect(b.x0 - 14, b.y0 - 14, b.x1 - b.x0 + 28, b.y1 - b.y0 + 28);
    const words = ['KICSI', 'KÖZEPES', 'NAGY'], hs = [70, 98, 128];
    L.panels.forEach((px, i) => { x.fillStyle = CREAM; x.beginPath(); x.roundRect(px - 115, b.y0, 230, b.y1 - b.y0, 10); x.fill();
      x.fillStyle = NAVY; x.font = '40px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(words[i], px, b.y0 + 42);
      bucket(x, px, b.y0 + 245, hs[i], 1, 7 + i); }); }
  // the marquee over it, POPCORN in lights
  { x.fillStyle = '#121a46'; x.beginPath(); x.roundRect(540, 600, 420, 110, 18); x.fill(); x.strokeStyle = GOLD2; x.lineWidth = 5; x.stroke();
    x.fillStyle = GOLD; x.font = '64px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('POPCORN', 750, 657); }
  return c;
}
// the counter, a layer of its own: whoever stands behind it is drawn first
export function counterFront() {
  const [c, x] = cnv(WW, WH);
  // a wooden top, a cream front with a navy band
  { const k = L.counter; x.fillStyle = lin(x, 0, k.top - 16, 0, k.top + 10, [[0, '#c99766'], [1, '#8a5d38']]); x.fillRect(k.x0 - 20, k.top - 16, k.x1 - k.x0 + 40, 26);
    x.fillStyle = lin(x, k.x0, 0, k.x1, 0, [[0, '#e6dabc'], [.5, '#f1e7cf'], [1, '#dccfae']]); x.fillRect(k.x0, k.top + 10, k.x1 - k.x0, k.front - k.top - 10);
    x.fillStyle = '#26346f'; x.fillRect(k.x0, k.top + 52, k.x1 - k.x0, 26); x.fillStyle = GOLD2; x.fillRect(k.x0, k.top + 50, k.x1 - k.x0, 3); x.fillRect(k.x0, k.top + 78, k.x1 - k.x0, 3);
    x.fillStyle = 'rgba(0,0,20,.15)'; for (let px = k.x0 + 110; px < k.x1; px += 110) x.fillRect(px, k.top + 82, 3, k.front - k.top - 82);
    x.fillStyle = 'rgba(0,0,20,.4)'; x.fillRect(k.x0, k.front - 8, k.x1 - k.x0, 8); }
  return c;
}
