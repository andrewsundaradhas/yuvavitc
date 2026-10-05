import { motion } from 'framer-motion'
import { domains } from '../data'
import Counter from './Counter'

const Pill = ({ src }) => (
  <span className="mx-[0.08em] inline-block h-[0.6em] w-[1.5em] -translate-y-[0.02em] rounded-full bg-cover bg-center align-baseline" style={{ backgroundImage: `url(${src})` }} role="presentation" />
)

export default function Intro() {
  return (
    <section id="intro" className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-28">
      <div className="grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="eyebrow mb-5 text-ember">The Official Publication of Yuva VIT Chennai</p>
          <p className="dropcap max-w-sm text-2xl leading-[1.2]">One community driven by purpose, passion, and action.</p>
          <p className="mt-6 font-serif text-2xl italic">Learning Beyond Education</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#events" className="btn-ring">Explore Events</a>
            <a href="#gallery" className="btn-ring">View Gallery</a>
          </div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="display-md text-[clamp(52px,8.2vw,128px)] leading-[.84] tracking-[-0.05em]">
          Twelve <Pill src="/images/05-orphanage-visit-2024.webp" />events. <span className="opacity-35">Seven <Pill src="/images/17-local-tourist-visit-heritage-walk.webp" />domains.</span> One <Pill src="/images/18-entrepreneurship-session-speaker.webp" />community.
        </motion.h2>
      </div>

      <div className="mt-16 grid grid-cols-3 border-y border-ink">
        {[[12, 'Events'], [Object.keys(domains).length, 'Domains'], [20, 'Moments captured']].map(([n, l], i) => (
          <div key={l} className={`px-3 py-6 md:px-8 md:py-8 ${i ? 'border-l border-ink' : ''}`}>
            <div className="display-md text-6xl md:text-[9rem] md:leading-[.85]"><Counter to={n} /></div>
            <div className="eyebrow mt-2 text-charcoal">{l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
