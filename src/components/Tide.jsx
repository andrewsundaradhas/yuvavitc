import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import MicroSlats from './ui/MicroSlats'
import { Sticker, Shout, FIC } from './Sticker'

const WORDS = ['KABOOM!', 'WOW!', 'BANG!', 'POP!', 'YAY!', 'ZAP!', 'SPLASH!', 'YUVA!']
const COLS = [FIC.coral, FIC.yellow, FIC.violet, FIC.lime]

// Night-edition statement over an interactive sea of slats — now sticker-bombed.
export default function Tide() {
  const ref = useRef(null)
  const [shouts, setShouts] = useState([])
  const [count, setCount] = useState(0)

  const slap = useCallback((e) => {
    if (e.target.closest('[data-sticker]')) return
    const r = ref.current.getBoundingClientRect()
    const id = Math.random()
    setCount((c) => c + 1)
    setShouts((s) => [...s.slice(-6), { id, x: e.clientX - r.left, y: e.clientY - r.top, text: WORDS[Math.floor(Math.random() * WORDS.length)], color: COLS[Math.floor(Math.random() * COLS.length)], rot: Math.round(Math.random() * 24 - 12) }])
  }, [])

  return (
    <section ref={ref} onPointerDown={slap} className="relative isolate cursor-crosshair overflow-hidden bg-[#050505] text-parchment" aria-label="Purpose, Passion, Action">
      <div className="absolute inset-0 -z-10">
        <MicroSlats
          preset="swell" color="#00b18c" glintColor="#ffe9ce" backgroundColor="#050505"
          slatWidth={9} slatHeight={26} gap={3} roundness={1}
          interactive cursorStrength={1.2} cursorSize={70} swirl={0.5} trail={1.8} lean={0.6} intro introDuration={2}
        />
      </div>

      <div className="pointer-events-none relative mx-auto flex min-h-[92svh] max-w-[1440px] flex-col justify-between px-5 py-12 md:px-10 md:py-16">
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="eyebrow text-teal">The Community</motion.p>

        <motion.h2 className="display-md text-[clamp(64px,19vw,210px)] md:text-[clamp(64px,13vw,210px)] leading-[.8] tracking-[-0.055em]" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} transition={{ staggerChildren: 0.15 }}>
          {['Purpose.', 'Passion.', 'Action.'].map((w, i) => (
            <span key={w} className="block overflow-hidden pb-[0.08em]">
              <motion.span className={`block ${i === 2 ? 'opacity-65' : ''}`} variants={{ hidden: { y: '110%' }, show: { y: 0 } }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>{w}</motion.span>
            </span>
          ))}
        </motion.h2>

        <div className="flex items-end justify-between gap-6">
          <p className="max-w-sm text-xl text-parchment/80">One community driven by purpose, passion, and action.</p>
          <p className="eyebrow hidden text-right text-parchment/60 md:block">Move to stir the water<br />Click to splash</p>
        </div>
      </div>

      {/* sticker pack — drag, hover, tap */}
      <div className="pointer-events-none absolute inset-0">
        <Sticker kind="burst" color={FIC.coral} shouts={['Splash!', 'Whoosh!', 'Glub!', 'Kaboom!']} rot={-9} n={16} size="clamp(92px,15vw,220px)" delay={0.3} className="right-[3%] top-[3%] md:right-[9%] md:top-[12%]" />
        <Sticker kind="circle" color={FIC.lime} textColor="#000" shouts={['Poke me', 'Again!', 'Harder!', 'Ha ha!', 'Stop it!']} rot={10} size="clamp(100px,12vw,170px)" delay={0.45} className="hidden md:block md:right-[27%] md:top-[47%]" />
        <Sticker kind="bubble" shouts={['Stir the water!', 'Wheee!', 'More!', 'Faster!', 'You’re a natural']} rot={-4} delay={0.6} className="left-[5%] top-[17%] max-w-[46vw] md:left-[46%] md:top-[16%] md:max-w-[30vw]" />
        <Sticker kind="label" color={FIC.yellow} textColor="#000" shouts={['Click anywhere!', 'Go on!', 'Do it!']} rot={-13} delay={0.75} className="bottom-[24%] right-[4%] md:bottom-[14%] md:right-[8%]" />
        <Sticker kind="circle" color={FIC.violet} shouts={[`${count} splat${count === 1 ? '' : 's'}`]} rot={8} size="clamp(86px,9vw,130px)" delay={0.9} className="hidden md:block md:bottom-[24%] md:left-[4%]" />
      </div>

      {shouts.map((s) => <Shout key={s.id} {...s} onDone={() => setShouts((a) => a.filter((x) => x.id !== s.id))} />)}
    </section>
  )
}
