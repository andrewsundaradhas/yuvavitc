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
