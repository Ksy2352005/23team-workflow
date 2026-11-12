# 23 Team animation reels: house style

Locked choices for every animation reel. Follow these unless the brief for a film says otherwise.

## Main blue (locked 2026-11-11)
New films use **`#00113F`** (midnight) as the background and caption-area colour (`TOP`), with a centre glow in `#163A8C`; the end card background is also `#00113F`. Mascot blues are unchanged. Films made before this date keep their old blues (`#111a52`, end card `#0b1438`). Details: `brand/23team.md`.

## End card: the 23 logo (locked)

| Setting | Value |
|---|---|
| Logo file | `refs/logo-23.png` (582 × 318 px, transparent). The shape is never changed; only its colour is. |
| Size | **30% of the frame width**: 324 × 177 px on a 1080 × 1920 frame, scaled with the frame on other sizes |
| Position | Centred, horizontally and vertically |
| Colour | Soft pale blue `#aeb9e2` at **75% opacity**: subtle, never black on blue |
| Background | `#00113F` (films before 2026-11-11: `#0b1438`) |
| Into it | The last shot fades into the end-card blue over 0.7 s |
| Logo in | Starts 0.15 s after the fade ends. It fades in over 0.9 s, settling from 104% to 100% scale while a 6 px blur clears, then holds about 1.2 s to the end. |
| Sound | **Locked:** a short reverse swell into a deep, soft cinematic boom, kept low, with a long smooth fade-out. It is `tools/logo_sting.py`, the same file in every film, and the boom lands as the logo starts to appear. Every other sound fades out with the picture before it. |
| No title cards | No text cards before the logo. |

Code: `endCard()` in `restaurant-nobody-entered/main.js` (`LOGO_W`, `END_BLUE`, `w = W * .30`).

## Captions: the script on screen (locked)

When a film shows its script, it is written word by word as it is spoken, placed for Instagram's Reels preview.

| Setting | Value |
|---|---|
| Font | **Montserrat Bold** (weight 700), 23 Team's font, kept in the film's `fonts/` with its OFL licence. It has the Hungarian ő and ű. |
| Size | **56 px**, line height 72 px, on a 1080 × 1920 frame |
| Position | Left-aligned, **x = 130 px**; first baseline at **y = 540 px**, second at 612 px. Lines wrap before 920 px (maximum width 790 px). |
| Lines | **Two at most.** A new page starts after a full stop, question mark or colon, after a comma once a page has four words, at seven words, or when a third line would be needed. |
| Colour | Cream `#f6efdc`. Only the word being spoken turns gold `#ecbd4a`, with no underline. A few key words stay gold once spoken. |
| Motion | Each word pops in as it is spoken: it rises about 34 px, scales from 75% to 100% and fades in on a soft spring. The page lifts away and fades in 0.12 s before the next one starts. A soft dark shadow keeps it readable. |
| Behind the text | No band of its own: the top of every scene is the same plain blue `#111a52`, and the text sits on it. That blue fades into the picture between 660 and 760 px. |
| One page | The words are part of each shot's page, in the same world: every transition (whip, punch, clock wipe, dissolve) moves them together with the picture. Only their place on the page is separate. |
| The story | Plays only in the stage under the captions, x 50–1030 and y 760–1860. Each shot fits its content inside it, so nothing is cut by the frame or by the captions. |
| Timing | The script's own words are matched letter by letter to Whisper's word timings on the sped-up voice (`align.py`), so the spelling is the script's and the timing is the voice's. |

Code: `captions()`, `CAP`, `PAGES` and `stage()` in `car-dealer/main.js`; `car-dealer/align.py`.

## Look

- 2D, after the 23 Team character sheets. Figures are small in frame, a little taller and thinner, close to stick figures but not exactly.
- The main character is white. Customers are dark blue, and some of them are women. No yellow characters.
- 60-30-10 colour: navy/blue 60%, cream/wood 30%, gold 10%.
- The setting sits a step darker than the characters and the key props, so they lead.
- No outline glow and no sparkle effects on characters. A smile and a camera push are enough.
- Actions are physically correct: hands touch what they act on, and nobody walks through tables or people.
- Close-ups and camera moves follow the voiceover. Settings are built from the script.

## Sound

- No music. Use the supplied voiceover unchanged, with real recorded CC0 sound effects (credited in `CREDITS`) and synthesized effects only where no recording fits.
- Effects are punchy and natural, close to the voice level. They drop lower once a scene gets busy, so the voice always leads.
- Bell/chime sounds ("dings") stay soft and quiet (user 2026-11-12: they were too loud and annoying): `chime()` in every `mix.py` is softened: 60% quieter, a slow 30 ms attack, dull overtones.
- The main character's footsteps are clear and synced to his feet. Other people's are softer.
- Character vocal sounds only for strong emotions.
- Loudness: −14 LUFS, true peak at or below −1.2 dB.

## Instagram safe zone

Instagram trims the sides of a 9:16 reel on tall phones (about 5% each side). Every visual and caption stays inside x 70–1010 of the 1080 frame: the world is framed at scale 1.06 around (540, 1790) in `paintShot` (was 1.18), characters stand between world x 165 and 915, and the background and floor are drawn wider than the frame so no edge shows. Only backgrounds may touch the frame edges.

## Format

- 9:16 Instagram Reel, 1080 × 1920, 24 fps. Preview at 540 × 960 first, then the final render.
- Deliver the final as the highest-quality master: `sh tools/master.sh <film folder> <name>`, run after the film's `build.sh`. It writes `<name>-MASTER.mp4` from lossless PNG frames and encodes once: H.264 High, CRF 12, veryslow, tuned for animation, BT.709-tagged colour, AAC 320 kb/s, −14 LUFS.
