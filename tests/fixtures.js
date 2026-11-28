import { test as base, expect } from '@playwright/test'

// Real-user session log: every click, console error, page error and failed request is
// recorded and attached to the HTML report so a test reads like a user's session.
export const test = base.extend({
  session: async ({ page }, use, info) => {
    const log = { clicks: [], consoleErrors: [], pageErrors: [], failedRequests: [] }
    page.on('console', (m) => { if (m.type() === 'error') log.consoleErrors.push(m.text()) })
    page.on('pageerror', (e) => log.pageErrors.push(String(e)))
    page.on('requestfailed', (r) => log.failedRequests.push(`${r.failure()?.errorText} ${r.url()}`))
    page.on('response', (r) => { if (r.status() >= 400) log.failedRequests.push(`${r.status()} ${r.url()}`) })
    await page.exposeFunction('__logClick', (c) => log.clicks.push(c))
    await page.addInitScript(() => {
      document.addEventListener('click', (e) => {
        const el = e.target.closest('button,a,[role=tab],[role=group]') || e.target
        const label = el.getAttribute?.('aria-label') || el.textContent?.trim().slice(0, 60) || el.tagName
        window.__logClick?.({ t: Math.round(performance.now()), tag: el.tagName, label })
      }, true)
    })
    await use(log)
    await info.attach('session-log', { body: JSON.stringify(log, null, 2), contentType: 'application/json' })
  },
})

// Load the page without the intro preloader (most tests target the content, not the intro).
export async function openSite(page, path = '/?nointro') {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#top')).toBeVisible()
}

// Scroll gradually to the bottom so lazy sections (Suspense / whileInView) mount like a real user would.
export async function scrollThrough(page, step = 700) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(60)
  }
}

// Filter noise that isn't a site bug (e.g. third-party font aborts).
export const realErrors = (arr) => arr.filter((x) => !/fonts\.(googleapis|gstatic)/.test(x))

export { expect }
