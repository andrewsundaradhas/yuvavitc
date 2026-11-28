// Asset inventory: which files in public/images are referenced, unused, or duplicated.
// Usage: node scripts/image-inventory.mjs  -> writes scripts/out/inventory.json and prints a summary.
// Reference sources: src/data.js (loaded as a module, every string value), every .jsx/.js/.css in src, index.html.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

const ROOT = process.cwd()
const IMG_DIR = path.join(ROOT, 'public', 'images')
const RE = /\/images\/[^"'`)\s]+?\.(?:png|jpe?g|webp|avif|gif|svg)/gi

// 1) every string inside data.js exports (catches img() helper output and any field name)
const data = await import(pathToFileURL(path.join(ROOT, 'src', 'data.js')).href)
const refs = new Map() // path -> Set(where)
const add = (p, where) => { if (!refs.has(p)) refs.set(p, new Set()); refs.get(p).add(where) }
const walk = (v, where) => {
  if (typeof v === 'string') { for (const m of v.match(RE) || []) add(m, where) }
  else if (Array.isArray(v)) v.forEach((x) => walk(x, where))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, where)
}
for (const [name, v] of Object.entries(data)) walk(v, `data.js:${name}`)

// 2) literal paths in source files + index.html
const srcFiles = []
const collect = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? collect(p) : /\.(jsx?|css)$/.test(f.name) && srcFiles.push(p) } }
collect(path.join(ROOT, 'src'))
srcFiles.push(path.join(ROOT, 'index.html'))
for (const f of srcFiles) {
  if (f.endsWith(`${path.sep}data.js`)) continue
  const rel = path.relative(ROOT, f).replaceAll('\\', '/')
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => { for (const m of line.match(RE) || []) add(m, `${rel}:${i + 1}`) })
}

// 3) inspect every file on disk
const files = fs.readdirSync(IMG_DIR).filter((f) => fs.statSync(path.join(IMG_DIR, f)).isFile())
const magic = (b) => b[0] === 0xff && b[1] === 0xd8 ? 'jpeg' : b.slice(0, 4).toString() === 'RIFF' ? 'webp' : b[0] === 0x89 && b[1] === 0x50 ? 'png' : 'other'
const inv = []
for (const f of files) {
  const abs = path.join(IMG_DIR, f)
  const buf = fs.readFileSync(abs)
  let meta = {}
  try { const m = await sharp(buf).metadata(); meta = { width: m.width, height: m.height, orientation: m.orientation || 1, hasAlpha: !!m.hasAlpha } } catch (e) { meta = { error: String(e.message) } }
  const web = `/images/${f}`
  inv.push({ file: f, bytes: buf.length, md5: crypto.createHash('md5').update(buf).digest('hex'), ext: path.extname(f).slice(1).toLowerCase(), realFormat: magic(buf), ...meta, referenced: refs.has(web), refs: [...(refs.get(web) || [])] })
}

// duplicate groups by content hash
const byHash = {}
for (const x of inv) (byHash[x.md5] ||= []).push(x.file)
for (const x of inv) x.duplicates = byHash[x.md5].filter((f) => f !== x.file)

const missing = [...refs.keys()].filter((p) => !files.includes(p.slice('/images/'.length)))
const sum = (a) => Math.round(a.reduce((s, x) => s + x.bytes, 0) / 1048576)
const used = inv.filter((x) => x.referenced), unused = inv.filter((x) => !x.referenced)
const out = {
  generated: new Date().toISOString(),
  totals: {
    files: inv.length, totalMB: sum(inv), referencedFiles: used.length, referencedMB: sum(used),
    unusedFiles: unused.length, unusedMB: sum(unused),
    unusedWithReferencedTwin: unused.filter((x) => x.duplicates.some((d) => used.find((u) => u.file === d))).length,
    fakeWebp: inv.filter((x) => x.ext === 'webp' && x.realFormat !== 'webp').length,
    over300KB: used.filter((x) => x.bytes > 300 * 1024).length,
    exifRotated: inv.filter((x) => x.orientation > 1).length,
  },
  missingReferences: missing,
  nonImagesDirRefs: [...refs.keys()].filter((p) => !p.startsWith('/images/')),
  files: inv.sort((a, b) => a.file.localeCompare(b.file)),
}
fs.mkdirSync('scripts/out', { recursive: true })
fs.writeFileSync('scripts/out/inventory.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify({ ...out.totals, missingReferences: missing }, null, 2))
