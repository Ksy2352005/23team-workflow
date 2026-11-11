"""Print flat artwork onto a fitted photo frame so it looks printed, not pasted.

Usage: python3 printart.py <photo-frame.png> <art.png> <out.png> [--cyl x0 x1]

- photo-frame.png: 1080x1920 photo from fit.py
- art.png: 1080x1920 transparent artwork (rendered from frames html)
- --cyl x0 x1: the surface is a cylinder (can, cup, glass) spanning x0..x1;
  the art is wrapped round it so it compresses towards the edges.

The photo's own light and shadow is carried onto the artwork (shading =
photo brightness relative to the median brightness under the art), so the
print follows folds, curves and shadows of the real object.
"""
import sys

import numpy as np
from PIL import Image


def cylinder(art, x0, x1):
    a = np.asarray(art)
    cx, r = (x0 + x1) / 2, (x1 - x0) / 2
    xs = np.arange(a.shape[1], dtype=float)
    src = xs.copy()
    inside = np.abs(xs - cx) < r
    theta = np.arcsin(np.clip((xs[inside] - cx) / r, -1, 1))
    src[inside] = cx + theta * (2 * r / np.pi)
    idx = np.clip(np.round(src).astype(int), 0, a.shape[1] - 1)
    return Image.fromarray(a[:, idx])


def print_art(photo, art, out, cyl=None):
    p = Image.open(photo).convert("RGB")
    a = Image.open(art).convert("RGBA")
    if cyl:
        a = cylinder(a, *cyl)
    pa = np.asarray(p).astype(float) / 255
    aa = np.asarray(a).astype(float) / 255
    lum = pa @ np.array([0.299, 0.587, 0.114])
    alpha = aa[..., 3]
    ref = np.median(lum[alpha > 0.5]) if (alpha > 0.5).any() else lum.mean()
    shade = np.clip(lum / max(ref, 1e-3), 0.55, 1.25)[..., None]
    ink = np.clip(aa[..., :3] * shade, 0, 1)
    outp = pa * (1 - alpha[..., None]) + ink * alpha[..., None] * 0.97 + pa * alpha[..., None] * 0.03
    Image.fromarray((outp * 255).round().astype(np.uint8)).save(out)
    print("wrote", out)


if __name__ == "__main__":
    a = sys.argv
    cyl = (float(a[a.index("--cyl") + 1]), float(a[a.index("--cyl") + 2])) if "--cyl" in a else None
    print_art(a[1], a[2], a[3], cyl)
