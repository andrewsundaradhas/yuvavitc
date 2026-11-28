# PROJECT_AUDIT.md — YUVA VIT Chennai website

**Audit date:** 2026-11-27 · **Branch:** `claude/perf-testing` (off `yuva-website-updates` @ `fd9250c`) · **Scope:** the whole repo, a production build (`vite build`), and a Playwright baseline across 5 real-browser profiles.
**No application code was changed for this audit.**

Severity: 🔴 Critical (hurts the "fast, no delay" goal or breaks things) · 🟠 High · 🟡 Medium · ⚪ Low.

---

## 1. Summary

The site is visually strong: a distinctive editorial + sticker design, lots of interaction, and decent accessibility basics. **Performance is the blocker.** A visitor who scrolls the page downloads about **405 MB of images**. Desktop LCP is about **5 s** on a throttled connection, and the intro blocks the hero for another 4.6 s. About 99% of the weight comes from un-optimized photos; the rest from WebGL libraries in the main bundle.

| Area | Grade | One-liner |
|------|-------|-----------|
| Visual design | A- | Strong identity, consistent tokens; 8 font families is heavy |
| Performance | **F** | 405 MB image payload, 5 s LCP, 398 KB initial JS |
| Mobile responsiveness | B | Purpose-built phone layouts; see test results below |
| Functionality | see §6 | Menu, events, modal, lightbox, gallery, queries tested |
| Accessibility | B- | Good aria labels/focus ring; carousel images have empty alt, no focus trap in modals |
| Repo hygiene | D | 1.3 GB images committed (`.git` = 648 MB), fake `.webp`, duplicates, unused deps |
| SEO / sharing | C | Basic meta; relative `og:image`, no canonical/structured data |

---

## 2. Performance findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| P1 | 🔴 | **Image payload of 405 MB per full scroll** (240 image requests). | `tests/perf.spec.js`, desktop-chrome: `totalImagesKB: 415235`, `imageCount: 240` |
| P2 | 🔴 | **76 files named `.webp` are really camera JPEGs** (`FF D8` magic bytes), up to 16 MB each (587 MB in total). Browsers still decode them, but they get none of WebP's compression. | `xxd` header check; e.g. `81-young-wings-13.webp` = 15.9 MB JPEG |
| P3 | 🔴 | **100 of the 231 referenced images are over 300 KB**; the 5 largest are 14–15 MB. No resizing, no `srcset`. | perf payload `largestImages`, `imagesOverBudget: 96` |
| P4 | 🔴 | **Gallery renders all 166 event photos at once** in the 3D carousel, with no `loading="lazy"`. The heading text also says "Twenty frames". | [Gallery.jsx:6](src/components/Gallery.jsx#L6), [Gallery.jsx:31](src/components/Gallery.jsx#L31), [CircularCarousel.jsx:835](src/components/ui/CircularCarousel.jsx#L835) |
| P5 | 🔴 | **The preloader blocks the Hero for about 4.6 s on every visit.** The Hero isn't mounted until `onReady`; a black placeholder shows instead. | [App.jsx:41](src/App.jsx#L41), [Preloader.jsx](src/components/Preloader.jsx) `duration: 4.6` |
| P6 | 🟠 | **Initial JS is 398 KB transferred** (642 KB raw), against a 250 KB budget. `Team` eagerly imports the `ogl` WebGL MicroSlats, and Award, Events and Team are all in the main chunk. | build output `index-*.js 642 KB / 204 KB gz`; [Team.jsx:4](src/components/Team.jsx#L4) |
| P7 | 🟠 | **The `PrintTable` chunk is 558 KB** (three.js) and **About is 165 KB** (vgpu). Both are lazy, but their Suspense boundary mounts immediately on page load, not when the section scrolls into view. | [App.jsx:44-56](src/App.jsx#L44-L56) |
| P8 | 🟠 | **Only 2 `<img>` tags in the whole site use `loading="lazy"`**, and none set width/height. That causes layout-shift risk and eager downloads. | `grep loading="lazy"` → Award.jsx only |
| P9 | 🟠 | **8 Google font families load in one render-blocking stylesheet** (Bodoni Moda, Playfair, Source Serif 4, Manrope, Pirata One, Fredoka, Anton, Sofia Sans EC, JetBrains Mono). | [index.html:17-19](index.html#L17-L19) |
| P10 | 🟡 | **5 raw `resize` listeners** set React state on every resize event, with no throttling. | Hero, Gallery, About, PrintTable, … |
| P11 | 🟡 | **The Intro "pill" images load full-size photos** (up to 14 MB) as CSS backgrounds for 1.5em-wide pills. | [Intro.jsx:39](src/components/Intro.jsx#L39) |
| P12 | 🟡 | **The Award canvas runs its particle animation with no IntersectionObserver pause.** The WebGL components do pause off-screen (good). | [Award.jsx:194](src/components/Award.jsx#L194) |
| P13 | ⚪ | `chunkSizeWarningLimit: 700` hides the bundle-size warning instead of fixing the cause. | [vite.config.js](vite.config.js) |

## 3. Repository & build hygiene

| # | Sev | Finding |
|---|-----|---------|
| R1 | 🔴 | **`public/images` is 1.3 GB, all committed** (`.git` = 648 MB). Every clone and every Vercel build copies it. |
| R2 | 🟠 | **99 image files are unreferenced (592 MB)**, including `DSC*.JPG` files that are byte-identical duplicates of the fake `.webp`s. |
| R3 | 🟠 | **Unused dependencies:** `express`, `cors`, `dotenv` (no imports). `vgpu` pulls in `webgpu` with a postinstall script. |
| R4 | 🟡 | **`.env.example` is stale:** it mentions FormSubmit and `aaathi241@gmail.com`, but the code uses Resend and sends to `yuvavitc@gmail.com`. |
| R5 | 🟡 | **`README.md` is a single line**, with no setup, deploy or content-editing guide for club members. |
| R6 | ⚪ | `scratch/resize_hack_startup.ps1` (an untracked ad-hoc script) and `.vscode/launch.json` (points to port 8080, while Vite uses 5173) are untracked noise. |
| R7 | ⚪ | No lint/format config and no CI. |

## 4. Accessibility & UX

| # | Sev | Finding |
|---|-----|---------|
| A1 | 🟠 | **Modals (EventModal, Lightbox) have no focus trap and don't restore focus on close.** Keyboard users can tab behind the overlay. |
| A2 | 🟡 | **Carousel images use `alt=""`.** The group has an aria-label, but screen readers get no photo description. |
| A3 | 🟡 | **Hero domain stickers use `touch-none` + drag.** On phones a vertical swipe that starts on a sticker won't scroll the page. |
| A4 | 🟡 | **Event list rows are bare `<button>`s with no accessible name for the domain/tenure** on mobile (that info is hidden below `md`). |
| A5 | ⚪ | Body text is Source Serif 4 **weight 300** on parchment, which has low contrast for long reads on mobile. |
| A6 | ⚪ | `prefers-reduced-motion` is respected by the preloader/marquee/orbit, but not checked everywhere (e.g. sticker springs, Award canvas). |

## 5. SEO & sharing

| # | Sev | Finding |
|---|-----|---------|
| S1 | 🟡 | **`og:image` is relative (`/og.jpg`).** Many scrapers (WhatsApp, LinkedIn) need an absolute URL. There's also no `og:url`, `twitter:card` or canonical. |
| S2 | 🟡 | **No JSON-LD `Organization` schema, no `robots.txt`, no `sitemap.xml`.** |
| S3 | ⚪ | Meta description says "Sixteen events", but `data.js` has 34 events, so the description is out of date. |

## 6. Playwright baseline results (before any change)

Full table and triage: [checkpoint.md → CP-000](checkpoint.md). **109 passed · 23 failed · 3 skipped · 31.5 min.**

| Metric | desktop-chrome | android-pixel | Budget |
|---|---|---|---|
| LCP (throttled) | 5,044 ms | 4,528 ms | < 2,500 ms |
| Hero visible (throttled) | 5,206 ms | **14,620 ms** | < 1,000 ms |
| CLS | 0.065 | 0.011 | < 0.1 ✅ |
| Initial JS | 398 KB | 398 KB | < 250 KB |
| Images per full scroll | 405 MB | 674 MB | – |
| Images > 300 KB | 96 | 105 | 0 |

**Bugs confirmed by the tests (in addition to §2–§5):**

| # | Sev | Finding |
|---|-----|---------|
| T1 | 🟠 | **iPad (WebKit): the page scrolls 80 px sideways.** The closed StaggeredMenu panel and prelayers sit off-canvas to the right and aren't clipped. [StaggeredMenu.css](src/components/ui/StaggeredMenu.css) |
| T2 | 🟠 | **Menu → Prints / Gallery goes nowhere for the first ~2.5 s+** (longer on 4G). The anchor targets live inside lazy Suspense chunks that haven't mounted yet. [App.jsx:53-58](src/App.jsx#L53-L58) |
| T3 | 🟡 | **Under load (slow device), the query form card disappears for several seconds** during the paper-plane animation, leaving an empty coral panel. It recovers, but there's no visible "sending…" fallback. [Queries.jsx](src/components/Queries.jsx) |
| T4 | ⚪ | The visual-review screenshot test can't complete within 60 s on any profile because of the image payload. |

Things that work well on all 5 profiles: no uncaught JS errors, no broken asset requests, every image has `alt`, event filters, event modal (open/next/prev/photo/Esc/close), lightbox, query-form validation, the honeypot payload, preloader skip, and `?nointro`.

## 7. Code-quality notes (non-blocking)
- [data.js](src/data.js) (1,238 lines) mixes content and asset paths; the `img()` helper hardcodes `.webp`, which is what hid the fake-webp problem.
- The `ui/` effect components are large vendored files (850–1,100 lines each); treat them as third-party and patch them sparingly.
- `Queries.jsx` has inconsistent formatting (semicolons in `post`, none elsewhere). It's cosmetic.
- The email API itself (`api/queries.mjs`) is sound: method guard, honeypot, length and email validation, and no secrets in code. Decision D-009 says to leave it.

---

## 8. Top 5 improvements to implement first

Ranked by impact on the owner's goal of loading fast with no delay on mobile and PC, per unit of risk.

1. **Image pipeline: convert, resize and prune** (fixes P1–P3, P11, R1, R2; decision D-004).
   Script (sharp) → real WebP at 480/960/1600 px, quality about 72. Rewrite paths in `data.js`. Delete the 99 unreferenced files and the fake/duplicate originals. Expected: 405 MB → **about 15–25 MB** for a full scroll, with no image over 300 KB.
2. **Lazy, sized, responsive `<img>` everywhere + a lazy Gallery** (fixes P4, P8).
   A shared `<Photo>` component with `srcset`/`sizes`, `loading="lazy"`, `decoding="async"` and width/height. Hero gets `fetchpriority="high"`. The carousel loads only the frames near the front. Fix the "Twenty frames" copy.
3. **Preloader: first visit only, about 2 s, non-blocking** (fixes P5; decision D-006).
   Mount the Hero underneath right away so LCP isn't gated by the intro, and remember the visit in `localStorage`.
4. **Split the JS: load WebGL effects only when they come into view, and keep section shells always mounted** (fixes P6, P7, P13, T2; decision D-008).
   Render every `<section id>` immediately (so menu anchors always work) and lazy-load only the heavy effect inside it when nearby. Move the MicroSlats import out of the main chunk. Target initial JS under 250 KB.
5. **Fonts & head: trim to the families in use, preload, absolute OG** (fixes P9, S1, S3, R3).
   Drop unused families/weights, `preload` the display face, and use `font-display: swap`. Make `og:image` absolute and update the description. Remove `express`/`cors`/`dotenv` (P-001).

Next after those: iPad sideways-scroll fix in the menu CSS (T1, a quick win), a "sending…" fallback in the query form (T3), modal focus trap (A1), throttled resize hooks (P10), Award canvas pause (P12), README for club members (R5), and fixing the stale `.env.example` (R4).
