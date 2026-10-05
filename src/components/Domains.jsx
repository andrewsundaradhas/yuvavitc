import { motion } from 'framer-motion'
import { domains, events, pad } from '../data'
import SectionHead from './SectionHead'
import { Sticker, FIC } from './Sticker'

const tilt = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9, -1.8]

export default function Domains({ onPick }) {
  return (
    <section id="domains" className="relative overflow-hidden bg-ink py-20 text-parchment md:py-28">
      <div className="teal-wash absolute inset-0" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Sticker kind="circle" color={FIC.violet} shouts={['7 domains', 'Tap a tile!', 'Pick a colour']} rot={12} size="clamp(96px,10vw,150px)" style={{ right: '6%', top: '-1%' }} />
        <SectionHead dark label="Night Edition · Domain Overview" title={<>Seven <span className="opacity-35">Domains</span></>}>Select a domain to jump to its events.</SectionHead>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Object.entries(domains).map(([k, d], i) => {
            const count = events.filter((e) => e.domain === k).length
            return (
              <motion.a key={k} href="#events" onClick={() => onPick(k)}
                initial={{ opacity: 0, y: 40, rotate: tilt[i] * 3 }} whileInView={{ opacity: 1, y: 0, rotate: tilt[i] }} viewport={{ once: true }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 120, damping: 14 }}
                whileHover={{ y: -8, rotate: 0, scale: 1.02 }} className="flex min-h-[150px] flex-col justify-between rounded-[24px] p-4 text-ink last:col-span-2 sm:min-h-[230px] sm:rounded-[36px] sm:p-7 lg:last:col-span-1 shadow-[5px_5px_20px_rgba(198,185,237,.25)]" style={{ background: d.color }}>
                <div className="flex items-start justify-between">
                  <span className="display-md text-6xl leading-[.8] sm:text-9xl">{pad(count)}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink sm:h-12 sm:w-12 sm:rounded-2xl font-display text-2xl text-parchment" aria-hidden="true">✦</span>
                </div>
                <div>
                  <h3 className="display-md break-words text-[clamp(17px,5vw,22px)] leading-[1] sm:text-3xl">{d.name}</h3>
                  <p className="eyebrow mt-1 text-ink/70">{count === 1 ? 'Event' : 'Events'}</p>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
