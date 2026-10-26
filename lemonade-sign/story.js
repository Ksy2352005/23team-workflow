// The Lemonade Sign — the timeline, cut to the Hungarian voiceover (refs/voiceover-hu.mp3, word times from Whisper).
// The boy and his dad are white; every customer is dark blue (some are women). Hands touch what they act on; nobody walks through the stand or anyone.
import { clamp, lerp, seg, ss, track, hash } from '/core/lib.js';
import { BASE_H } from './char2d.js';
import { G } from './sets.js';

export const STORY = 54.3, DUR = 56.6;   // the story, then the 23 logo on white
export const DISSOLVES = [{ at: 6.7, d: .4 }, { at: 30.35, d: .3 }, { at: 37.2, d: .3 }, { at: 40.35, d: .35 }, { at: 45.85, d: .45 }];

// the stand: front panel x 770..990, its front at y 1700, the top surface at y 1594..1612
export const ST = { x0: 770, x1: 990, front: 1700, top: 1612, back: 1594, pitcher: [815, 1604], cups: [945, 1604], tin: [968, 1602], pour: [872, 1604], hand: [1000, 1612] };
export const BOARD = { x0: 1035, x1: 1205, y0: 1570, y1: 1720, feet: 1740 };
export const BOY = { s: .66, y: 1662 }, LANE = 1792;

const WRITE1 = [4.55, 5.6], WRITE2 = [5.72, 6.45];
const COUNT = [...Array(7)].map((_, k) => +(40.65 + k * .27).toFixed(3));
const POURS = [37.45, 37.98, 38.5, 38.98];
export const HIT = {
  cupDown: [1.25, 2.05], paper: 3.25, uncap: 3.72, write1: WRITE1, write2: WRITE2,
  timelapse: 6.95, sigh: 12.0, stack: 12.55, intoBox: 13.05, door: 13.62, gate: 14.5, tap: 17.4, bang: 21.35,
  brush: [21.85, 22.15, 22.45, 22.75, 23.05], tapPrice: 29.45,
  spokes: 30.6, bell: 31.35, brake: 31.95, footDown: 32.38, lift: 32.45, pour: 32.62, ice: 33.0, setDown: 33.35, cupPick: 33.5, handOff: 34.12,
  gulp: [34.55, 34.95], ahh: 35.45, coinGive: 36.3, coinTin: 36.62,
  pours: POURS, lastDrop: 39.5, tins: POURS.map(t => t + .32), count: COUNT, giggle: 42.15,
  split: 43.0, plain: 45.9, magic: 50.5, ices: [50.62, 50.8, 50.95], lemon: 51.2, straw: 51.45, finalAhh: 53.1, bloom: 53.7,
};

const V = keys => track(keys);
export function sp(tau, d = .4, b = .2) {   // a spring like Motion's { type: 'spring', visualDuration, bounce }
  if (tau <= 0) return 0; const z = Math.max(.05, 1 - b);
  if (z >= .999) { const w = 4.7 / d; return 1 - Math.exp(-w * tau) * (1 + w * tau); }
  const wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau));
}
function blinkAt(t, seed) { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; }
const idle = (t, seed, o = {}) => ({ bob: Math.sin(t * 2.2 + seed) * .006, blink: blinkAt(t, seed), ...o });
// walk along a path of points (eased at both ends); the foot lands every 'stride' world px
function route(t, t0, t1, pts, stride = 46, ease = true) {
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  const u = seg(t, t0, t1), e = (ease ? ss(u) : u) * tot, moving = t > t0 && t < t1;
  let acc = 0, i = 0; while (i < L.length - 1 && acc + L[i] < e) acc += L[i++];
  const k = L[i] ? (e - acc) / L[i] : 1, A = pts[i], B = pts[i + 1], x = lerp(A[0], B[0], clamp(k)), y = lerp(A[1], B[1], clamp(k));
  const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1;
  const st = t - t1, settle = st > 0 && st < .5 ? Math.sin(st * 20) * Math.exp(-st * 9) * .07 : 0;
  return { x, y, f: clamp(dx / d * 1.1, -.95, .95), back: dy < -Math.abs(dx) * .7, phi: e / stride * Math.PI, walk: moving ? Math.min(1, Math.sin(u * Math.PI) * (ease ? 2.2 : 6)) : 0, squash: settle };
}
const B = 'blue1', B2 = 'blue2', B3 = 'blue3', W = 'owner';
const boy = (t, o = {}) => ({ id: 'boy', skin: W, cap: 1, x: 880, y: BOY.y, s: BOY.s, f: 0, ...idle(t, 1), smile: .6, armL: .12, armR: .12, ...o });
const reach = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const stand0 = { pitcher: 1, cups: 6, served: [], tin: 0, stacks: [0, 0, 0], paper: true, box: 0 };

// —— A (0–3.1): a summer afternoon, the crane comes down from the sky to the boy setting out his cups ——
function intro(t) {
  const put = k => { const c = HIT.cupDown[k], u = seg(t, c - .45, c), back = seg(t, c, c + .35); return u > 0 && back < 1 ? (back > 0 ? 1 - back : Math.sin(u * Math.PI / 2)) : 0; };
  const a = put(0), b = put(1), placed = (t > HIT.cupDown[0]) + (t > HIT.cupDown[1]);
  const slots = [[858, 1604], [895, 1604]], k = t < HIT.cupDown[0] + .35 ? 0 : 1, u = k ? b : a;
  const hand = reach([925, 1600], slots[k], ss(u));
  const b0 = boy(t, { handR: u > .02 ? [hand[0], hand[1] - 6] : undefined, look: .6 * u, smile: .75 });
  if (u > .02 && t < HIT.cupDown[k]) b0.cupAt = [hand[0], hand[1] - 2];
  const served = slots.slice(0, placed).map(([x, y]) => ({ x, y, lvl: 0 }));
  return { set: 'st', look: 'day', tod: 0, cam: V([[0, [760, 1060, 1.0]], [1.2, [800, 1300, 1.1]], [3.1, [870, 1530, 1.9]]])(t), chars: [b0], stand: { ...stand0, cups: 6 - placed - (u > .02 && t < HIT.cupDown[k] ? 1 : 0), served, paper: false } };
}
// —— B (3.1–6.7): top-down on the table: the paper, the marker, "Limonádé 500 Ft" written as the voice says it ——
function writing(t) { return { set: 'desk', mode: 'write', w1: seg(t, ...WRITE1), w2: seg(t, ...WRITE2), cap: seg(t, HIT.uncap - .2, HIT.uncap), handIn: ss(seg(t, 3.15, 3.6)), handOut: ss(seg(t, 6.45, 6.7)), cam: [540, 960 + 30 * seg(t, 3.1, 6.7), 1 + .06 * seg(t, 3.1, 6.7)] }; }
// —— C (6.7–11.45): the whole afternoon in a few seconds: the sun sinks, people walk past, nobody stops ——
function afternoon(t) {
  const passer = (id, skin, t0, t1, dir, y, o = {}) => { if (t < t0 - .01 || t > t1 + .01) return null; const r = route(t, t0, t1, dir > 0 ? [[-80, y], [1800, y]] : [[1800, y], [-80, y]], 46, false); return { id, skin, s: 1, ...idle(t, id.length), ...r, ...o }; };
  const p2 = passer('p2', B2, 8.3, 10.1, -1, LANE + 8, { fem: 'bob' });
  if (p2) { const g = Math.sin(seg(t, 8.95, 9.55) * Math.PI); p2.headTurn = .9 * g; p2.look = -.6 * g; }
  const chin = t > 8.6, sad = ss(seg(t, 10.2, 10.8));
  const b0 = boy(t, { chin: chin ? 'L' : undefined, tilt: chin ? -.08 : 0, look: chin ? .3 : 0, smile: chin ? lerp(.3, 0, sad) : .8, sad, headTurn: !chin ? .4 * Math.sin(t * 2) : 0 });
  const chars = [b0, passer('p1', B, 6.75, 8.55, 1, LANE), p2, passer('p3', B3, 9.75, 11.45, 1, LANE - 6)].filter(Boolean);
  return { set: 'st', look: 'day', blend: { to: 'gold', u: ss(seg(t, 7.0, 11.2)) }, tod: seg(t, 6.7, 11.2), timelapse: seg(t, 6.75, 11.3), cam: V([[6.7, [870, 1470, 1.45]], [11.45, [880, 1490, 1.55]]])(t), chars, stand: { ...stand0, served: [{ x: 858, y: 1604, lvl: 0 }, { x: 895, y: 1604, lvl: 0 }], cups: 4 } };
}
// —— D (11.45–16.3): he is about to pack up: the cups into the box; the door opens, his dad comes down the path and out of the gate ——
const DAD = [[570, 1496], [598, 1540], [644, 1596], [668, 1662], [700, 1726], [720, 1768]];
function packing(t) {
  const step = ss(seg(t, 11.9, 12.3)), bx = lerp(880, 930, step);
  const grab = ss(seg(t, 12.3, HIT.stack)), carry = ss(seg(t, HIT.stack + .05, HIT.intoBox)), back = ss(seg(t, HIT.intoBox, HIT.intoBox + .3));
  let hand = reach([bx + 30, 1590], [945, 1598], grab); if (carry > 0) hand = reach([945, 1598], [1012, 1612], carry); if (back > 0) hand = reach([1012, 1612], [bx + 30, 1600], back);
  const look = t > 13.75 ? ss(seg(t, 13.75, 14.1)) : 0;
  const b0 = boy(t, { x: bx, handR: grab > 0 && back < 1 ? hand : undefined, smile: lerp(.15, .5, look), sad: lerp(.7, 0, look), f: -.55 * look, look: .4 * (1 - look),
    squash: t > 11.95 && t < 12.4 ? .05 * Math.sin(seg(t, 11.95, 12.4) * Math.PI) : 0 });
  const dad = { id: 'dad', skin: W, tache: 1, s: 1.08, ...idle(t, 4), ...route(t, 13.95, 16.0, DAD, 60), smile: .7 };
  if (t < 13.95) Object.assign(dad, { x: DAD[0][0], y: DAD[0][1], f: .3, walk: 0, alpha: ss(seg(t, 13.7, 13.95)) });
  const gate = ss(seg(t, 14.42, 14.75));
  if (t > 14.3 && t < 14.8) dad.handR = [lerp(640, 650, gate), 1560];
  const cups = carry > 0 ? 0 : 4, box = carry > .9 ? 4 : 0;
  return { set: 'st', look: 'gold', tod: 1, door: ss(seg(t, 13.62, 13.9)) * (1 - ss(seg(t, 14.4, 14.7))), gate,
    cam: V([[11.45, [830, 1500, 1.5]], [13.5, [790, 1490, 1.45]], [16.3, [780, 1540, 1.6]]])(t), chars: [b0, dad],
    stand: { ...stand0, cups, served: [], box, stackAt: carry > 0 && carry < 1 ? hand : null } };
}
// —— E (16.3–19.7): dad points at the paper: "try writing something else" ——
function advice(t) {
  const pt = ss(seg(t, 16.45, 16.9)) * (1 - ss(seg(t, 18.6, 19.0))), talk = t > 16.38 && t < 18.25 ? Math.max(0, Math.sin(t * 19)) * .7 : 0;
  const dad = { id: 'dad', skin: W, tache: 1, s: 1.08, x: 720, y: 1768, f: .7, ...idle(t, 4), lean: .12 * pt, handR: pt > .05 ? reach([745, 1660], [826, 1652], pt) : undefined, o: talk, smile: talk > .3 ? 0 : .7, look: .3 * pt, headTurn: .2 };
  const bl = t > 18.4 ? ss(seg(t, 18.4, 18.8)) : 0;
  const b0 = boy(t, { x: 930, f: -.6 * (1 - bl), look: .5 + .3 * pt, smile: .2 + .4 * bl, sad: .3 * (1 - bl), tilt: .1 * pt });
  return { set: 'st', look: 'gold', tod: 1, gate: 1, cam: V([[16.3, [820, 1625, 2.25]], [19.7, [830, 1615, 2.5]]])(t), chars: [b0, dad], stand: { ...stand0, cups: 0, box: 4 } };
}
// —— F (19.7–21.66): the boy thinks, chin in hand, eyes up... and it comes to him ——
function thinking(t) {
  const idea = t > HIT.bang - .05, k = sp(t - HIT.bang + .05, .35, .35);
  const b0 = boy(t, { x: 930, chin: idea ? undefined : 'L', look: idea ? -.2 : -1, tilt: idea ? 0 : -.12 + .03 * Math.sin(t * 2), smile: idea ? .3 + .7 * k : .25, headUp: idea ? .02 * k : 0, o: idea && t < HIT.bang + .4 ? .6 : 0,
    bang: idea ? clamp(t - HIT.bang + .05) : 0, armR: idea ? .2 + .5 * k : .1, squash: idea ? -.05 * Math.sin(seg(t, HIT.bang, HIT.bang + .3) * Math.PI) : 0 });
  return { set: 'st', look: 'gold', tod: 1, gate: 1, cam: V([[19.7, [930, 1560, 3.0]], [21.0, [930, 1555, 3.25]], [21.66, [930, 1545, 3.6]]])(t), chars: [b0], stand: { ...stand0, cups: 0, box: 4 } };
}
// —— G (21.66–23.45): top-down again: brush and paint on a board ——
function painting(t) { return { set: 'desk', mode: 'paint', p: seg(t, 21.75, 23.3), cam: [540, 960, 1.05 - .05 * seg(t, 21.66, 23.45)] }; }
// —— H (23.45–30.35): the new board outside; the camera reads it as the voice does, then down to the price, the same 500 Ft ——
function board(t) {
  const cam = V([[23.45, [1120, 1640, 3.2]], [24.0, [1120, 1600, 5.0]], [25.2, [1112, 1600, 5.2]], [25.6, [1120, 1626, 5.3]], [26.6, [1120, 1628, 5.35]], [26.95, [1120, 1650, 5.4]], [28.3, [1124, 1652, 5.5]],
    [29.0, [1160, 1694, 6.2]], [29.8, [1140, 1690, 5.6]], [30.35, [1020, 1670, 2.8]]])(t);
  const tapU = Math.sin(seg(t, HIT.tapPrice - .3, HIT.tapPrice + .3) * Math.PI);
  const b0 = boy(t, { x: 1010, y: 1748, f: .6, smile: .9, handR: tapU > .05 ? reach([1030, 1690], [1168, 1700], tapU) : undefined, look: .3 });
  return { set: 'st', look: 'gold', tod: 1, gate: 1, cam, chars: [b0], board: 1, stand: { ...stand0, paper: false, cups: 6 } };
}
// —— I (30.35–37.2): a cyclist stops; the boy pours, hands the cup over; a mother comes up with her child ——
export const BIKE_STOP = 1010;
export function bikeX(t) { const t0 = 30.5, t1 = 32.3; if (t < t0) return 1950; if (t > t1) return BIKE_STOP; const u = (t - t0) / (t1 - t0); return lerp(1950, BIKE_STOP, 1 - Math.pow(1 - u, 2)); }
function customers(t) {
  const bx = bikeX(t), moving = t < 32.3, crank = (1950 - bx) / 34 * (t < 31.6 ? 1 : 0) + (t >= 31.6 ? (1950 - bikeX(31.6)) / 34 : 0);
  const lift = ss(seg(t, HIT.lift, HIT.pour)), tilt = ss(seg(t, HIT.pour, HIT.pour + .2)) * (1 - ss(seg(t, HIT.ice + .1, HIT.setDown - .05))), down = ss(seg(t, HIT.setDown - .1, HIT.setDown));
  const fill = seg(t, HIT.pour + .1, HIT.ice + .15);
  const pick = ss(seg(t, HIT.cupPick - .15, HIT.cupPick)), go = ss(seg(t, HIT.cupPick, HIT.handOff - .15));
  const bxp = lerp(880, 955, go), pAt = lift > 0 && down < 1 ? { x: lerp(ST.pitcher[0], 846, lift * (1 - down)), y: lerp(ST.pitcher[1], 1582, lift * (1 - down)), rot: .95 * tilt } : null;
  const b0 = boy(t, { x: bxp, smile: .85, look: .5 });
  let cupHeld = null;
  if (pAt) { b0.handL = [pAt.x - 22, pAt.y - 30]; b0.handR = [pAt.x + 10, pAt.y - 10]; b0.look = .7; }
  if (pick > 0 && t < HIT.handOff) { cupHeld = reach(ST.pour, ST.hand, go); b0.handR = [cupHeld[0], cupHeld[1] - 8]; }
  const took = t >= HIT.handOff;
  if (took && t < HIT.handOff + .35) b0.handR = reach(ST.hand, [bxp + 18, 1600], ss(seg(t, HIT.handOff, HIT.handOff + .35)));
  // the coin: from his hand to the boy's, then into the tin
  const give = Math.sin(seg(t, HIT.coinGive - .4, HIT.coinGive + .25) * Math.PI);
  if (t > HIT.coinGive - .4 && t < HIT.coinTin) { const u = ss(seg(t, HIT.coinGive + .05, HIT.coinTin)); b0.handR = reach(ST.hand, [ST.tin[0] - 4, ST.tin[1] - 18], u); if (t > HIT.coinGive) b0.coinAt = b0.handR; }
  // the rider: on the saddle, hands on the bars, feet on the pedals; then the left foot down on the pavement
  const sY = 1726, rider = { id: 'rider', skin: B, helmet: 1, s: .95, x: bx + 40, y: sY + .31 * BASE_H * .95 * 1.08, f: -.8, lean: -.18, sit: 1, shadow: false, ...idle(t, 6), smile: .5, look: .2 };
  const bb = [bx + 4, 1766], ang = crank, pd = s => [bb[0] + Math.cos(ang + (s > 0 ? 0 : Math.PI)) * 15, bb[1] + Math.sin(ang + (s > 0 ? 0 : Math.PI)) * 15];
  rider.footR = pd(1); rider.footL = t > HIT.footDown - .25 ? reach(pd(-1), [bx - 22, LANE], ss(seg(t, HIT.footDown - .25, HIT.footDown))) : pd(-1);
  if (t > HIT.footDown) { Object.assign(rider, { sit: 0, y: LANE + 1, shadow: true, footL: undefined, footR: undefined }); }
  rider.handL = [bx - 62, 1680]; rider.handR = [bx - 56, 1684];
  const drink = t > HIT.handOff ? Math.sin(seg(t, 34.4, 35.25) * Math.PI) : 0, cupLvl = 1 - seg(t, 34.5, 35.15) * .85;
  if (t > HIT.handOff - .15) { const u = ss(seg(t, HIT.handOff - .15, HIT.handOff)); rider.handL = reach([bx - 62, 1676], ST.hand, u);
    if (took) { const mouth = [bx - 14, 1632]; rider.handL = drink > 0 ? reach([bx - 30, 1650], mouth, drink) : reach(ST.hand, [bx - 30, 1650], ss(seg(t, HIT.handOff, HIT.handOff + .3))); rider.cupAt = rider.handL; rider.cupLvl = cupLvl; rider.headUp = .02 * drink; rider.tilt = .25 * drink; } }
  if (t > HIT.ahh - .1) { rider.smile = 1; rider.blink = t < HIT.ahh + .5 ? 1 : rider.blink; }
  if (t > HIT.coinGive - .45 && t < HIT.coinGive + .1) { rider.handR = reach([bx - 56, 1680], ST.hand, give); if (t < HIT.coinGive) rider.coinAt = rider.handR; }
  // mother and child, hand in hand
  const mom = { id: 'mom', skin: B2, fem: 'hat', s: 1, ...idle(t, 8), ...route(t, 33.9, 35.9, [[-120, LANE + 6], [700, LANE + 6], [712, 1778]], 48), smile: .8 };
  const kid = { id: 'kid', skin: B3, fem: 'pony', s: .55, ...idle(t, 9), ...route(t, 33.9, 35.9, [[-62, LANE + 18], [758, LANE + 18], [770, 1792]], 30), smile: .9 };
  const hh = [(mom.x + kid.x) / 2, kid.y - .5 * BASE_H * kid.s * 1.08 + 4]; mom.handR = hh; kid.handL = hh;
  if (t > 35.95) { kid.look = -1; kid.squash = .04 * Math.sin(t * 9); kid.headTurn = .3; mom.headTurn = .2; mom.look = -.4; }
  const stand = { ...stand0, paper: false, cups: 5, pitcher: 1 - .18 * fill, pAt, served: [], tin: t > HIT.coinTin ? 1 : 0 };
  if (t > HIT.pour && pick === 0) stand.served = [{ x: ST.pour[0], y: ST.pour[1], lvl: fill, ice: fill > .9 }];
  if (cupHeld) b0.cupAt = cupHeld, b0.cupLvl = 1;
  return { set: 'st', look: 'gold', tod: 1, gate: 1, board: 1, bike: { x: bx, crank, moving }, cam: V([[30.35, [1000, 1540, 1.55]], [32.3, [960, 1550, 1.7]], [33.7, [950, 1550, 1.75]], [34.1, [880, 1550, 1.5]], [37.2, [880, 1545, 1.55]]])(t),
    chars: [b0, rider, mom, kid], stand };
}
// —— J (37.2–40.35): until evening, in a few seconds: one customer after another, the pitcher empties, the last drop ——
function rush(t) {
  const cs = [], slot = [1010, 1782], plan = [[37.25, -1, B, 'long'], [37.75, 1, B3, null], [38.25, -1, B2, 'bun'], [38.75, 1, B, null], [39.25, -1, B3, 'glasses']];
  plan.forEach(([t0, dir, skin, fem], i) => { if (t < t0 || t > t0 + 1.25) return;
    const from = [dir > 0 ? -120 : 1820, LANE + 4], out = [dir > 0 ? 1820 : -120, LANE + 4];
    let p = t < t0 + .45 ? route(t, t0, t0 + .45, [from, slot], 40) : t < t0 + .8 ? { x: slot[0], y: slot[1], f: -.5 * dir, walk: 0 } : route(t, t0 + .8, t0 + 1.25, [slot, out], 40);
    p = { id: 'r' + i, skin, fem, s: 1, ...idle(t, 20 + i), smile: .9, ...p };
    if (t > t0 + .45 && t < t0 + .8) { p.handR = p.handL = undefined; const hand = [slot[0] - 30, 1640]; if (dir > 0) p.handR = hand; else p.handL = hand; p.cupAt = t > t0 + .62 ? hand : null; p.cupLvl = 1; }
    if (t > t0 + .8) { p.cupAt = [p.x + 14 * Math.sign(p.f || 1), p.y - .45 * BASE_H]; p.cupLvl = 1; p.handR = p.cupAt; }
    cs.push(p); });
  const k = POURS.findIndex(p => t > p - .2 && t < p + .3), u = k >= 0 ? Math.sin(seg(t, POURS[k] - .2, POURS[k] + .3) * Math.PI) : 0;
  const level = 1 - POURS.filter(p => t > p + .1).length * .25 - (k >= 0 ? .25 * seg(t, POURS[k], POURS[k] + .1) : 0);
  const flip = ss(seg(t, 39.2, 39.45)), b0 = boy(t, { x: 890, smile: .9 * (1 - flip) + .5 * flip, look: .6, o: flip > .5 ? .5 : 0 });
  const pAt = u > 0 || flip > 0 ? { x: lerp(ST.pitcher[0], 846, Math.max(u, flip)), y: lerp(ST.pitcher[1], 1570, Math.max(u, flip)), rot: .95 * u + 2.8 * flip } : null;
  if (pAt) { b0.handL = [pAt.x - 20, pAt.y - 28]; b0.handR = [pAt.x + 8, pAt.y - 14]; }
  return { set: 'st', look: 'gold', blend: { to: 'dusk', u: ss(seg(t, 37.4, 39.6)) }, tod: 1 + seg(t, 37.3, 39.6), timelapse: seg(t, 37.2, 39.7), gate: 1, board: 1,
    cam: V([[37.2, [890, 1520, 1.45]], [40.35, [900, 1510, 1.5]]])(t), chars: [b0, ...cs], stand: { ...stand0, paper: false, cups: 5 - Math.min(4, POURS.filter(p => t > p).length), pitcher: Math.max(0, level), pAt, tin: 1 + POURS.filter(p => t > p + .32).length * 3, drop: t > 39.35 && t < 39.6 ? seg(t, 39.35, 39.55) : 0 } };
}
// —— K (40.35–43.0): evening, the porch lamp on: he counts the money into little stacks ——
function counting(t) {
  const k = COUNT.findIndex(c => t > c - .26 && t <= c), n = COUNT.filter(c => t > c).length, stacks = [0, 0, 0];
  for (let i = 0; i < n; i++) stacks[i % 3]++;
  const tgt = i => [905 + (i % 3) * 20, 1604 - stacks[i % 3] * 3.5], tin = [ST.tin[0] - 2, ST.tin[1] - 16];
  let hand; if (k >= 0) { const u = seg(t, COUNT[k] - .26, COUNT[k]); hand = u < .45 ? reach(tgt(k), tin, ss(u / .45)) : reach(tin, tgt(k), ss((u - .45) / .55)); }
  const b0 = boy(t, { x: 912, smile: 1, look: .7, handR: hand, coinAt: k >= 0 && seg(t, COUNT[k] - .26, COUNT[k]) > .45 ? hand : null, squash: t > HIT.giggle && t < HIT.giggle + .5 ? .04 * Math.sin((t - HIT.giggle) * 25) : 0,
    blink: t > HIT.giggle && t < HIT.giggle + .45 ? 1 : blinkAt(t, 1) });
  return { set: 'st', look: 'dusk', tod: 2, gate: 1, board: 1, porch: 1, cam: V([[40.35, [915, 1580, 3.1]], [43.0, [918, 1575, 3.45]]])(t), chars: [b0], stand: { ...stand0, paper: false, cups: 1, pitcher: 0, tin: 12 - n, stacks } };
}
// —— L (43.0–45.85): the same lemonade, the same price: before (above) and after (below) ——
function split(t) {
  const u = seg(t, 43.0, 45.85), cam = [960, 1650, 2.0 + .25 * ss(u)];
  const top = { set: 'st', look: 'gold', tod: 1, cam, chars: [boy(t, { x: 900, chin: 'L', sad: .4, smile: 0, look: .3 })], stand: { ...stand0, cups: 6 } };
  const ppl = [{ id: 'q1', skin: B, s: 1, x: 735, y: 1786, f: .5, ...idle(t, 31), smile: .9 }, { id: 'q2', skin: B2, fem: 'bun', s: 1, x: 1300, y: 1800, f: -.5, ...idle(t, 32), smile: .8 }, { id: 'q3', skin: B3, s: 1, x: 630, y: 1796, f: .5, ...idle(t, 33), smile: .9, cupAt: [660, 1646], cupLvl: .6, handR: [660, 1646] }];
  const bot = { set: 'st', look: 'gold', tod: 1, board: 1, gate: 1, cam, chars: [boy(t, { x: 900, smile: 1, look: .4 }), ...ppl], stand: { ...stand0, paper: false, cups: 6, tin: 6 } };
  return { set: 'split', top, bot, open: ss(seg(t, 43.0, 43.45)) };
}
// —— M (45.85–52.36): a plain glass of lemonade... that becomes a cold drink on a hot summer day ——
function glass(t) { return { set: 'glass', m: ss(seg(t, HIT.magic, HIT.magic + .9)), t0: t - 45.85, ices: HIT.ices.map(c => sp(t - c, .3, .4)), lemon: sp(t - HIT.lemon, .35, .35), straw: sp(t - HIT.straw, .35, .3), cam: [540, 960, 1 + .04 * seg(t, 45.85, 52.36)] }; }
// —— N (52.36–54.3): a hot summer day at the stand, everyone with a cold cup; the sun swells to white ——
function finale(t) {
  const sip = (seed, x, y, skin, fem, f) => { const ph = ((t + hash(seed) * 2) % 2.2) / 2.2, d = ph < .35 ? Math.sin(ph / .35 * Math.PI) : 0, mouth = [x + f * 20, y - .7 * BASE_H], rest = [x + f * 30, y - .42 * BASE_H];
    const h = reach(rest, mouth, d), p = { id: 'f' + seed, skin, fem, s: 1, x, y, f, ...idle(t, seed), smile: .9, tilt: -.2 * d * Math.sign(f), cupAt: h, cupLvl: .7 }; p[f > 0 ? 'handR' : 'handL'] = h; return p; };
  const kid = { id: 'fk', skin: B3, fem: 'pony', s: .55, x: 790, y: 1795, f: .3, ...idle(t, 44), smile: 1, squash: .04 * Math.sin(t * 8) };
  const chars = [boy(t, { x: 900, smile: 1, armR: .6 + .3 * Math.sin(t * 6), look: .2 }), sip(41, 700, 1786, B2, 'hat', .5), kid, sip(42, 1050, 1792, B, null, -.5), sip(43, 1250, 1800, B3, 'long', -.5), sip(45, 560, 1800, B, null, .5)];
  return { set: 'st', look: 'day', tod: 0, board: 1, gate: 1, hot: 1, bloom: ss(seg(t, HIT.bloom, STORY)), cam: V([[52.36, [900, 1480, 1.35]], [STORY, [880, 1420, 1.15]]])(t), chars, stand: { ...stand0, paper: false, cups: 2, tin: 10, pitcher: .7 } };
}
const SCENES = [[0, intro], [3.1, writing], [6.7, afternoon], [11.45, packing], [16.3, advice], [19.7, thinking], [21.66, painting], [23.45, board], [30.35, customers], [37.2, rush], [40.35, counting], [43.0, split], [45.85, glass], [52.36, finale]];
export function sceneAt(t) { t = Math.min(t, STORY - 1e-3); let f = SCENES[0][1]; for (const [a, fn] of SCENES) if (t >= a) f = fn; return f(t); }
