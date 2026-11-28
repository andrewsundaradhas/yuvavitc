import { useMemo, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { domains, events, tenures, pad } from '../data'
import SectionHead from './SectionHead'
import Banner from './Banner'
import { Sticker, FIC } from './Sticker'
import { pick } from '../lib/img'

function Index({ list, onOpen }) {
  const [hover, setHover] = useState(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 250, damping: 28 })
  const y = useSpring(my, { stiffness: 250, damping: 28 })
  return (
    <div onMouseMove={(ev) => { mx.set(ev.clientX + 24); my.set(ev.clientY - 90) }} onMouseLeave={() => setHover(null)} className="border-t-2 border-ink">
      {list.map((e, idx) => {
        const d = domains[e.domain]
        const t = tenures[e.tenure]
        return (
          <button key={`${e.tenure}-${e.slug}`} onClick={() => onOpen(e)} onMouseEnter={() => setHover(e)} onFocus={() => setHover(e)} onBlur={() => setHover(null)}
            className="group grid w-full grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 border-b border-ink/30 py-5 text-left transition hover:bg-bone md:grid-cols-[80px_minmax(0,1fr)_auto_32px] lg:grid-cols-[100px_minmax(0,1fr)_260px_40px] md:px-3">
            <span className="display-md text-4xl text-ink/30 transition group-hover:text-ember md:text-6xl">{pad(idx + 1)}</span>
            <span className="display-md text-2xl leading-[.95] tracking-[-0.03em] transition group-hover:translate-x-2 min-w-0 break-words md:text-4xl lg:text-5xl">{e.short}</span>
            <div className="hidden items-center gap-2 justify-self-start md:flex">
              <span className="pill px-3 py-1 text-[11px]" style={{ background: d.color }}>{d.name}</span>
              <span className="pill border border-ink/20 bg-parchment px-2 py-0.5 text-[10px] font-mono text-charcoal">
                {t?.short || e.tenure}
              </span>
            </div>
            <ArrowUpRight className="justify-self-end transition group-hover:rotate-45" />
          </button>
        )
      })}
      <AnimatePresence>
        {hover && (
          <motion.div key={`${hover.tenure}-${hover.slug}`} style={{ x, y }} initial={{ opacity: 0, scale: 0.8, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: -3 }} exit={{ opacity: 0, scale: 0.8 }}
            className="sticker pointer-events-none fixed left-0 top-0 z-40 hidden w-64 border-[6px] border-parchment md:block" >
            <img src={pick(hover.hoverPhoto || hover.photos[0].src, 512)} alt="" decoding="async" className="w-full object-contain max-h-72 bg-parchment" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Events({ filter, setFilter, onOpen }) {
  const [tenure, setTenure] = useState('2026-27')

  const list = useMemo(() => {
    const tenureOrder = { '2026-27': 0, '2025-26': 1, '2024-25': 2 }
    return events
      .filter((e) => {
        const matchTenure = tenure === 'all' || e.tenure === tenure
        const matchDomain = filter === 'all' || e.domain === filter
        return matchTenure && matchDomain
      })
      .sort((a, b) => {
        const tDiff = (tenureOrder[a.tenure] ?? 9) - (tenureOrder[b.tenure] ?? 9)
        if (tDiff !== 0) return tDiff
        return a.n - b.n
      })
  }, [tenure, filter])

  const tenureCount = useMemo(() => {
    const counts = { all: events.length }
    Object.keys(tenures).forEach((t) => {
      counts[t] = events.filter((e) => e.tenure === t).length
    })
    return counts
  }, [])

  return (
    <section id="events">
      <Banner glow size="clamp(64px, 16vw, 230px)" className="pt-16! md:pt-12!" stickers={<>
        <Sticker kind="burst" color={FIC.coral} shouts={[`${events.length} events!`, '2026 – 2027', 'Pick one!', 'Scroll!']} rot={-10} size="clamp(64px,12vw,180px)" className="left-[1%] top-[2%] md:left-[2%] md:top-[8%]" />
        <Sticker kind="label" color={FIC.lime} textColor="#000" shouts={['Start here!', 'Tap an event', 'Choose tenure']} rot={-14} className="hidden sm:block sm:right-[5%] sm:bottom-[10%]" />
      </>}>Events!</Banner>
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <SectionHead
          label="Featured Events · Tenures"
          title={
            tenure === 'all'
              ? <>All Tenures <span className="opacity-35">({events.length} Events)</span></>
              : <>{tenures[tenure]?.label || tenure} <span className="opacity-35">Tenure</span></>
          }
        >
          Select a tenure to view past and upcoming events, or filter by specific domain.
        </SectionHead>

        {/* Tenure Switcher */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="eyebrow text-charcoal">Tenure:</span>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {Object.entries(tenures).map(([k, t]) => {
              const active = tenure === k
              const count = tenureCount[k] || 0
              return (
                <button
                  key={k}
                  onClick={() => setTenure(k)}
                  className={`pill flex items-center gap-2 border border-ink px-4 py-2 text-xs transition hover:-translate-y-0.5 ${
                    active ? 'bg-ink text-parchment' : 'bg-transparent text-ink hover:bg-bone'
                  }`}
                >
                  <span className="font-semibold">{t.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    active ? 'bg-parchment text-ink' : 'bg-ink/10 text-charcoal'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
            <button
              onClick={() => setTenure('all')}
              className={`pill flex items-center gap-2 border border-ink px-4 py-2 text-xs transition hover:-translate-y-0.5 ${
                tenure === 'all' ? 'bg-ink text-parchment' : 'bg-transparent text-ink hover:bg-bone'
              }`}
            >
              <span className="font-semibold">All Tenures</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                tenure === 'all' ? 'bg-parchment text-ink' : 'bg-ink/10 text-charcoal'
              }`}>
                {tenureCount.all}
              </span>
            </button>
          </div>
        </div>

        {/* Domain Filter Bar */}
        <div className="mb-10">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist" aria-label="Filter by domain">
            {[['all', { name: 'All Domains', color: '#1d1d1b' }], ...Object.entries(domains)].map(([k, d]) => {
              const active = filter === k
              return (
                <button key={k} role="tab" aria-selected={active} onClick={() => setFilter(k)} className="pill shrink-0 border border-ink px-4 py-2.5 transition hover:-translate-y-0.5 text-xs sm:py-2"
                  style={{ background: active ? d.color : 'transparent', color: active && k === 'all' ? '#e2dedb' : '#1d1d1b' }}>{d.name}</button>
              )
            })}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="my-10 rounded-2xl border-2 border-dashed border-ink/30 bg-bone/50 p-10 text-center md:py-16">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink bg-parchment font-display text-xl text-ink">
              ✦
            </span>
            <h3 className="display-md text-3xl md:text-5xl">
              {tenures[tenure]?.label || tenure} Tenure
            </h3>
            <p className="mx-auto mt-3 max-w-md font-serif text-lg italic text-ink/70">
              {filter !== 'all'
                ? `No events found for this domain under ${tenures[tenure]?.label || tenure}.`
                : `Events for the ${tenures[tenure]?.label || tenure} tenure will be added and published here as they take place.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {tenure !== '2025-26' && (
                <button
                  onClick={() => { setTenure('2025-26'); setFilter('all') }}
                  className="btn-ring text-xs"
                >
                  View 2025 – 2026 Events
                </button>
              )}
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="btn-ring text-xs"
                >
                  Show All Domains
                </button>
              )}
            </div>
          </div>
        ) : (
          <Index list={list} onOpen={onOpen} />
        )}
      </div>
    </section>
  )
}
