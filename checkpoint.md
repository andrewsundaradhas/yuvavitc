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

### Next checkpoint
CP-001 will be after the image pipeline (Top-5 #1) is implemented. Expected: images < 30 MB per scroll, no image > 300 KB, and the timeouts cleared.
