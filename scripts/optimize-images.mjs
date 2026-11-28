// Image pipeline: every REFERENCED file in public/images -> real WebP in public/img at 480/960/1600 px.
//   node scripts/image-inventory.mjs   (first — builds scripts/out/inventory.json)
//   node scripts/optimize-images.mjs
// Output per image (never upscaled; the largest variant is capped at 1600 px wide):
//   public/img/<slug>-480.webp, <slug>-960.webp, <slug>.webp (= largest, <= 1600 px)
// Manifest: src/imageManifest.json  { "/img/<slug>.webp": { w, h, widths: [480, 960, 1600] } }
// Map:      scripts/out/path-map.json { "/images/<original>": "/img/<slug>.webp" }  (used to rewrite references)
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SIZES = [480, 960, 1600]
const MAX_BYTES = 300 * 1024
const QUALITIES = [78, 72, 66, 60, 54] // stepped down only if the 1600 variant exceeds 300 KB
const IN = 'public/images', OUT = 'public/img'

const inv = JSON.parse(fs.readFileSync('scripts/out/inventory.json', 'utf8'))
const files = inv.files.filter((f) => f.referenced)
fs.mkdirSync(OUT, { recursive: true })

export const slug = (file) => path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const manifest = {}, map = {}, report = []
const seen = new Map()
for (const f of files) {
  let s = slug(f.file)
  if (seen.has(s) && seen.get(s) !== f.md5) s = `${s}-${f.md5.slice(0, 6)}` // name collision with different content
  seen.set(s, f.md5)
  const input = fs.readFileSync(path.join(IN, f.file))
  const meta = await sharp(input).rotate().metadata() // rotate() bakes EXIF orientation
  const rotated = (meta.orientation || 1) >= 5
  const W = rotated ? meta.height : meta.width, H = rotated ? meta.width : meta.height
  const MAX = SIZES[SIZES.length - 1]
  // longest edge <= 1600: landscape caps width at 1600; portrait caps height at 1600 (e.g. 1200x1600)
  const full = Math.min(W, MAX, Math.round((MAX * W) / H))
  const widths = [...SIZES.filter((w) => w < full), full]
  const alpha = !!meta.hasAlpha
  let out = []
  for (const w of widths) {
    const name = w === full ? `${s}.webp` : `${s}-${w}.webp`
    let q, buf
    for (q of QUALITIES) {
      buf = await sharp(input).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: alpha ? Math.max(q, 82) : q, alphaQuality: 90, effort: 5, smartSubsample: true }).toBuffer()
      if (buf.length <= MAX_BYTES || w < full) break
    }
    fs.writeFileSync(path.join(OUT, name), buf)
    out.push({ name, w, kb: Math.round(buf.length / 1024), q })
  }
  const key = `/img/${s}.webp`
  manifest[key] = { w: full, h: Math.round((H * full) / W), widths }
  map[`/images/${f.file}`] = key
  report.push({ from: f.file, fromKB: Math.round(f.bytes / 1024), fromFormat: f.realFormat, srcSize: `${W}x${H}`, to: out })
  process.stdout.write('.')
}
fs.writeFileSync('src/imageManifest.json', JSON.stringify(manifest, null, 1))
fs.writeFileSync('scripts/out/path-map.json', JSON.stringify(map, null, 2))
fs.writeFileSync('scripts/out/optimize-report.json', JSON.stringify(report, null, 2))
const all = report.flatMap((r) => r.to)
console.log(`\nimages: ${report.length}, variants: ${all.length}, total KB: ${all.reduce((s, x) => s + x.kb, 0)}`)
console.log(`largest variant KB: ${Math.max(...all.map((x) => x.kb))}, over 300KB: ${all.filter((x) => x.kb > 300).length}, quality-stepped: ${all.filter((x) => x.q < 78).length}`)
console.log(`full-size (largest variant) total KB: ${report.reduce((s, r) => s + r.to[r.to.length - 1].kb, 0)}  |  originals KB: ${report.reduce((s, r) => s + r.fromKB, 0)}`)
