import { Suspense, useEffect, useRef, useState } from 'react'

// Improvement #4: a lazy section's code (and its WebGL effect) loads only when it gets within ~1.5 screens.
// Until then a same-size, same-colour shell stands in, carrying the section's id so menu anchors always resolve.
export default function Deferred({ id, className, children, margin = '150% 0px' }) {
  const ref = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (near) return
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setNear(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [near, margin])
  const shell = <div ref={ref} id={id} className={className} aria-hidden="true" />
  return near ? <Suspense fallback={shell}>{children}</Suspense> : shell
}
