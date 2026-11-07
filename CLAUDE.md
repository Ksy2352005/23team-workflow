# 23 Team

This repo belongs to 23 Team, a Budapest branding, web and marketing studio.

- Brand profile (colours, fonts, voice, handles, services): `brand/23team.md`. Read it before any 23 Team content, reel, graphic or copy work.
- Website security/launch skill: `skills/23page/`.

## Branding reels (`reels/`)
- Every fictional brand starts with a short concept in `brand.md`: what the name means, the product, the audience, and why each design choice (logo, colours, font, taglines) fits.
- ChatGPT image prompt files are named `23promts1.md`, `23promts2.md`, … (exact spelling, one number per file, counting across ALL brands, never reusing a number). Before making one, find the highest existing number with `find reels -name '23promts*.md'` and use the next. Save it in `brands/<name>/`. Write it so the user can upload the whole file to ChatGPT and just say "next":
  - Title and first line state the total, e.g. "**Total images: 8**".
  - An "Instructions for ChatGPT" block: generate only Image 1, then one image per "next", "redo" to retry, announce each as "Image N of TOTAL — name", say when all are done.
  - Tell ChatGPT to ignore its memory/earlier chats/other brands of the user (it otherwise pulls in the 23 Team mascot).
  - ChatGPT can't make true 9:16: ask for its tallest portrait size (1024×1536) and keep the subject in the middle 75% of the width; the reel tools crop to 9:16.
  - Brand + style rules once (9:16 crop, product label dead centre, blank, no text/logos), then each prompt headed "Image N of TOTAL — name".
  - Include a "Look" block (clean colour-blocked studio backdrops in the brand colours, daylight/one crisp shadow, matte plain products, one hero product, straight-on and centred) and an "Avoid" block (dark moody bar, bokeh, droplets, splashes, garnish, wrong fruit, glossy CGI, stock-ad look, any text). Without these ChatGPT makes generic stock-advert images.
  - Ask ChatGPT to first confirm in one line what it read (brand, product, colours, Image 1) and wait for "start".
- Whenever you hand over a prompts file, tell the user in your message how many images it contains.
