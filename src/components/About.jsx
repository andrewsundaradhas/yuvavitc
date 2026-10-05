import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ShapeWaves from './ui/ShapeWaves'
import { Sticker, FIC } from './Sticker'

const facts = [
  { k: 'Young Indians (Yi)', v: 'A movement for Indian youth to converge, lead, co-create and influence India’s future.', bg: '#ffe9ce' },
  { k: 'Part of CII', v: 'An integral part of the Confederation of Indian Industry.', bg: '#ffffff' },
  { k: 'VIT Chennai', v: 'Represents VIT Chennai for Yi, as part of the Student Welfare Office.', bg: '#ffe9ce' },
]
const rise = (d = 0) => ({ initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px 0px' }, transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] } })

// Full-bleed yellow colour block: who Yuva VIT Chennai is.
export default function About() {
  const [cell, setCell] = useState(14)
  useEffect(() => {
    const on = () => setCell(window.innerWidth < 640 ? 11 : 15)
    on(); window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return (
    <section id="about" className="relative overflow-hidden px-5 py-16 text-black md:px-10 md:py-24" style={{ background: FIC.yellow }}>
      {/* WebGPU shape-wave field behind everything — falls back to flat yellow */}
      <div className="absolute inset-0" aria-hidden="true">
        <ShapeWaves
          shapes="mixed" cellSize={cell} dotSize={0.72} color="#e8c100" hoverColor="#000000" backgroundColor="#ffd80c"
          speed={0.8} scale={1.1} contrast={1} brightness={0.4} fade={0.2} interactive splashRadius={46} splashStrength={0.5} glow={0} intro introDuration={1.8}
        />
      </div>
      <Sticker kind="burst" color={FIC.coral} shouts={['Student run!', 'Hi there!', 'Join us!']} rot={10} n={14} size="clamp(92px,12vw,180px)" className="right-[3%] top-[3%] md:right-[6%] md:top-[6%]" />
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <motion.p {...rise()} className="eyebrow mb-4">About us</motion.p>
        <motion.h2 {...rise(0.05)} className="font-aalto text-[clamp(72px,19vw,330px)] font-normal uppercase leading-[.95] tracking-[0.005em]">
          Yuva<br />
          <span className="relative inline-block">VIT Chennai
            <sup className="absolute left-full top-[6%] ml-[0.05em] flex items-center justify-center rounded-full border-2 border-black font-mango font-black leading-none tracking-normal" style={{ width: 'clamp(26px,4.4vw,70px)', height: 'clamp(26px,4.4vw,70px)', fontSize: 'clamp(12px,2vw,32px)' }} aria-label="Young Indians">Yi</sup>
          </span>
        </motion.h2>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <motion.p {...rise(0.1)} className="font-mango text-[clamp(34px,4.4vw,68px)] font-black uppercase leading-[.95]">
            A student-run club of <span className="rounded-md bg-black px-2 text-[#ffd80c]">Young Indians (Yi)</span>.
          </motion.p>
          <motion.div {...rise(0.15)} className="space-y-5 font-mango text-[clamp(24px,2.3vw,34px)] font-medium leading-[1.12]">
            <p><strong className="font-black">Young Indians (Yi)</strong> is a movement for Indian youth to Converge, Lead, Co-Create and influence India’s Future. It is an integral part of the Confederation of Indian Industry (CII).</p>
            <p>Yuva VIT Chennai represents VIT Chennai for Yi and is part of the Student Welfare Office of VIT Chennai.</p>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
          {facts.map((f, i) => (
            <motion.div key={f.k} {...rise(0.1 * i)} whileHover={{ y: -6, rotate: i % 2 ? 1.2 : -1.2 }} className="rounded-[15px] p-7" style={{ background: f.bg }}>
              <p className="font-aalto text-3xl uppercase leading-none">{f.k}</p>
              <p className="mt-3 font-mango text-[23px] font-medium leading-[1.1]">{f.v}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
