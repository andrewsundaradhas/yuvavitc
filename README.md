# YUVA VIT Chennai — Event Magazine

Vite + React + Tailwind CSS v4 + Framer Motion. Interactive pieces use `ogl` (WebGL sea), `three` (paper crumple) and `gsap` (menu).

```bash
npm install
npm run dev       # http://localhost:5173  (add ?nointro to skip the opening intro)
npm run build     # outputs ./dist
npm run preview
```

Content (events, domains, photos) lives in `src/data.js`. Photos are in `public/images/`.

Deploy: import the repo in Vercel — framework preset *Vite*, build `npm run build`, output `dist` (already set in `vercel.json`).
