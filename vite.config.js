import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Improvement #5 (S1): social previews need absolute URLs. On Vercel the production domain comes from the system env
// VERCEL_PROJECT_PRODUCTION_URL (or set SITE_URL yourself); locally the tags fall back to root-relative paths.
const site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
const siteUrl = () => ({ name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', site) })

// Local /api: on Vercel, api/*.mjs run as serverless functions. `vite dev` / `vite preview` don't run them, so the
// query form got a 404 locally. This runs the same handler files (unchanged) with a minimal Vercel-style req/res,
// reading secrets such as RESEND_API_KEY from .env.local (git-ignored). Local only — never part of the build.
const localApi = (mode) => {
  const env = loadEnv(mode, process.cwd(), '')
  const serve = (server) => { server.middlewares.use(async (req, res, next) => {
    const m = /^\/api\/([a-z0-9-]+)\/?(\?.*)?$/i.exec(req.url || '')
    if (!m) return next()
    for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v
    let mod
    try { mod = await import(pathToFileURL(path.resolve('api', `${m[1]}.mjs`)).href) } catch { return next() }
    let raw = ''
    for await (const chunk of req) raw += chunk
    try { req.body = raw && /json/.test(req.headers['content-type'] || '') ? JSON.parse(raw) : raw } catch { req.body = undefined }
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (obj) => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res }
    try { await mod.default(req, res) } catch (e) { console.error(`[api/${m[1]}]`, e); if (!res.writableEnded) res.status(500).json({ success: false, message: 'Local API error' }) }
  }) } // return nothing: a returned function would be treated as a post-middleware hook
  return { name: 'local-api', apply: 'serve', configureServer: serve, configurePreviewServer: serve }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), siteUrl(), localApi(mode)],
  build: { chunkSizeWarningLimit: 700 },
}))
