import { test, expect, openSite, scrollThrough, realErrors } from './fixtures.js'

const SECTIONS = ['top', 'intro', 'award', 'about', 'events', 'domains', 'team', 'prints', 'gallery', 'queries']

test.describe('Smoke — page renders like a real visit', () => {
  test('all sections render with no JS errors', async ({ page, session }) => {
    await openSite(page)
    await scrollThrough(page)
    for (const id of SECTIONS) await expect(page.locator(`#${id}`), `section #${id}`).toBeAttached()
    expect(session.pageErrors, 'uncaught page errors').toEqual([])
    expect(realErrors(session.consoleErrors), 'console errors').toEqual([])
  })

  test('no broken assets (4xx/5xx or failed requests)', async ({ page, session }) => {
    await openSite(page)
    await scrollThrough(page)
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
    // aborted image loads during fast scrolling are not broken assets
    const broken = realErrors(session.failedRequests).filter((x) => !/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(x))
    expect(broken).toEqual([])
  })

  test('no horizontal overflow at this viewport', async ({ page }) => {
    await openSite(page)
    await scrollThrough(page)
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
    expect(sw, `page is ${sw - cw}px wider than the viewport`).toBeLessThanOrEqual(cw + 1)
  })

  test('every image has alt text', async ({ page }) => {
    await openSite(page)
    await scrollThrough(page)
    const missing = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.src))
    expect(missing).toEqual([])
  })

  test('section screenshots for visual review', async ({ page }, info) => {
    await openSite(page)
    await scrollThrough(page)
    for (const id of SECTIONS) {
      const el = page.locator(`#${id}`)
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      await info.attach(`${id}.png`, { body: await page.screenshot(), contentType: 'image/png' })
    }
  })
})
