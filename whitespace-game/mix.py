"""Sound for Whitespace Game: David's Hungarian voice (ElevenLabs v3, 1.18x) over the reference video's own sound design.
The reference's soundtrack (music + effects, voice removed with Demucs: refs/ref-soundtrack.wav, kept out of git) is cut at every sentence
and time-stretched (Rubber Band, pitch kept) so each of its hits, drops and pauses lands on the same sentence of the Hungarian voice.
The soundtrack sits at the same level under the voice as in the reference. Then the locked 23 logo sound. Writes out/mix.wav."""
import os, subprocess, sys
import numpy as np
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core', 'audio'))
from sfx import SR, compress, limit, norm
sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from logo_sting import place_logo
DUR, STORY = 59.4, 56.9
# (time in the reference, time in the Hungarian voice): the start of each sentence, and a few key words inside them
PAIRS = [(0.0, 0.0), (1.82, 1.58), (4.12, 3.44), (5.32, 4.56), (7.50, 6.76), (10.20, 9.14), (11.62, 10.32), (14.32, 12.52), (18.22, 15.36), (20.46, 17.46),
         (21.90, 18.92), (28.04, 23.66), (29.47, 24.56), (32.47, 26.30), (36.99, 30.60), (38.85, 33.06), (43.73, 36.74), (45.39, 38.60), (47.05, 40.68),
         (48.37, 41.64), (49.77, 42.30), (51.53, 44.10), (54.95, 46.40), (57.53, 48.96), (59.99, 51.26), (62.65, 54.26), (64.27, 55.90), (65.60, 57.23)]
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
def stretch(o0, o1, h0, h1):   # one piece of the reference soundtrack, fitted to the Hungarian timing
    tempo = (o1 - o0) / (h1 - h0); src = os.path.join(HERE, 'refs', 'ref-soundtrack.wav')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-af', f'atrim={o0}:{o1},asetpts=PTS-STARTPTS,rubberband=tempo={tempo:.5f}:transients=crisp,aresample={SR}', '-ac', '2', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2); n = int(round((h1 - h0) * SR))
    return x[:n] if len(x) >= n else np.vstack([x, np.zeros((n - len(x), 2))])
N = int(DUR * SR) + SR
music = np.zeros((N, 2)); XF = int(.012 * SR)
for (o0, h0), (o1, h1) in zip(PAIRS, PAIRS[1:]):
    seg = stretch(o0, o1, h0, h1); a = int(h0 * SR); seg = seg.copy()
    seg[:XF] *= np.linspace(0, 1, XF)[:, None]; seg[-XF:] *= np.linspace(1, 0, XF)[:, None]   # tiny crossfades at the joins, no clicks
    n = min(len(seg), N - a); music[a:a + n] += seg[:n]
f0, f1 = int((STORY - .7) * SR), int((STORY + .05) * SR); music[f0:f1] *= np.linspace(1, 0, f1 - f0)[:, None]; music[f1:] = 0   # the soundtrack fades with the picture into the end card
# the voice
vo = load(os.path.join(HERE, 'refs/voiceover-hu-x1.18.mp3')).mean(1); vo = compress(norm(vo, .9), thr=.3, ratio=3)
voice = np.zeros((N, 2)); voice[:len(vo), 0] = vo[:N]; voice[:len(vo), 1] = vo[:N]
# the reference's balance: its soundtrack sits 4.5 dB (RMS) under its voice; the same here
vr = np.sqrt(np.mean(voice[np.abs(voice[:, 0]) > .02] ** 2)); mr = np.sqrt(np.mean(music[:int(STORY * SR)] ** 2))
mix = voice + music * (vr * 0.599 / max(mr, 1e-9))
mix = place_logo(mix, STORY + .2, SR, vr, 0.9)   # the locked 23 logo sound on the end card
mix = mix[:int(DUR * SR)]; mix[-int(.5 * SR):] *= np.linspace(1, 0, int(.5 * SR))[:, None]
mix = np.stack([limit(compress(mix[:, c], thr=.16, ratio=3, att=.002, rel=.1), .7) for c in range(2)], 1)
mix = np.concatenate([mix, np.zeros((int(max(3.2, 58.5 - DUR) * SR), 2))])
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix', mix.shape[0] / SR, np.abs(mix).max())
