# 23 Team animation reels: house style

Locked choices for every animation reel. Follow these unless the brief for a film says otherwise.

## End card: the 23 logo (locked)

| Setting | Value |
|---|---|
| Logo file | `refs/logo-23.png` (582 × 318 px, transparent). The shape is never changed; only its colour is. |
| Size | **30% of the frame width**: 324 × 177 px on a 1080 × 1920 frame, scaled with the frame on other sizes |
| Position | Centred, horizontally and vertically |
| Colour | Soft pale blue `#aeb9e2` at **75% opacity**: subtle, never black on blue |
| Background | The film's dark blue `#0b1438` |
| Into it | The last shot fades into `#0b1438` over 0.7 s |
| Logo in | Starts 0.15 s after the fade ends. It fades in over 0.9 s, settling from 104% to 100% scale while a 6 px blur clears, then holds about 1.2 s to the end. |
| Sound | Only a soft airy swell that rises with the fade and dies away. No bell, no beep. Every other sound fades out with the picture. |
| No title cards | No text cards before the logo. |

Code: `endCard()` in `restaurant-nobody-entered/main.js` (`LOGO_W`, `END_BLUE`, `w = W * .30`).

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
- The main character's footsteps are clear and synced to his feet. Other people's are softer.
- Character vocal sounds only for strong emotions.
- Loudness: −14 LUFS, true peak at or below −1.2 dB.

## Format

- 9:16 Instagram Reel, 1080 × 1920, 24 fps. Preview at 540 × 960 first, then the final render.
