"""Sound for the nightclub film: David's Hungarian voice (tightened), an original late-night jazz bed (ElevenLabs music, refs/music.mp3, made for this video),
and ElevenLabs effects on the story beats (refs/sfx). Writes out/mix.wav. No end card, no call to action (exact remake: it ends where the reference ends)."""
import json, os, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
GAP_AT, GAP = 38.55, 3.8   # a pause after „Beállnak a sor végére.” for the slower walk and the taxi (user 2026-11-20); the picture (2d/main.js) has the same
END = 66.3 + GAP; M = lambda t: t + GAP if t >= GAP_AT else t
W = json.loads(open(os.path.join(HERE, 'captions.js')).read().split('=', 1)[1].strip().rstrip(';')); T = lambda i: M(W[i][1])
def load(p):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, p), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
N = int(END * SR); vo = np.zeros(N); v = load(os.environ.get('VO', 'refs/voiceover-hu-x1.15-tight.wav')); v = v / np.abs(v).max() * .85
def deeper(x):   # the doorman's lines a little deeper than the narrator (user 2026-11-20), same length
    y = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'rubberband=pitch=0.8:formant=preserved,bass=g=3:f=140', '-f', 'f64le', '-'],
                         input=x.tobytes(), capture_output=True, check=True).stdout, np.float64)[:len(x)].copy()
    return np.concatenate([y, np.zeros(len(x) - len(y))])
for a, b in ((W[86][1] - .06, W[91][2] + .08), (W[103][1] - .06, W[105][2] + .08)):   # „300 helyünk van. Miért mondjak nemet?” and „Ma este nem.”
    i, j = int(a * SR), int(b * SR); y = deeper(v[i:j]); k = int(.02 * SR); y[:k] = y[:k] * np.linspace(0, 1, k) + v[i:i + k] * np.linspace(1, 0, k); y[-k:] = y[-k:] * np.linspace(1, 0, k) + v[j - k:j] * np.linspace(0, 1, k); v[i:i + len(y)] = y
g = int(GAP_AT * SR); v = np.concatenate([v[:g], np.zeros(int(GAP * SR)), v[g:]]); vo[:min(N, len(v))] = v[:N]
fx = np.zeros(N)
def add(name, t, g, fade_in=0., fade_out=.3, dur=None):
    x = load(f'refs/sfx/{name}.mp3'); x = x / (np.abs(x).max() + 1e-9)
    if dur: x = x[:int(dur * SR)]
    n = len(x); e = np.ones(n)
    if fade_in: k = min(n, int(fade_in * SR)); e[:k] = np.linspace(0, 1, k)
    if fade_out: k = min(n, int(fade_out * SR)); e[n - k:] *= np.linspace(1, 0, k)
    a = int(t * SR); b = min(N, a + n)
    if a < N: fx[a:b] += (x * e)[:b - a] * g
def bed(name, a, b, g):   # a loop under a stretch of the film, faded at both ends
    x = load(f'refs/sfx/{name}.mp3'); x = x / (np.abs(x).max() + 1e-9); n = int((b - a) * SR); y = np.resize(x, n); e = np.ones(n); k = min(n // 2, int(.5 * SR)); e[:k] = np.linspace(0, 1, k); e[n - k:] = np.linspace(1, 0, k)
    fx[int(a * SR):int(a * SR) + n] += (y * e)[:N - int(a * SR)] * g
# the street at night under every outside stretch; the waiting line murmurs
for a, b in ((0, 5.8), (13.2, 28.2), (29.1, 51.6 + GAP), (54.4 + GAP, 59.6 + GAP)): bed('street-night', a, b, .12)
for a, b in ((2.8, 4.6), (18.1, 23.1), (40.0 + GAP, 47.2 + GAP)): bed('crowd-murmur', a, b, .14)
add('cash-flick', T(5), .35); add('band-hit', T(20) - .05, .3); add('door-clunk', T(41) - .1, .35); add('footsteps-group', T(45), .3, fade_out=.8)
add('rope-unhook', T(52), .4); add('gasp-cartoon', T(86) - .05, .28); add('gasp-cartoon', T(106), .25); add('footsteps-group', T(110) - .1, .32, fade_out=.6, dur=GAP_AT + 2.0 - T(110) + .1); add('taxi-door', GAP_AT + 2.4, .4); add('footsteps-group', GAP_AT + 3.8, .22, fade_out=.5, dur=1.6)
add('cash-flick', T(146), .3); add('rope-unhook', T(155) + .2, .45); add('crowd-cheer', T(158) - .1, .5, fade_out=.6); [add('cash-flick', T(165) + .15 + k * .55, .32) for k in range(4)]; add('footsteps-group', T(172), .25, fade_out=.8)
# the music: low under the voice, ducked while he speaks
m = load('refs/music.mp3'); m = m / (np.abs(m).max() + 1e-9)
g, k = int(GAP_AT * SR), int(.4 * SR); rep = m[g - int(GAP * SR) - k:g]; m = np.concatenate([m[:g - k], m[g - k:g] * np.linspace(1, 0, k) + rep[:k] * np.linspace(0, 1, k), rep[k:], m[g:]])   # the music runs on through the pause (a repeated bar)
mus = np.zeros(N); mus[:min(N, len(m))] = m[:N]
env = np.convolve(np.abs(vo), np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .45 * np.clip(env / (env.max() * .25), 0, 1)
mus *= .22 * duck; k = int(1.2 * SR); mus[-k:] *= np.linspace(1, 0, k)
mix = vo + fx + mus; mix = mix / np.abs(mix).max() * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '2', os.path.join(HERE, os.environ.get('OUT', 'out/mix.wav'))], input=mix.tobytes(), check=True)
print('mix.wav', round(N / SR, 2), 's')
