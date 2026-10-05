import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Lightbox({ photos, index, setIndex, onClose }) {
  const go = (d) => setIndex((index + d + photos.length) % photos.length)
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', k, true)
    return () => window.removeEventListener('keydown', k, true)
  })
  const p = photos[index]
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Photo viewer">
      <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 rounded-full border border-white/20 p-3 text-parchment hover:border-ember hover:text-ember"><X size={18} /></button>
      {photos.length > 1 && <>
        <button onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous" className="absolute left-3 rounded-full border border-white/20 p-3 text-parchment hover:border-ember hover:text-ember md:left-8"><ChevronLeft /></button>
        <button onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next" className="absolute right-3 rounded-full border border-white/20 p-3 text-parchment hover:border-ember hover:text-ember md:right-8"><ChevronRight /></button>
      </>}
      <motion.figure key={p.src} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="max-h-full max-w-5xl">
        <img src={p.src} alt={p.alt} className="max-h-[80vh] w-auto  object-contain" />
        <figcaption className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-bone">{p.alt} · {index + 1}/{photos.length}</figcaption>
      </motion.figure>
    </motion.div>
  )
}
