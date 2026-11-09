# Branding reels

Beat-synced 9:16 reels for fictional brand identities, in the "locked logo" style:
the logo stays perfectly still in the centre while the scenes behind it cut on the beat.

## Folders
- `tools/beats.py`: analyse a song (tempo, beats, loudness). `python3 tools/beats.py music/song.mp4`
- `tools/render.js`: render a brand's `frames.html` into 1080×1920 PNGs (logo layers transparent)
- `tools/fit.py`: fit a ChatGPT photo into a 1080×1920 frame so its blank label sits exactly under the locked logo: `python3 tools/fit.py photo.png frames/photo-x.png <label cx> <label cy> <label width>`
- `tools/printart.py`: print flat artwork (label designs) onto a fitted photo, keeping the photo's light and shadow; `--cyl x0 x1` wraps it round cans, cups and glasses
- `tools/zoomout.py`: zoomed-out version of a printed photo (whole scene visible, 9:16), with the label artwork moved and scaled to match
- `tools/build.py`: build the reel from `plan.json`: detects the beats, cuts exactly on them, adds punch-ins, flashes and the logo reveal, and muxes the song
- `brands/<name>/`: one folder per fictional brand: `brand.md`, `frames.html`, `23promtsN.md` (ChatGPT photo prompts, numbered across all brands), `photos/` (ChatGPT originals), `plan.json`, `frames/`, `out/`
- `music/`: songs and screen recordings (kept out of git)

## Make a reel
```
pip install librosa                     # once per session
NODE_PATH=$(npm root -g) node tools/render.js brands/korte/frames.html brands/korte/frames
python3 tools/build.py brands/korte/plan.json
```

## plan.json
Each shot has a background (`bg`), an optional logo layer (`logo`), a length in beats (`beats`, halves allowed, e.g. 0.5),
an optional `view` ([centre x, centre y, zoom], to cut between details of one image), and effects: `fx` = `punch` (zoom settles on the beat) | `drift` (slow push-in) | `none`,
`flash: true` (white flash on the cut), `pop: true` (logo reveal). The last shot without `beats`
runs to `end`. `start` and `end` are times in the song.

## Photo scenes (ChatGPT)
Every photo must have its label or flat surface dead centre, facing the camera and blank,
so the locked logo lands on it. Each prompt file (`23promts1.md`, `23promts2.md`, … numbered across all brands) is made to be uploaded to ChatGPT as a file:
it states the total number of images, and ChatGPT generates them one at a time each time you say "next".
See `brands/korte/23promts1.md`.

## What a reel should show (design first, not just the logo)
Your references sell the whole identity, so each reel should include:
- Identity frames: a supergraphic, a name-meaning card, logo construction, palette, type specimen, patterns, icons, the flat packaging label, a poster/campaign layout
- Applications: ChatGPT photos with the full label artwork printed on them, zoomed out so the whole scene shows (`zoomout.py`), not only the logo
- No near-empty frames (e.g. just the logo on a plain colour)
- Order: identity → packaging → real-world applications → 23 Team end card
See `brands/korte/frames-v3.html` and `plan-v4.json`.

## Reel formats (from the user's favourite references)
- **Brand board** (Belle Bakery style, song `music/ref-belle.mp4`, 172 BPM, drop at 3.6 s, song clip ENDS at 6.90 s: after that the recording is silent and then the reel loops — never use audio past 6.90; last real beat 6.73):
  a bento grid of tiles builds one per beat during the quiet intro (`"type": "bento"` shot),
  then full-screen lifestyle mockups every 2 beats from the drop, then the finished board (loops).
  Example: `brands/korte/plan-bento.json`.
- **Desk reveal** (Luwak style, song `music/ref-luwak.mp4`, drop at about 3.3 s):
  a monitor photo whose screen shows the logo sliding onto the artboard with a selection box
  (`"type": "screen"` shot with the screen's 4 corners as `quad`), held until the drop,
  then a fast montage (half-beat cuts) of lifestyle mockups, ending back on the monitor.

## Brand kit for ChatGPT
Each brand has a `<brand>-brand-kit.png` (rendered from `kit.html`): logo, colours, mascot,
stickers, patterns and the designs for can, cup, menu, loyalty card and bags. It is uploaded to
ChatGPT with the prompt file so the lifestyle photos carry the real designs.

## KÖRTE final (v5): `brands/korte/plan-v5.json`
Belle song. Intro (quiet part): the brand-board flat-lay photo, cutting on every 2 beats between
full view → logo → colours → typography → mascot. Drop: 6 lifestyle photos, 1.5 beats each. End: 23 Marketing.

## End card: the 23 logo (`tools/end23.py`)
The last shot of every reel, cut on the beat inside the music (no sting, no fade, no extra length, `fx: none`
so the size never changes). Logo size/position/opacity locked from the 23motion films; colours per brand:
```
"end23": {"bg": "<brand darkest>", "logo": "<brand lightest>"}
... last shot: {"bg": "end23", "fx": "none"}
```
KÖRTE: bg `#3E0F1E`, logo `#F5EEDF`.

## Screen-recorded songs: check the end
A screen recording of a reel often ends with silence and then the reel restarting (or the next video).
Before using a song, look at the loudness at the end (`tools/beats.py`): set the plan's `end` to where the
song really stops and put the 23 card on the last real beat before it.

## KOCKA (Luwak format): `brands/kocka/plan.json`
Luwak song: drop 3.42 s, final hit 6.24 s, song ends 6.33 s. Monitor shot: `"type": "screen"` with the gold logo
(`logo-gold`) sliding in after a 0.5 s `delay`, then a selection box; 9 photo cuts placed with `"at"` on the
song's hits; 23 card on the final hit, song fades out under it.
