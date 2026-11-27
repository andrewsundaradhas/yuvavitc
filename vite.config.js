import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Improvement #5 (S1): social previews need absolute URLs. On Vercel the production domain comes from the system env
// VERCEL_PROJECT_PRODUCTION_URL (or set SITE_URL yourself); locally the tags fall back to root-relative paths.
const site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
const siteUrl = () => ({ name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', site) })

export default defineConfig({ plugins: [react(), tailwindcss(), siteUrl()], build: { chunkSizeWarningLimit: 700 } })
