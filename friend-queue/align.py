"""Times every word of the script (refs/script-hu.txt) for the captions, from Whisper's word timings on the voice at 1.15x.
Whisper mishears a few words, so the script is matched to it letter by letter and each script word takes the time of its first matched letter.
Writes captions.js. Run once with the library's Python after transcribing (WORDS = a JSON list of [word, start, end])."""
import json, os, re, sys, unicodedata
from difflib import SequenceMatcher
HERE = os.path.dirname(os.path.abspath(__file__))
words = json.load(open(sys.argv[1]))
script = open(os.path.join(HERE, 'refs', 'script-hu.txt')).read().split()
norm = lambda s: ''.join(ch for ch in unicodedata.normalize('NFD', s.lower()) if ch.isalpha() or ch.isdigit()).replace('10', 'tiz')
def chars(toks):
    out, own = [], []
    for i, w in enumerate(toks):
        for ch in norm(w): out.append(ch); own.append(i)
    return ''.join(out), own
A, oa = chars(script); B, ob = chars([w for w, _, _ in words])
m = [None] * len(A)
for blk in SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
    for k in range(blk.size): m[blk.a + k] = blk.b + k
start = [None] * len(script); end = [None] * len(script)
for ia, ib in enumerate(m):
    if ib is None: continue
    w = oa[ia]; wb = words[ob[ib]]
    if start[w] is None: start[w] = wb[1]
    end[w] = wb[2]
# fill the gaps between known words
for i in range(len(script)):
    if start[i] is None:
        j = i - 1; k = i + 1
        while k < len(script) and start[k] is None: k += 1
        a = end[j] if j >= 0 and end[j] is not None else 0.0; b = start[k] if k < len(script) else a + .4
        n = k - i; start[i] = round(a + (b - a) * 0.5 / n, 2); end[i] = start[i] + .2
for i in range(1, len(script)):   # two script words matched to one heard word: space them out a little
    if start[i] <= start[i - 1]: start[i] = start[i - 1] + .14
out = [[w, round(s, 2), round(e, 2)] for w, s, e in zip(script, start, end)]
open(os.path.join(HERE, 'captions.js'), 'w').write('// The script, word by word, with the time each word is spoken (made by align.py from Whisper word timings, voice at 1.15x).\nexport const WORDS = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print(len(out), 'words;', ' '.join(f'{w}@{s}' for w, s, e in out[:40]))
