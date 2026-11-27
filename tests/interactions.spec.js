import { test, expect, openSite, scrollThrough } from './fixtures.js'

test.describe('Preloader', () => {
  test('intro plays and "Skip intro" reveals the hero', async ({ page, session }) => {
    // Fake clock: the intro is ~2 s and would otherwise race the click on a loaded runner. Time only moves when we
    // say so, so "gone after 0.8 s" proves Skip worked (the auto-exit would need 2.07 s + shutters).
    await page.clock.install()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const skip = page.getByRole('button', { name: 'Skip intro' })
    await expect(skip).toBeVisible()
    await skip.dispatchEvent('click')
    await page.clock.runFor(800)
    await expect(skip).toBeHidden({ timeout: 8_000 })
    await page.clock.runFor(2000)
    await expect(page.locator('#top')).toBeVisible()
    expect(session.clicks.length).toBeGreaterThan(0)
  })

  test('hero is mounted under the preloader and revealed after it', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible()
    // hero DOM + LCP-priority photo are already there (loading) while the intro still covers the screen
    const stall = page.locator('#top img[alt="Yuva VIT Chennai Team"]')
    await expect(stall).toBeAttached()
    expect(await stall.evaluate((i) => i.currentSrc), 'photo request started under the intro').toContain('/img/yuva-team-stall')
    // let the (~2 s) intro end on its own — this test is about the hero, the first test covers Skip
    await expect(page.locator('[aria-label="Loading Yuva VIT Chennai"]')).toHaveCount(0, { timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Filter events: Health' })).toBeVisible()
    await expect.poll(() => stall.evaluate((i) => i.complete && i.naturalWidth > 0), { timeout: 15_000 }).toBe(true)
  })

  test('repeat visit skips the intro; Replay intro still plays it', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible() // first visit: intro plays
    await expect(page.locator('[aria-label="Loading Yuva VIT Chennai"]')).toHaveCount(0, { timeout: 15_000 })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Filter events: Health' })).toBeVisible()
    await expect(page.locator('[aria-label="Loading Yuva VIT Chennai"]')).toHaveCount(0) // no intro at all on the repeat visit
    await page.getByRole('button', { name: 'Replay intro' }).click()
    await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible()
  })

  test('?nointro shows content immediately', async ({ page }) => {
    await openSite(page)
    await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0)
  })
})

test.describe('Navigation menu', () => {
  const links = [
    ['Club awards and honors', 'award'], ['About Yuva VIT Chennai', 'about'], ['See all sixteen events', 'events'],
    ['Browse the seven domains', 'domains'], ['Meet the team and core reveal', 'team'], ['The print table', 'prints'],
    ['Photo gallery', 'gallery'], ['Send us a query', 'queries'], ['Back to the top', 'top'],
  ]
  for (const [label, id] of links) {
    test(`menu → ${id}`, async ({ page }) => {
      await openSite(page)
      await page.getByRole('button', { name: 'Open menu' }).click()
      const item = page.getByRole('link', { name: label })
      await expect(item).toBeVisible()
      await item.click()
      await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.05, timeout: 8_000 })
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
    })
  }
})

test.describe('Events', () => {
  test('tenure + domain filters change the list', async ({ page }) => {
    await openSite(page)
    const events = page.locator('#events')
    await events.scrollIntoViewIfNeeded()
    await events.getByRole('button', { name: /All Tenures/ }).click()
    await expect(events.getByRole('heading', { name: /All Tenures/ })).toBeVisible()
    const tab = events.getByRole('tab', { name: 'Road Safety' })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await events.getByRole('tab', { name: 'All Domains' }).click()
  })

  test('hero domain sticker filters events and scrolls there', async ({ page }) => {
    await openSite(page)
    await page.getByRole('button', { name: 'Filter events: Health' }).click()
    await expect(page.locator('#events').getByRole('tab', { name: 'Health' })).toHaveAttribute('aria-selected', 'true')
  })

  test('event modal opens, navigates, opens a photo, closes', async ({ page }) => {
    await openSite(page)
    const events = page.locator('#events')
    await events.scrollIntoViewIfNeeded()
    await events.locator('button.group').first().click()
    const modal = page.getByRole('dialog').first()
    await expect(modal).toBeVisible()
    const counter = modal.locator('.eyebrow').first()
    const before = await counter.textContent()
    await modal.getByRole('button', { name: 'Next event' }).click()
    await expect(counter).not.toHaveText(before)
    await modal.getByRole('button', { name: 'Previous event' }).click()
    await expect(counter).toHaveText(before)
    await modal.getByRole('button', { name: /^Enlarge/ }).first().click()
    const viewer = page.getByRole('dialog', { name: 'Photo viewer' })
    await expect(viewer).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()
    await modal.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})

test.describe('Gallery', () => {
  test('carousel renders and a frame opens the lightbox', async ({ page }) => {
    await openSite(page)
    await scrollThrough(page)
    const gallery = page.locator('#gallery')
    await gallery.scrollIntoViewIfNeeded()
    await expect(gallery.getByRole('region', { name: 'Image carousel' })).toBeVisible()
    const frame = gallery.getByRole('group').first()
    await expect(frame).toBeAttached()
    await page.evaluate(() => document.querySelector('#gallery [aria-label="Image carousel"]').scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(3000) // let the "rise" intro finish, like a user watching it land
    // click the centre of a card that is actually visible and on top (cylinder layouts have gaps between cards)
    // scan the carousel area (centre-out) for a point where a card is the top-most element — what a user would click
    const findCard = () => page.evaluate(() => {
      const r = document.querySelector('#gallery [aria-label="Image carousel"]').getBoundingClientRect()
      const cx = r.left + r.width / 2
      for (let dy = 0.5; dy <= 0.95; dy += 0.03) for (const dx of [0, -0.05, 0.05, -0.1, 0.1, -0.2, 0.2]) {
        const x = cx + dx * r.width, y = r.top + dy * r.height
        if (y > 0 && y < innerHeight && document.elementFromPoint(x, y)?.closest('[data-cc-index]')) return { x, y }
      }
      return null
    })
    await expect.poll(findCard, { message: 'a visible gallery card', timeout: 10_000 }).not.toBeNull()
    const pt = await findCard()
    await page.mouse.click(pt.x, pt.y)
    await expect(page.getByRole('dialog', { name: 'Photo viewer' })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('dialog', { name: 'Photo viewer' }).getByRole('button', { name: 'Close' }).click()
  })
})

test.describe('Queries form (API mocked — never sends real email)', () => {
  const fill = async (page) => {
    await openSite(page)
    await page.locator('#queries').scrollIntoViewIfNeeded()
  }

  test('empty submit shows a hint', async ({ page }) => {
    await fill(page)
    await page.getByRole('button', { name: 'Send query' }).click()
    await expect(page.getByText('Type your query first')).toBeVisible()
  })

  test('invalid email is rejected client-side', async ({ page }) => {
    let called = false
    await page.route('**/api/queries', (r) => { called = true; r.fulfill({ json: { success: true } }) })
    await fill(page)
    await page.getByLabel('Your query').fill('Hello from Playwright')
    await page.getByLabel(/Your email/).fill('not-an-email')
    await page.getByRole('button', { name: 'Send query' }).click()
    await expect(page.getByText(/doesn’t look right/)).toBeVisible()
    expect(called).toBe(false)
  })

  test('successful send shows confirmation', async ({ page }) => {
    let body
    await page.route('**/api/queries', (r) => { body = r.request().postDataJSON(); r.fulfill({ json: { success: true } }) })
    await fill(page)
    await page.getByLabel('Your query').fill('When is the next event?')
    await page.getByLabel(/Your email/).fill('student@example.com')
    await page.getByRole('button', { name: 'Send query' }).click()
    await expect(page.getByText('Your query has been sent')).toBeVisible({ timeout: 10_000 })
    expect(body).toMatchObject({ message: 'When is the next event?', email: 'student@example.com', website: '' })
    await page.getByRole('button', { name: 'Send another query' }).click()
    await expect(page.getByLabel('Your query')).toHaveValue('')
  })

  test('server failure shows an error', async ({ page }) => {
    await page.route('**/api/queries', (r) => r.fulfill({ status: 500, json: { success: false, message: 'boom' } }))
    await fill(page)
    await page.getByLabel('Your query').fill('This will fail')
    await page.getByRole('button', { name: 'Send query' }).click()
    await expect(page.getByText('Couldn’t send that')).toBeVisible({ timeout: 10_000 })
  })
})

test('footer "Replay intro" replays the preloader', async ({ page }) => {
  await openSite(page)
  await page.getByRole('button', { name: 'Replay intro' }).click()
  await expect(page.getByRole('button', { name: 'Skip intro' })).toBeVisible()
})
