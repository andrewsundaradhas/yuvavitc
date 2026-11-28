// Rewrites every "/images/<file>" reference in src/ + index.html to its optimized "/img/<slug>.webp",
// using scripts/out/path-map.json from optimize-images.mjs. Also retargets the data.js img() helper.
// Refuses to write anything if a reference has no mapping or a helper name would change.
import fs from 'node:fs'
import path from 'node:path'

const map = JSON.parse(fs.readFileSync('scripts/out/path-map.json', 'utf8'))
const manifest = JSON.parse(fs.readFileSync('src/imageManifest.json', 'utf8'))
const RE = /\/images\/[^"'`)\s]+?\.(?:png|jpe?g|webp|avif|gif|svg)/gi
const files = []
const collect = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? collect(p) : /\.(jsx?|css)$/.test(f.name) && files.push(p) } }
collect('src'); files.push('index.html')

const problems = [], edits = []
for (const f of files) {
  let txt = fs.readFileSync(f, 'utf8'), n = 0
  txt = txt.replace(RE, (m) => { if (m === '/images/${f}.webp') return m /* img() helper, handled below */; if (!map[m]) { problems.push(`${f}: no mapping for ${m}`); return m } n++; return map[m] })
  if (f.endsWith(`${path.sep}data.js`)) {
    // img('name') helper -> /images/name.webp ; verify each name maps to /img/name.webp unchanged
    for (const [, name] of txt.matchAll(/img\('([^']+)'\)/g)) {
      if (map[`/images/${name}.webp`] !== `/img/${name}.webp`) problems.push(`data.js img('${name}') -> ${map[`/images/${name}.webp`]}`)
    }
    const before = txt
    txt = txt.replace("const img = (f) => `/images/${f}.webp`", "const img = (f) => `/img/${f}.webp`")
    if (before === txt) problems.push('data.js img() helper not found')
    else n++
  }
  if (n) edits.push([f, txt, n])
}
if (problems.length) { console.error('ABORT — nothing written:\n' + problems.join('\n')); process.exit(1) }
for (const [f, txt, n] of edits) { fs.writeFileSync(f, txt); console.log(`${n} refs  ${f}`) }

// verify: no /images/ refs left, every /img/ ref exists in the manifest and on disk
const left = [], bad = []
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  for (const m of t.match(RE) || []) if (m !== '/images/${f}.webp') left.push(`${f}: ${m}`)
  for (const m of t.match(/\/img\/[a-z0-9-]+\.webp/g) || []) if (!manifest[m] || !fs.existsSync(`public${m}`)) bad.push(`${f}: ${m}`)
}
const data = await import('../src/data.js?' + Date.now())
const helperRefs = data.events.flatMap((e) => e.photos.map((p) => p.src)).filter((s) => !manifest[s])
console.log({ remainingOldRefs: left, brokenNewRefs: bad, dataJsUnresolved: helperRefs })
