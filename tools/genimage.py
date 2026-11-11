"""Generate a picture with Cloudflare Workers AI (FLUX.1 schnell, free daily allowance, Apache-2.0 model: commercial use OK).
The Cloudflare API credential is injected by the environment's proxy; no key in code.

  python3 tools/genimage.py "prompt" out.jpg [--steps 8] [--n 1]

Writes out.jpg (1024x1024); with --n 3 writes out-1.jpg, out-2.jpg, out-3.jpg (pick the best). Prints the file paths."""
import argparse, base64, json, sys, urllib.request
ACCOUNT = '917b76cb7f3f3045683a55e5f8a67a43'
MODEL = '@cf/black-forest-labs/flux-1-schnell'
ap = argparse.ArgumentParser(); ap.add_argument('prompt'); ap.add_argument('out'); ap.add_argument('--steps', type=int, default=8); ap.add_argument('--n', type=int, default=1)
a = ap.parse_args()
for k in range(a.n):
    body = json.dumps({'prompt': a.prompt, 'steps': min(8, a.steps)}).encode()
    req = urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/run/{MODEL}', data=body, headers={'Content-Type': 'application/json'}, method='POST')
    d = json.load(urllib.request.urlopen(req, timeout=120))
    if not d.get('success'): sys.exit(f'error: {d.get("errors")}')
    out = a.out if a.n == 1 else a.out.replace('.jpg', f'-{k + 1}.jpg')
    open(out, 'wb').write(base64.b64decode(d['result']['image'])); print(out)
