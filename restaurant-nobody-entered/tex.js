// Procedural canvas textures (seeded, so every frame and every worker sees the same images)
import * as THREE from 'three';
import { mulberry } from '/core/lib.js';

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c, srgb = true, rep = [1, 1]) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 4;
  return t;
}
const shade = (hex, k) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); };

export function planks() {
  const [c, x] = canvas(512, 512), R = mulberry(11);
  for (let i = 0; i < 8; i++) {
    let y = 0;
    while (y < 512) {
      const h = 120 + R() * 200, k = (R() - .5) * .08;
      x.fillStyle = shade('#c48a4c', k); x.fillRect(i * 64, y, 64, h);
      for (let g = 0; g < 7; g++) { x.strokeStyle = `rgba(90,50,20,${.06 + R() * .08})`; x.lineWidth = 1 + R() * 1.5; x.beginPath(); const gx = i * 64 + 6 + R() * 52; x.moveTo(gx, y); x.bezierCurveTo(gx + R() * 8 - 4, y + h * .3, gx + R() * 8 - 4, y + h * .7, gx, y + h); x.stroke(); }
      x.fillStyle = 'rgba(60,32,12,.55)'; x.fillRect(i * 64, y, 64, 2);
      y += h;
    }
    x.fillStyle = 'rgba(60,32,12,.6)'; x.fillRect(i * 64, 0, 2, 512);
  }
  return tex(c, true, [3, 3]);
}

export function cobbles(wet = false) {
  const [c, x] = canvas(512, 512), R = mulberry(5);
  x.fillStyle = '#2a2f45'; x.fillRect(0, 0, 512, 512);
  const rows = 16, cw = 512 / 10;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * cw / 2;
    for (let i = -1; i < 11; i++) {
      const cx = i * cw + off, cy = r * 32, k = (R() - .5) * .1;
      x.fillStyle = shade('#5d6585', k);
      x.beginPath(); x.roundRect(cx + 3, cy + 3, cw - 6, 26, 9); x.fill();
      x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.roundRect(cx + 6, cy + 5, cw - 16, 8, 4); x.fill();
    }
  }
  return tex(c, true, [24, 2]);
}

export function slabs() {
  const [c, x] = canvas(256, 256), R = mulberry(9);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = shade('#6f7591', (R() - .5) * .06); x.fillRect(i * 64 + 1, j * 64 + 1, 62, 62); }
  return tex(c, true, [30, 1.2]);
}

export function stripes(a = '#1b2b6b', b = '#efe3c6', n = 12) {
  const [c, x] = canvas(512, 64);
  for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * 512 / n, 0, 512 / n + 1, 64); }
  return tex(c, true);
}

// a building facade: wall colour, window grid, lit windows in an emissive map
export function facade({ seed = 1, wall = '#e3cfa2', floors = 4, cols = 4, lit = .35, ground = false, trim = '#f3e8cf' }) {
  const W = 512, H = 128 * floors, [c, x] = canvas(W, H), [e, y] = canvas(W, H), R = mulberry(seed);
  x.fillStyle = wall; x.fillRect(0, 0, W, H); y.fillStyle = '#000'; y.fillRect(0, 0, W, H);
  // subtle plaster variation
  for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '80,60,30'},${R() * .04})`; x.fillRect(R() * W, R() * H, 30 + R() * 60, 20 + R() * 40); }
  for (let f = 0; f < floors; f++) {
    const fy = H - (f + 1) * 128;
    x.fillStyle = trim; x.fillRect(0, fy + 122, W, 6);          // cornice line
    if (ground && f === 0) continue;
    for (let i = 0; i < cols; i++) {
      const wx = (i + .5) * W / cols - 26, wy = fy + 26, ww = 52, wh = 78, on = R() < lit;
      x.fillStyle = trim; x.fillRect(wx - 6, wy - 10, ww + 12, 8); x.fillRect(wx - 5, wy + wh, ww + 10, 7);
      x.fillStyle = on ? '#f3b45a' : '#1d2546'; x.fillRect(wx, wy, ww, wh);
      x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(wx + ww / 2 - 2, wy, 4, wh); x.fillRect(wx, wy + wh * .38, ww, 4);
      if (on) { const g = y.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#ffd08a'); g.addColorStop(1, '#e98c33'); y.fillStyle = g; y.fillRect(wx, wy, ww, wh); y.fillStyle = '#000'; y.fillRect(wx + ww / 2 - 2, wy, 4, wh); y.fillRect(wx, wy + wh * .38, ww, 4); }
    }
  }
  return { map: tex(c), emissive: tex(e) };
}

export function blob() {
  const [c, x] = canvas(128, 128), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,10,.55)'); g.addColorStop(.6, 'rgba(0,0,10,.25)'); g.addColorStop(1, 'rgba(0,0,10,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return tex(c);
}

export function glow(col = '255,190,110') {
  const [c, x] = canvas(128, 128), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(.35, `rgba(${col},.35)`); g.addColorStop(1, `rgba(${col},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return tex(c);
}

// a small framed painting: the river and a bridge at night, drawn very simply
export function painting(seed = 3) {
  const [c, x] = canvas(256, 192), R = mulberry(seed);
  const g = x.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, '#22346e'); g.addColorStop(.6, '#3a4f8f'); g.addColorStop(1, '#1b2550');
  x.fillStyle = g; x.fillRect(0, 0, 256, 192);
  x.fillStyle = '#e9b55e'; x.beginPath(); x.arc(70 + R() * 120, 50, 14, 0, 7); x.fill();
  x.fillStyle = '#14204a'; x.fillRect(0, 118, 256, 6);
  for (const px of [60, 196]) { x.fillRect(px - 10, 70, 20, 54); }
  x.strokeStyle = '#e9b55e'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 112); x.quadraticCurveTo(60, 72, 128, 104); x.quadraticCurveTo(196, 72, 256, 112); x.stroke();
  return tex(c, true, [1, 1]);
}

export function mist() {
  const [c, x] = canvas(256, 64), R = mulberry(21);
  for (let i = 0; i < 40; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); const cx = R() * 256, cy = 20 + R() * 30, r = 20 + R() * 40;
    const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r); gg.addColorStop(0, 'rgba(200,215,255,.10)'); gg.addColorStop(1, 'rgba(200,215,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, 256, 64); }
  return tex(c);
}
