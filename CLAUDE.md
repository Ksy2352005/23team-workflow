# 23 Team

This repo belongs to 23 Team, a Budapest branding, web and marketing studio.

- Brand profile (colours, fonts, voice, handles, services): `brand/23team.md`. Read it before any 23 Team content, reel, graphic or copy work.
- Website security/launch skill: `skills/23page/`.

## Branding reels (`reels/`)
- Every fictional brand starts with a short concept in `brand.md`: what the name means, the product, the audience, and why each design choice (logo, colours, font, taglines) fits.
- Reels must be graphic-design focused, not just the logo on objects: show the identity system (supergraphic, name meaning, logo construction, palette, typography, patterns, icons, flat packaging, posters) and print full label artwork onto the photos. See `reels/README.md`.
- The look to aim for is the user's references (Belle Bakery, Luwak): a mascot/illustration, stickers, patterns and rich applications (cups, menus, loyalty cards, bags, storefronts, posters) shown in real lifestyle scenes with hands, cut fast on the beat. The logo does not need to be centred. Formats and songs: `reels/README.md`.
- One reel format per brand: each new reel is a new fictional brand. KÖRTE = Belle-style brand board (`plan-bento.json`); the Luwak-style desk reveal goes to the next brand.
- Reels end on the **23 end card as the last picture of the edit**: a still cut on the beat inside the same music (no sound effect, no fade-in, no extra length, no zoom on it). The 23 card cuts in exactly on the song's LAST beat, the song fades out over it (`"fade_from": <last beat>`), and it holds about 1 s after (`"tail": 1.0`). Plan: `{"bg": "end23", "fx": "none"}` as the last shot plus `"end23": {"bg": <brand darkest>, "logo": <brand lightest>}`. Locked from the 23motion films (`ANIMATION-STYLE.md`, branch `mere-exposure`): logo file `reels/brand-assets/logo-23.png`, 30% of frame width (324×177 on 1080×1920), centred both ways, 75% opacity. Only the colours change per brand. No call to action, no text.
- Every shot must relate to the brand's core product (e.g. for a canned-drink café every photo shows the can/drink); the only exceptions are packaging that contains the product and the shop/café itself. Write this into the brand's `brand.md`.
- Each brand gets a brand kit image (`kit.html` → `<brand>-brand-kit.png`) that the user uploads to ChatGPT together with the prompt file; prompts then ask ChatGPT to put those exact designs on the products (no more blank labels).
- Preferred photo method ("sketch to life"): Claude designs each scene as a flat comp (`kit.html` sections `sk-N-name`, 1024×1536, exact composition and real artwork on the products), saved to `brands/<name>/sketches/`. The user uploads the sketches + prompt file to ChatGPT, which turns each into a realistic photo keeping composition and designs exactly. See `brands/korte/23promts6.md`.
- ChatGPT image prompt files are named `23promts1.md`, `23promts2.md`, … (exact spelling, one number per file, counting across ALL brands, never reusing a number). Before making one, find the highest existing number with `find reels -name '23promts*.md'` and use the next. Save it in `brands/<name>/`. Write it so the user can upload the whole file to ChatGPT and just say "next":
  - Title and first line state the total, e.g. "**Total images: 8**".
  - An "Instructions for ChatGPT" block: generate only Image 1, then one image per "next", "redo" to retry, announce each as "Image N of TOTAL — name", say when all are done.
  - Tell ChatGPT to ignore its memory/earlier chats/other brands of the user (it otherwise pulls in the 23 Team mascot).
  - ChatGPT can't make true 9:16: ask for its tallest portrait size (1024×1536) and keep the subject in the middle 75% of the width; the reel tools crop to 9:16.
  - Brand + style rules once, then each prompt headed "Image N of TOTAL — name". Lifestyle prompts use the brand kit designs; only use blank labels when the tools will print the artwork themselves.
  - Include a "Look" block (clean colour-blocked studio backdrops in the brand colours, daylight/one crisp shadow, matte plain products, one hero product, straight-on and centred) and an "Avoid" block (dark moody bar, bokeh, droplets, splashes, garnish, wrong fruit, glossy CGI, stock-ad look, any text). Without these ChatGPT makes generic stock-advert images.
  - Ask ChatGPT to first confirm in one line what it read (brand, product, colours, Image 1) and wait for "start".
- Whenever you hand over a prompts file, tell the user in your message how many images it contains.
