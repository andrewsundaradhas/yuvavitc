import fs from 'node:fs'
import { test, expect } from './fixtures.js'

// Strict budget (see decision.md D-007). Soft assertions: every metric is recorded even if one fails.
const BUDGET = { lcpMs: 2500, cls: 0.1, initialJsGzKB: 250, maxImageKB: 300, heroVisibleMs: 1000 }

// Lighthouse-style mobile network: ~1.6 Mbps down, 150 ms RTT, 4x CPU slowdown.
async function throttle(page) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
}

function save(name, data) {
  fs.mkdirSync('test-results/perf', { recursive: true })
  fs.writeFileSync(`test-results/perf/${name}.json`, JSON.stringify(data, null, 2))
}

test.describe('Performance budget', () => {
  test('payload: JS, CSS, images (unthrottled, full scroll)', async ({ page }, info) => {
    await page.goto('/?nointro', { waitUntil: 'load' })
    const initial = await page.evaluate(() => performance.getEntriesByType('resource')
      .filter((r) => r.initiatorType === 'script' || r.name.endsWith('.js'))
      .reduce((s, r) => s + r.transferSize, 0))
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < h; y += 800) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(80) }
    await page.waitForLoadState('networkidle', { timeout: 45_000 }).catch(() => {})
    const res = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => ({ url: r.name, type: r.initiatorType, size: r.encodedBodySize || r.transferSize })))
    const imgs = res.filter((r) => /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(r.url)).sort((a, b) => b.size - a.size)
    const kb = (b) => Math.round(b / 1024)
    const data = {
      project: info.project.name,
      initialJsKB: kb(initial),
      totalJsKB: kb(res.filter((r) => /\.js(\?|$)/.test(r.url)).reduce((s, r) => s + r.size, 0)),
      totalImagesKB: kb(imgs.reduce((s, r) => s + r.size, 0)),
      imageCount: imgs.length,
      largestImages: imgs.slice(0, 5).map((r) => ({ url: r.url.replace(/^https?:\/\/[^/]+/, ''), kb: kb(r.size) })),
      imagesOverBudget: imgs.filter((r) => r.size > BUDGET.maxImageKB * 1024).length,
    }
    save(`payload-${info.project.name}`, data)
    await info.attach('payload', { body: JSON.stringify(data, null, 2), contentType: 'application/json' })
    expect.soft(data.initialJsKB, 'initial JS (transfer KB)').toBeLessThanOrEqual(BUDGET.initialJsGzKB)
    expect.soft(data.imagesOverBudget, `images > ${BUDGET.maxImageKB} KB`).toBe(0)
  })

  test('LCP / CLS / hero visible on throttled mobile', async ({ page, browserName }, info) => {
    test.skip(browserName !== 'chromium', 'CDP throttling + LCP observer are Chromium-only')
    await throttle(page)
    await page.addInitScript(() => {
      window.__perf = { lcp: 0, cls: 0 }
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value }).observe({ type: 'layout-shift', buffered: true })
    })
    const t0 = Date.now()
    await page.goto('/?nointro', { waitUntil: 'domcontentloaded', timeout: 90_000 })
    await page.locator('#top').waitFor({ state: 'visible', timeout: 60_000 })
    const heroVisibleMs = Date.now() - t0
    await page.waitForTimeout(5000) // let LCP candidates settle
    const { lcp, cls } = await page.evaluate(() => window.__perf)
    const data = { project: info.project.name, heroVisibleMs, lcpMs: Math.round(lcp), cls: +cls.toFixed(3) }
    save(`vitals-${info.project.name}`, data)
    await info.attach('vitals', { body: JSON.stringify(data, null, 2), contentType: 'application/json' })
    expect.soft(data.lcpMs, 'LCP ms').toBeLessThanOrEqual(BUDGET.lcpMs)
    expect.soft(data.cls, 'CLS').toBeLessThanOrEqual(BUDGET.cls)
  })
})
