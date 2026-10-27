// Highest-quality frame capture for a final master: lossless PNG screenshots, encoded losslessly (RGB H.264, qp 0) in parallel segments, then joined.
// node tools/master-frames.mjs <film folder> [--size 1080x1920] [--fps 24] [--workers 4] [--q 'k=v'] --out <file.mkv>
// Needs LIB (the Lemo-Opuscar library folder) for its page server. The finished master is encoded by tools/master.sh.
import fs from 'fs'; import path from 'path'; import { spawn, execFileSync } from 'child_process';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer, requireDemo, takeSize } = await import(path.join(LIB, 'core/render/page.mjs'));
const args = process.argv.slice(2), { w: W, h: H } = takeSize(args), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const dir = path.resolve(args[0]); requireDemo(dir);
const FPS = +opt('--fps', 24), WK = +opt('--workers', 4), Q = opt('--q', ''), out = path.resolve(opt('--out', path.join(dir, 'out', 'master_lossless.mkv')));
const segDir = fs.mkdtempSync(path.join(path.dirname(out), '.master_segs-'));
const probe = await openDemo(dir, { w: W, h: H, q: Q }); const DUR = await probe.page.evaluate(() => window.DUR); await probe.browser.close();
const TOTAL = Math.round(DUR * FPS), per = Math.ceil(TOTAL / WK), t0 = Date.now();
await Promise.all([...Array(WK)].map(async (_, w) => {
  const a = w * per, b = Math.min(TOTAL, a + per); if (a >= b) return;
  const { browser, page } = await openDemo(dir, { w: W, h: H, q: Q });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264rgb', '-qp', '0', '-preset', 'ultrafast', `seg_${w}.mkv`], { cwd: segDir, stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise(r => ff.on('close', r));
  for (let f = a; f < b; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 120 === 0) console.log(`w${w} ${f - a}/${b - a}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); const code = await closed; await browser.close();
  if (code !== 0) { console.error('ffmpeg failed for worker', w); process.exit(1); }
}));
fs.writeFileSync(path.join(segDir, 'segs.txt'), [...Array(WK)].map((_, w) => `file 'seg_${w}.mkv'`).filter((_, w) => w * per < TOTAL).join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'segs.txt', '-c', 'copy', 'merged.mkv'], { cwd: segDir, stdio: 'inherit' });
fs.renameSync(path.join(segDir, 'merged.mkv'), out); fs.rmSync(segDir, { recursive: true, force: true });
console.log('done', out, TOTAL, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's'); closeServer();
