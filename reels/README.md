# Branding reels

Beat-synced 9:16 reels for fictional brand identities, in the "locked logo" style:
the logo stays perfectly still in the centre while the scenes behind it cut on the beat.

## Folders
- `tools/beats.py`: analyse a song (tempo, beats, loudness). `python3 tools/beats.py music/song.mp4`
- `tools/render.js`: render a brand's `frames.html` into 1080×1920 PNGs (logo layers transparent)
- `tools/fit.py`: fit a ChatGPT photo into a 1080×1920 frame so its blank label sits exactly under the locked logo: `python3 tools/fit.py photo.png frames/photo-x.png <label cx> <label cy> <label width>`
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
Each shot has a background (`bg`), an optional logo layer (`logo`), a length in beats (`beats`),
and effects: `fx` = `punch` (zoom settles on the beat) | `drift` (slow push-in) | `none`,
`flash: true` (white flash on the cut), `pop: true` (logo reveal). The last shot without `beats`
runs to `end`. `start` and `end` are times in the song.

## Photo scenes (ChatGPT)
Every photo must have its label or flat surface dead centre, facing the camera and blank,
so the locked logo lands on it. Each prompt file (`23promts1.md`, `23promts2.md`, … numbered across all brands) is made to be uploaded to ChatGPT as a file:
it states the total number of images, and ChatGPT generates them one at a time each time you say "next".
See `brands/korte/23promts1.md`.
