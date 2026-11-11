# 23 Team — Accessibility Checklist (WCAG 2.2 AA baseline)

Automated tools catch roughly a third of issues. Every review = automated scan on every
page template + manual keyboard pass + screen-reader spot check (NVDA/VoiceOver/TalkBack)
+ the alt-text audit below. Record which were done; never mark accessibility PASS from a
tool score alone. Criterion numbers refer to WCAG 2.2.

## 1. Images and alt text (1.1.1)

Audit **every** image-like element: `<img>`, CSS background images that carry meaning,
inline `<svg>`, icon fonts, `<input type="image">`, image links, logos, charts, maps.

| Image role | Correct treatment |
|---|---|
| Informative | `alt` describes the information, not the file ("Team photographing a restaurant menu") |
| Functional (link/button) | `alt` says the action/destination ("23 Team home", "Open Instagram") |
| Decorative | `alt=""` (img) or `aria-hidden="true"` (svg, icon) — nothing announced |
| Text in image | `alt` repeats the text; prefer real text instead |
| Complex (chart, map, infographic) | Short `alt` + full description or data table nearby |
| Logo | Company name; if it's the home link: "<Name> home" |
| Inline SVG that means something | `role="img"` + `<title>` or `aria-label` |
| Icon-only button/link | Accessible name via `aria-label` or visually hidden text |

Fail signals: missing `alt`; `alt` = file name (`IMG_2041.jpg`, `hero-final.webp`);
"image of…/picture of…"; same alt on different images; alt on decorative images that
adds noise; meaningful CSS backgrounds with no text alternative.

Automated audit snippet (run in the browser on every page):
```js
[...document.querySelectorAll('img, svg, [role="img"], input[type="image"]')].map(e => ({
  tag: e.tagName, src: e.currentSrc || e.getAttribute('src') || '',
  alt: e.getAttribute('alt'), ariaHidden: e.getAttribute('aria-hidden'),
  label: e.getAttribute('aria-label') || e.querySelector?.('title')?.textContent || '',
  suspicious: /\.(jpe?g|png|webp|gif|svg)$|^(image|picture|photo) of/i.test(e.getAttribute('alt') || '')
}))
```
Then judge each result by eye: tools can't tell whether alt text is *meaningful*.

## 2. Video, audio and motion

- [ ] Prerecorded video with speech: captions (1.2.2); audio description or text alternative when visuals carry information (1.2.3/1.2.5)
- [ ] Audio-only: transcript (1.2.1)
- [ ] Anything moving, blinking or auto-updating > 5 s (including looping hero videos and carousels): pause/stop control (2.2.2)
- [ ] Auto-playing audio > 3 s: stop or volume control (1.4.2)
- [ ] Nothing flashes more than 3 times per second (2.3.1)
- [ ] `prefers-reduced-motion` respected: no autoplay video, no parallax, no scroll animations
- [ ] Key messages are never only inside a video or image (headline must be real text)

## 3. Structure and semantics

- [ ] `<html lang="…">` correct; `lang` on passages in another language (3.1.1/3.1.2)
- [ ] Unique, descriptive `<title>` per page (2.4.2)
- [ ] Exactly one `<h1>` with the page's main topic; headings in logical order, no skipped levels for styling
- [ ] Landmarks: `<header>`, `<nav>`, `<main>` (one), `<footer>`; multiple navs labelled
- [ ] Skip link to main content for sites with repeated navigation (2.4.1)
- [ ] Lists, tables (`<th>`, `scope`, caption) and buttons use real elements
- [ ] Links make sense out of context; "read more" has extra context (2.4.4)
- [ ] Consistent navigation and help location across pages (3.2.3, 3.2.6)

## 4. Keyboard and focus

- [ ] Everything works by keyboard alone, in logical order (2.1.1, 2.4.3)
- [ ] No keyboard trap (2.1.2) — test menus, modals, cookie banner, embedded widgets
- [ ] Visible focus indicator on every interactive element (2.4.7), with sufficient contrast
- [ ] Focused element not hidden behind sticky headers, banners or chat bubbles (2.4.11)
- [ ] Dialogs: focus moves in, is contained, Escape closes, focus returns
- [ ] Custom controls (dropdowns, tabs, accordions) expose state (`aria-expanded`, etc.)
- [ ] Hidden honeypot fields and off-screen content are not focusable

## 5. Forms

- [ ] Every field has a visible, programmatically associated label (1.3.1, 3.3.2)
- [ ] Groups (checkboxes, radios) in `<fieldset>` with `<legend>`
- [ ] Required fields indicated in text, not colour alone
- [ ] Errors identified in text, next to the field, and announced (3.3.1, 3.3.3)
- [ ] Success/failure messages announced (`role="status"` / `aria-live`) (4.1.3)
- [ ] `autocomplete` on personal-data fields (1.3.5)
- [ ] No re-entering information already given in the same process (3.3.7)
- [ ] No cognitive tests for login (puzzles without alternative) (3.3.8); CAPTCHA has an accessible mode

## 6. Visual design

- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text); UI components and focus ≥ 3:1 (1.4.3, 1.4.11)
- [ ] Test contrast after animations finish (mid-fade states give false failures)
- [ ] Text over images/video has a guaranteed contrast backdrop
- [ ] Colour is not the only way information is conveyed (1.4.1)
- [ ] 200% zoom without loss; reflow at 320 px width with no horizontal scroll (1.4.4, 1.4.10)
- [ ] Text spacing override doesn't break layout (1.4.12)
- [ ] Touch targets ≥ 24×24 px or enough spacing (2.5.8)
- [ ] Content on hover/focus dismissible and persistent (1.4.13)
- [ ] Orientation not locked (1.3.4)

## 7. Cookie banner, chat widgets, embeds

- [ ] Banner reachable and operable by keyboard and screen reader; doesn't trap focus or hide the page's first content permanently
- [ ] Accept/reject equally accessible
- [ ] Third-party widgets (chat, booking, maps, video) checked too — note vendor issues

## 8. Documents and statement

- [ ] Linked PDFs/docs are tagged and readable, or have an HTML alternative
- [ ] Accessibility statement where required or wanted: conformance level, known issues, contact, date

## Tools

axe-core (via Playwright) · Lighthouse accessibility · pa11y · browser contrast checker ·
keyboard-only pass · NVDA (Windows) / VoiceOver (macOS/iOS) / TalkBack (Android) spot check.
