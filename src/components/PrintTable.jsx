import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { domains, events } from '../data'
import PaperCrumple from './ui/PaperCrumple'
import { Sticker, FIC } from './Sticker'

const prints = [
  { slug: 'core-reveal', rotation: -3, ouch: ['OUCH!', 'EEK!', 'NOOO!'] },
  { slug: 'tourist-visit', rotation: 2, ouch: ['YIKES!', 'CRUNCH!', 'OOF!'] },
  { slug: 'orphanage', rotation: -2, ouch: ['SQUISH!', 'OH NO!', 'HELP!'] },
].map((p) => ({ ...p, e: events.find((e) => e.slug === p.slug) }))
const relief = ['PHEW!', 'ALL BETTER', 'GOOD AS NEW', 'MOSTLY…']
const pick = (a) => a[Math.floor(Math.random() * a.length)]

// Full-bleed violet colour block: white rounded type, stickers that react to every grab.
export default function PrintTable() {
  const [mood, setMood] = useState({}) // slug -> { text, kind }
  const [resetKey, setResetKey] = useState(0)
  const [grabs, setGrabs] = useState(0)
  const [stage, setStage] = useState(400)
  useEffect(() => {
    const on = () => setStage(innerWidth < 640 ? 340 : innerWidth < 1024 ? 300 : 400)
    on(); addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])

  const react = (p) => (state) => {
    if (state === 'holding') { setGrabs((g) => g + 1); setMood((m) => ({ ...m, [p.slug]: { text: pick(p.ouch), c: FIC.coral } })) }
    else { setMood((m) => ({ ...m, [p.slug]: { text: pick(relief), c: FIC.yellow } })); setTimeout(() => setMood((m) => ({ ...m, [p.slug]: null })), 1400) }
  }

  return (
    <section id="prints" className="relative overflow-hidden px-5 py-16 text-white md:px-10 md:py-24" style={{ background: FIC.violet }}>
      <div className="relative mx-auto max-w-[1440px]">
        <div className="relative mb-10 pb-24 md:mb-14 md:pb-0">
          <p className="eyebrow mb-4 text-white">The Print Table</p>
          <h2 className="font-round text-[clamp(56px,11vw,176px)] font-bold uppercase leading-[.9] tracking-[0.012em]">Handle<br />with care.</h2>
          <Sticker kind="bubble" shouts={['Press & hold a print!', 'Go on, crumple it', 'Let go — it unfolds', 'I felt that']} rot={4} delay={0.2} className="bottom-0 left-[2%] max-w-[60vw] md:bottom-auto md:left-auto md:right-[2%] md:top-[2%] md:max-w-[36vw]" />
          <Sticker kind="burst" color={FIC.yellow} textColor="#000" shouts={[`${grabs} crumple${grabs === 1 ? '' : 's'}`, 'Careful!', 'Too far!']} rot={-10} n={12} size="clamp(92px,12vw,180px)" delay={0.4} className="-bottom-2 right-[2%] md:bottom-[-14%] md:right-[8%]" />
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {prints.map((p, n) => {
            const d = domains[p.e.domain]
            const m = mood[p.slug]
            return (
              <motion.figure key={p.slug} initial={{ opacity: 0, y: 50, rotate: n % 2 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', stiffness: 120, damping: 14, delay: n * 0.1 }}
                className="relative rounded-[15px]" style={{ background: FIC.cream }}>
                <PaperCrumple
                  src={p.e.photos[0].src} alt={p.e.photos[0].alt} width={300} height={230} sceneHeight={stage} rotation={p.rotation}
                  releaseBehavior="creased" crumpleAmount={0.9} creaseStrength={0.2} foldCount={7} detail={56}
                  paperColor="#f4f0e8" dragRadius={60} returnToOrigin resetKey={resetKey} onStateChange={react(p)}
                />
                <AnimatePresence>
                  {m && (
                    <motion.div key={m.text} className="pointer-events-none absolute left-1/2 top-6 z-20" initial={{ scale: 0, rotate: -30, x: '-50%' }} animate={{ scale: 1, rotate: n % 2 ? 8 : -8, x: '-50%' }} exit={{ scale: 0, rotate: 30, x: '-50%' }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
                      <div className="relative flex h-[130px] w-[130px] items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full"><polygon points={Array.from({ length: 28 }, (_, i) => { const a = (Math.PI / 14) * i - Math.PI / 2; const r = i % 2 ? 38 : 49; return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}` }).join(' ')} fill={m.c} /></svg>
                        <span className="relative px-2 text-center font-round text-[22px] font-bold uppercase leading-[.95]" style={{ color: m.c === FIC.yellow ? '#000' : '#fff' }}>{m.text}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <figcaption className="flex flex-col items-start gap-2 rounded-b-[15px] border-t-2 border-black/80 px-5 py-4 text-black lg:flex-row lg:items-center lg:justify-between lg:gap-3">
                  <span className="font-round text-xl font-bold leading-none lg:text-2xl">{p.e.short}</span>
                  <span className="rounded-full px-3 py-1 font-round text-[13px] font-semibold" style={{ background: d.color }}>{d.name}</span>
                </figcaption>
              </motion.figure>
            )
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <button onClick={() => { setResetKey((k) => k + 1); setGrabs(0) }} className="btn-ring">Smooth them all out</button>
        </div>
      </div>
    </section>
  )
}
