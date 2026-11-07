"""Zoomed-out version of a printed photo: show the whole scene, not a tight crop.

Usage: python3 zoomout.py <photo> <art.png> <out.png> <cx> <cy> <label_w> <target> [--cyl x0 x1] [--zoom 1.0]

<art.png> was drawn for the tight crop that `fit.py photo ... cx cy label_w target`
produces. This script uses the full height of the photo instead (9:16 crop,
centred on the label horizontally), moves and scales the artwork to match,
prints it with printart, and saves the result.
--cyl x0 x1   cylinder span in the tight-crop frame (same numbers as before)
--zoom z      1.0 = full photo height; >1 zooms back in a little
"""
import os
import sys
import tempfile

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from printart import print_art  # noqa: E402

W, H = 1080, 1920


def tight_scale(w, h, cx, cy, lw, target):
    return max(target / lw, W / w, H / h, W / (2 * cx), W / (2 * (w - cx)), H / (2 * cy), H / (2 * (h - cy)))


def main():
    a = sys.argv
    photo, art, out = a[1], a[2], a[3]
    cx, cy, lw, target = map(float, a[4:8])
    zoom = float(a[a.index("--zoom") + 1]) if "--zoom" in a else 1.0
    cyl = (float(a[a.index("--cyl") + 1]), float(a[a.index("--cyl") + 2])) if "--cyl" in a else None

    im = Image.open(photo).convert("RGB")
    s_old = tight_scale(im.width, im.height, cx, cy, lw, target)
    s = max(W / im.width, H / im.height) * zoom
    big = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x0 = min(max(round(cx * s - W / 2), 0), big.width - W)
    y0 = min(max(round(cy * s - H / 2), 0), big.height - H)
    frame = big.crop((x0, y0, x0 + W, y0 + H))

    # tight frame -> photo pixels -> new frame: new = (f - centre) * k + (c * s - offset)
    k = s / s_old
    ox, oy = cx * s - x0, cy * s - y0
    src = Image.open(art).convert("RGBA")
    scaled = src.resize((round(W * k), round(H * k)), Image.LANCZOS)
    moved = Image.new("RGBA", (W, H))
    moved.paste(scaled, (round(ox - W / 2 * k), round(oy - H / 2 * k)), scaled)
    new_cyl = None
    if cyl:
        new_cyl = tuple((x - W / 2) * k + ox for x in cyl)

    with tempfile.TemporaryDirectory() as d:
        fp, ap = os.path.join(d, "f.png"), os.path.join(d, "a.png")
        frame.save(fp); moved.save(ap)
        print_art(fp, ap, out, new_cyl)


if __name__ == "__main__":
    main()
