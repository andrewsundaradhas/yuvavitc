import { Suspense, useEffect, useRef, useState } from 'react'

// Improvement #4: a lazy section's code (and its WebGL effect) loads only when it gets within ~1.5 screens.
// Until then a same-size, same-colour shell stands in, carrying the section's id so menu anchors always resolve.
//
// `idleAfter` (ms): also mount early, but only while the user is idle — mounting About/Tide/Prints costs a one-off
// 50–800 ms (fonts, layout, WebGPU/three.js setup). Doing it mid-scroll is what made the Award section above "stick".
// Rules: page loaded + `idleAfter` elapsed, no scroll/touch/key/wheel input for 1.2 s, and at most one idle mount
// per 1 s across all sections. Approaching a section still mounts it immediately.
const quiet = { input: 0, mount: 0 }
if (typeof window !== 'undefined') {
  const mark = () => { quiet.input = performance.now() }
  for (const ev of ['scroll', 'wheel', 'touchmove', 'keydown', 'pointerdown']) window.addEventListener(ev, mark, { passive: true, capture: true })
}

// Run fn in a quiet moment (same rules as idle mounts); returns a cancel function.
export function whenQuiet(fn) {
  let timer
  const ric = window.requestIdleCallback || ((f) => setTimeout(f, 1))
  const check = () => {
    const t = performance.now()
    if (t - quiet.input > 1200 && t - quiet.mount > 1000) ric(() => {
      const u = performance.now()
      if (u - quiet.input > 1200 && u - quiet.mount > 1000) { quiet.mount = u; fn() } else timer = setTimeout(check, 500)
    }, { timeout: 1000 })
    else timer = setTimeout(check, 500)
  }
  check()
  return () => clearTimeout(timer)
}

export default function Deferred({ id, className, children, margin = '150% 0px', idleAfter }) {
  const ref = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (near) return
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setNear(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    if (idleAfter == null) return () => io.disconnect()
    let timer
    const ric = window.requestIdleCallback || ((fn) => setTimeout(fn, 1))
    const tryMount = () => {
      const now = performance.now()
      if (now - quiet.input > 1200 && now - quiet.mount > 1000) {
        ric(() => {
          const t = performance.now()
          if (t - quiet.input > 1200 && t - quiet.mount > 1000) { quiet.mount = t; setNear(true) } else timer = setTimeout(tryMount, 500)
        }, { timeout: 1000 })
      } else timer = setTimeout(tryMount, 500)
    }
    const go = () => { timer = setTimeout(tryMount, idleAfter) }
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true })
    return () => { io.disconnect(); clearTimeout(timer); window.removeEventListener('load', go) }
  }, [near, margin, idleAfter])
  const shell = <div ref={ref} id={id} className={className} aria-hidden="true" />
  return near ? <Suspense fallback={shell}>{children}</Suspense> : shell
}
