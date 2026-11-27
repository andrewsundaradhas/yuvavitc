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

## Proposals awaiting owner approval
_(Bigger design ideas go here before anything is built, per D-005.)_
- P-001 — Remove unused deps `express`, `cors`, `dotenv` (no imports found). Low risk.
- P-002 — Cut the Google Fonts request from 8 families to the ones in use, and self-host or subset them.

## Commit log (branch `claude/perf-testing`)

| Commit | Date | Description |
|--------|------|-------------|
