# 23 Team

This repo belongs to 23 Team, a Budapest branding, web and marketing studio. It is the shared memory of every 23 Team chat:
anything one chat makes or decides is written here, so the other chats know it.

- **Main blue (locked): midnight `#00113F`** for every background, carousel, end card and graphic on both pages, with a soft `#163A8C` centre glow for depth; mascots keep their own blues. See `brand/23team.md`.
- Brand profile (colours, fonts, voice, handles, services): `brand/23team.md`. Read it before any 23 Team content, reel, graphic or copy work.
- Website security/launch skills: `skills/23page/` and `skills/security-workflow/` (same skill; the second name is what the environment's setup script installs).

## The two pages (two chats, one repo)
| Chat | Instagram page | Status |
|---|---|---|
| **23HungarianPage** | the Hungarian page | active: 4 posts a day |
| **23ArabicPage** | the Arabic page (new) | starts later; first job: Arabic versions of the 18 marketing stories |

- Both chats work on the **`main` branch** of this repo. At the start of every chat: `git checkout main && git pull`. Commit and push to `main` after each finished piece, so the other chat sees it.
- Shared between both pages: this file, `ANIMATION-STYLE.md`, `brand/`, the story films, `tools/`, `reels/`, the post library `posts/`, and the ElevenLabs key (saved on the cloud environment).
- Each page has its own rules section below. A rule the user gives in one chat that applies to both goes into the shared part.
- Arabic film folders get the `-ar` ending next to the Hungarian one (e.g. `supermarket-route-ar/`).

## Post library (`posts/`)
- `posts/INDEX.md` lists every post: number, page (HU/AR), type, title, date made, posted or not, and its files.
- Each post has a folder `posts/<page>/<NNN>-<slug>/` with the final video(s) or slides and `caption.txt` (the Instagram caption, ready to paste).
- Final masters are committed here (the containers are temporary; without this, "send me post 7" fails in a later chat). Keep each file under 90 MB.
- "Send me post N" (or "send me day N"): send the files with SendUserFile and put the caption text in the reply, ready to copy.
- The user posts by hand and makes the covers (for now). No Facebook Page, no publishing by Claude.

## Content plan (Hungarian page, 10 days from 2026-11-11): 4 posts a day
1. **Marketing story**: a mascot-world reel from the user's script (the 18 films so far; workflow below).
2. **Branding secret**: a short tip reel that follows the format of a reference video the user sends (format and pacing only; own wording and visuals).
3. **Branding identity**: graphic-design showcase of a fictional brand (made together with the user; see "Branding reels" below).
4. **Carousel**: typography slides (text, background, small effects), very sharp, 1080×1350, replicating the user's examples with the user's texts.

## Marketing story films (the 23motion films)
- House style: `ANIMATION-STYLE.md` (locked end card, captions, sound). Every film folder: `story.js` (timing), `main.js` (picture), `mix.py` (sound), `captions.js`, `refs/script-hu.txt`.
- The blue mascot world (background and caption area `#00113F` with a `#163A8C` centre glow; the first 18 films used `#111a52`), big clear centred visuals, elegant soft transitions, icons that match the words, nothing in front of faces, nothing half off the edges, no thought bubbles, no brand names, animations finish before cuts, characters' heads joined to their bodies.
- Voice at **1.18×** (pitch kept) unless the user says otherwise. Captions: Montserrat Bold 56 px, x 130, y 540, two lines, gold key words.
- Voiceovers: the user's mp3, or ElevenLabs (`api.elevenlabs.io`, key injected by the environment): Hungarian voice **"David"** (`M336tBVZHWWiWb4R54ui`), model `eleven_multilingual_v2`.
- Master: `sh tools/master.sh <film> <film>` (CRF 12, −14 LUFS). Check the logo sound level (max ≈ −11.3 dB) after mastering.
- Final scripts of the first 18 stories: `scripts-pdf/23-Team-Marketing-Stories-Scripts.pdf`.

## Transcribing
Skill `.claude/skills/transcribe`: `/root/lemo-opuscar/.venv/bin/python tools/transcribe.py <video/audio> --out transcripts`. Videos must be uploaded as files (Instagram/TikTok links can't be downloaded here).

## Hungarian page rules
- **Translation rule (into Hungarian): "Instagram tone".** It must sound like someone talking to the viewer, not an article read aloud. The tone reference is the user's own 18 scripts (`scripts-pdf/` and each film's `refs/script-hu.txt`); match them:
  - storytelling, friendly and professional, never formal or corporate; always **te**, never "Ön"
  - short spoken lines (about 10 words), plain everyday words; translate the meaning, not the words
  - spoken connectors and hooks like the scripts use: „De…", „És…", „Pedig…", „Mert…", „Hirtelen…", „Elmondom, miért.", „És itt jön az érdekes rész!", „De vajon…?", „De tudod, miért…?"; takeaways in the „Néha nem kell…, elég, ha…" pattern
  - avoid written constructions („ki kell derülnie", „érdemes megnézni", „tartalmat gyárt"); prefer what people say („rögtön érthetőnek kell lennie", „miért érdemes megállni", „többet posztolsz")
  - watch for ambiguity (e.g. „a jó emberek" can mean "good people" → use „a megfelelő emberek")
  - well-known marketing terms may stay in English (branding, Decoy Effect); prices in forint
- **Every final Hungarian text comes with a Persian back-translation** (a literal translation of the Hungarian into Persian) so the user can check the meaning. The user may also check it with ChatGPT; weigh its notes against this rule.
- (add the caption style and hashtags here when the user gives them)

## Arabic page rules
- The 18 existing stories are already posted in Hungarian: the Arabic page needs only their Arabic versions (posts AR 1–18), then new stories in both languages.
- Arabic captions on screen: right to left, an Arabic font (e.g. Cairo or Tajawal; Montserrat has no Arabic letters); swap Hungarian words drawn in the pictures (e.g. "ÚJ", "Ft").
- (add the translation rule, dialect, Arabic voice and caption style here when the user gives them)

## Branding reels (`reels/`)
- Every fictional brand starts with a short concept in `brand.md`: what the name means, the product, the audience, and why each design choice (logo, colours, font, taglines) fits.
- Reels must be graphic-design focused, not just the logo on objects: show the identity system (supergraphic, name meaning, logo construction, palette, typography, patterns, icons, flat packaging, posters) and print full label artwork onto the photos. See `reels/README.md`.
- The look to aim for is the user's references (Belle Bakery, Luwak): a mascot/illustration, stickers, patterns and rich applications (cups, menus, loyalty cards, bags, storefronts, posters) shown in real lifestyle scenes with hands, cut fast on the beat. The logo does not need to be centred. Formats and songs: `reels/README.md`.
- One reel format per brand: each new reel is a new fictional brand. KÖRTE = Belle-style (`plan-v5.json`); KOCKA (premium brownies) = Luwak-style desk reveal on `music/ref-luwak.mp4`; SZELET (frozen pizza) = tile-mosaic style on `music/ref-3.mp4` (5 photos, 3×5 grid of tiles flipping to the next photo on the beat).
- Brands are **products** (packaged supermarket goods), not cafés or shops, unless the user asks otherwise. No animal mascots unless asked. Agree the concept with the user (name, product, palette) BEFORE building the kit.
- Reels end on the **23 end card as the last picture of the edit**: a still cut on the beat inside the same music (no sound effect, no fade-in, no extra length, no zoom on it). The 23 card cuts in exactly on the song's LAST REAL beat (screen recordings often end with silence and then the reel looping — never use audio past the song's real end; check with `tools/beats.py`), ONLY the original song, never added sounds/echo/other music: cut the 23 exactly ON the song's final hit (`"at": <hit time>` on the end23 shot; find the hit's real start with a 20 ms loudness scan, beat times can be late), and fade the song out from that hit to its real end (`"fade_from": <hit>`, `"end": <song end>`), then a short, subtle hold (`"tail": 0.3`; the 23 should not linger). KÖRTE: hit 6.68, fade to 6.88. Plan: `{"bg": "end23", "fx": "none"}` as the last shot plus `"end23": {"bg": <brand darkest>, "logo": <brand lightest>}`. Locked from the 23motion films (`ANIMATION-STYLE.md`, branch `mere-exposure`): logo file `reels/brand-assets/logo-23.png`, 30% of frame width (324×177 on 1080×1920), centred both ways, 75% opacity. Only the colours change per brand. No call to action, no text.
- Match the reference's shot count: Luwak-style = 15 different images after the drop (~13 photos + 2 design frames); Belle-style = brand board + ~6 shots.
- Never repeat a picture or use two near-identical shots (e.g. the same open box from the same angle twice); every cut must show something new.
- Desk-reveal monitor shot: the logo is on the screen in the photo's perspective (`quad` = the screen's 4 measured corners), a mouse cursor drags it in, selects it, scales it down from the corner handle (`end_scale`), moves away and deselects; the screen's own light is kept on top so it looks real.
- Every shot must relate to the brand's core product (e.g. for a canned-drink café every photo shows the can/drink); the only exceptions are packaging that contains the product and the shop/café itself. Write this into the brand's `brand.md`.
- Each brand gets a brand kit image (`kit.html` → `<brand>-brand-kit.png`) that the user uploads to ChatGPT together with the prompt file; prompts then ask ChatGPT to put those exact designs on the products (no more blank labels).
- Preferred photo method ("sketch to life"): Claude designs each scene as a flat comp (`kit.html` sections `sk-N-name`, 1024×1536, exact composition and real artwork on the products), saved to `brands/<name>/sketches/`. The user uploads the sketches + prompt file to ChatGPT, which turns each into a realistic photo keeping composition and designs exactly. See `brands/korte/23promts6.md`.
- ChatGPT image prompt files are named `23promts1.md`, `23promts2.md`, … (exact spelling, one number per file, counting across ALL brands, never reusing a number). Before making one, find the highest number ever used — including deleted files — with `find reels -name '23promts*.md'` AND `git log --all --name-only --format= | grep -o '23promts[0-9]*' | sort -V | tail -1`, and use the next. Save it in `brands/<name>/`. Write it so the user can upload the whole file to ChatGPT and just say "next":
  - Title and first line state the total, e.g. "**Total images: 8**".
  - An "Instructions for ChatGPT" block: generate only Image 1, then one image per "next", "redo" to retry, announce each as "Image N of TOTAL — name", say when all are done.
  - Tell ChatGPT to ignore its memory/earlier chats/other brands of the user (it otherwise pulls in the 23 Team mascot).
  - ChatGPT can't make true 9:16: ask for its tallest portrait size (1024×1536) and keep the subject in the middle 75% of the width; the reel tools crop to 9:16.
  - Brand + style rules once, then each prompt headed "Image N of TOTAL — name". Lifestyle prompts use the brand kit designs; only use blank labels when the tools will print the artwork themselves.
  - Include a "Look" block (clean colour-blocked studio backdrops in the brand colours, daylight/one crisp shadow, matte plain products, one hero product, straight-on and centred) and an "Avoid" block (dark moody bar, bokeh, droplets, splashes, garnish, wrong fruit, glossy CGI, stock-ad look, any text). Without these ChatGPT makes generic stock-advert images.
  - Ask ChatGPT to first confirm in one line what it read (brand, product, colours, Image 1) and wait for "start".
- Whenever you hand over a prompts file, tell the user in your message how many images it contains.
