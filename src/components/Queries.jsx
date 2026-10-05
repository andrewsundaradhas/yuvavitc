import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { Sticker, FIC } from './Sticker'

// Queries are emailed to the inbox(es) below via FormSubmit (https://formsubmit.co).
// Override with VITE_QUERY_ENDPOINT (e.g. your own Vercel function) if you ever move off FormSubmit.
const RECIPIENT = 'aaathi241@gmail.com'
const ENDPOINT = import.meta.env.VITE_QUERY_ENDPOINT || `https://formsubmit.co/ajax/${RECIPIENT}`
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX = 600
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Fold stages as polygon point lists on a 300x200 sheet (nose on the left, mirrored by CSS).
// 0 flat sheet · 1 corners folded to the centre line · 2 folded in half · 3 wings open
const BODY = [
  '0,100 0,0 100,0 300,0 300,200 100,200 0,200',
  '0,100 0,100 100,0 300,0 300,200 100,200 0,100',
  '0,100 0,100 60,50 300,50 300,150 60,150 0,100',
  '0,100 0,100 70,95 300,91 300,109 70,105 0,100',
]
const TOP = ['0,100 100,0 0,0', '0,100 100,0 100,100', '0,100 60,50 60,100', '0,100 215,6 215,97']
const BOTTOM = ['0,100 100,200 0,200', '0,100 100,200 100,100', '0,100 60,150 60,100', '0,100 215,194 215,103']
const fold = { duration: 0.6, ease: [0.65, 0, 0.35, 1] }

export default function Queries() {
  const [value, setValue] = useState('')
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('') // honeypot: real people never fill this
  const [phase, setPhase] = useState('idle') // idle | folding | flying | sent | error
  const [stage, setStage] = useState(0)
  const [hint, setHint] = useState('')
  const [size, setSize] = useState({ w: 640, h: 300 })
  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const alive = useRef(true)
  const flight = useAnimationControls()
  const shake = useAnimationControls()
  const busy = phase === 'folding' || phase === 'flying'

  useEffect(() => () => { alive.current = false }, [])

  const post = async (q, replyTo) => {
    if (trap) return // bot: pretend it worked, send nothing
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        message: q,
        ...(replyTo ? { email: replyTo, _replyto: replyTo } : {}),
        name: replyTo || 'Website visitor',
        page: location.href,
        sentAt: new Date().toISOString(),
        _subject: 'New query — Yuva VIT Chennai website',
        _template: 'table',
        _captcha: 'false',
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success === false || data.success === 'false') {
      // e.g. FormSubmit before the recipient has clicked the "Activate Form" email
      console.warn('[Queries] not delivered:', data.message || res.status)
      throw new Error(data.message || 'send failed')
    }
  }

  const submit = async () => {
    if (busy) return
    const q = value.trim()
    if (!q) {
      setHint('Type your query first ✦')
      shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } })
      return
    }
    const replyTo = email.trim()
    if (replyTo && !EMAIL_RE.test(replyTo)) { setHint('That email doesn’t look right — fix it or clear it ✦'); return }
    setHint('')
    const sending = post(q, replyTo).then(() => true, () => false)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rect = cardRef.current.getBoundingClientRect()
    setSize({ w: rect.width, h: rect.height })
    if (reduced) {
      setPhase('folding')
      setPhase((await sending) ? 'sent' : 'error')
      return
    }
    const card = rect
    const sec = sectionRef.current.getBoundingClientRect()
    setStage(0); setPhase('folding')
    await wait(220); if (!alive.current) return
    setStage(1); await wait(700); if (!alive.current) return
    setStage(2); await wait(700); if (!alive.current) return
    setStage(3); await wait(800); if (!alive.current) return
    setPhase('flying')
    const dist = sec.width - (card.left - sec.left + card.width / 2) + 340
    await flight.start({
      x: [0, dist * 0.18, dist * 0.55, dist],
      y: [0, -70, -30, -190],
      rotate: [0, -14, 7, -16],
      scale: [1, 1, 0.8, 0.45],
      opacity: [1, 1, 1, 0],
      transition: { duration: 1.8, times: [0, 0.22, 0.62, 1], ease: 'easeInOut' },
    })
    if (!alive.current) return
    const ok = await sending
    flight.set({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 })
    setPhase(ok ? 'sent' : 'error')
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit() }
  }
  const again = () => { setValue(''); setEmail(''); setStage(0); setHint(''); setPhase('idle') }

  const planeW = Math.min(300, size.w * 0.7)
  const target = { width: planeW, height: planeW * (200 / 300) }
  const sheet = stage === 0 ? { width: size.w, height: size.h } : target
  const flap = stage === 0 ? '#ffffff' : '#ffe9ce'

  return (
    <section id="queries" ref={sectionRef} className="relative overflow-hidden px-5 py-16 text-white md:px-10 md:py-28" style={{ background: FIC.coral }}>
      <Sticker kind="circle" color={FIC.violet} shouts={['Ask away!', 'Go on…', 'Don’t be shy']} rot={-10} size="clamp(92px,11vw,170px)" className="left-[3%] top-[3%] md:left-[5%] md:top-[8%]" />
      <Sticker kind="burst" color={FIC.yellow} textColor="#000" shouts={['No question is too small!', 'Type it!', 'We read all']} rot={9} n={14} size="clamp(104px,13vw,200px)" className="right-[3%] top-[2%] md:right-[6%] md:top-[6%]" />

      <div className="relative z-10 mx-auto max-w-[1100px]">
        <p className="eyebrow mb-4 text-center">Queries</p>
        <h2 className="text-center font-round text-[clamp(48px,10vw,150px)] font-bold uppercase leading-[.9] tracking-[0.012em]">Have a<br />query?</h2>
        <p className="mx-auto mt-6 max-w-xl text-center font-round text-[clamp(18px,1.8vw,26px)] font-medium leading-snug text-white/95">
          Type it below and press Enter — we’ll fold it up and send it flying our way.
        </p>

        <div className="relative mx-auto mt-12 max-w-4xl md:mt-16">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'sent' ? (
              <motion.div key="sent" role="status" aria-live="polite" initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}
                className="relative flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-[15px] p-8 text-center text-black md:min-h-[320px]" style={{ background: FIC.yellow, boxShadow: '0 0 0 2px #000', minHeight: size.h }}>
                <motion.p initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="font-round text-[clamp(34px,6vw,76px)] font-bold leading-[.98]">Your query has been sent ✦</motion.p>
                <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="font-round text-[clamp(18px,2vw,28px)] font-medium">Thank you for reaching out.</motion.p>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} onClick={again} className="btn-ring mt-2" autoFocus>Send another query</motion.button>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }}>
                <motion.div animate={shake}>
                  <div ref={cardRef} className="relative rounded-[15px] bg-white p-5 text-black transition-opacity duration-150 md:p-8" style={{ boxShadow: '0 0 0 2px #000', opacity: busy ? 0 : 1 }} aria-hidden={busy}>
                    <label htmlFor="query" className="eyebrow mb-3 block text-black/70">Your query</label>
                    <textarea id="query" value={value} onChange={(e) => { setValue(e.target.value.slice(0, MAX)); if (hint) setHint('') }} onKeyDown={onKey} rows={3} maxLength={MAX} disabled={busy}
                      placeholder="What would you like to ask us?"
                      className="block w-full resize-none rounded-[5px] border border-[#101010] bg-white px-4 py-3 font-round text-[clamp(18px,2.4vw,32px)] font-medium leading-[1.25] text-[#101010] outline-none transition placeholder:text-black/35 hover:bg-[#fffaf1] focus:border-2 focus:px-[15px] focus:py-[11px]" />
                    <label htmlFor="query-email" className="eyebrow mb-2 mt-5 block text-black/70">Your email <span className="normal-case tracking-normal text-black/45">(optional — so we can reply)</span></label>
                    <input id="query-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); if (hint) setHint('') }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} disabled={busy} placeholder="you@example.com"
                      className="block w-full rounded-[5px] border border-[#101010] bg-white px-4 py-3 font-round text-[17px] font-medium text-[#101010] outline-none transition placeholder:text-black/35 hover:bg-[#fffaf1] focus:border-2 focus:px-[15px] focus:py-[11px]" />
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
                    <div className="mt-5 flex flex-col-reverse gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                      <p className={`font-round text-[15px] font-medium ${hint || phase === 'error' ? 'text-[#fd4b38]' : 'text-black/55'}`} aria-live="polite">
                        {phase === 'error' ? 'Couldn’t send that — please try again.' : hint || 'Enter to send · Shift + Enter for a new line'}
                      </p>
                      <div className="flex items-center justify-between gap-4 sm:justify-start">
                        <span className="font-round text-[14px] text-black/45" aria-hidden="true">{value.length}/{MAX}</span>
                        <button type="button" onClick={submit} disabled={busy} className="btn-ring min-h-[46px] disabled:opacity-60" aria-label="Send query">Send ✈</button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {busy && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden="true">
                    <motion.div animate={flight} className="flex items-center justify-center">
                      <motion.div animate={sheet} initial={sheet} transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }} style={{ filter: 'drop-shadow(0 14px 12px rgba(0,0,0,.28))' }}>
                        <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="h-full w-full overflow-visible" style={{ transform: 'scaleX(-1)' }}>
                          <g stroke="#000" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
                            <motion.polygon initial={{ points: BODY[0] }} animate={{ points: BODY[stage], fill: '#ffffff' }} transition={fold} vectorEffect="non-scaling-stroke" />
                            <motion.polygon initial={{ points: TOP[0], fill: '#ffffff' }} animate={{ points: TOP[stage], fill: flap }} transition={fold} vectorEffect="non-scaling-stroke" />
                            <motion.polygon initial={{ points: BOTTOM[0], fill: '#ffffff' }} animate={{ points: BOTTOM[stage], fill: flap }} transition={fold} vectorEffect="non-scaling-stroke" />
                            <motion.line x1="0" y1="100" x2="300" y2="100" initial={{ opacity: 0 }} animate={{ opacity: stage >= 2 ? 0.55 : 0 }} transition={{ duration: 0.4 }} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                          </g>
                        </svg>
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
