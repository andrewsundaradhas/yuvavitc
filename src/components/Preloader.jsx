import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, animate, useAnimationControls } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { domains } from '../data'

const C = { violet: '#8a53ff', coral: '#fd4b38', yellow: '#ffd80c', lime: '#3ccb09', cream: '#ffe9ce', ink: '#1d1d1b' }
const EASE = [0.65, 0, 0.35, 1]
const OUT = [0.16, 1, 0.3, 1]

const star = (n, ro, ri) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2
    const r = i % 2 ? ri : ro
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')

/* ---------- HUD: mono counter, status line, skip ---------- */
function Hud({ dark, hidden, onSkip }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const c = animate(0, 100, { duration: 4.6, ease: EASE, onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [])
  const msg = v < 25 ? 'Initialising' : v < 50 ? 'Mounting 20 photos' : v < 75 ? 'Indexing 07 domains' : v < 100 ? 'Assembling 12 events' : 'Ready'
  const tone = dark ? 'text-white' : 'text-ink'
  return (
    <div className={`pointer-events-none absolute inset-0 z-40 font-mono transition-opacity duration-300 ${hidden ? 'opacity-0' : ''} ${tone}`}>
      <div className="flex items-start justify-between px-5 pt-5 text-[11px] uppercase tracking-[0.06em] md:px-10 md:pt-8">
        <span>Yuva · VIT Chennai</span>
        <span className="hidden md:block">Learning Beyond Education</span>
        <span>Event Magazine</span>
      </div>
      <div className="absolute bottom-5 left-5 md:bottom-8 md:left-10">
        <div className="text-[clamp(52px,10vw,132px)] font-light leading-[.85] tracking-[-0.04em]">{String(v).padStart(3, '0')}</div>
        <div className="mt-3 text-[11px] uppercase tracking-[0.06em]">{msg}</div>
      </div>
      <button onClick={onSkip} className="pointer-events-auto absolute bottom-5 right-5 flex items-center gap-3 text-[13px] md:bottom-8 md:right-10" aria-label="Skip intro">
        Skip intro
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-current transition hover:bg-current/10"><ArrowRight size={16} /></span>
      </button>
      <div className="absolute bottom-0 left-0 h-[3px] w-full origin-left" style={{ transform: `scaleX(${v / 100})`, background: dark ? '#00b18c' : C.ink }} />
    </div>
  )
}

/* ---------- Scene 1: blueprint + teal scan reveal (Scale x Allfeat) ---------- */
function Blueprint({ leaving }) {
  const ticks = Array.from({ length: 72 })
  const draw = (delay, d = 1.4) => ({ initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: d, delay, ease: EASE } })
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
      <motion.div className="teal-wash absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.6 }} />

      <motion.div className="absolute left-0 top-1/2 h-px w-full origin-center bg-white/25" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, ease: EASE }} />
      <motion.div className="absolute left-1/2 top-0 h-full w-px origin-center bg-white/25" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.1, ease: EASE }} />

      <motion.svg viewBox="-500 -500 1000 1000" className="absolute left-1/2 top-1/2 h-[min(125vh,125vw)] w-[min(125vh,125vw)] -translate-x-1/2 -translate-y-1/2" animate={{ rotate: 140 }} transition={{ duration: 7, ease: 'linear' }}>
        <motion.circle r="470" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" {...draw(0.1, 1.8)} />
        <motion.circle r="330" fill="none" stroke="rgba(0,177,140,.7)" strokeWidth="1.2" {...draw(0.4, 1.6)} />
        <motion.circle r="210" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1" strokeDasharray="3 9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }} />
        {ticks.map((_, i) => (
          <g key={i} transform={`rotate(${i * 5})`}>
            <motion.line x1="0" x2="0" y1="-470" y2={i % 6 ? -454 : -436} stroke="rgba(255,255,255,.5)" strokeWidth="1.4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.012 }} />
          </g>
        ))}
      </motion.svg>

      <motion.div className="absolute left-1/2 top-1/2 aspect-[1179/1158] h-[min(44vh,66vw)] -translate-x-1/2 -translate-y-1/2" animate={leaving ? { scale: 0.4, rotate: -14, opacity: 0 } : {}} transition={{ duration: 0.8, ease: EASE }}>
        <motion.div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/20 bg-[#00b18c]/[0.08]" initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} transition={{ duration: 0.9, delay: 0.7, ease: EASE }}>
          <div className="flex h-full flex-col justify-center gap-[6%] px-[9%] font-mono text-white">
            {[['12', 'Events'], ['07', 'Domains'], ['20', 'Moments']].map(([n, l], i) => (
              <motion.div key={l} className="flex items-baseline justify-between border-b border-white/20 pb-[4%]" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.0 + i * 0.12, ease: OUT }}>
                <span className="text-[clamp(40px,8vh,84px)] font-light leading-none tracking-[-0.04em]">{n}</span>
                <span className="text-[11px] uppercase tracking-[0.06em] text-white/70">{l}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div className="absolute -left-[6%] -right-[6%] h-[2px] bg-[#00b18c] shadow-[0_0_18px_4px_rgba(0,177,140,.7)]" initial={{ top: '100%', opacity: 0 }} animate={{ top: '0%', opacity: [0, 1, 1, 0] }} transition={{ duration: 0.9, delay: 0.7, ease: EASE }} />

        <svg viewBox="0 0 116 116" className="pointer-events-none absolute -inset-[8%] h-[116%] w-[116%]" fill="none" stroke="#fff" strokeWidth="1.4">
          {['M0 20 V0 H20', 'M96 0 H116 V20', 'M116 96 V116 H96', 'M20 116 H0 V96'].map((d, i) => (
            <motion.path key={i} d={d} vectorEffect="non-scaling-stroke" {...draw(0.3 + i * 0.1, 0.8)} />
          ))}
        </svg>
        <motion.div className="absolute -bottom-12 left-0 right-0 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.06em] text-white/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <span className="h-px flex-1 bg-white/40" />Yuva · VIT Chennai<span className="h-px flex-1 bg-white/40" />
        </motion.div>
        <motion.div className="absolute -left-12 bottom-0 top-0 flex flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.06em] text-white/70 [writing-mode:vertical-rl]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <span className="w-px flex-1 bg-white/40" />Event magazine<span className="w-px flex-1 bg-white/40" />
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ---------- Confetti burst on sticker reveal ---------- */
const confettiBits = Array.from({ length: 34 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 34 + Math.random() * 0.4
  const d = 220 + Math.random() * 420
  return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7, drop: 120 + Math.random() * 160, r: Math.random() * 720 - 360, w: 8 + Math.random() * 10, round: i % 3 === 0, c: [C.coral, C.yellow, C.violet, C.lime][i % 4], d: Math.random() * 0.15 }
})
function Confetti() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-30">
      {confettiBits.map((b, i) => (
        <motion.span key={i} className="absolute block" style={{ width: b.w, height: b.round ? b.w : b.w * 0.5, background: b.c, borderRadius: b.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{ x: b.x, y: [0, b.y, b.y + b.drop], scale: [0, 1, 1], rotate: b.r, opacity: [1, 1, 0] }}
          transition={{ duration: 1.5, delay: b.d, times: [0, 0.45, 1], ease: 'easeOut' }} />
      ))}
    </div>
  )
}

/* ---------- Scene 3: stickers (Fictional x Eddie) ---------- */
const Pop = ({ rot = 0, delay = 0, className = '', style, children }) => (
  <motion.div className={`absolute ${className}`} style={style} initial={{ scale: 0, rotate: rot - 50, opacity: 0 }} animate={{ scale: 1, rotate: rot, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 11, delay }}>
    {children}
  </motion.div>
)

const Burst = ({ color, big, small, textColor, n, ...p }) => (
  <Pop {...p} className="flex items-center justify-center" style={{ width: 'clamp(120px,17vw,250px)', height: 'clamp(120px,17vw,250px)', ...p.style }}>
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full"><polygon points={star(n, 49, 39)} fill={color} /></svg>
    <span className="relative text-center font-round font-bold leading-[.9]" style={{ color: textColor }}>
      <span className="block text-[clamp(40px,6.4vw,92px)]">{big}</span>
      <span className="block text-[clamp(13px,1.7vw,24px)] uppercase tracking-wide">{small}</span>
    </span>
  </Pop>
)

const pillSpots = [[17, 47, -8], [24, 86, 5], [47, 91, -4], [70, 85, 6], [86, 70, -9], [1, 54, 8], [58, 4, -5]]
const pillSpotsMobile = [[3, 31, -6], [56, 32, 5], [3, 38, 4], [50, 39, -5], [3, 76, 5], [46, 77, -6], [28, 83, 4]]

function Stickers() {
  return (
    <>
      <Confetti />
      <Burst color={C.coral} big="12" small="Events!" textColor="#fff" n={16} rot={-10} delay={0} style={{ left: '5%', top: '13%' }} />
      <Burst color={C.yellow} big="7" small="Domains" textColor="#000" n={12} rot={9} delay={0.12} style={{ right: '6%', top: '10%' }} />
      <Pop rot={12} delay={0.24} className="flex items-center justify-center rounded-full bg-[#8a53ff] text-center font-round font-bold uppercase leading-[.95] text-white" style={{ right: '10%', bottom: '21%', width: 'clamp(100px,13vw,190px)', height: 'clamp(100px,13vw,190px)', fontSize: 'clamp(14px,1.9vw,27px)' }}>
        One<br />Community
      </Pop>
      <Pop rot={-4} delay={0.36} className="rounded-[15px] bg-white px-[clamp(16px,2.6vw,43px)] py-[clamp(12px,1.8vw,29px)] font-round font-semibold text-black shadow-[0_0_0_2px_#ffd80c]" style={{ left: '6%', bottom: '27%', fontSize: 'clamp(16px,2.2vw,34px)', maxWidth: '36vw' }}>
        Purpose. Passion. Action.
        <span className="absolute -bottom-3 left-10 h-5 w-6 bg-white [clip-path:polygon(0_0,100%_0,0_100%)]" />
      </Pop>
      <Pop rot={-12} delay={0.5} className="rounded-[5px] bg-[#3ccb09] px-[clamp(16px,2vw,29px)] py-2 font-round font-bold uppercase text-black shadow-[0_0_0_2px_#ffd80c]" style={{ left: '38%', bottom: '10%', fontSize: 'clamp(16px,2vw,30px)' }}>
        Let’s go!
      </Pop>
      {Object.values(domains).map((d, i) => {
        const [l, t, r] = (typeof window !== 'undefined' && window.innerWidth < 640 ? pillSpotsMobile : pillSpots)[i]
        return (
          <motion.div key={d.name} className="absolute whitespace-nowrap rounded-full px-[clamp(12px,1.6vw,24px)] py-[clamp(5px,.7vw,10px)] font-round font-semibold text-ink" style={{ left: `${l}%`, top: `${t}%`, background: d.color, fontSize: 'clamp(12px,1.5vw,22px)' }}
            initial={{ y: '-110vh', rotate: r * 5 }} animate={{ y: 0, rotate: r }} transition={{ type: 'spring', stiffness: 130, damping: 8, mass: 1.1, delay: 0.55 + i * 0.09 }}>
            {d.name}
          </motion.div>
        )
      })}
    </>
  )
}

/* ---------- Scene 2: cream tabletop, letter slam (Miranda) ---------- */
function Slam({ stickers }) {
  const shake = useAnimationControls()
  const hit = () => shake.start({ x: [0, -12, 10, -6, 2, 0], y: [0, 9, -7, 3, -1, 0], transition: { duration: 0.42 } })
  const rots = [-18, 14, -11, 17]
  return (
    <>
      <motion.div className="pointer-events-none absolute inset-0 z-30 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.45, delay: 0.25 }} />
      <motion.div className="absolute inset-0" style={{ background: C.cream }} initial={{ clipPath: 'circle(0% at 50% 50%)' }} animate={{ clipPath: 'circle(150% at 50% 50%)' }} transition={{ duration: 0.85, ease: EASE }} />
      <motion.div className="absolute inset-0 overflow-hidden" animate={shake}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p className="eyebrow mb-4 text-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>The Official Publication of</motion.p>
          <h2 className="display flex text-ink" style={{ fontSize: 'clamp(110px,30vw,440px)' }} aria-label="YUVA">
            {'YUVA'.split('').map((ch, i) => (
              <span key={i} className="relative inline-block" aria-hidden="true">
                <motion.span className="inline-block" initial={{ y: '-115vh', rotate: rots[i] }} animate={{ y: 0, rotate: 0 }} onAnimationComplete={hit}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, mass: 1, delay: 0.3 + i * 0.12 }}>{ch}</motion.span>
                <motion.span className="pointer-events-none absolute bottom-[8%] left-1/2 aspect-square w-[70%] -translate-x-1/2 rounded-full border-[3px] border-ink" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 2.2], opacity: [0.55, 0] }} transition={{ duration: 0.7, delay: 0.3 + i * 0.12 + 0.5, ease: 'easeOut' }} />
              </span>
            ))}
          </h2>
          <motion.div className="display text-ember" style={{ fontSize: 'clamp(44px,8.4vw,128px)', marginTop: '-0.04em' }} initial={{ clipPath: 'inset(0 0 100% 0)', y: 40 }} animate={{ clipPath: 'inset(0 0 0% 0)', y: 0 }} transition={{ duration: 0.7, delay: 0.95, ease: OUT }}>VIT Chennai</motion.div>
        </div>
        {stickers && <Stickers />}
      </motion.div>
    </>
  )
}

/* ---------- Exit: five colour shutters ---------- */
const shutters = [C.violet, C.coral, C.yellow, C.lime, C.ink]
function Shutters() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex">
      {shutters.map((c, i) => (
        <motion.div key={c} className="h-full flex-1" style={{ background: c }} initial={{ y: '101%' }} animate={{ y: ['101%', '0%', '0%', '-101%'] }} transition={{ duration: 1.5, delay: i * 0.07, times: [0, 0.38, 0.55, 1], ease: EASE }} />
      ))}
    </div>
  )
}

export default function Preloader({ onReady, onDone }) {
  const [stage, setStage] = useState(0) // 0 blueprint · 1 cream+slam · 2 stickers · 3 shutters
  const [content, setContent] = useState(true)
  const timers = useRef([])
  const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))

  const exit = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = []
    setStage(3)
    at(900, () => { setContent(false); onReady() })
    at(1900, onDone)
  }, [onReady, onDone])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    at(1800, () => setStage(1))
    at(2600, () => setStage(2))
    at(4600, exit)
    return () => { timers.current.forEach(clearTimeout); document.body.style.overflow = '' }
  }, [exit])

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && stage < 3 && exit()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [stage, exit])

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${content ? 'bg-[#050505]' : ''}`} role="status" aria-label="Loading Yuva VIT Chennai">
      {content && (
        <>
          <Blueprint leaving={stage >= 1} />
          {stage >= 1 && <Slam stickers={stage >= 2} />}
          <Hud dark={stage === 0} hidden={stage >= 3} onSkip={exit} />
        </>
      )}
      {stage >= 3 && <Shutters />}
    </div>
  )
}
