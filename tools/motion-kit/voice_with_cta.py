"""A new video's voice WITH its call to action, in one ElevenLabs request (CLAUDE.md, user 2026-11-15: "same voice and volume").

    /root/lemo-opuscar/.venv/bin/python tools/motion-kit/voice_with_cta.py <folder> <cta 1|3|4> [speed=1.1] [--tight]

- reads refs/script-hu-v3-tags.txt (or refs/script-hu.txt), adds the CTA sentence at the end (no tag), and makes David's voice
  (eleven_v3, Hungarian, stability .5, similarity .8) in ONE request -> refs/voiceover-with-cta-hu.mp3
- speeds it up (pitch kept), cuts the CTA off after the last pause -> refs/cta-<N>-same-voice-x<speed>.wav (placed by write_mix(cta_file=...))
- the script part -> refs/voiceover-hu-x<speed>.wav; with --tight, pauses over 0.3 s are cut to 0.18 s (motion reels) -> ...-tight.wav
- times every word on the final voice with Whisper and align.py -> captions.js
"""
import json, os, shutil, subprocess, sys, urllib.request
import numpy as np
LINES = {1: 'Kövess további marketingtippekért!', 3: 'Mentsd el, és kövess a következő tippért!', 4: 'Kövess, ha szereted az ilyen történeteket!'}
args = [a for a in sys.argv[1:] if not a.startswith('--')]; tight = '--tight' in sys.argv
D, n = args[0], int(args[1]); speed = float(args[2]) if len(args) > 2 else 1.1
R = os.path.join(D, 'refs'); SR = 44100
tags = os.path.join(R, 'script-hu-v3-tags.txt'); text = open(tags if os.path.exists(tags) else os.path.join(R, 'script-hu.txt'), encoding='utf-8').read().strip().replace('\n', ' ') + ' ' + LINES[n]
raw = os.path.join(R, 'voiceover-with-cta-hu.mp3')
if not os.path.exists(raw):
    body = json.dumps({'text': text, 'model_id': 'eleven_v3', 'language_code': 'hu', 'voice_settings': {'stability': .5, 'similarity_boost': .8}}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/M336tBVZHWWiWb4R54ui?output_format=mp3_44100_128', data=body, headers={'Content-Type': 'application/json'}, method='POST')
    open(raw, 'wb').write(urllib.request.urlopen(req, timeout=300).read())
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', raw, '-filter:a', f'atempo={speed}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
fr = int(SR * .01); rms = np.sqrt(np.convolve(x ** 2, np.ones(fr) / fr, 'same'))[::fr]; on = rms > rms.max() * .03; idx = np.where(on)[0]
def runs(a, b, min_len):   # silent runs (start, end) in frames
    out, k = [], 0
    for i in range(a, b + 1):
        if not on[i]: k += 1
        else:
            if k >= min_len: out.append((i - k, i))
            k = 0
    return out
cut = runs(idx[0], idx[-1], 25)[-1]   # the pause before the CTA
wav = lambda arr, p: subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', p], input=arr.tobytes(), check=True)
a, b = cut[1] * fr - int(.04 * SR), min(len(x), idx[-1] * fr + int(.12 * SR)); cta = x[a:b].copy(); f = fr; cta[:f] *= np.linspace(0, 1, f); cta[-4 * f:] *= np.linspace(1, 0, 4 * f)
wav(cta, os.path.join(R, f'cta-{n}-same-voice-x{speed:.2f}.wav'))
e = cut[0] * fr + int(.15 * SR); vo = x[:e].copy(); vo[-6 * f:] *= np.linspace(1, 0, 6 * f)
name = f'voiceover-hu-x{speed:.2f}'
if tight:   # pauses over 0.3 s -> 0.18 s
    keep, last = [], 0
    for s0, s1 in runs(idx[0], cut[0] - 1, 30):
        keep.append(vo[last * fr:(s0 + 9) * fr]); last = s1 - 9   # keep 0.09 s of silence on each side
    keep.append(vo[last * fr:]); vo = np.concatenate(keep); name += '-tight'
out = os.path.join(R, name + '.wav'); wav(vo, out)
py = '/root/lemo-opuscar/.venv/bin/python'; ww = os.path.join(R, 'whisper-words.json')
subprocess.run([py, '-c', f"""
from faster_whisper import WhisperModel; import json
m=WhisperModel('large-v3-turbo',compute_type='int8'); segs,_=m.transcribe({out!r},language='hu',word_timestamps=True,beam_size=5)
W=[[w.word.strip(),round(w.start,2),round(w.end,2)] for s in segs for w in s.words]; json.dump(W,open({ww!r},'w'),ensure_ascii=False)"""], check=True, stderr=subprocess.DEVNULL)
subprocess.run([py, os.path.join(D, 'align.py'), ww], check=True, stdout=subprocess.DEVNULL)
W = json.loads(open(os.path.join(D, 'captions.js')).read().split('=', 1)[1].strip().rstrip(';'))
print(text); print(f'voice {len(vo) / SR:.2f} s -> {out}; CTA {len(cta) / SR:.2f} s')
print(' '.join(f'{i}:{w}@{a}' for i, (w, a, b) in enumerate(W)))
