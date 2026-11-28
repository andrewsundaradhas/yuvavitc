import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { domains } from '../data'
import Stamp from './Stamp'
import { imgProps } from '../lib/img'

// [domain, left%, top%, rotate]
const stickers = [
  ['road', 5, 14, -9], ['health', 66, 9, 6], ['access', 20, 33, 4],
  ['innov', 76, 38, -5], ['learn', 44, 20, -3], ['climate', 8, 50, 7], ['entrep', 58, 52, -7],
]
// Phone layout: pills sit below the logo / photo stickers so nothing collides.
const stickersPhone = [
  ['road', 4, 30, -8], ['health', 52, 30, 5], ['access', 6, 39, 4],
  ['innov', 54, 41, -5], ['learn', 26, 49, -3], ['climate', 4, 57, 7], ['entrep', 40, 58, -6],
]
const photoStickers = [
  { src: '/img/49-only-founders-1.webp', alt: 'Only Founders', cls: 'left-[34%] top-[11%] w-24 sm:left-[27%] sm:top-[8%] sm:w-44 lg:w-56', rot: -7, color: '#d2e534' },
  { src: '/img/24-freshers-expo.webp', alt: 'Freshers Expo', cls: 'right-[4%] top-[48%] hidden sm:block sm:w-44 lg:w-56', rot: 5, color: '#89cdf3' },
]

// play=false: mounted (images, fonts, layout load) but entrance held until the preloader reveals it.
export default function Hero({ onPick, play = true }) {
  const ref = useRef(null)
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const on = () => setPhone(window.innerWidth < 640)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12])

  return (
    <section id="top" ref={ref} className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-ink pt-14">
      <div className="teal-wash absolute inset-0" />
      <div className="eyebrow relative z-10 flex justify-between px-5 pt-5 text-bone md:px-10">
        <span className="hidden sm:inline">The Official Publication of</span>
      </div>

      {/* draggable sticker pack */}
      <div className="absolute inset-0 z-20">
        {photoStickers.map((p, i) => (
          <motion.div key={p.src} drag dragDirectionLock dragMomentum={false} whileDrag={{ scale: 1.06, zIndex: 40 }} initial={{ opacity: 0, scale: 0.6, rotate: 0 }} animate={play ? { opacity: 1, scale: 1, rotate: p.rot } : undefined} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.9 + i * 0.15 }}
            className={`sticker absolute cursor-grab touch-pan-y border-[4px] border-parchment active:cursor-grabbing sm:border-[6px] ${p.cls}`} style={{ background: p.color }}>
            <img {...imgProps(p.src, '(min-width: 1024px) 224px, (min-width: 640px) 176px, 96px', { eager: true })} alt={p.alt} draggable={false} className="aspect-[4/3] w-full object-cover" />
          </motion.div>
        ))}
        {(phone ? stickersPhone : stickers).map(([k, l, t, r], i) => (
          <motion.button key={k} drag dragDirectionLock dragMomentum={false} onTap={() => { onPick(k); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }) }}
            whileHover={{ scale: 1.1, rotate: 0 }} whileDrag={{ scale: 1.1, zIndex: 40 }}
            initial={{ opacity: 0, y: -80, rotate: r * 3 }} animate={play ? { opacity: 1, y: 0, rotate: r } : undefined} transition={{ type: 'spring', stiffness: 220, damping: 13, delay: 0.5 + i * 0.1 }}
            className="sticker pill absolute cursor-grab touch-none whitespace-nowrap border-2 border-ink px-3 py-1.5 text-[11px] active:cursor-grabbing md:px-5 md:py-2 md:text-[14px]"
            style={{ left: `min(${l}%, calc(100% - 11.5rem))`, top: `${t}%`, background: domains[k].color }} aria-label={`Filter events: ${domains[k].name}`}>
            ✦ {domains[k].name}
          </motion.button>
        ))}
      </div>

      <motion.div drag dragDirectionLock dragMomentum={false} whileDrag={{ scale: 1.05, zIndex: 40 }} initial={{ opacity: 0, scale: 0.6, rotate: 0 }} animate={play ? { opacity: 1, scale: 1, rotate: 4 } : undefined} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 1.2 }}
        className="sticker absolute right-[3%] top-[9%] z-[15] w-28 cursor-grab touch-pan-y border-[4px] border-parchment bg-white p-1.5 active:cursor-grabbing sm:top-[11%] sm:w-52 sm:border-[6px] sm:p-3 lg:w-64">
        <img {...imgProps('/img/yuva-team-stall.webp', '(min-width: 1024px) 256px, (min-width: 640px) 208px, 112px', { priority: true })} alt="Yuva VIT Chennai Team" draggable={false} className="aspect-[4/3] w-full object-cover" />
      </motion.div>
      <h1 className="sr-only">YUVA VIT Chennai</h1>
      <div className="relative z-10 flex flex-1 flex-col justify-end">
        <motion.div style={{ y: titleY, scale }} initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : undefined} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="display text-center text-parchment" aria-hidden="true">
          <motion.div initial={{ y: 140 }} animate={play ? { y: 0 } : undefined} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} style={{ fontSize: 'clamp(120px, 29.5vw, 430px)' }}>YUVA</motion.div>
        </motion.div>
        <div className="flex flex-col items-start gap-5 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:flex-row md:items-end md:justify-between md:gap-6 md:px-10 md:pb-12">
          <div className="display whitespace-nowrap text-[clamp(38px,11.4vw,72px)] text-ember md:text-[clamp(60px,7.2vw,118px)]" aria-hidden="true">VIT Chennai</div>
          <div className="flex w-full items-end justify-between gap-4 md:w-auto md:flex-col md:items-end md:gap-4">
            <Stamp className="w-20 rotate-[8deg] md:w-28" />
            <a href="#intro" className="flex items-center gap-3 font-mono text-[13px] text-parchment" aria-label="Scroll to explore">
              Scroll to explore
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-parchment/70 transition hover:bg-parchment hover:text-ink"><ArrowDown size={16} /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
