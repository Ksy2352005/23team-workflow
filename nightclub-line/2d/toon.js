// Our mascots drawn the reference's way (user 2026-11-18: "between 2D and 3D"): flat colours, one flat cel shadow,
// a thick warm-dark outline, simple drawn faces. They stand on top of soft 3D background plates.
export const INK = '#2a1712';
export const SKINS = {
  owner: ['#f4efe4', 'rgba(150,130,120,.55)'], blue1: ['#3d66dc', 'rgba(15,30,100,.5)'], blue2: ['#4a74e8', 'rgba(15,30,100,.5)'], blue3: ['#3458c8', 'rgba(15,30,100,.5)'],
};
const TAU = Math.PI * 2;
function shape(c, path, fill, lw, shade) {   // fill, a cel shadow on the right/bottom inside it, then the outline
  c.save(); path(); c.fillStyle = fill; c.fill();
  if (shade) {   // soft rounded shading like the reference: a light top-left, the shade colour round the right and bottom edge
    const [sc, x0, y0, r] = shade, g = c.createRadialGradient(x0 - r * .35, y0 - r * .4, r * .1, x0 - r * .1, y0 - r * .1, r * 1.25);
    g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(.55, 'rgba(255,255,255,0)'); g.addColorStop(1, sc);
    c.save(); path(); c.clip(); c.fillStyle = g; c.fillRect(x0 - r * 2, y0 - r * 2, r * 4, r * 4); c.restore(); }
  path(); c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.restore();
}
function limb(c, pts, w, col, lw) {   // an outlined tube through points
  for (const [ww, cc] of [[w + lw * 2, INK], [w, col]]) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineWidth = ww; c.strokeStyle = cc; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
}
const ell = (c, x, y, rx, ry, r = 0) => () => { c.beginPath(); c.ellipse(x, y, rx, ry, r, 0, TAU); };

// P: { x, y (feet), h (height px), skin, f (facing -1..1), sq (squash), tilt, eyes: 'dot'|'happy'|'lids'|'wide', mouth: 'smile'|'laugh'|'flat'|'frown'|'o',
//      handL, handR: [x, y] targets (relative to the hips, in units of h), hair, tache, bow, buttons, cap, hat, legs: [l, r] swing }
export function toon(c, P) {
  const h = P.h, [col, sh] = SKINS[P.skin] || SKINS.blue1, lw = Math.max(2, h * .016), f = P.f || 0, sq = P.sq || 0;
  const x = P.x, y = P.y;
  c.save(); c.translate(x, y); if (P.lean) c.rotate(P.lean);
  // contact shadow
  c.fillStyle = 'rgba(30,8,8,.28)'; c.beginPath(); c.ellipse(0, 0, h * .2, h * .035, 0, 0, TAU); c.fill();
  const hip = -h * .2 * (1 - sq * .3), bodyY = -h * .38 * (1 - sq * .35), bodyRX = h * .16 * (1 + sq * .25), bodyRY = h * .2 * (1 - sq * .2);
  // legs: short, a little apart, round feet
  const legs = P.legs || [0, 0];
  for (const s of [-1, 1]) {
    const lx = s * h * .065, sw = legs[s < 0 ? 0 : 1] * h;
    limb(c, [[lx, hip], [lx + sw * .5, -h * .05]], h * .065, col, lw);
    shape(c, ell(c, lx + sw * .5 + s * h * .015 + f * h * .02, -h * .03, h * .06, h * .035), col, lw);
  }
  // arms behind the body when a hand is tucked (none here): arms are drawn after the body
  const shY = bodyY - bodyRY * .55, armX = bodyRX * .85;
  const armTo = (s, tgt) => {
    const sx = s * armX, ex = tgt ? tgt[0] * h : s * h * .2, ey = tgt ? tgt[1] * h : -h * .12;
    const mx = (sx + ex) / 2 + s * h * .07, my = (shY + ey) / 2 + h * .03;   // a soft elbow bend outwards
    return [[sx, shY], [mx, my], [ex, ey]];
  };
  // body: an egg with a cel shadow on the right
  shape(c, ell(c, 0, bodyY, bodyRX, bodyRY), col, lw, [sh, 0, bodyY, Math.max(bodyRX, bodyRY)]);
  if (P.buttons) for (let k = 0; k < 3; k++) { c.fillStyle = '#d9a83a'; c.strokeStyle = INK; c.lineWidth = lw * .5; c.beginPath(); c.arc(f * h * .03, bodyY - bodyRY * .35 + k * bodyRY * .38, h * .014, 0, TAU); c.fill(); c.stroke(); }
  if (P.bow) { const bx = f * h * .03, by = shY + h * .01;
    for (const s of [-1, 1]) shape(c, () => { c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + s * h * .07, by - h * .03); c.lineTo(bx + s * h * .07, by + h * .03); c.closePath(); }, '#d8333a', lw * .6);
    c.fillStyle = '#fff'; for (const [dx, dy] of [[-.045, -.008], [-.03, .012], [.035, -.01], [.05, .012]]) { c.beginPath(); c.arc(bx + dx * h, by + dy * h, h * .006, 0, TAU); c.fill(); }
    shape(c, ell(c, bx, by, h * .016, h * .018), '#b8242c', lw * .6); }
  for (const s of [-1, 1]) {
    const pts = armTo(s, s < 0 ? P.handL : P.handR); limb(c, pts, h * .05, col, lw);
    const [hx, hy] = pts[2]; shape(c, ell(c, hx, hy, h * .042, h * .04), col, lw);
  }
  // head: a big circle with a cel shadow, sitting on the body (overlapping, so it is clearly joined)
  const hr = h * .25, hx = f * h * .02, hy = bodyY - bodyRY - hr * .72 + sq * h * .05;
  c.save(); c.translate(hx, hy); c.rotate(P.tilt || 0);
  shape(c, ell(c, 0, 0, hr, hr * (1 - sq * .08)), col, lw, [sh, 0, 0, hr]);
  face(c, hr, f, P, lw);
  if (P.hair) shape(c, () => { c.beginPath(); c.moveTo(-hr * 1.02, hr * .05); c.bezierCurveTo(-hr * 1.15, -hr * 1.3, hr * 1.15, -hr * 1.3, hr * 1.02, hr * .05); c.bezierCurveTo(hr * .6, -hr * .2, -hr * .6, -hr * .2, -hr * 1.02, hr * .05); c.closePath(); }, P.hair, lw);
  if (P.cap) {   // the doorman's peaked cap: navy crown, red band, gold badge, a black peak
    shape(c, () => { c.beginPath(); c.moveTo(-hr * .95, -hr * .45); c.lineTo(-hr * 1.15, -hr * .95); c.quadraticCurveTo(0, -hr * 1.35, hr * 1.15, -hr * .95); c.lineTo(hr * .95, -hr * .45); c.closePath(); }, '#24306e', lw);
    shape(c, () => { c.beginPath(); c.rect(-hr * .95, -hr * .6, hr * 1.9, hr * .16); }, '#c8323a', lw * .7);
    shape(c, () => { c.beginPath(); c.ellipse(f * hr * .2, -hr * .42, hr * 1.0, hr * .14, 0, 0, Math.PI); c.closePath(); }, '#151520', lw);
    shape(c, ell(c, f * hr * .2, -hr * .9, hr * .12, hr * .12), '#e2b64a', lw * .6);
  }
  c.restore();
  c.restore();
}

function face(c, R, f, P, lw) {
  const ox = f * R * .3, ey = R * .14, sep = R * .3, line = (w) => { c.lineWidth = w; c.strokeStyle = INK; c.lineCap = 'round'; };
  const eyes = P.eyes || 'dot', blink = P.blink;
  for (const s of [-1, 1]) {
    const ex = ox + s * sep;
    if (eyes === 'happy') { line(lw * 1.3); c.beginPath(); c.arc(ex, ey + R * .06, R * .1, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    else if (eyes === 'squint') { line(lw * 1.3); c.beginPath(); c.moveTo(ex - R * .1, ey - s * R * .05); c.lineTo(ex + R * .02 * s, ey); c.lineTo(ex - R * .1, ey + s * R * .05); c.stroke(); }
    else if (blink) { line(lw * 1.2); c.beginPath(); c.moveTo(ex - R * .08, ey); c.lineTo(ex + R * .08, ey); c.stroke(); }
    else {
      const r = eyes === 'wide' ? R * .13 : R * .085; c.fillStyle = eyes === 'wide' ? '#fff' : INK; c.beginPath(); c.ellipse(ex, ey, r, r * 1.2, 0, 0, TAU); c.fill();
      if (eyes === 'wide') { line(lw * .8); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(ex + f * r * .3, ey, r * .45, 0, TAU); c.fill(); }
      else { c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - r * .3, ey - r * .4, r * .32, 0, TAU); c.fill(); }
      if (eyes === 'lids') { c.fillStyle = (SKINS[P.skin] || SKINS.blue1)[0]; c.fillRect(ex - r * 1.4, ey - r * 1.6, r * 2.8, r * 1.5); line(lw * 1.1); c.beginPath(); c.moveTo(ex - r * 1.3, ey - r * .1); c.lineTo(ex + r * 1.3, ey - r * .1); c.stroke(); }
    }
  }
  const my = R * .5, mouth = P.mouth || 'smile';
  if (mouth === 'laugh') {   // a wide open D with a tongue
    c.save(); c.beginPath(); c.moveTo(ox - R * .26, my - R * .06); c.quadraticCurveTo(ox, my - R * .02, ox + R * .26, my - R * .06); c.quadraticCurveTo(ox + R * .2, my + R * .32, ox, my + R * .32); c.quadraticCurveTo(ox - R * .2, my + R * .32, ox - R * .26, my - R * .06); c.closePath();
    c.fillStyle = '#5a1418'; c.fill(); c.clip(); c.fillStyle = '#e25a64'; c.beginPath(); c.ellipse(ox, my + R * .3, R * .16, R * .1, 0, 0, TAU); c.fill(); c.restore();
    c.beginPath(); c.moveTo(ox - R * .26, my - R * .06); c.quadraticCurveTo(ox, my - R * .02, ox + R * .26, my - R * .06); c.quadraticCurveTo(ox + R * .2, my + R * .32, ox, my + R * .32); c.quadraticCurveTo(ox - R * .2, my + R * .32, ox - R * .26, my - R * .06); line(lw); c.stroke();
  } else if (mouth === 'o') { c.fillStyle = '#5a1418'; c.beginPath(); c.ellipse(ox, my + R * .08, R * .08, R * .11, 0, 0, TAU); c.fill(); line(lw * .9); c.stroke(); }
  else { line(lw * 1.1); c.beginPath(); const k = mouth === 'frown' ? -1 : mouth === 'flat' ? 0 : 1; c.moveTo(ox - R * .16, my + R * .04); c.quadraticCurveTo(ox, my + R * .04 + k * R * .14, ox + R * .16, my + R * .04); c.stroke(); }
  if (P.tache) {   // a curly handlebar moustache, like the reference's owner
    c.fillStyle = '#3a2016'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(ox + s * R * .12, my - R * .04, R * .14, R * .05, s * .15, 0, TAU); c.fill(); }
    line(lw * 1.4); c.strokeStyle = '#3a2016'; for (const s of [-1, 1]) { c.beginPath(); c.arc(ox + s * R * .28, my - R * .09, R * .05, s > 0 ? Math.PI * .6 : Math.PI * -.6 + Math.PI, s > 0 ? Math.PI * 2.1 : Math.PI * .9 - Math.PI * 1.5, s < 0); c.stroke(); }
  }
  if (P.brows) { line(lw * 1.2); for (const s of [-1, 1]) { const a = P.brows === 'angry' ? s * .3 : P.brows === 'worried' ? -s * .3 : 0; c.save(); c.translate(ox + s * sep, ey - R * .25); c.rotate(a); c.beginPath(); c.moveTo(-R * .1, 0); c.lineTo(R * .1, 0); c.stroke(); c.restore(); } }
}
