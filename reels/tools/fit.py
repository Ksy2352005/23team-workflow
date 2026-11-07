"""Fit a ChatGPT photo into a 1080x1920 reel frame so its label sits exactly
under the locked logo.

Usage: python3 fit.py <photo> <out.png> <cx> <cy> <label_width> [--target 680]

cx, cy       centre of the blank label in the photo (photo pixels)
label_width  width of the label in the photo (photo pixels)
--target     how wide the label should be in the reel frame (default 680 px,
             a little wider than the logo)
The photo is scaled so the label is --target wide, then cropped to 9:16
around the label centre. If the photo is too small to fill the frame at that
scale, it is scaled up just enough to fill it.
"""
import sys

from PIL import Image

W, H = 1080, 1920


def fit(photo, out, cx, cy, lw, target=680):
    im = Image.open(photo).convert("RGB")
    # smallest scale that makes the label `target` wide AND lets a 9:16 window
    # sit exactly centred on the label without running off the photo
    s = max(target / lw, W / im.width, H / im.height,
            W / (2 * cx), W / (2 * (im.width - cx)), H / (2 * cy), H / (2 * (im.height - cy)))
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x0 = min(max(round(cx * s - W / 2), 0), im.width - W)
    y0 = min(max(round(cy * s - H / 2), 0), im.height - H)
    if (x0 + W / 2) != cx * s or (y0 + H / 2) != cy * s:
        off = (cx * s - x0 - W / 2, cy * s - y0 - H / 2)
        if max(abs(off[0]), abs(off[1])) > 2:
            print(f"note: label is {off[0]:+.0f},{off[1]:+.0f} px off centre (photo edge reached)")
    im.crop((x0, y0, x0 + W, y0 + H)).save(out)
    print(f"wrote {out} (scale {s:.2f})")


if __name__ == "__main__":
    a = sys.argv
    t = float(a[a.index("--target") + 1]) if "--target" in a else 680
    fit(a[1], a[2], float(a[3]), float(a[4]), float(a[5]), t)
