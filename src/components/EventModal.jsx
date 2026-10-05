import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { domains, events, pad } from '../data'

export default function EventModal({ event, onClose, onNav, onPhoto }) {
  const d = domains[event.domain]
  const idx = events.findIndex((e) => e.n === event.n)
  const steps = event.instructions.reduce((a, s) => (Array.isArray(s) ? (a[a.length - 1].subs = s) : a.push({ text: s, subs: [] }), a), [])

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', k)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', k) }
  }, [onClose, onNav])

  const btn = 'rounded-full border border-ink p-2 transition hover:bg-ink hover:text-parchment'

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={event.title}>
      <motion.div key={event.n} onClick={(e) => e.stopPropagation()} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-xl bg-parchment md:rounded-xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-ink bg-parchment px-5 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <button onClick={() => onNav(-1)} aria-label="Previous event" className={btn}><ChevronLeft size={16} /></button>
            <button onClick={() => onNav(1)} aria-label="Next event" className={btn}><ChevronRight size={16} /></button>
            <span className="eyebrow ml-3 text-charcoal">{pad(idx + 1)} / {events.length}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className={btn}><X size={16} /></button>
        </div>

        <div className="px-6 py-8 md:p-10" style={{ background: d.color }}>
          <div className="flex items-start gap-5">
            <span className="display-md text-7xl leading-none opacity-40 md:text-9xl">{pad(event.n)}</span>
            <div>
              <span className="pill mb-3 inline-block bg-ink px-3 py-1 text-[11px] text-parchment">{d.name}</span>
              <h3 className="display-md text-4xl leading-[.95] md:text-6xl">{event.title}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <p className="max-w-2xl text-xl leading-snug md:text-2xl">{event.desc}</p>

          <div className={`mt-8 grid gap-3 ${event.photos.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {event.photos.map((p, i) => (
              <figure key={p.src} className={event.photos.length === 3 && i === 0 ? 'sm:col-span-2' : ''}>
                {p.label && <figcaption className="eyebrow mb-2 text-charcoal">{p.label}</figcaption>}
                <button onClick={() => onPhoto(event.photos, i)} className="block w-full overflow-hidden" aria-label={`Enlarge: ${p.alt}`}>
                  <img src={p.src} alt={p.alt} className="max-h-[420px] w-full object-cover transition duration-500 hover:scale-105" />
                </button>
              </figure>
            ))}
          </div>

          <div className="mt-10 rounded-xl bg-bone p-6 md:p-8">
            <p className="eyebrow mb-5 text-ember">Instructions</p>
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4 border-b border-dotted border-ink/30 pb-3 text-lg last:border-0">
                  <span className="display-md w-8 shrink-0 text-3xl leading-none text-ember">{i + 1}</span>
                  <div>
                    {s.text}
                    {s.subs.length > 0 && <ul className="mt-1 space-y-0.5 text-base text-charcoal">{s.subs.map((x) => <li key={x} className="before:mr-2 before:content-['·']">{x}</li>)}</ul>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
