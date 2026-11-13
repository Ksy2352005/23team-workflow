// iconkit: Lucide line icons (tools/icons/lucide, ISC) drawn as glowing strokes, with a "draw itself" animation.
// Every icon is turned into SVG path data; each stroke's length is measured with the browser's SVG engine, so the tracing is exact.
//   await loadIcons('icons.json');  drawIcon(c, 'brain', x, y, size, { p: 0..1 drawn, alpha, w, glow, col, fill })
const NS = 'http://www.w3.org/2000/svg'; let NODES = {}; const CACHE = {}; let SVG = null;
export async function loadIcons(url = 'icons.json') { NODES = await (await fetch(url)).json(); SVG = document.createElementNS(NS, 'svg'); SVG.setAttribute('style', 'position:absolute;width:0;height:0'); document.body.appendChild(SVG); }
const pts = s => s.trim().split(/[\s,]+/).map(Number);
function toD([tag, a]) { const n = k => +a[k] || 0;
  if (tag === 'path') return a.d;
  if (tag === 'circle') { const cx = n('cx'), cy = n('cy'), r = n('r'); return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`; }
  if (tag === 'ellipse') { const cx = n('cx'), cy = n('cy'), rx = n('rx'), ry = n('ry'); return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`; }
  if (tag === 'line') return `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}`;
  if (tag === 'polyline' || tag === 'polygon') { const p = pts(a.points); let d = `M${p[0]} ${p[1]}`; for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`; return tag === 'polygon' ? d + 'Z' : d; }
  if (tag === 'rect') { const x = n('x'), y = n('y'), w = n('width'), h = n('height'), r = Math.min(+a.rx || +a.ry || 0, w / 2, h / 2);
    return r ? `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z` : `M${x} ${y}H${x + w}V${y + h}H${x}Z`; }
  return ''; }
export function icon(name) { if (CACHE[name]) return CACHE[name]; const nodes = NODES[name]; if (!nodes) throw new Error('no icon ' + name);
  const parts = nodes.map(nd => [toD(nd), ['circle', 'ellipse', 'rect', 'polygon'].includes(nd[0])]).filter(q => q[0]).map(([d, closed]) => { const el = document.createElementNS(NS, 'path'); el.setAttribute('d', d); SVG.appendChild(el); const len = el.getTotalLength(); return { d, p2: new Path2D(d), len: Math.max(len, .01), closed: closed || /z\s*$/i.test(d) }; });
  return CACHE[name] = { parts, total: parts.reduce((s, q) => s + q.len, 0) }; }
// draw an icon centred on (x, y), `size` px wide; p = how much of it is drawn (0..1, strokes trace in order); erase with p going back to 0
export function drawIcon(c, name, x, y, size, o = {}) { const ic = icon(name), p = o.p ?? 1, a = o.alpha ?? 1; if (p <= 0 || a <= 0 || size <= 0) return; const k = size / 24, K = c.getTransform().a;
  const pass = (blur) => { c.save(); c.globalAlpha *= a; c.translate(x - size / 2, y - size / 2); c.scale(k, k); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = o.w ?? 1.6; c.strokeStyle = o.col || '#F4F7FF';
    c.shadowColor = o.glowCol || 'rgba(190,210,255,.95)'; c.shadowBlur = blur; let acc = 0; const want = p * ic.total;
    for (const q of ic.parts) { const vis = Math.max(0, Math.min(q.len, want - acc)); acc += q.len; if (vis <= 0) continue; if (vis < q.len) c.setLineDash([vis, q.len + 1]); else c.setLineDash([]); c.stroke(q.p2); }
    c.restore(); };
  if (o.fill) { c.save(); c.globalAlpha *= a * o.fill; c.translate(x - size / 2, y - size / 2); c.scale(k, k); c.fillStyle = o.fillCol || 'rgba(244,247,255,.9)'; for (const q of ic.parts) if (q.closed) c.fill(q.p2); c.restore(); }   // only closed shapes get a fill (open strokes like a tick would fill as odd triangles)
  pass((o.glow ?? 28) * K); pass(0); }
