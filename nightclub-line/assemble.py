"""Assembles the film: the rendered 3D frames (frames/<shot>/f_NNNNN.png, 540x960) upscaled to 1080x1920 with lanczos, the captions drawn sharp on top
(after the reference: big centred bold words, a few at a time, the spoken word highlighted, here in our turquoise), and the mix. -> nightclub-line-MASTER.mp4"""
import glob, json, os, subprocess
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); FPS = 24; END = 66.3; NF = round(END * FPS)
W = json.loads(open(os.path.join(HERE, 'captions.js')).read().split('=', 1)[1].strip().rstrip(';'))
FONT = os.path.join(HERE, 'refs', 'Montserrat-Bold.ttf'); TURQ = (46, 211, 198); WHITE = (244, 247, 255)
# caption chunks: up to 3 words, a new chunk after punctuation
chunks, cur = [], []
for i, (w, a, b) in enumerate(W):
    cur.append(i)
    if len(cur) >= 3 or w[-1] in '.,?!:…”' or (i + 1 < len(W) and W[i + 1][1] - b > .5): chunks.append(cur); cur = []
if cur: chunks.append(cur)
spans = [(c, W[c[0]][1] - .04, (W[chunks[k + 1][0]][1] - .04) if k + 1 < len(chunks) else W[c[-1]][2] + .4) for k, c in enumerate(chunks)]
frames = {}
for p in glob.glob(os.path.join(HERE, 'frames', '*', 'f_*.png')):
    if '/preview/' in p or '/test/' in p: continue
    frames[int(p.rsplit('_', 1)[1][:-4])] = p
font_cache = {}
def font(sz):
    if sz not in font_cache: font_cache[sz] = ImageFont.truetype(FONT, sz)
    return font_cache[sz]
def caption(img, t):
    sp = next((s for s in spans if s[1] <= t < s[2]), None)
    if not sp: return
    idx = sp[0]; words = [W[i][0] for i in idx]; now = max([i for i in idx if W[i][1] <= t + .02] or [idx[0]])
    d = ImageDraw.Draw(img); sz = 84
    while True:
        f = font(sz); widths = [d.textlength(w, font=f) for w in words]; space = d.textlength(' ', font=f); tot = sum(widths) + space * (len(words) - 1)
        if tot <= 900 or sz <= 50: break
        sz -= 4
    x = 540 - tot / 2; y = 1300; pop = min(1., (t - W[now][1] + .04) / .12)
    for i, w, wd in zip(idx, words, widths):
        col = TURQ if i == now else WHITE; s2 = sz if i != now else int(sz * (1 + .08 * (1 - pop)))
        d.text((x + wd / 2, y), w, font=font(s2), fill=col, anchor='mm', stroke_width=max(6, s2 // 11), stroke_fill=(5, 7, 16)); x += wd + space
out = os.path.join(HERE, 'nightclub-line-MASTER.mp4')
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1080x1920', '-r', str(FPS), '-i', '-', '-i', os.path.join(HERE, 'out', 'mix.wav'),
    '-filter_complex', '[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]', '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
last = None
for g in range(1, NF + 1):
    p = frames.get(g)
    if p: last = Image.open(p).convert('RGB').resize((1080, 1920), Image.LANCZOS)
    img = (last or Image.new('RGB', (1080, 1920), (4, 6, 15))).copy(); caption(img, (g - 1) / FPS); ff.stdin.write(img.tobytes())
ff.stdin.close(); ff.wait(); print(out, 'missing frames:', sum(1 for g in range(1, NF + 1) if g not in frames))
