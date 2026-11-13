"""Sound for Más főnök (boss-difference), user 2026-11-13: "use the exact music and sound effects of the inspiration video, just replace the
visual" — the reference's own audio from where its counters start (0.433 s) to its loop point: refs/ref-audio.wav, 15.104 s.
On top (user: "a bit louder sound effects on the hits"): a heavy punch on the hit and a kick that launches the worker out of the scene
(studio library, tools/sfx-lib). No end card and no call to action."""
import os, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'tools')); from motion_sound2 import lib, SR
HITS = [5.28, 5.8]
x, sr = sf.read(os.path.join(HERE, 'refs', 'ref-audio.wav')); assert sr == 48000
if x.ndim == 1: x = np.stack([x, x], 1)
ref_peak = np.abs(x).max()
def put(snd, t, v):   # library sounds are mono at SR; resample to 48 kHz and add
    n = int(len(snd) * 48000 / SR); y = np.interp(np.linspace(0, len(snd) - 1, n), np.arange(len(snd)), snd) * v; i = int(t * 48000); m = min(n, len(x) - i)
    x[i:i + m, 0] += y[:m]; x[i:i + m, 1] += y[:m]
put(lib('punch-hard', 1.0), HITS[0] - .02, .75 * ref_peak); put(lib('impact-soft-a', 1.0), HITS[0], .35 * ref_peak)
put(lib('kick-launch', 1.0), HITS[1] - .03, .8 * ref_peak); put(lib('punch-hard', 1.0), HITS[1] - .02, .5 * ref_peak)
x /= max(1.0, np.abs(x).max() / .98)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out', 'mix.wav'), x.astype(np.float32), 48000); print('mix: reference audio + louder punch and kick')
