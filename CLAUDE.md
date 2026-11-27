# CLAUDE.md — YUVA VIT Chennai website

Single-page marketing site for **YUVA VIT Chennai** (student club of Young Indians / Yi). Goal: a visually loud, energetic site that loads fast with no visible delay on both phones and PCs.

Also read: [decision.md](decision.md) (owner's decisions — follow them) and [checkpoint.md](checkpoint.md) (real-browser test log).

## Tech stack
- **React 19** + **Vite 8** (rolldown), plain JSX (no TypeScript), ES modules. Node >= 20.19.
- **Tailwind CSS v4** via `@tailwindcss/vite`; design tokens live in `@theme` in [src/index.css](src/index.css). No `tailwind.config.js`.
- **framer-motion** — the default animation tool (scroll, drag, springs, `AnimatePresence`).
- **gsap** — only inside [StaggeredMenu](src/components/ui/StaggeredMenu.jsx).
- **WebGL effects**: `three` → [PaperCrumple](src/components/ui/PaperCrumple.jsx) (Prints), `ogl` → [MicroSlats](src/components/ui/MicroSlats.jsx) (Team, Tide), `vgpu` → [ShapeWaves](src/components/ui/ShapeWaves.jsx) (About). These are heavy — they must lazy-load near the viewport and pause off-screen.
- **lucide-react** icons.
- **Backend**: one Vercel serverless function [api/queries.mjs](api/queries.mjs) — Resend email to `yuvavitc@gmail.com` (needs `RESEND_API_KEY` on Vercel; works in production — don't change it without asking).
- **Hosting**: Vercel (`vercel.json`, framework vite, output `dist`). Pushed branches get Vercel preview URLs.
- `express`, `cors`, `dotenv` are in dependencies but unused.

## Structure
- [src/App.jsx](src/App.jsx) — page composition, section order, modal/lightbox state, lazy sections (About, Tide, PrintTable, Gallery).
- [src/data.js](src/data.js) — **all content**: `tenures`, `domains` (7, each with a pastel colour), `events` (photos, instructions), `team`. Content edits happen here.
- [src/components/](src/components/) — one file per section; `ui/` holds the imported effect components (each with its own CSS).
- `public/images/` — photos served as `/images/...`. Referenced by path strings in `data.js` and components.
- Section anchors (used by the nav menu & tests): `#top #intro #award #about #events #domains #team #prints #gallery #queries`.
- `?nointro` query param skips the preloader (used by tests).

## Design system
Two layers that coexist — keep both:
1. **Editorial magazine** (base): parchment `#e2dedb` bg, ink `#1d1d1b`, bone `#cdc6be`, charcoal `#69645f`, ember `#c03f13` (accent/focus), teal `#00b18c`, edge `#383835`. Display type **Bodoni Moda** 800 with crushed leading (`.display`, `.display-md`); body **Source Serif 4** 300; mono eyebrows **JetBrains Mono** 11px uppercase (`.eyebrow`); UI pills **Manrope** (`.pill`); nameplate **Pirata One**.
2. **"Fictional" sticker energy** (accent layer): `FIC` palette in [Sticker.jsx](src/components/Sticker.jsx) — violet `#8a53ff`, coral `#fd4b38`, yellow `#ffd80c`, lime `#3ccb09`, cream `#ffe9ce`; **Fredoka** (`font-round`) bold uppercase; die-cut `<Sticker>` (burst/circle/bubble/label) that are draggable and cycle "shouts"; `.btn-ring` button (white, yellow 2px ring, black on hover with a tilt); `.sticker` hard offset shadow.
- Domain colours come from `domains[k].color` in data.js — always use these for domain pills/cards.
- Other fonts loaded: Anton (`font-aalto`), Sofia Sans Extra Condensed (`font-mango`), Playfair Display.
- Motion: easing `[0.16, 1, 0.3, 1]` (out) and `[0.65, 0, 0.35, 1]` (in-out); springs for stickers. Every animation must respect `prefers-reduced-motion`.
- Mobile: breakpoint at 640px (`sm`) is the phone/desktop switch in several components; tap targets >= 44px; safe-area insets respected.

**Design scope (decision D-005): polish only.** Keep this look. Fix bugs, spacing and mobile issues, and add small motion polish. Write bigger redesign ideas in decision.md as proposals first.

## Commands
```bash
npm run dev          # Vite dev server
npm run build        # production build -> dist/
npm run preview      # serve dist on :4173 (Playwright uses this)
npm test             # Playwright, all 5 projects (needs `npm run build` first)
npm run test:desktop | test:mobile | test:perf
npm run test:report  # open the HTML report (screenshots + click/session logs)
BASE_URL=https://<preview>.vercel.app npx playwright test   # test a Vercel preview
```

## Testing (Playwright)
- Config: [playwright.config.js](playwright.config.js). Projects: `desktop-chrome` 1440, `android-pixel` (Pixel 7), `iphone-safari` (WebKit iPhone 14), `desktop-firefox` 1440, `ipad`.
- [tests/fixtures.js](tests/fixtures.js) — `session` fixture logs every click, console error, page error and failed request into the report.
- [tests/smoke.spec.js](tests/smoke.spec.js) — sections render, no errors, no broken assets, no horizontal overflow, alt text, per-section screenshots.
- [tests/interactions.spec.js](tests/interactions.spec.js) — preloader, every menu link, event filters/modal/lightbox, gallery, query form (**always mock `/api/queries`; never send real email**), replay intro.
- [tests/perf.spec.js](tests/perf.spec.js) — strict budget: LCP < 2.5s, CLS < 0.1, initial JS < 250 KB, no image > 300 KB (throttled mobile, Chromium).
- After every meaningful change: build, run the tests, and log the result in checkpoint.md.

## Git rules (owner's instructions — mandatory)
- The owner is a **collaborator**; `andrewsundaradhas` owns the repo. **Never commit to, merge into, or push `master`/`main`.**
- Work branch: `claude/perf-testing` (off `yuva-website-updates`).
- **Commit locally; push only when the user explicitly says so.**
- Record every commit (hash + description) in decision.md's commit log.
- Write only inside this project folder. Never commit `.env*` (except `.env.example`), `dist/`, `.vercel/`, or test reports.

## Performance rules
- Images: real WebP/AVIF, max ~1600px wide, with `srcset`/`sizes`, `loading="lazy"` + `decoding="async"` below the fold, explicit `width`/`height` (or aspect-ratio) so nothing shifts. Hero images are eager with `fetchpriority="high"`.
- No image file > 300 KB. Never commit raw camera JPEGs.
- Keep the initial JS small: heavy/WebGL components go behind `lazy()` + an in-view trigger.
- Throttle or `matchMedia` instead of raw `resize` listeners.
