// Our mascots drawn the reference's way (user 2026-11-18: "between 2D and 3D"): flat colours with soft rounded shading,
// a thick dark outline and simple drawn faces, standing in soft 3D background plates. Blue heads; the body wears the clothes.
export const INK = '#1a1220';
const SKIN = { owner: '#f4efe4', blue1: '#4f7bf0', blue2: '#5b86f5', blue3: '#4470e2' };
const TAU = Math.PI * 2;
const ell = (c, x, y, rx, ry, r = 0) => () => { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), r, 0, TAU); };
function soft(c, path, x0, y0, r, dark = 'rgba(10,15,60,.42)') {   // the reference's soft shading: light top-left, darker round the bottom-right edge
  const g = c.createRadialGradient(x0 - r * .35, y0 - r * .4, r * .1, x0 - r * .1, y0 - r * .1, r * 1.25);
  g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(.55, 'rgba(255,255,255,0)'); g.addColorStop(1, dark);
  c.save(); path(); c.clip(); c.fillStyle = g; c.fillRect(x0 - r * 2, y0 - r * 2, r * 4, r * 4); c.restore();
}
function shape(c, path, fill, lw, sh) { c.save(); path(); c.fillStyle = fill; c.fill(); if (sh) soft(c, path, ...sh); path(); c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.restore(); }
function limb(c, pts, w, col, lw) {
  for (const [ww, cc] of [[w + lw * 2, INK], [w, col]]) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineWidth = ww; c.strokeStyle = cc; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
}
function pattern(c, path, kind, col, x, y, w, h, s) {   // checks or stripes on clothes
  c.save(); path(); c.clip(); c.fillStyle = col; c.globalAlpha = .55;
  if (kind === 'check') { const k = s * .05; for (let i = -12; i < 12; i++) { c.fillRect(x + i * k * 2, y - h, k * .8, h * 2); c.fillRect(x - w, y + i * k * 2, w * 2, k * .8); } }
  else { const k = s * .045; for (let i = -12; i < 12; i++) c.fillRect(x - w, y + i * k * 2, w * 2, k); }
  c.restore();
}

// P: x, y (feet, px), h (height px), skin, f (-1 left … 1 right), back, wear, pat, pat2, bulk, jacket, walk, phi, sq, tilt, lean, bob,
//    eyes ('dot' 'happy' 'lids' 'wide' 'squint' 'shut'), mouth ('smile' 'laugh' 'flat' 'frown' 'o' 'teeth' 'grin' 'smirk' 'open'), brows ('angry' 'worried' 'raised' 'flat'),
//    hair {type: 'bowl' 'bob' 'pony', col}, hat {type: 'cap' 'beanie' 'fedora' 'beret', col, col2}, glasses, tache, beard, bow, tie, buttons, pearls, scarf, blush, freckles,
//    handL, handR: [x, y] in units of h from the feet (y up is negative), folded, cash ('L' | 'R'), clip (a screen y below which nothing is drawn)
export function toon(c, P) {
  const h = P.h; if (!(h > 4)) return;
  const col = SKIN[P.skin] || SKIN.blue1, wear = P.wear || col, lw = Math.max(1.2, h * .015), f = P.f || 0, sq = P.sq || 0, bulk = P.bulk || 1, back = !!P.back;
  c.save();
  if (P.clip !== undefined) { c.beginPath(); c.rect(-5000, -5000, 12000, P.clip + 5000); c.clip(); }
  if (P.alpha !== undefined) c.globalAlpha = P.alpha;
  c.translate(P.x, P.y); if (P.lean) c.rotate(P.lean);
  const walk = P.walk || 0, phi = P.phi || 0, bob = walk * Math.abs(Math.sin(phi)) * h * .03 + (P.bob || 0) * h;
  c.fillStyle = 'rgba(5,8,30,.35)'; c.beginPath(); c.ellipse(0, 0, h * .2 * bulk, h * .035, 0, 0, TAU); c.fill();
  c.translate(0, -bob);
  const hip = -h * .2, bodyY = -h * .4 * (1 - sq * .3), rx = h * .155 * bulk * (1 + sq * .25), ry = h * .2 * (1 - sq * .15);
  // legs
  for (const s of [-1, 1]) {
    const sw = walk ? Math.sin(phi + (s > 0 ? Math.PI : 0)) * h * .07 : 0, lx = s * h * .065 * Math.min(bulk, 1.2), fx = lx + sw + f * h * .015;
    limb(c, [[lx, hip], [fx, -h * .045]], h * .06, col, lw);
    shape(c, ell(c, fx + (f || s * .3) * h * .02, -h * .03, h * .058, h * .034), col, lw);
  }
  // body (the clothes)
  const body = ell(c, 0, bodyY, rx, ry);
  const arm = (s) => {
    const sx = s * rx * .82, sy = bodyY - ry * .5, tgt = s < 0 ? P.handL : P.handR;
    let ex, ey;
    if (P.folded) {   // arms crossed: down to the elbow at the side, the forearm across the chest to the other elbow
      const elx = s * rx * 1.02, ely = bodyY + ry * .05, hx2 = -s * rx * .62, hy2 = bodyY - ry * .22 + (s > 0 ? -h * .012 : h * .012), aw = h * .048 * (bulk > 1 ? 1.25 : 1), acol = P.sleeve || (P.jacket ? wear : col);
      limb(c, [[sx, sy], [elx, ely], [hx2, hy2]], aw, acol, lw); shape(c, ell(c, hx2, hy2, h * .04 * (bulk > 1 ? 1.15 : 1), h * .038), col, lw); return [hx2, hy2]; }
    else if (tgt) { ex = tgt[0] * h; ey = tgt[1] * h; }
    else { const sw = walk ? Math.sin(phi + (s > 0 ? 0 : Math.PI)) * .06 : 0; ex = s * (rx + h * .06) + sw * h; ey = -h * .17; }
    const mx = (sx + ex) / 2 + s * h * .05, my = (sy + ey) / 2 + h * .025;
    const aw = h * .048 * (bulk > 1 ? 1.25 : 1), acol = P.sleeve || (P.jacket ? wear : col);
    limb(c, [[sx, sy], [mx, my], [ex, ey]], aw, acol, lw);
    if (bulk > 1.2 && !P.folded) shape(c, ell(c, (sx + mx) / 2, (sy + my) / 2, aw * .9, aw * .75), acol, lw);   // biceps
    shape(c, ell(c, ex, ey, h * .04 * (bulk > 1 ? 1.15 : 1), h * .038), col, lw);
    if (P.cash === (s < 0 ? 'L' : 'R')) for (let k = 0; k < 3; k++) { c.save(); c.translate(ex + s * h * .02, ey - h * .045); c.rotate((k - 1) * .3 - s * .2); shape(c, () => { c.beginPath(); c.rect(-h * .055, -h * .028, h * .11, h * .056); }, '#7cc68a', lw * .6); c.restore(); }
    return [ex, ey];
  };
  const backArm = f > .3 ? -1 : f < -.3 ? 1 : 0;
  if (backArm && !P.folded) arm(backArm);
  shape(c, body, wear, lw, [0, bodyY, Math.max(rx, ry)]);
  if (P.pat) { pattern(c, body, P.pat, P.pat2 || '#ffffff', 0, bodyY, rx, ry, h); body(); c.lineWidth = lw; c.strokeStyle = INK; c.stroke(); }
  if (bulk > 1.2) for (const s of [-1, 1]) shape(c, ell(c, s * rx * .78, bodyY - ry * .55, rx * .4, ry * .32), P.jacket ? wear : col, lw);   // round shoulders
  if (!back) {
    if (P.jacket) { c.save(); body(); c.clip(); c.strokeStyle = INK; c.lineWidth = lw * .8; c.beginPath(); c.moveTo(0, bodyY - ry); c.lineTo(0, bodyY + ry); c.stroke();
      for (let k = 0; k < 3; k++) { c.fillStyle = '#e2b64a'; c.beginPath(); c.arc(rx * .2, bodyY - ry * .3 + k * ry * .35, h * .012, 0, TAU); c.fill(); } c.restore(); }
    if (P.tie) shape(c, () => { const y0 = bodyY - ry * .85; c.beginPath(); c.moveTo(f * h * .02 - h * .018, y0); c.lineTo(f * h * .02 + h * .018, y0); c.lineTo(f * h * .02 + h * .024, y0 + h * .16); c.lineTo(f * h * .02, y0 + h * .19); c.lineTo(f * h * .02 - h * .024, y0 + h * .16); c.closePath(); }, P.tie, lw * .6);
    if (P.buttons) for (let k = 0; k < 3; k++) { c.fillStyle = '#d9a83a'; c.strokeStyle = INK; c.lineWidth = lw * .5; c.beginPath(); c.arc(f * h * .03, bodyY - ry * .3 + k * ry * .38, h * .013, 0, TAU); c.fill(); c.stroke(); }
    if (P.pearls) for (let k = -4; k <= 4; k++) { const a = Math.PI / 2 + k * .22; c.fillStyle = '#fff8ec'; c.strokeStyle = INK; c.lineWidth = lw * .4; c.beginPath(); c.arc(f * h * .02 + Math.cos(a) * rx * .6, bodyY - ry * .78 + Math.sin(a) * ry * .25, h * .014, 0, TAU); c.fill(); c.stroke(); }
    if (P.scarf) shape(c, () => { c.beginPath(); c.ellipse(0, bodyY - ry * .82, rx * .75, ry * .16, 0, 0, TAU); }, P.scarf, lw * .7);
    if (P.bow) { const bx = f * h * .03, by = bodyY - ry * .82;
      for (const s of [-1, 1]) shape(c, () => { c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + s * h * .065, by - h * .028); c.lineTo(bx + s * h * .065, by + h * .028); c.closePath(); }, P.bow, lw * .6);
      if (P.bowDots) { c.fillStyle = '#fff'; for (const [dx, dy] of [[-.042, -.007], [-.028, .011], [.033, -.009], [.046, .011]]) { c.beginPath(); c.arc(bx + dx * h, by + dy * h, h * .006, 0, TAU); c.fill(); } }
      shape(c, ell(c, bx, by, h * .015, h * .017), P.bow, lw * .6); }
  }
  if (!backArm || P.folded) { arm(-1); arm(1); } else arm(-backArm);
  // head, joined to the body (it overlaps the top of the body)
  const hr = h * .23, hx = f * h * .02, hy = bodyY - ry - hr * .7 + sq * h * .04;
  c.save(); c.translate(hx, hy); c.rotate(P.tilt || 0);
  const hair = P.hair;
  if (hair && (hair.type === 'bob' || hair.type === 'pony')) {   // hair behind the head
    if (hair.type === 'bob') shape(c, () => { c.beginPath(); c.ellipse(0, hr * .15, hr * 1.12, hr * 1.0, 0, 0, TAU); }, hair.col, lw);
    else shape(c, ell(c, -f * hr * .9 + (back ? 0 : hr * .7), hr * .25, hr * .28, hr * .55, .3), hair.col, lw);
  }
  shape(c, ell(c, 0, 0, hr, hr * (1 - sq * .06)), col, lw, [0, 0, hr]);
  if (!back) face(c, hr, f, P, lw, col);
  if (hair) {
    if (hair.type === 'bowl') shape(c, () => { c.beginPath(); c.moveTo(-hr * 1.03, hr * .02); c.bezierCurveTo(-hr * 1.18, -hr * 1.32, hr * 1.18, -hr * 1.32, hr * 1.03, hr * .02); c.bezierCurveTo(hr * .55, -hr * .26, -hr * .55, -hr * .26, -hr * 1.03, hr * .02); c.closePath(); }, hair.col, lw);
    else shape(c, () => { c.beginPath(); c.moveTo(-hr * 1.05, hr * .1); c.bezierCurveTo(-hr * 1.15, -hr * 1.3, hr * 1.15, -hr * 1.3, hr * 1.05, hr * .1); c.quadraticCurveTo(hr * .8, -hr * .45, f * hr * .3, -hr * .5); c.quadraticCurveTo(-hr * .8, -hr * .45, -hr * 1.05, hr * .1); c.closePath(); }, hair.col, lw);
  }
  const hat = P.hat;
  if (hat) {
    const hc = hat.col || '#24306e';
    if (hat.type === 'cap') {   // the doorman's peaked cap: navy crown, red band, gold badge, black peak
      shape(c, () => { c.beginPath(); c.moveTo(-hr * .95, -hr * .45); c.lineTo(-hr * 1.15, -hr * .95); c.quadraticCurveTo(0, -hr * 1.4, hr * 1.15, -hr * .95); c.lineTo(hr * .95, -hr * .45); c.closePath(); }, hc, lw);
      shape(c, () => { c.beginPath(); c.rect(-hr * .97, -hr * .62, hr * 1.94, hr * .17); }, hat.col2 || '#d8453a', lw * .7);
      if (!back) { shape(c, () => { c.beginPath(); c.ellipse(f * hr * .2, -hr * .43, hr * 1.0, hr * .15, 0, 0, Math.PI); c.closePath(); }, '#151520', lw); shape(c, ell(c, f * hr * .2, -hr * .88, hr * .13, hr * .13), '#f0c552', lw * .6); }
    } else if (hat.type === 'beanie') {
      shape(c, () => { c.beginPath(); c.moveTo(-hr * 1.0, -hr * .35); c.bezierCurveTo(-hr * 1.05, -hr * 1.35, hr * 1.05, -hr * 1.35, hr * 1.0, -hr * .35); c.closePath(); }, hc, lw);
      shape(c, () => { c.beginPath(); c.rect(-hr * 1.02, -hr * .5, hr * 2.04, hr * .2); }, hat.col2 || hc, lw * .7);
      shape(c, ell(c, 0, -hr * 1.12, hr * .17, hr * .15), hat.col2 || '#f4f1e6', lw * .7);
    } else if (hat.type === 'fedora') {
      shape(c, ell(c, 0, -hr * .62, hr * 1.45, hr * .2), hc, lw);
      shape(c, () => { c.beginPath(); c.moveTo(-hr * .8, -hr * .62); c.lineTo(-hr * .72, -hr * 1.25); c.quadraticCurveTo(0, -hr * 1.05, hr * .72, -hr * 1.25); c.lineTo(hr * .8, -hr * .62); c.closePath(); }, hc, lw);
      shape(c, () => { c.beginPath(); c.rect(-hr * .8, -hr * .8, hr * 1.6, hr * .16); }, hat.col2 || '#151018', lw * .6);
    } else if (hat.type === 'beret') {
      shape(c, ell(c, -hr * .15, -hr * .82, hr * 1.0, hr * .35, -.15), hc, lw); shape(c, ell(c, -hr * .1, -hr * 1.18, hr * .08, hr * .08), hc, lw * .6);
    }
  }
  c.restore();
  c.restore();
}

function face(c, R, f, P, lw, skin) {
  const ox = f * R * .32, ey = R * .12, sep = R * .3 * (1 - .25 * Math.abs(f));
  const ln = w => { c.lineWidth = w; c.strokeStyle = INK; c.lineCap = 'round'; c.lineJoin = 'round'; };
  const eyes = P.eyes || 'dot';
  for (const s of [-1, 1]) {
    const ex = ox + s * sep;
    if (eyes === 'happy') { ln(lw * 1.3); c.beginPath(); c.arc(ex, ey + R * .07, R * .1, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    else if (eyes === 'squint') { ln(lw * 1.3); c.beginPath(); c.moveTo(ex - s * R * .1, ey - R * .06); c.lineTo(ex + s * R * .04, ey); c.lineTo(ex - s * R * .1, ey + R * .06); c.stroke(); }
    else if (eyes === 'shut') { ln(lw * 1.2); c.beginPath(); c.moveTo(ex - R * .09, ey); c.lineTo(ex + R * .09, ey); c.stroke(); }
    else {
      const wide = eyes === 'wide', r = wide ? R * .16 : R * .085;
      if (wide) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, r, r * 1.15, 0, 0, TAU); c.fill(); ln(lw * .9); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(ex + f * r * .3, ey, r * .38, 0, TAU); c.fill(); }
      else { c.fillStyle = INK; c.beginPath(); c.ellipse(ex, ey, r, r * 1.2, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - r * .3, ey - r * .4, r * .32, 0, TAU); c.fill(); }
      if (eyes === 'lids') {   // heavy half-closed lids, the reference doorman's smug look
        c.fillStyle = skin; c.beginPath(); c.rect(ex - r * 1.6, ey - r * 2, r * 3.2, r * 1.9); c.fill(); ln(lw * 1.2); c.beginPath(); c.moveTo(ex - r * 1.4, ey - r * .05); c.lineTo(ex + r * 1.4, ey - r * .05); c.stroke(); }
    }
  }
  if (P.glasses) { ln(lw * .8); c.strokeStyle = P.glasses; for (const s of [-1, 1]) { c.beginPath(); c.arc(ox + s * sep, ey, R * .17, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(ox - sep + R * .17, ey); c.lineTo(ox + sep - R * .17, ey); c.stroke(); }
  if (P.brows) { ln(lw * 1.2); for (const s of [-1, 1]) { const a = P.brows === 'angry' ? s * .35 : P.brows === 'worried' ? -s * .35 : 0, up = P.brows === 'raised' ? R * .08 : 0; c.save(); c.translate(ox + s * sep, ey - R * .24 - up); c.rotate(a); c.beginPath(); c.moveTo(-R * .1, 0); c.lineTo(R * .1, 0); c.stroke(); c.restore(); } }
  if (P.blush) { c.fillStyle = 'rgba(255,120,150,.45)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(ox + s * sep * 1.45, ey + R * .22, R * .1, R * .06, 0, 0, TAU); c.fill(); } }
  if (P.freckles) { c.fillStyle = 'rgba(30,20,60,.5)'; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(ox + s * (sep * 1.2 + k * R * .06), ey + R * .2 + (k % 2) * R * .04, R * .02, 0, TAU); c.fill(); } }
  const my = R * .5, m = P.mouth || 'smile';
  const D = (wd, dp) => { c.beginPath(); c.moveTo(ox - wd, my - R * .05); c.quadraticCurveTo(ox, my - R * .01, ox + wd, my - R * .05); c.quadraticCurveTo(ox + wd * .8, my + dp, ox, my + dp); c.quadraticCurveTo(ox - wd * .8, my + dp, ox - wd, my - R * .05); c.closePath(); };
  if (m === 'laugh' || m === 'grin' || m === 'open') {
    const wd = m === 'open' ? R * .15 : R * .25, dp = m === 'open' ? R * .26 : m === 'grin' ? R * .22 : R * .32;
    c.save(); D(wd, dp); c.fillStyle = '#5a1430'; c.fill(); c.clip(); c.fillStyle = '#e25a74'; c.beginPath(); c.ellipse(ox, my + dp, wd * .65, R * .1, 0, 0, TAU); c.fill(); c.restore(); D(wd, dp); ln(lw); c.stroke();
  } else if (m === 'o') { c.fillStyle = '#5a1430'; c.beginPath(); c.ellipse(ox, my + R * .06, R * .08, R * .11, 0, 0, TAU); c.fill(); ln(lw * .9); c.stroke(); }
  else if (m === 'teeth') { c.fillStyle = '#fff'; c.beginPath(); c.rect(ox - R * .26, my - R * .06, R * .52, R * .2); c.fill(); ln(lw); c.stroke(); for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(ox - R * .26 + k * R * .104, my - R * .06); c.lineTo(ox - R * .26 + k * R * .104, my + R * .14); c.stroke(); } c.beginPath(); c.moveTo(ox - R * .26, my + R * .04); c.lineTo(ox + R * .26, my + R * .04); c.stroke(); }
  else if (m === 'smirk') { ln(lw * 1.1); c.beginPath(); c.moveTo(ox - R * .14, my + R * .06); c.quadraticCurveTo(ox + R * .02, my + R * .1, ox + R * .17, my - R * .04); c.stroke(); }
  else { ln(lw * 1.1); const k = m === 'frown' ? -1 : m === 'flat' ? 0 : 1; c.beginPath(); c.moveTo(ox - R * .15, my + R * .04); c.quadraticCurveTo(ox, my + R * .04 + k * R * .14, ox + R * .15, my + R * .04); c.stroke(); }
  if (P.tache) {   // a curly handlebar moustache, like the reference's owner
    c.fillStyle = '#3a2016'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(ox + s * R * .12, my - R * .1, R * .14, R * .05, s * .15, 0, TAU); c.fill(); }
    ln(lw * 1.3); c.strokeStyle = '#3a2016'; for (const s of [-1, 1]) { c.beginPath(); c.arc(ox + s * R * .27, my - R * .15, R * .05, s > 0 ? Math.PI * .5 : Math.PI * .5, s > 0 ? Math.PI * 1.9 : -Math.PI * .9, s < 0); c.stroke(); }
  }
  if (P.beard) { c.fillStyle = P.beard === true ? '#3a2418' : P.beard; c.beginPath(); c.ellipse(ox, my + R * .32, R * .32, R * .2, 0, 0, Math.PI); c.fill(); }
}
