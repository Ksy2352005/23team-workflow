"""The call to action in the script's own voice (CLAUDE.md, user 2026-11-15: "same voice and volume").

    python3 tools/cta/cta_with_script.py <film> <cta 1|3|4> [speed=1.15]

For a film whose voiceover already exists: the script's last two lines (with their v3 delivery tags, from
refs/script-hu-v3-tags.txt, or refs/script-hu.txt) plus the CTA sentence (no tag) are spoken in ONE ElevenLabs
request (voice David, the same model and settings as the voiceover), so the CTA flows on in the same tone.
The CTA is then cut out after the last pause and saved as <film>/refs/cta-<N>-same-voice-x<speed>.wav.
The film's mix.py places it on the end card at the voice's own speech level (gain 1.0).
For a NEW video, simply add the CTA line to the end of the voiceover text instead.
"""
import json, os, subprocess, sys, urllib.request
import numpy as np
LINES = {1: 'Kövess további marketingtippekért!', 3: 'Mentsd el, és kövess a következő tippért!', 4: 'Kövess, ha szereted az ilyen történeteket!'}
film, n = sys.argv[1], int(sys.argv[2]); speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.15
refs = os.path.join(film, 'refs'); tags = os.path.join(refs, 'script-hu-v3-tags.txt')
lines = [l.strip() for l in open(tags if os.path.exists(tags) else os.path.join(refs, 'script-hu.txt'), encoding='utf-8') if l.strip()]
text = ' '.join(lines[-2:]) + ' ' + LINES[n]
raw = os.path.join(refs, f'cta-{n}-with-script.mp3')
if not os.path.exists(raw):
    body = json.dumps({'text': text, 'model_id': 'eleven_v3', 'language_code': 'hu', 'voice_settings': {'stability': .5, 'similarity_boost': .8}}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/M336tBVZHWWiWb4R54ui?output_format=mp3_44100_128', data=body, headers={'Content-Type': 'application/json'}, method='POST')
    open(raw, 'wb').write(urllib.request.urlopen(req, timeout=180).read())
SR = 44100
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', raw, '-filter:a', f'atempo={speed}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32).astype(np.float64)
fr = int(SR * .01); rms = np.sqrt(np.convolve(x ** 2, np.ones(fr) / fr, 'same'))[::fr]; on = rms > rms.max() * .03
idx = np.where(on)[0]; end = idx[-1]
# the pause before the CTA: the last silent run of >= 0.25 s before the end of speech
gaps, k = [], 0
for i in range(idx[0], end):
    if not on[i]: k += 1
    else:
        if k >= 25: gaps.append((i - k, i))
        k = 0
start = gaps[-1][1]
a, b = max(0, start * fr - int(.04 * SR)), min(len(x), end * fr + int(.12 * SR))
cta = x[a:b].copy(); f = int(.01 * SR); cta[:f] *= np.linspace(0, 1, f); cta[-4 * f:] *= np.linspace(1, 0, 4 * f)
out = os.path.join(refs, f'cta-{n}-same-voice-x{speed:.2f}.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', out], input=cta.tobytes(), check=True)
print(text); print(f'CTA {n}: {len(cta) / SR:.2f} s (cut at {a / SR:.2f} s of {len(x) / SR:.2f} s) -> {out}')
