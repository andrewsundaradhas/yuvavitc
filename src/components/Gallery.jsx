import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { domains, events, galleryHighlights } from '../data'
import CircularCarousel from './ui/CircularCarousel'
import { pick } from '../lib/img'

// The ring shows the curated highlights (D-021); every photo stays in its event's modal.
const bySrc = new Map(events.flatMap((e) => e.photos.map((p) => [p.src, { ...p, event: e.short, domain: e.domain }])))
export const allPhotos = galleryHighlights.map((src) => bySrc.get(src)).filter(Boolean)
const WORDS = { 24: 'Twenty-four', 25: 'Twenty-five', 26: 'Twenty-six', 27: 'Twenty-seven', 28: 'Twenty-eight', 29: 'Twenty-nine', 30: 'Thirty' }

// Mount the carousel (and start fetching its frames) only when the gallery is within ~1 screen of the viewport.
const useNear = (ref) => {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    if (!('IntersectionObserver' in window)) { setNear(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '100% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, near])
  return near
}

const useWide = () => {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024)
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= 1024)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return wide
}

// Night gallery: a 3D ring of frames — drag to spin, click one to open it.
export default function Gallery({ onPhoto }) {
  const wide = useWide()
  const stageRef = useRef(null)
  const near = useNear(stageRef)
  const cardWidth = wide ? 310 : 230
  // one right-sized variant per frame (the carousel preloads item.src, so preload and render stay in sync)
  const items = useMemo(() => {
    const px = cardWidth * Math.min(window.devicePixelRatio || 1, 2)
    return allPhotos.map((p) => ({ src: pick(p.src, px), alt: p.alt, title: p.event, subtitle: domains[p.domain].name }))
  }, [cardWidth])
  return (
    <section id="gallery" className="relative overflow-hidden bg-[#050505] py-16 text-parchment md:py-24">
      <div className="teal-wash absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px 0px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow mb-4 text-teal">Moments</p>
            <h2 className="display-md text-[clamp(52px,8vw,122px)] leading-[.82] tracking-[-0.05em]">The <span className="opacity-40">Gallery</span></h2>
          </div>
          <p className="max-w-xs text-xl text-bone">{WORDS[allPhotos.length] ?? allPhotos.length} frames from a year of showing up.</p>
        </motion.div>
      </div>
      <div ref={stageRef} className="relative h-[430px] md:h-[600px]" style={{ color: '#e2dedb' }}>
        {near && <CircularCarousel
          items={items} preset={wide ? 'cylinder' : 'panorama'} intro="rise"
          cardWidth={cardWidth} aspectRatio={1.25} gap={wide ? 24 : 16} cornerRadius={10}
          autoplay="drift" speed={9} momentum={0.7} fadeColor="#050505" depthFade={0.7} innerShade={0.7}
          captions focusOnClick onItemClick={(_, i) => onPhoto?.(allPhotos, i)}
        />}
      </div>
      <p className="eyebrow relative mt-2 text-center text-parchment/60">Drag to spin · Click a frame to open it</p>
    </section>
  )
}
