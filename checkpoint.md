# checkpoint.md — Real-browser test log

Each checkpoint is a Playwright run in real browsers (Chromium, WebKit, Gecko) that tests the site the way a real visitor uses it: page load, rendering per section, every menu click, filters, modals, lightbox, gallery, the query form (API mocked), and the performance budget.
Full per-test details: `npm run test:report` (HTML report with click/session logs and screenshots).

**Profiles:** desktop-chrome 1440×900 · android-pixel (Pixel 7) · iphone-safari (WebKit, iPhone 14) · desktop-firefox 1440×900 · ipad (WebKit, iPad gen 7)
**Budget (D-007):** LCP < 2.5 s · CLS < 0.1 · initial JS < 250 KB · no image > 300 KB · Hero visible < 1 s (desktop)

---

## CP-000 — Baseline (before any change)
- **Date:** 2026-11-27 · **Commit under test:** `fd9250c` app code (+ test suite `f7fb535`) · **Target:** local `vite preview` (production build)
- **Result:** ✅ 109 passed · ❌ 23 failed · ⏭ 3 skipped (the Chromium-only throttled vitals test, skipped on WebKit/Firefox) · ⏱ 31.5 min (most of it spent downloading images)

### Performance (budget ❌ on every profile)
| Profile | Initial JS | Images downloaded (full scroll) | # images | Images > 300 KB | LCP (throttled) | CLS | Hero visible (throttled) |
|---|---|---|---|---|---|---|---|
| desktop-chrome | 398 KB ❌ | **405 MB** ❌ | 240 | 96 ❌ | **5,044 ms** ❌ | 0.065 ✅ | 5,206 ms ❌ |
| android-pixel | 398 KB ❌ | **674 MB** ❌ | 211 | 105 ❌ | **4,528 ms** ❌ | 0.011 ✅ | **14,620 ms** ❌ |
| iphone-safari | 398 KB ❌ | 673 MB ❌ | 208 | 105 ❌ | n/a (Chromium-only metric) | – | – |
| desktop-firefox | 398 KB ❌ | 666 MB ❌ | 223 | 108 ❌ | n/a | – | – |
| ipad | 398 KB ❌ | 672 MB ❌ | 205 | 104 ❌ | n/a | – | – |

Largest single images: `53-only-founders-5.webp` 15.1 MB, `52-only-founders-4.webp` 15.1 MB, `55-only-founders-7.webp` 15.0 MB, `41-yuva-ai-thon-7.webp` 14.2 MB, `56-first-responder-1.webp` 14.0 MB. All of them are JPEGs with a renamed `.webp` extension.
(On mobile the image totals are higher because more lazy/visibility-driven frames load during the slower step-scroll. Desktop-chrome measured 240 requests at a lower average size.)

### Functional results by component
| Component / flow | desktop-chrome | android-pixel | iphone-safari | desktop-firefox | ipad |
|---|---|---|---|---|---|
| Page loads, all 10 sections render, no JS errors | ⏱ timeout | ✅ | ✅ | ✅ | ✅ |
| No broken assets (4xx/5xx) | ✅ | ✅ | ✅ | ✅ | ✅ |
| No horizontal overflow | ✅ | ✅ | ✅ | ✅ | ❌ **80 px** |
| All images have alt | ✅ | ✅ | ✅ | ✅ | ✅ |
| Section screenshots (render check) | ⏱ | ⏱ | ⏱ | ⏱ | ⏱ |
| Preloader → Skip intro | ✅ | ✅ | ✅ | ✅ | ✅ |
| `?nointro` instant content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Menu → 9 links (Home, Awards, About, Events, Domains, Team, Prints, Gallery, Queries) | ❌ Prints, Gallery | ❌ Gallery | ✅ | ✅ | ✅ |
| Events tenure + domain filter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hero domain sticker → filters events | ✅ | ✅ | ✅ | ✅ | ⏱ (flake) |
| Event modal: open / next / prev / photo → lightbox / Esc / close | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gallery carousel → click frame → lightbox | ⏱ timeout | ✅ | ✅ | ⏱ timeout | ✅ |
| Query form: empty hint | ✅ | ✅ | ✅ | ✅ | ✅ |
| Query form: invalid email blocked (no API call) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Query form: success → "sent" → "send another" | ✅ | ✅ | ✅ | ❌ (flake) | ✅ |
| Query form: server error → error message | ✅ | ✅ | ✅ | ❌ (flake) | ✅ |
| Footer "Replay intro" | ✅ | ✅ | ✅ | ✅ | ❌ (flake) |

### Failure triage (each was re-checked)
| Failure | Verdict | Evidence |
|---|---|---|
| Perf budget, all profiles (initial JS, image size, LCP) | **Real**: the site misses the budget | numbers above |
| iPad: page 80 px wider than the viewport | **Real bug.** The closed StaggeredMenu panel (`aside.staggered-menu-panel`, `.sm-prelayer`) sits off-canvas to the right (right edge 1,620 px on an 810 px screen) and WebKit lets the page pan sideways. | Probe: offenders = `sm-prelayer`, `staggered-menu-panel` |
| Menu → Prints / Gallery doesn't land on the section | **Real bug (perf-driven).** `#prints` / `#gallery` live in lazy `Suspense` chunks that aren't mounted until about 2.5 s after load, even on fast local (much longer on 4G). Taps before that go nowhere. Once mounted, anchors land correctly (top = 56 px). | Probe: `#prints exists after 2463 ms`; after settling, the section top is 56 px |
| Firefox query form success/error; iPad Replay intro; iPad hero sticker | **Flaky under load, not a logic bug.** All 6 pass when re-run in isolation (`--workers=1`, 2.1 min). Under 3 parallel heavy pages, the paper-plane animation and intro took over 10 s, which is a symptom of CPU/network saturation from the image payload. In the Firefox screenshot the form card vanishes during the "busy" phase, so a user on a slow device sees an empty coral panel for several seconds. | Isolated re-run: 6/6 passed |
| Screenshot test (all 5), desktop smoke/gallery timeouts | **Perf-driven timeouts.** Scrolling through 400–670 MB of images can't finish within 60 s. They should pass once images are optimized; if not, the test timeout will be tuned. | `Test timeout of 60000ms exceeded` |

### Click/session tracking
Every test attaches a `session-log` (all clicks with timestamp + label, console errors, page errors, failed requests) to the HTML report. Baseline: **no uncaught page errors and no 4xx/5xx asset responses** were recorded in any passing smoke run.

> **Correction (added at CP-001):** the CP-000 throttled vitals above (LCP 5.0 s / 4.5 s, Hero 5.2 s / 14.6 s) were measured with 3 parallel workers competing for the CPU, so they're inflated. A fair re-measurement of the **same baseline code** (commit `41b6cd6`, built in a temporary worktree) with 1 worker, ×3 runs, gave: desktop LCP **3,620–3,700 ms**, Hero 3,333–3,574 ms; Pixel LCP **3,624–3,696 ms**, Hero 3,818–3,897 ms. CP-001 compares against these.

---

## CP-001 — Improvement #1: image optimization
- **Date:** 2026-11-27 · **Commits under test:** `6cc6956` (optimize) + `392a6ac` (remove originals) · **Target:** local `vite preview` of the cleaned build
- **Result:** ✅ 122 passed · ❌ 10 failed · ⏭ 3 skipped · ⏱ **10.1 min** (was 31.5 min)

### Before → after
| Metric | CP-000 (before) | CP-001 (after) | Change |
|---|---|---|---|
| `public/images` in repo / deploy output (`dist/`) | 1.24 GB / 1.3 GB | `public/img` 34 MB / `dist` **35 MB** | **−97%** |
| Images per full scroll, desktop-chrome | 405 MB (240 req) | **6.1 MB** (207 req) | **−98.5%** |
| Images per full scroll, android-pixel | 674 MB | **2.3 MB** | −99.7% |
| Images per full scroll, iphone-safari | 673 MB | **1.1 MB** | −99.8% |
| Images per full scroll, desktop-firefox | 666 MB | **6.8 MB** | −99% |
| Images per full scroll, ipad | 672 MB | **1.1 MB** | −99.8% |
| Largest single image | 15.1 MB | ≤ 298 KB (largest on disk) | −98% |
| Images over 300 KB | 96–108 per profile | **0** | ✅ budget met |
| Fake `.webp` (JPEG inside) | 76 | 0 | ✅ |
| Gallery images before the user scrolls near it | all 166 frames | 0 (carousel mounts ~1 screen away) | ✅ |
| Initial JS (transfer) | 398 KB | 401 KB (+3 KB image manifest) | ≈ (fix in #4) |
| LCP, desktop (throttled, 1 worker ×3) | 3,620–3,700 ms | 3,712–3,744 ms | ≈ unchanged* |
| LCP, Pixel (throttled, 1 worker ×3) | 3,624–3,696 ms | 3,684–3,772 ms | ≈ unchanged* |
| Hero visible, desktop / Pixel | 3.3–3.6 s / 3.8–3.9 s | 3.4–3.5 s / 3.9 s | ≈ unchanged* |
| CLS desktop / Pixel | 0.065 / 0.011 | 0.065 / 0.010 | ✅ unchanged |

\* **Why LCP didn't move:** the LCP element is the giant "YUVA" headline, not a photo. First paint is held back by 401 KB of JS (parsed under 4× CPU throttling) and 8 font families. That's the work in improvements #3 (preloader), #4 (JS split) and #5 (fonts). Image optimization removes the hundreds of MB that used to compete for bandwidth *after* first paint, which is what users feel as "slow while scrolling", along with the data cost on mobile.

### Functional results by component (after)
| Component / flow | desktop-chrome | android-pixel | iphone-safari | desktop-firefox | ipad |
|---|---|---|---|---|---|
| All sections render, no JS errors | ✅ (was ⏱) | ✅ | ✅ | ✅ | ✅ |
| No broken assets (4xx/5xx) | ✅ | ✅ | ✅ | ✅ | ✅ |
| No horizontal overflow | ✅ | ✅ | ✅ | ✅ | ❌ 80 px (T1, pre-existing) |
| Every image has alt | ✅ | ✅ | ✅ | ✅ | ✅ |
| Section screenshots (render check) | ✅ (was ⏱) | ✅ (was ⏱) | ✅ (was ⏱) | ✅ (was ⏱) | ✅ (was ⏱) |
| Preloader skip / `?nointro` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Menu → 9 links | ✅ (was ❌ Prints, Gallery) | ✅ (was ❌ Gallery) | ⚠ Gallery flaked once (see below) | ✅ | ✅ |
| Events filters, modal, photo → lightbox | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hero domain sticker → filters events | ✅ | ✅ | ✅ | ✅ | ⏱ (pre-existing flake) |
| Gallery: carousel → click frame → lightbox | ✅ (was ⏱) | ✅ | ✅ | ✅ (was ⏱) | ✅ |
| Query form: empty / invalid / success / error | ✅ | ✅ | ✅ | ✅ (was flaky) | ✅ |
| Footer "Replay intro" | ✅ | ✅ | ✅ | ✅ | ✅ (was flaky) |

### Remaining failures (10), triaged
| Failure | Verdict |
|---|---|
| Initial JS 401 KB > 250 KB (all 5 profiles) | Real, pre-existing → improvement #4 |
| LCP > 2,500 ms (desktop-chrome, android-pixel) | Real, pre-existing → improvements #3/#4/#5 |
| iPad 80 px sideways scroll | Real, pre-existing (T1, menu CSS) |
| iPad hero sticker → events timeout | Pre-existing flake (also in CP-000) |
| iphone-safari menu → Gallery timeout | **Load flake, not a regression.** Re-checked: 18/18 passed isolated (×3 on both phones) and 50/52 passed in the full iPhone project ×2 with 3 parallel workers (the only failures were the JS budget). Watch it in CP-002. |

### Visual verification
- Desktop 1440 and Pixel 7 screenshots of the Hero, Awards, Team, event modal and lightbox: images are sharp and correctly oriented, aspect ratios and crops are unchanged, and there are **0 broken eager images**.
- Side-by-side spot checks: an EXIF-rotated portrait (`27-freshers-expo-4`) and a quality-stepped crowd photo (`img-8410`) both look correct at display size.

### Test changes in this checkpoint
- The Gallery test now clicks a card that is actually visible after the "rise" intro settles. The old fixed coordinate landed in a gap between cylinder cards, which was a test bug: real users click a card and the lightbox opens on all 5 profiles.

### Next checkpoint
CP-002 comes after the next approved improvement.

## CP-002 — Improvement #2: fresh baseline (2026-11-27, before any #2 change)
Code: `f21f9e9` (improvement #1 complete; no application changes since). Build: `npm run build`, then a full suite at 3 workers.

**Result: 121 passed / 11 failed (2 timed out) / 3 skipped, 12.0 min.**

| Failure | Profile | Class |
|---|---|---|
| Payload budget: initial JS 401 KB > 250 KB | all 5 | Known (improvement #4/#5) |
| LCP/hero vitals | desktop, Pixel | Known. Parallel-run values (7.4 s / 6.2 s) are inflated by load; see D-019 for the fair 1-worker method |
| No horizontal overflow (80 px) | iPad | Known T1 (StaggeredMenu off-canvas) |
| Hero domain sticker (timeout) | iPad | Known load flake (CP-000/CP-001) |
| Section screenshots (timeout 60 s) | desktop | **New in this run.** Passed in CP-001; load-induced, nothing changed in app code |
| All sections render, no console errors | iPad | **New in this run:** "There are too many active WebGL contexts on this page, the oldest context will be lost." (×12). This is a WebGL lifecycle issue (D-008 / improvement #4), not image-related |

**Image payload (full scroll, unthrottled):** desktop 6.8 MB / 213 requests · Firefox 7.0 MB / 216 · Pixel 3.1 MB / 72 · iPhone 1.1 MB / 68 · iPad 1.4 MB / 83. 0 images > 300 KB.

**Gallery probe** (`scratch/gallery-probe.mjs`, not committed: gallery-only image requests after scrolling to the gallery, 6 s settle, then 10 s drift and 2 drags):

| Profile | Gallery images at page load | After viewing | After spinning | Gallery KB |
|---|---|---|---|---|
| desktop-chrome 1440 | 3 | **166** | 166 | **4,801** |
| android-pixel | 3 | 19 | 19 | 631 |
| iphone-safari | 3 | 22 | 25 | 870 |

Finding: on desktop the `cylinder` ring shows **all 166 frames on screen at once** as roughly 65 px thumbnails, so every frame really is visible and native lazy loading correctly loads them all. A "load only near the front" window would leave visible frames blank. On phones (`panorama`) lazy loading already limits it to about 20 frames. Every other `<img>` already uses `imgProps` (srcset/sizes/width/height/lazy), which was delivered in #1 Phase 3 (D-018). → Scope question raised with the owner (see decision.md D-022).

**Outcome (D-023):** the owner closed #2 as already delivered, and the desktop gallery weight moves to the D-021 curation. No application code changed in CP-002, so these results stand as the baseline for improvement #3.

## CP-003 — Improvement #3: preloader (2026-11-27)
Commits: `458dc6f` (step 1), `dbe00cd` (step 2). Compared against the CP-002 baseline (`f21f9e9`).

### How the preloader worked (findings, before any change)
- **Entirely timer-driven.** It doesn't wait for any asset, and the 000→100 counter is cosmetic: a 4.6 s `animate()`. Timeline from when the app mounts:
  - Blueprint scene 0–1.8 s
  - Cream "YUVA" slam 1.8–2.65 s
  - Stickers 2.65–4.6 s
  - Auto-exit at 4.6 s, then five colour shutters
  - `onReady` (Hero mounts) at **5.28 s**
  - Overlay removed at **6.55 s**

  So it's about 5.3 s until the Hero exists, not about 2 s.
- **The Hero wasn't mounted during the intro.** `App` rendered a `min-h-[100svh] bg-ink` placeholder until `onReady`, so the Hero's images, fonts and layout only *started* loading after 5.3 s, and LCP landed at about 7.3 s.
- **It played on every visit**, repeat visits included. Nothing was remembered.
- **Under 4× CPU the scripted 5.3 s stretches to about 9.5–10 s.** The intro's own animation load (many springs, confetti, a 72-tick rotating SVG) delays the timers.
- **Before the intro can paint, the screen is blank.** It lasts 0.6–0.8 s fast and 3.4–4.6 s throttled on a first visit, because the preloader lives inside the 401 KB React bundle, and module scripts also wait for the render-blocking Google Fonts CSS. That's JS and fonts (improvements #4/#5), not the preloader itself.
- **Cause breakdown:** mostly **intentional timing**, then **the Hero being gated behind the timer**, then **JS/font loading** (before the intro starts only).

### Changes (smallest safe set; no visual change)
1. **Hero mounts immediately under the preloader** (`App.jsx`, `Hero.jsx`). The Hero's 5 entrance animations are held at their start pose (`play=false`) and play when the shutters lift. A timeline probe confirmed the look is unchanged: YUVA sits at opacity 0 / y=140 until the reveal, then animates in, and the stickers drop as before. Replay remounts the Hero so the entrance replays too.
2. **The intro plays on the first visit only** (D-006). `localStorage['yuva:intro-seen']` is set when the intro starts, wrapped in try/catch for private mode. Footer "Replay intro" still plays it.

### Before → after (`scratch/preloader-probe.mjs`, median of 3, ms from navigation)
| Profile | Visit | Hero mounted | Preloader gone | LCP |
|---|---|---|---|---|
| desktop fast | first | 6,149 → **615** | 7,402 → 7,213 | 7,400 → **5,992** |
| desktop fast | repeat | 6,053 → **389** | 7,325 → **no intro** | 7,304 → **1,668** |
| desktop throttled | first | 13,905 → **2,668** | 13,905 → **11,667** | 13,612 → **11,712** |
| desktop throttled | repeat | 11,243 → **1,062** | 11,884 → **no intro** | 11,972 → **4,172** |
| Pixel fast | first | 6,039 → **530** | 7,289 → 7,114 | 7,300 → **6,016** |
| Pixel fast | repeat | 5,635 → **582** | 6,896 → **no intro** | 5,748 → **1,832** |
| Pixel throttled | first | 13,884 → **2,518** | 14,197 → **10,802** | 13,240 → **10,836** |
| Pixel throttled | repeat | 11,071 → **829** | 11,071 → **no intro** | 1,340\* → 4,368 |

\*Not a real regression: before the change, LCP on a repeat visit sometimes recorded the preloader's own text (1.3 s), not the Hero. After, the Hero is the real LCP element.
First-visit throttled reveal comes about 2–3.4 s earlier, because the Hero's work now overlaps the intro instead of following it.

### Full suite (3 workers): **132 passed / 10 failed (1 timed out) / 3 skipped, 10.0 min** (CP-002: 121 / 11 / 3, 12.0 min)
4 new preloader tests were added, so the total is 145 tests (was 135). Remaining failures:
- JS budget ×5 (known; #4/#5)
- LCP desktop and Pixel (known)
- iPad overflow T1 (known)
- iPad hero sticker timeout (known flake)
- **Firefox gallery lightbox** (new in this run but pre-existing: the original build fails it 3/6 in an A/B rerun, the new build 1/6; untouched by #3)

The CP-002 desktop-screenshot timeout and iPad WebGL-context console error didn't recur in this run.
- **Fair vitals** (`?nointro` path; 1 worker × 3, A/B in the same session):

  | Profile | Metric | Original (`f21f9e9`) | New (`dbe00cd`) |
  |---|---|---|---|
  | Desktop | LCP | 3,724–3,864 ms | 3,744–3,928 ms |
  | Desktop | CLS | 0.065 | 0.065 |
  | Pixel | LCP | 3,744–3,848 ms | 3,760–3,960 ms |
  | Pixel | CLS | 0.010–0.011 | 0.010–0.011 |

  This path is unchanged, and the differences are within noise.
- **Preloader tests:** 150/150 (6 repeats × 5 profiles, 3 workers).
- **Test fix:** "Skip intro" now uses `dispatchEvent('click')`. A full actionability click raced the 4.6 s auto-exit on loaded WebKit; the original build timed out 2/18 on iPad.
- **Edge case found and fixed:** marking the intro "seen" only at the end left a ~2 s window where a reload replayed it. It's now marked at the start.
- **Pre-existing quirk (unchanged):** "Replay intro" pressed *during* the exit shutters is ignored.

### Not done; needs owner approval (visual change)
Shortening the intro itself (4.6 s scripted → about 2 s per D-006) changes the animation, so it's proposed as P-005.
