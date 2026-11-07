# Branding reels

Beat-synced 9:16 reels for fictional brand identities, in the "locked logo" style:
the logo stays perfectly still in the centre while the scenes behind it cut on the beat.

## Folders
- `tools/beats.py`: analyse a song (tempo, beats, loudness). `python3 tools/beats.py music/song.mp4`
- `tools/render.js`: render a brand's `frames.html` into 1080×1920 PNGs (logo layers transparent)
- `tools/build.py`: build the reel from `plan.json`: detects the beats, cuts exactly on them, adds punch-ins, flashes and the logo reveal, and muxes the song
- `brands/<name>/`: one folder per fictional brand: `brand.md`, `frames.html`, `prompts.md` (ChatGPT photo prompts), `plan.json`, `frames/`, `out/`
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
so the locked logo lands on it. See `brands/korte/prompts.md` for the prompt pattern.
