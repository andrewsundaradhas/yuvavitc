# decision.md — Owner inputs & decisions log

Every input from the project owner and every decision made on this project, newest at the bottom of each table.
Format: **ID · date · decision · why / source**.

## Project objective (owner, 2026-11-27)
Make YUVA VIT Chennai's site **highly visually engaging and energetic**, responsive on **mobile and PC**, with **fast loading and no visible delay**. Use Playwright in real browsers to verify it from a real user's point of view. Log decisions here and test results in checkpoint.md.

## Decisions

| ID | Date | Decision | Why / Source |
|----|------|----------|--------------|
| D-001 | 2026-11-27 | Work on a new branch `claude/perf-testing` created from `yuva-website-updates`. Never touch `master`/`main` without the owner's approval. | Owner choice (Q&A) |
| D-002 | 2026-11-27 | Owner is a **collaborator**; repo owner `andrewsundaradhas` reviews and merges to master. | Owner (Q&A) |
| D-003 | 2026-11-27 | **Commit locally only; push only when the owner says so.** | Owner (Q&A) |
| D-004 | 2026-11-27 | **Images: optimize + prune.** Convert referenced images to real WebP (max ~1600px plus smaller `srcset` sizes), update paths, and delete unreferenced or duplicate originals from the repo (they stay in git history). | Review found 1.3 GB in `public/images`, 76 fake `.webp` files (renamed 16 MB JPEGs, 587 MB), duplicate `DSC*.JPG` files, and about 80 MB actually referenced. Owner chose "Optimize + prune". |
| D-005 | 2026-11-27 | **Design scope: polish only.** Keep the editorial + sticker look; fix layout, mobile and motion issues. Propose bigger redesigns here before building them. | Owner (Q&A) |
| D-006 | 2026-11-27 | **Preloader: first visit only, shortened to about 2s**, remembered in localStorage, with the Hero rendering underneath immediately. Skip stays. | It currently takes about 4.6s and blocks the Hero render. Owner choice. |
| D-007 | 2026-11-27 | **Strict perf budget**: LCP < 2.5s, CLS < 0.1, initial JS < 250 KB, no image > 300 KB, Hero visible < 1s on desktop. Enforced by `tests/perf.spec.js`. | Owner choice |
| D-008 | 2026-11-27 | **WebGL effects: keep all**, load and start each one only when its section nears the viewport, pause when off-screen, and use lighter settings on mobile or low-end devices. | Owner choice |
| D-009 | 2026-11-27 | **Query email (Resend) works in production — leave the logic alone.** Only clean up the stale `.env.example` (it mentions FormSubmit and aaathi241). Tests always mock `/api/queries`. | Owner (Q&A) |
| D-010 | 2026-11-27 | **Test matrix:** desktop Chrome 1440, Android Pixel 7, iPhone 14 (WebKit), desktop Firefox 1440, iPad. | Owner (Q&A) |
| D-011 | 2026-11-27 | **Preview:** Playwright runs against the local `vite preview` build by default; set `BASE_URL` to test a Vercel preview URL once a branch is pushed. | Owner (Q&A) |
| D-012 | 2026-11-27 | Playwright `@playwright/test` 1.56.1 added as a devDependency; tests live in `tests/`; reports are gitignored. | Setup |
| D-013 | 2026-11-27 | **Audit before code:** finish the full Playwright baseline, create checkpoint.md (CP-000) and PROJECT_AUDIT.md, and propose the top 5 improvements. **Don't modify application code until the owner approves.** | Owner instruction |
| D-014 | 2026-11-27 | Baseline failures were triaged into real bugs (perf budget, iPad overflow T1, lazy-anchor T2) and load-induced flakes (6/6 pass in isolation). Test timeouts are left untouched for now so the baseline is honest; re-evaluate after the image fix. | Baseline triage |
| D-015 | 2026-11-27 | **Owner approved improvement #1 (image optimization) only**, in 5 phases: inventory, optimize, perf, cleanup, testing. Stay on `claude/perf-testing`, no push, originals kept until all checks pass, cleanup in a separate commit, never rewrite history, ask before deleting anything uncertain. **Don't start #2 without approval.** | Owner instruction |
| D-016 | 2026-11-27 | **Image pipeline:** `scripts/image-inventory.mjs` → `scripts/optimize-images.mjs` → `scripts/rewrite-refs.mjs`. Output is real WebP in `public/img/<slug>.webp` (largest) plus `-480`/`-960`, with a manifest at `src/imageManifest.json`. **Longest edge is capped at 1600px**, so portrait photos max out at 1200×1600 instead of 1600×2133 (otherwise they're over 300 KB even at q54). **No upscaling**: 127 small originals get fewer sizes. Quality is 78, stepped down (minimum 66) for 6 dense crowd photos to stay ≤300 KB. EXIF orientation is baked in. | Phase 2 |
| D-017 | 2026-11-27 | **The 24 unreferenced files with no duplicate twin** (Diwali 7–12, 2 team photos, Nanban, Pongal-6, drone photo, 13 older small WebPs) get **backed up to `D:\yuvavitc-image-backup` and then deleted** from the repo. Writing that one backup folder outside the project is explicitly authorized. | Owner (Q&A) |
| D-018 | 2026-11-27 | **Responsive loading (Phase 3):** a `src/lib/img.js` helper (`imgProps`, `pick`, `srcSet`) is spread on existing `<img>` tags, so there are no markup or design changes. The Hero images are eager and the team-stall photo gets `fetchpriority="high"`; everything else is lazy, with intrinsic width/height. The Gallery carousel mounts only when within about 1 screen and uses one right-sized variant per frame (the carousel preloads `item.src`). PrintTable textures use the ~700px variant and the Intro pills the 480px one. Award's best-club image changed from eager to lazy (it's below the fold). | Phase 3 |
| D-019 | 2026-11-27 | **Fair perf comparison:** throttled vitals are compared with 1 worker over 3 runs, against the baseline code rebuilt in a temporary worktree (removed afterwards). The CP-000 parallel-run vitals are marked inflated. The CP-001 iPhone "menu → Gallery" timeout is classified as a load flake (18/18 isolated, 50/52 under load with only budget failures) and stays on watch. | CP-001 triage |
| D-020 | 2026-11-27 | **Roadyssey Google Meet screenshot (`/img/img-20260622-wa0088.webp`) stays as it is.** The owner has full rights to publish it, including the participants' visible names and faces, with no permission restrictions. Closes P-004. Don't crop, blur or swap it. | Owner instruction |
| D-021 | 2026-11-27 | **Gallery: curate 24–30 highlight photos for the 3D carousel.** All 166 photos stay reachable in their event galleries (the event modal and lightbox read `events[].photos`, which won't change). Accepts P-003, option 1. **Not implemented yet.** It's queued as its own change; the shortlist will be proposed to the owner before it's built, and the "Twenty frames" copy will be aligned with the final count. The original image backup at `D:\yuvavitc-image-backup` stays untouched. | Owner instruction |
| D-022 | 2026-11-27 | **Owner approved improvement #2** (lazy, sized, responsive images + lazy gallery), with these conditions: stay on `claude/perf-testing`, keep #1 unchanged, no push, don't touch master, keep backups, take a fresh baseline first, change one step at a time with tests, and leave the gallery redesign alone. Fresh baseline = CP-002. **Finding:** almost all of #2 was already delivered in #1 Phase 3 (D-018). The remaining item ("the carousel loads only frames near the front") doesn't fit desktop, where all 166 frames are visible at once (about 65 px each, 4.8 MB). Shrinking that needs either a new small thumbnail size (which changes #1's pipeline) or the D-021 curation. **Scope change, so it's paused for owner approval.** No application code changed. | Owner instruction + CP-002 |
| D-023 | 2026-11-27 | **Improvement #2 closed as delivered by #1 Phase 3 (D-018). No new code.** The desktop gallery weight (166 frames, 4.8 MB) is folded into the D-021 curation: about 30 frames comes to roughly 1 MB. Rejected: a new ~240 px thumbnail size (changes #1's pipeline and is mostly undone by curation), and a front-only load window (visible frames would show blank on desktop). **The next step is improvement #3; waiting for owner approval.** | Owner (Q&A) |

## Proposals awaiting owner approval
_(Bigger design ideas go here before anything is built, per D-005.)_
- P-001 — Remove unused deps `express`, `cors`, `dotenv` (no imports found). Low risk.
- ~~P-003 — Gallery density~~ → **approved as D-021** (24–30 highlight photos in the ring; all 166 stay in the event galleries).
- ~~P-004 — Roadyssey Meet screenshot~~ → **resolved as D-020** (keep as is; owner holds publishing rights).
- P-002 — Cut the Google Fonts request from 8 families to the ones in use, and self-host or subset them.

## Commit log (branch `claude/perf-testing`)

| Commit | Date | Description |
|--------|------|-------------|
| f7fb535 | 2026-11-27 | Add CLAUDE.md, decision.md, and a Playwright suite (5 browser/device projects; smoke, interaction and perf specs; click/session logging fixture). |
| 41b6cd6 | 2026-11-27 | Add checkpoint.md (CP-000 baseline: 109 pass / 23 fail, perf metrics, triage) and PROJECT_AUDIT.md (findings + top-5 plan). No app code changed. |
| 6cc6956 | 2026-11-27 | **Improvement #1, part 1:** responsive WebP pipeline (scripts/, `public/img` 546 variants, `src/imageManifest.json`, `src/lib/img.js`), lazy/eager/priority loading, gallery mounts near the viewport, ASSET_INVENTORY.md, gallery test fix. Originals untouched. |
| 392a6ac | 2026-11-27 | **Improvement #1, part 2 (cleanup):** removed all 329 files in `public/images` after reference checks and a full test run. Backup at `D:\yuvavitc-image-backup` (MD5-verified 329/329). No history rewrite. |
| 0df6d94 | 2026-11-27 | Record CP-001 results in checkpoint.md (122 pass / 10 fail, before/after table, triage) and decisions D-016–D-019 plus proposals P-003/P-004. |
| f21f9e9 | 2026-11-27 | Record owner decisions D-020 (keep the Roadyssey Meet photo; closes P-004) and D-021 (curate 24–30 gallery ring photos; all 166 stay in the event galleries). Fix commit-log order. Docs only. |
