"""The end-card call to action (user 2026-11-13): David says one short line over the 23 logo end card; voice only, no text on screen.
Lines rotate from video to video (motion reels use 1-3, story films use 1, 2 and 4). Run once: python3 tools/cta/make_cta.py
Makes cta-N-hu.mp3 (ElevenLabs v3, voice David) and the sped-up copies cta-N-hu-x1.10.mp3 (motion) and cta-N-hu-x1.15.mp3 (stories)."""
import json, os, subprocess, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
LINES = {1: '[warmly] Kövess további marketingtippekért!', 2: '[warmly] Kövess, ha még több ilyen tippet szeretnél!', 3: '[warmly] Mentsd el, és kövess a következő tippért!', 4: '[warmly] Kövess, ha szereted az ilyen történeteket!'}
for n, text in LINES.items():
    out = os.path.join(HERE, f'cta-{n}-hu.mp3')
    if not os.path.exists(out):
        body = json.dumps({'text': text, 'model_id': 'eleven_v3', 'language_code': 'hu', 'voice_settings': {'stability': .5, 'similarity_boost': .8}}).encode()
        req = urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/M336tBVZHWWiWb4R54ui?output_format=mp3_44100_128', data=body, headers={'Content-Type': 'application/json'}, method='POST')
        open(out, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    for sp in (1.10, 1.15): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-filter:a', f'atempo={sp}', os.path.join(HERE, f'cta-{n}-hu-x{sp:.2f}.mp3')], check=True)
    print(n, text, round(float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout), 2), 's')
