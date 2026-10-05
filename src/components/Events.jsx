import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { domains, events, pad } from '../data'
import SectionHead from './SectionHead'
import Banner from './Banner'
import { Sticker, FIC } from './Sticker'

function Index({ list, onOpen }) {
  const [hover, setHover] = useState(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 250, damping: 28 })
  const y = useSpring(my, { stiffness: 250, damping: 28 })
  return (
    <div onMouseMove={(ev) => { mx.set(ev.clientX + 24); my.set(ev.clientY - 90) }} onMouseLeave={() => setHover(null)} className="border-t-2 border-ink">
      {list.map((e) => {
        const d = domains[e.domain]
        return (
          <button key={e.n} onClick={() => onOpen(e)} onMouseEnter={() => setHover(e)} onFocus={() => setHover(e)} onBlur={() => setHover(null)}
            className="group grid w-full grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 border-b border-ink/30 py-5 text-left transition hover:bg-bone md:grid-cols-[80px_minmax(0,1fr)_auto_32px] lg:grid-cols-[100px_minmax(0,1fr)_220px_40px] md:px-3">
            <span className="display-md text-4xl text-ink/30 transition group-hover:text-ember md:text-6xl">{pad(e.n)}</span>
            <span className="display-md text-2xl leading-[.95] tracking-[-0.03em] transition group-hover:translate-x-2 min-w-0 break-words md:text-4xl lg:text-5xl">{e.short}</span>
            <span className="pill hidden justify-self-start px-3 py-1 text-[11px] md:inline-block" style={{ background: d.color }}>{d.name}</span>
            <ArrowUpRight className="justify-self-end transition group-hover:rotate-45" />
          </button>
        )
      })}
      <AnimatePresence>
        {hover && (
          <motion.div key={hover.n} style={{ x, y }} initial={{ opacity: 0, scale: 0.8, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: -3 }} exit={{ opacity: 0, scale: 0.8 }}
            className="sticker pointer-events-none fixed left-0 top-0 z-40 hidden w-64 border-[6px] border-parchment md:block" >
            <img src={hover.photos[0].src} alt="" className="aspect-[4/3] w-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Events({ filter, setFilter, onOpen }) {
  const list = useMemo(() => events.filter((e) => filter === 'all' || e.domain === filter), [filter])

  return (
    <section id="events">
      <Banner glow size="clamp(64px, 16vw, 230px)" className="pt-16! md:pt-12!" stickers={<>
        <Sticker kind="burst" color={FIC.coral} shouts={['12 events!', 'Pick one!', 'Go on!', 'Scroll!']} rot={-10} size="clamp(64px,12vw,180px)" className="left-[1%] top-[2%] md:left-[2%] md:top-[8%]" />
        <Sticker kind="label" color={FIC.lime} textColor="#000" shouts={['Start here!', 'Tap an event', 'Not that one']} rot={-14} className="hidden sm:block sm:right-[5%] sm:bottom-[10%]" />
      </>}>Events!</Banner>
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <SectionHead label="Featured Events" title={<>All Twelve <span className="opacity-35">Events</span></>}>Pick a domain to filter, then open any event to see its photos and full playbook.</SectionHead>

        <div className="mb-10">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist" aria-label="Filter by domain">
            {[['all', { name: 'All', color: '#1d1d1b' }], ...Object.entries(domains)].map(([k, d]) => {
              const active = filter === k
              return (
                <button key={k} role="tab" aria-selected={active} onClick={() => setFilter(k)} className="pill shrink-0 border border-ink px-4 py-3 transition hover:-translate-y-0.5 sm:py-2"
                  style={{ background: active ? d.color : 'transparent', color: active && k === 'all' ? '#e2dedb' : '#1d1d1b' }}>{d.name}</button>
              )
            })}
          </div>
        </div>

        <Index list={list} onOpen={onOpen} />
      </div>
    </section>
  )
}
