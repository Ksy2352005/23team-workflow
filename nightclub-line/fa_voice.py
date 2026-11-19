"""A Persian voiceover for checking the film (user 2026-11-19: "persian voiceover so I double check the video"); the final film stays Hungarian.
Each Persian line (the back-translation in scripts-pdf/nightclub-line/script.md) is spoken by ElevenLabs (David, eleven_v3, Persian) and placed
where its Hungarian line starts, sped up (pitch kept) if it is longer than that line's slot, so it stays with the pictures.
    python3 fa_voice.py   -> refs/voiceover-fa.wav ; then  VO=refs/voiceover-fa.wav OUT=out/mix-fa.wav python3 mix.py
"""
import json, os, subprocess, urllib.request, re
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000; END = 66.3
W = json.loads(open(os.path.join(HERE, 'captions.js')).read().split('=', 1)[1].strip().rstrip(';')); T = lambda i: W[i][1]
md = open(os.path.join(HERE, '..', 'scripts-pdf', 'nightclub-line', 'script.md'), encoding='utf-8').read().split('## Persian', 1)[1]
FA = [re.sub(r'^\d+\.\s*', '', l).strip() for l in md.splitlines() if re.match(r'^\d+\.', l.strip())][:23]
AT = [0, 15, 20, 34, 40, 54, 60, 68, 72, 78, 86, 92, 98, 106, 114, 128, 135, 151, 158, 165, 175, 180, 188]
assert len(FA) == 23
# shorter spoken wording for the long lines (same meaning), so the Persian voice keeps up with the pictures
SHORT = {3: 'داخل، گروه موسیقی، بار و ۳۰۰ صندلی مخملی منتظرند… ولی هیچ‌کس ننشسته.',
         13: 'دربان دست‌به‌سینه می‌شود: «امشب نه.»', 14: 'ولی خانه نمی‌روند، ته صف می‌ایستند.',
         15: 'مردی از تاکسی پیاده می‌شود و توی صف می‌ایستد. حتی نمی‌پرسد برای چیست.', 16: 'ساعت یازده، صف به سر کوچه رسیده.',
         17: 'نیمه‌شب صف دور کل بلوک پیچیده و مردم به دربان پول تعارف می‌کنند.', 18: 'تازه آن موقع سر تکان می‌دهد و طناب را برمی‌دارند.',
         22: 'می‌دانی، هیچ‌کس نمی‌خواهد در سالن خالی بنشیند.'}
for k, v in SHORT.items(): FA[k - 1] = v
def tts(text, path):
    if os.path.exists(path): return
    body = json.dumps({'text': text, 'model_id': 'eleven_v3', 'language_code': 'fa', 'voice_settings': {'stability': .5, 'similarity_boost': .8}}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/M336tBVZHWWiWb4R54ui?output_format=mp3_44100_128', data=body, headers={'Content-Type': 'application/json'}, method='POST')
    open(path, 'wb').write(urllib.request.urlopen(req, timeout=180).read())
def pcm(path, tempo=1.):
    f = ['-filter:a', f'atempo={tempo}'] if abs(tempo - 1) > .01 else []
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', path, *f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def trim(x):   # cut leading/trailing silence
    e = np.abs(x) > np.abs(x).max() * .02; idx = np.where(e)[0]; return x[max(0, idx[0] - 400): idx[-1] + 2400]
N = int(END * SR); vo = np.zeros(N); prev = 0.
for k, text in enumerate(FA):
    p = os.path.join(HERE, 'refs', 'fa', f'l{k:02d}.mp3'); tts(text, p)
    a = max(0., T(AT[k]) - .05); b = (T(AT[k + 1]) - .15) if k + 1 < len(AT) else END - .3
    x = trim(pcm(p)); dur = len(x) / SR; tempo = min(1.5, max(1.25, dur / (b - a)))   # evenly quick, never two lines at once
    x = trim(pcm(p, tempo)); a = max(a, prev + .07)
    i = min(int(a * SR), N); j = min(N, i + len(x)); vo[i:j] += x[:j - i]; prev = a + len(x) / SR
    print(f'{k + 1:2d} at {a:5.2f}s (picture {T(AT[k]):5.2f}s)  x{tempo:.2f}  ends {prev:5.2f}')
vo = vo / np.abs(vo).max() * .85
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', os.path.join(HERE, 'refs', 'voiceover-fa.wav')], input=vo.tobytes(), check=True)
print('refs/voiceover-fa.wav')
