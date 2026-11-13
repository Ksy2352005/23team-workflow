"""Sound for Más főnök (boss-difference), user 2026-11-13: "use the exact music and sound effects of the inspiration video, just replace the visual".
The picture follows the reference frame for frame (its times are the reference's minus 0.433 s, where its counters start from zero), so the
sound is the reference's own audio from that moment to its loop point (15.537 s in the screen recording): refs/ref-audio.wav, 15.104 s.
No end card and no call to action for this video."""
import os, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
shutil.copy(os.path.join(HERE, 'refs', 'ref-audio.wav'), os.path.join(HERE, 'out', 'mix.wav')); print('mix = reference audio, 15.104 s')
