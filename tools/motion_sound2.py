"""23 Team motion-reel sound engine, v2 (smooth and continuous; after the user's feedback 2026-11-12).
Under the voice: a soft, slowly moving ambient bed (warm detuned pads that crossfade chord to chord, a quiet air layer, a low drone;
no beat, no plucks, no clicks), long airy swooshes that carry each morph and camera move, soft swells into the big reveals and a
gentle low bloom on them. Nothing pops: every sound has a soft attack and a long tail. The voice always leads; the locked logo sound ends it.

Use from a reel's mix.py:
    sys.path.insert(0, '<repo>/tools'); from motion_sound2 import *
    fx = buf(DUR); add(fx, swoosh(1.2, .2), 3.0); add(fx, swell(1.0, .15), 7.2); add(fx, bloom(.5), 8.2)
    write_mix(HERE, voice='refs/voiceover-hu-x1.10.mp3', fx=fx, story=STORY, dur=DUR, dips=[(a, b)])"""
import os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve
import soundfile as sf
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import SR, t_, bp, lp, hp, noise, norm, brown, compress, limit, add as _add
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from logo_sting import place_logo
rng = np.random.default_rng(23)
def buf(d): return np.zeros((int(d * SR) + SR, 2))
def add(b, x, t, v=1, pan=0): _add(b, x, max(0, t), v, pan)
def verb(x, t60=2.2, wet=.45):
    n = int(t60 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n); ir = lp(ir, 6000) * .05
    return x + wet * fftconvolve(x, ir)[:len(x)]
def soft_env(d, a, r): tt = t_(d); return np.minimum(1, tt / max(a, 1e-3)) ** 2 * np.minimum(1, (d - tt) / max(r, 1e-3))
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def sweep_noise(d, f0, f1, q=.7):
    x = noise(d); y = np.zeros_like(x); f = np.geomspace(f0, f1, len(x)); blk = 512
    for k in range(0, len(x), blk): fc = f[k]; y[k:k + blk] = bp(x[k:k + blk + 0], fc * (1 - q / 2), fc * (1 + q / 2))[:len(y[k:k + blk])]
    return y
# —— effects: all soft ——
def swoosh(d=1.2, v=.2, up=True):   # an airy whoosh that rises then falls; carries a morph or a camera move
    tt = t_(d); x = sweep_noise(d, 300, 5000) if up else sweep_noise(d, 5000, 300); e = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2.2
    return verb(norm(lp(x, 9000)) * e, 1.4, .35) * v
def swell(d=1.0, v=.15):   # a reverse-reverb-like swell into a reveal, faded (not cut) at its peak
    tt = t_(d); e = (tt / d) ** 2.5 * np.minimum(1, (d - tt) / .06); x = norm(sweep_noise(d, 400, 3000) * .7 + np.sin(2 * np.pi * np.cumsum(np.geomspace(220, 440, len(tt))) / SR) * .3)
    return lp(x, 7000) * e * v
def bloom(v=.4, f=55):   # a soft low bloom on a big reveal: a warm sine body with a slow attack and a long tail, plus a quiet pad shimmer
    d = 2.6; tt = t_(d); body = np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / .07) * np.exp(-tt * 1.6)
    pad = sum(np.sin(2 * np.pi * mtof(m) * tt) for m in (62, 69, 74)) / 3 * np.minimum(1, tt / .25) * np.exp(-tt * 1.2) * .25
    return verb(norm(body + pad) , 2.4, .5) * v
def shimmer(d=1.6, v=.08):   # a soft glassy shimmer that fades in (no attack transient)
    tt = t_(d); y = sum(np.sin(2 * np.pi * mtof(m) * tt + k) for k, m in enumerate((86, 90, 93, 98))) / 4 * (1 + .3 * np.sin(2 * np.pi * 5 * tt))
    return verb(y * soft_env(d, .35, .9), 2.0, .5) * v
def glide(d=1.0, v=.08, f0=330, f1=660):   # a smooth tonal glide under a growing or shrinking shape
    tt = t_(d); y = np.sin(2 * np.pi * np.cumsum(np.geomspace(f0, f1, len(tt))) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(np.geomspace(f0, f1, len(tt))) / SR)
    return verb(lp(y, 2500) * soft_env(d, .3, .5), 1.6, .4) * v
def air(d=2.0, v=.05):   # a breath of air / crackle-free texture for shatter or dissolve moments
    tt = t_(d); return verb(norm(bp(noise(d), 2500, 9000) * (.6 + .4 * np.sin(2 * np.pi * 3 * tt))) * soft_env(d, .3, .8), 1.8, .4) * v
def thud(v=.4, f=70):   # a soft landing: a round low body with a short airy touch, no click (6 ms attack)
    d = 1.4; tt = t_(d); body = np.sin(2 * np.pi * (f + 40 * np.exp(-tt * 18)) * tt) * np.minimum(1, tt / .006) * np.exp(-tt * 5.5)
    touch = lp(noise(d), 1800) * np.minimum(1, tt / .004) * np.exp(-tt * 30) * .35
    return verb(norm(body + touch), 1.2, .3) * v
def spin(d=1.5, v=.15):   # a turning whoosh with a gentle flutter, for things spinning or rotating
    tt = t_(d); return swoosh(d, 1) * (1 + .35 * np.sin(2 * np.pi * 7 * tt)) * v
def scan(d=1.0, v=.14):   # a bright sweep of light opening outward
    tt = t_(d); x = norm(sweep_noise(d, 1500, 9000) * .6 + np.sin(2 * np.pi * np.cumsum(np.geomspace(880, 1760, len(tt))) / SR) * .4)
    return verb(x * soft_env(d, .08, .35), 1.8, .45) * v
def melt(d=.8, v=.12):   # something melting / pouring down: a falling tone and air
    tt = t_(d); y = np.sin(2 * np.pi * np.cumsum(np.geomspace(880, 180, len(tt))) / SR) * .5 + sweep_noise(d, 4000, 400) * .5
    return verb(lp(norm(y), 6000) * soft_env(d, .05, .4), 1.6, .4) * v
def chime(v=.12, f=1568):   # a soft rounded bell (slow 15 ms attack, long tail) for a coin turning bright
    d = 2.2; tt = t_(d); y = sum(a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt / tau) for k, a, tau in [(1, 1, .9), (2.01, .4, .5), (3.0, .15, .3)])
    return verb(y * np.minimum(1, tt / .015), 2.0, .45) * v
# —— the studio library (tools/sfx-lib, ElevenLabs sound effects; user 2026-11-13: the synthesized effects sounded cheap) ——
_LIBC = {}
def lib(name, v=.2, lowpass=None):   # a library sound, mono, peak-normalised, with a soft 8 ms fade-in so it can never click
    if name not in _LIBC:
        p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx-lib', name + '.mp3'); x = load_mono(p); x = x / (np.abs(x).max() + 1e-9)
        n = int(.008 * SR); x[:n] *= np.linspace(0, 1, n); m = int(.03 * SR); x[-m:] *= np.linspace(1, 0, m); _LIBC[name] = x
    x = _LIBC[name]; x = lp(x, lowpass) if lowpass else x; return x * v
def draw_on(v=.12): return lib('draw-on-a', v, 7000)          # a glowing line drawing itself (bright, so softened)
def draw_on2(v=.12): return lib('draw-on-b', v, 7000)
# —— the bed ——
CH = [(50, 57, 62, 65, 69), (46, 53, 58, 62, 69), (41, 48, 57, 60, 64), (48, 55, 60, 64, 67)]   # Dm(add9), Bbmaj7-ish, F, C — warm, not happy, not dark
def ambient_bed(d, seed=0, seg=6.0):
    n = int(d * SR) + 3 * SR; out = np.zeros(n); tt_all = np.arange(n) / SR
    for b in range(int(d / seg) + 2):
        ch = CH[(b + seed) % 4]; t0 = b * seg - 1.5; L = seg + 3.0; tt = t_(L); e = soft_env(L, 2.0, 2.5)
        y = sum(sum(np.sin(2 * np.pi * mtof(m) * (1 + dt) * tt + p) for dt, p in [(-.002, 0), (.0025, 1.3)]) / 2 for m in ch[1:]) / 4
        y = lp(y, 1600) * e * .5 + np.sin(2 * np.pi * mtof(ch[0] - 12) * tt) * e * .35
        a = int(max(0, t0) * SR); s0 = int(max(0, -t0) * SR); m_ = min(len(y) - s0, n - a); out[a:a + m_] += y[s0:s0 + m_]
    airl = bp(noise(n / SR), 1800, 6000) * (.5 + .5 * np.sin(2 * np.pi * tt_all / 7.0)) * .06
    out = out + airl[:n]; out *= (1 + .12 * np.sin(2 * np.pi * tt_all / 9.0))
    return verb(out[:int(d * SR)], 3.0, .5)
# —— the mix ——
def load_mono(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def end_clean(vo):   # ElevenLabs files can end on a cut-off burst (sounds like a hand bumping the mic): find where the last word has died away and fade out before the burst
    w = int(.02 * SR); env = np.array([np.abs(vo[i:i + w]).max() for i in range(0, len(vo) - w, w)]); peak = env.max(); n = len(env)
    k = n - 1
    while k > 0 and env[k] > peak * .12: k -= 1           # step back over a loud tail at the very end
    if k == n - 1: return vo                                 # ends quietly: nothing to clean
    cut = min(len(vo), (k + 1) * w); f = int(.05 * SR); out = vo[:cut].copy(); out[-f:] *= np.linspace(1, 0, f) ** 2   # end at the start of the burst, faded
    return out
def smooth(x, sec): k = max(1, int(sec * SR)); return np.convolve(x, np.ones(k) / k, 'same')
CTA_AT = 1.3   # the call to action starts 1.3 s into the end card, after the logo's sound has bloomed
def cta_len(n, speed=1.10): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cta', f'cta-{n}-hu-x{speed:.2f}.mp3')], capture_output=True, text=True).stdout)
def write_mix(here, voice, fx, story, dur, dips=(), bed_level=.22, fx_level=2.0, logo_trim=0.0, seed=0, out='out/mix.wav', cta=None, cta_speed=1.10, cta_gain=.6):
    N = int(dur * SR) + SR
    bed = np.zeros(N); b = ambient_bed(story + 1.0, seed); bed[:min(N, len(b))] = b[:N]
    g = np.ones(N)
    for a, c in dips: ia, ic = int(a * SR), int(c * SR); g[ia:ic] = .45   # soft dips (never silence) just before a big moment
    g = smooth(g, .45); fi, fo = int(1.2 * SR), int(1.4 * SR); g[:fi] *= np.linspace(0, 1, fi); e0 = int((story + .1) * SR); g[e0 - fo:e0] *= np.linspace(1, 0, fo); g[e0:] = 0
    fx = fx[:N].copy(); n0, n1 = int((story - .6) * SR), int((story + .1) * SR); fx[n0:n1] *= np.linspace(1, 0, n1 - n0)[:, None]; fx[n1:] = 0
    vo = load_mono(os.path.join(here, voice)); vo = end_clean(vo)
    if cta:   # the spoken call to action over the end card, processed exactly like the voice so it sounds the same
        cv = end_clean(load_mono(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cta', f'cta-{cta}-hu-x{cta_speed:.2f}.mp3'))); sr_ = lambda x: np.sqrt(np.mean(x[np.abs(x) > np.abs(x).max() * .05] ** 2)); cv = cv * ((sr_(vo) / max(sr_(cv), 1e-9)) if np.abs(vo).max() > 1e-4 else 1.0) * cta_gain   # user 2026-11-13: a little quieter than the voice (0.6 = -4.4 dB)   # same loudness as the voice (user 2026-11-13: the CTA was too quiet)
        at = int((story + CTA_AT) * SR); full = np.zeros(max(len(vo), at + len(cv))); full[:len(vo)] = vo; full[at:at + len(cv)] += cv; vo = full
    vo = compress(norm(vo, .9), thr=.3, ratio=3); vb = np.zeros((N, 2)); n = min(len(vo), N); vb[:n, 0] = vo[:n]; vb[:n, 1] = vo[:n]
    env = smooth(np.abs(vb[:, 0]), .25); duck = np.clip(env / (env.max() * .3), 0, 1); duck = smooth(duck, .3)
    vr = np.sqrt(np.mean(vb[np.abs(vb[:, 0]) > .02] ** 2))
    br = np.sqrt(np.mean(bed[int(3 * SR):int(story * SR)] ** 2)); bed *= (vr * bed_level / max(br, 1e-9)) * g * (1 - .4 * duck)
    fr = np.percentile(np.abs(fx[:, 0]), 99.5); fxs = fx * (vr * 1.1 * fx_level / max(fr, 1e-6)) * (1 - .18 * duck)[:, None]
    mix = vb + fxs + np.stack([bed, bed], 1); mix = place_logo(mix, story + .2, SR, vr, logo_trim); mix = mix[:int(dur * SR)]
    mix[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR))[:, None]
    mix = np.stack([limit(compress(mix[:, c], thr=.18, ratio=2.5, att=.005, rel=.15), .7) for c in range(2)], 1)
    mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - dur) * SR), 2))])
    os.makedirs(os.path.join(here, 'out'), exist_ok=True); sf.write(os.path.join(here, out), mix.astype(np.float32), SR); print('mix', round(mix.shape[0] / SR, 1), 's')
