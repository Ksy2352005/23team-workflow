"""Transcribe videos or audio files (any format ffmpeg reads: mp4, mov, mp3, m4a, wav...) with Whisper large-v3-turbo.

  python tools/transcribe.py FILE_OR_FOLDER [...] [--lang hu|en|ar|auto] [--out DIR] [--model large-v3-turbo]

For each file it writes, in --out (default: transcripts/):
  <name>.txt         the transcript, one sentence per line (ready to paste as a script)
  <name>.srt         subtitles with timings
  <name>-words.json  every word with its start/end time (for caption timing; align.py reads this format)
and prints the text. A folder is searched for media files. Runs on CPU; about half a minute per minute of speech."""
import argparse, json, os, re, sys
from faster_whisper import WhisperModel

MEDIA = ('.mp4', '.mov', '.m4v', '.mkv', '.webm', '.avi', '.mp3', '.m4a', '.wav', '.aac', '.ogg', '.opus', '.flac')
ap = argparse.ArgumentParser(); ap.add_argument('paths', nargs='+'); ap.add_argument('--lang', default='auto'); ap.add_argument('--out', default='transcripts'); ap.add_argument('--model', default='large-v3-turbo')
a = ap.parse_args()
files = []
for p in a.paths:
    if os.path.isdir(p): files += sorted(os.path.join(p, f) for f in os.listdir(p) if f.lower().endswith(MEDIA))
    else: files.append(p)
if not files: sys.exit('no media files found')
os.makedirs(a.out, exist_ok=True)
model = WhisperModel(a.model, compute_type='int8', cpu_threads=os.cpu_count() or 4)
ts = lambda s: f'{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(s * 1000 % 1000):03d}'
for f in files:
    segs, info = model.transcribe(f, language=None if a.lang == 'auto' else a.lang, beam_size=5, vad_filter=True, word_timestamps=True)
    # drop what Whisper invents over music or silence (a lone low-confidence word at the end, e.g. over a logo sound)
    wp = lambda g: sum(w.probability for w in g.words) / len(g.words) if g.words else 0
    segs = [g for g in segs if not (g.no_speech_prob > .5 or (len(g.text.split()) <= 3 and (wp(g) < .5 or g.avg_logprob < -.9)))]
    segs = list(segs); name = os.path.splitext(os.path.basename(f))[0]; base = os.path.join(a.out, name)
    text = ' '.join(s.text.strip() for s in segs)
    sentences = [x.strip() for x in re.split(r'(?<=[.!?…])\s+', text) if x.strip()]
    open(base + '.txt', 'w').write('\n'.join(sentences) + '\n')
    open(base + '.srt', 'w').write(''.join(f'{i + 1}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n\n' for i, s in enumerate(segs)))
    json.dump([[w.word.strip(), round(w.start, 2), round(w.end, 2)] for s in segs for w in (s.words or [])], open(base + '-words.json', 'w'), ensure_ascii=False)
    print(f'=== {os.path.basename(f)}  [{info.language}, {info.duration:.1f} s] → {base}.txt / .srt / -words.json'); print('\n'.join(sentences)); print()
