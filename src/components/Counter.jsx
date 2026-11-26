import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

export default function Counter({ from = 0, to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(from)
  useEffect(() => {
    if (!inView) return
    const c = animate(from, to, { duration: 1.8, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, from, to])
  return <span ref={ref}>{String(v).padStart(2, '0')}{suffix}</span>
}
