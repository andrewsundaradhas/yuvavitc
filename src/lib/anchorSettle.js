// Deferred sections (improvement #4) can grow while a menu jump is still scrolling past them. Chrome/Firefox keep
// the target in place via scroll anchoring; WebKit (Safari/iPad) doesn't. So after any in-page link click, wait for
// the scroll to stop, and if the target has drifted, scroll to it once more (max 2 corrections, 6 s cap).
export function installAnchorSettle(offset = 56) {
  const onClick = (e) => {
    const a = e.target.closest?.('a[href^="#"]')
    const id = a?.getAttribute('href').slice(1)
    if (!id) return
    let last = -1, still = 0, tries = 0
    const stop = () => clearInterval(t)
    const t = setInterval(() => {
      const el = document.getElementById(id)
      if (!el) return stop()
      if (scrollY !== last) { last = scrollY; still = 0; return }
      if (++still < 3) return // ~300 ms without movement = the scroll has settled
      const off = el.getBoundingClientRect().top - offset
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2
      if (Math.abs(off) > 24 && !(atEnd && off > 0) && tries++ < 2) { el.scrollIntoView({ behavior: 'smooth' }); still = 0 } else stop()
    }, 100)
    setTimeout(stop, 6000)
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
