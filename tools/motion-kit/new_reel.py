"""Start a new neon motion reel:  python3 tools/motion-kit/new_reel.py <folder> <locked script .txt> "<Title>" [speed=1.1]
Creates the folder with the motion kit (kit.js, fonts, logo), index.html and .gitignore; makes David's voice (ElevenLabs v3, Hungarian;
uses refs/script-hu-v3-tags.txt for delivery tags if it already exists), speeds it up, and times every word (captions.js).
The voice key is injected by the environment's proxy."""
import json, os, re, shutil, subprocess, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); KIT = os.path.join(ROOT, 'tools', 'motion-kit')
folder, script, title = sys.argv[1], sys.argv[2], sys.argv[3]; speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.1
D = os.path.join(ROOT, folder); os.makedirs(os.path.join(D, 'refs'), exist_ok=True); os.makedirs(os.path.join(D, 'fonts'), exist_ok=True)
shutil.copy(os.path.join(KIT, 'kit.js'), D); shutil.copy(os.path.join(KIT, 'logo-23.png'), D)
for f in os.listdir(KIT):
    if f.endswith('.ttf') or f.startswith('OFL'): shutil.copy(os.path.join(KIT, f), os.path.join(D, 'fonts'))
shutil.copy(os.path.join(ROOT, script), os.path.join(D, 'refs', 'script-hu.txt'))
open(os.path.join(D, '.gitignore'), 'w').write('stills/\nout/\n*.mp4\n')
open(os.path.join(D, 'index.html'), 'w').write(f'''<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title>
<style>@font-face{{font-family:'Unbounded';font-weight:200 900;src:url(fonts/Unbounded.ttf) format('truetype')}}@font-face{{font-family:'Inter';font-weight:100 900;src:url(fonts/Inter.ttf) format('truetype')}}@font-face{{font-family:'JBMono';font-weight:100 800;src:url(fonts/JetBrainsMono.ttf) format('truetype')}}@font-face{{font-family:'Montserrat';font-weight:700;src:url(fonts/Montserrat-Bold.ttf) format('truetype')}}@font-face{{font-family:'Cormorant';font-weight:300 700;src:url(fonts/CormorantGaramond.ttf) format('truetype')}}html,body{{margin:0;background:#00113F;overflow:hidden}}canvas{{display:block}}</style>
</head><body><canvas id="c"></canvas>
<script type="module" src="main.js"></script></body></html>
''')
tags = os.path.join(D, 'refs', 'script-hu-v3-tags.txt'); text = open(tags if os.path.exists(tags) else os.path.join(D, 'refs', 'script-hu.txt')).read().strip().replace('\n', ' ')
body = json.dumps({'text': text, 'model_id': 'eleven_v3', 'language_code': 'hu', 'voice_settings': {'stability': .5, 'similarity_boost': .8}}).encode()
req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/M336tBVZHWWiWb4R54ui?output_format=mp3_44100_128', data=body, headers={'Content-Type': 'application/json'}, method='POST')
open(os.path.join(D, 'refs', 'voiceover-hu.mp3'), 'wb').write(urllib.request.urlopen(req, timeout=300).read())
vo = os.path.join(D, 'refs', f'voiceover-hu-x{speed:.2f}.mp3'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(D, 'refs', 'voiceover-hu.mp3'), '-filter:a', f'atempo={speed}', vo], check=True)
py = '/root/lemo-opuscar/.venv/bin/python'
subprocess.run([py, '-c', f"""
from faster_whisper import WhisperModel; import json
m=WhisperModel('large-v3-turbo',compute_type='int8'); segs,_=m.transcribe({vo!r},language='hu',word_timestamps=True,beam_size=5)
W=[[w.word.strip(),round(w.start,2),round(w.end,2)] for s in segs for w in s.words]; json.dump(W,open({os.path.join(D,'refs','whisper-words.json')!r},'w'),ensure_ascii=False)"""], check=True, stderr=subprocess.DEVNULL)
shutil.copy(os.path.join(ROOT, 'whitespace-game', 'align.py'), D); subprocess.run([py, os.path.join(D, 'align.py'), os.path.join(D, 'refs', 'whisper-words.json')], check=True, stdout=subprocess.DEVNULL)
W = json.loads(open(os.path.join(D, 'captions.js')).read().split('=', 1)[1].strip().rstrip(';'))
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', vo], capture_output=True, text=True).stdout)
print(f'voice {dur:.1f} s;', ' '.join(f'{i}:{w}@{a}' for i, (w, a, b) in enumerate(W)))
