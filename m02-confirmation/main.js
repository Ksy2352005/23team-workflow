// M02 Megerősítés (confirmation), v3 (user 2026-11-13): ONE clear idea per screen, drawn with Lucide line icons as glowing strokes.
// Each icon draws itself in with light while the previous one draws itself out; soft glows and fills mark the key words. Safe zone 0.92.
import { WORDS } from './captions.js';
import { start, glowDot, ss, seg, clamp, lerp, hash, ease3, WHITE, MID, K } from './kit.js';
import { loadIcons, drawIcon } from './iconkit.js';
await loadIcons('icons.json');
const T = i => WORDS[i][1];
const STORY = 38.8, DUR = 43.1, X = 540, Y = 1180;   // DUR: the end card holds the call to action (line 1) and then 1 s of the logo alone
const GOLD = '#ECBD4A', ROSE = '#E8778F', GREEN = '#7FD6A8';
const IN = .65, OUT = .45;   // draw in / draw out times
// the storyboard: one beat per idea. x/y/size optional; tint colours the stroke glow; fill = a soft fill on the accent word
const BEATS = [
  { icon: 'brain', at: .05, end: 1.95 },
  { icon: 'lock', at: 1.8, end: T(8) + .05 },
  { icon: 'lock-open', at: T(8) - .05, end: T(9) + .1, burst: T(8) + .2 },
  { icon: 'store', at: T(10) - .2, end: T(17) - .1, x: X - 205, size: 380 },
  { icon: 'house', at: T(14) - .3, end: T(17) - .1, x: X + 205, size: 380 },
  { icon: 'handshake', at: T(17) - .2, end: T(22) - .1, glowAt: T(20) },
  { icon: 'users', at: T(22) - .2, end: T(27) - .2 },
  { icon: 'message-square-text', at: T(27) - .35, end: T(29) - .15 },
  { icon: 'circle-check', at: T(29) - .25, end: T(35) - .2, tint: GREEN, fillAt: T(29) + .3 },
  { icon: 'heart', at: T(35) - .3, end: T(37) - .2, tint: ROSE, fillAt: T(35) + .1 },
  { icon: 'leaf', at: T(37) - .25, end: T(46) - .2, tint: GREEN, fillAt: T(38) + .2 },
  { icon: 'earth', at: T(46) - .3, end: T(50) - .1, tint: GREEN, glowAt: T(49) },
  { icon: 'gem', at: T(50) - .1, end: T(56) - .3, tint: GOLD, glowAt: T(51) + .3 },
  { icon: 'award', at: T(56) - .4, end: T(59) - .1, tint: GOLD, fillAt: T(56) + .2 },
  { icon: 'mirror-round', at: T(59) - .1, end: T(63) - .2 },
  { icon: 'shield-check', at: T(63) - .3, end: T(66) - .1, fillAt: T(64) },
  { icon: 'key-round', at: T(66) - .1, end: T(70) - .15, glowAt: T(69) },
  { icon: 'flag', at: T(70) - .3, end: T(76) - .3 },
  { icon: 'link', at: T(76) - .4, end: T(79) - .2, glowAt: T(76) + .3 },
  { icon: 'heart', at: T(79) - .25, end: STORY, tint: ROSE, fillAt: T(82) - .2, glowAt: T(82) - .2 } ];
function beat(c, b, t) { const pin = ease3(seg(t, b.at, b.at + IN)), pout = ss(seg(t, b.end - OUT, b.end)); if (pin <= 0 || pout >= 1) return;
  const size = b.size || 620, x = b.x ?? X, y = (b.y ?? Y) - 10 * Math.sin((t - b.at) * 1.3), sc = lerp(1.08, 1, pin) * lerp(1, .9, pout) * (1 + .015 * Math.sin((t - b.at) * 2.2)), a = 1 - pout * .3;
  const gl = b.glowAt ? Math.max(0, Math.sin(clamp((t - b.glowAt) / 1.2) * Math.PI)) : 0, fl = b.fillAt ? ss(seg(t, b.fillAt, b.fillAt + .5)) * (1 - pout) : 0;
  if (gl > 0 || fl > 0) { c.save(); c.globalAlpha = .5 * Math.max(gl, fl * .6); const g = c.createRadialGradient(x, y, 0, x, y, size * .75); g.addColorStop(0, b.tint ? b.tint + 'aa' : 'rgba(230,238,255,.65)'); g.addColorStop(1, 'rgba(230,238,255,0)'); c.fillStyle = g; c.fillRect(x - size, y - size, size * 2, size * 2); c.restore(); }
  drawIcon(c, b.icon, x, y, size * sc, { p: pin * (1 - pout), alpha: a, w: 1.15, glow: 26 + 30 * gl, glowCol: b.tint ? b.tint : undefined, fill: fl * .35, fillCol: b.tint || 'rgba(244,247,255,.9)' });
  if (b.burst && t > b.burst) { const u = seg(t, b.burst, b.burst + 1.0); if (u < 1) { glowDot(c, x, y, 40 + 80 * Math.sin(u * Math.PI), 1 - u); c.save(); c.strokeStyle = WHITE; c.lineCap = 'round'; c.lineWidth = 7; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 24 * K; c.globalAlpha = 1 - u; for (let k = 0; k < 12; k++) { const an = k / 12 * Math.PI * 2, r0 = size * .42 + 120 * ease3(u); c.beginPath(); c.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); c.lineTo(x + Math.cos(an) * (r0 + 90 * Math.sin(u * Math.PI)), y + Math.sin(an) * (r0 + 90 * Math.sin(u * Math.PI))); c.stroke(); } c.restore(); } } }
const off = document.createElement('canvas'); off.width = innerWidth; off.height = innerHeight; const oc = off.getContext('2d');
function take(c, t) { oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height); oc.setTransform(K, 0, 0, K, 0, 0); oc.translate(540, 1160); oc.scale(.92, .92); oc.translate(-540, -1160);   // safe zone
  for (const b of BEATS) beat(oc, b, t);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .5; c.filter = `blur(${22 * K}px)`; c.drawImage(off, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.drawImage(off, 0, 0); c.restore(); }
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
// the sound cues: each icon's draw-in, draw-out and accent, so mix.py lands every sound on its frame
window.EV = BEATS.flatMap((b, i) => [{ t: +b.at.toFixed(3), type: 'in', i, icon: b.icon, x: b.x ?? X }, { t: +(b.end - OUT).toFixed(3), type: 'out', i }, ...(b.burst ? [{ t: b.burst, type: 'burst', i }] : []), ...(b.fillAt ? [{ t: b.fillAt, type: 'fill', i }] : []), ...(b.glowAt ? [{ t: b.glowAt, type: 'glow', i }] : [])]).sort((p, q) => p.t - q.t);
