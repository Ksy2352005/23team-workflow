"""The motion-reel sound library (user 2026-11-13: the synthesized effects sounded cheap). Studio-quality effects from the ElevenLabs
sound-effects API (key injected by the environment), made once and reused by every reel. Elegant motion-design sounds only:
no music, no voice, no harsh clicks, no ding-like bells. Run: python3 tools/sfx-lib/make_lib.py (skips files that already exist)."""
import json, os, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
STYLE = ', premium minimal motion graphics sound design, clean, high quality, no music, no voice'
LIB = {
  'whoosh-soft-a': (1.0, 'soft airy whoosh passing by, smooth gentle transition'),
  'whoosh-soft-b': (1.0, 'gentle silky swoosh, light fabric-like air movement, smooth transition'),
  'whoosh-long': (1.8, 'slow airy swoosh that builds and fades, cinematic smooth scene transition'),
  'zoom-through': (1.0, 'fast airy zoom whoosh rushing through a tunnel of light, smooth'),
  'draw-on-a': (1.0, 'soft light stroke being drawn, delicate rising airy shimmer, glowing line appearing'),
  'draw-on-b': (1.2, 'gentle magical sparkle sweep as a glowing outline draws itself, soft and airy'),
  'reveal-shimmer': (1.5, 'warm soft shimmer reveal with light glints, elegant magical reveal'),
  'impact-soft-a': (1.5, 'deep warm cinematic boom hit with a smooth reverb tail, soft attack, emotional emphasis'),
  'impact-soft-b': (1.5, 'soft warm sub bass thump with a short airy tail, elegant emphasis hit'),
  'riser-short': (1.5, 'short airy cinematic riser building gently into a reveal'),
  'swell-glow': (2.0, 'warm soft ambient swell of light blooming, smooth pad swell, gentle'),
  'morph-liquid': (1.0, 'soft liquid morph whoosh, smooth shape transforming, gentle'),
  'settle-soft': (0.8, 'soft gentle landing tap with a felt-like muffled touch, very subtle'),
  'sparkle-soft': (1.5, 'very soft warm sparkle twinkle fading, delicate, low volume, no bell'),
}
for name, (dur, text) in LIB.items():
    out = os.path.join(HERE, name + '.mp3')
    if os.path.exists(out): continue
    body = json.dumps({'text': text + STYLE, 'duration_seconds': dur, 'prompt_influence': .6}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation', data=body, headers={'Content-Type': 'application/json'}, method='POST')
    open(out, 'wb').write(urllib.request.urlopen(req, timeout=120).read()); print('made', name)
open(os.path.join(HERE, 'README.md'), 'w').write('# Motion-reel sound library\n\nStudio-quality effects from the ElevenLabs sound-effects API, made by `make_lib.py` (prompts listed there). Generated for 23 Team; reused by every motion reel through `tools/motion_sound2.py` (`lib(name)`).\n')
