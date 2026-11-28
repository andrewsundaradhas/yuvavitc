import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Sticker, FIC } from './Sticker'
import { imgProps } from '../lib/img'

/**
 * Interactive golden starlight & constellation canvas background.
 * Particles drift upward like celebratory embers, connect near the cursor,
 * and burst into golden sparks on click.
 */
function AwardField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 1) // soft dots look the same at 1x; never above 1 (also when zoomed out)
    const mouse = { x: -9999, y: -9999, active: false }

    const COLORS = ['#ffd80c', '#ffe875', '#d2e534', '#ffb4a2']
    const particles = []
    const sparks = []

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const initParticles = () => {
      particles.length = 0
      const count = Math.min(75, Math.max(36, Math.floor((w * h) / 18000)))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.25 - Math.random() * 0.45,
          r: 1.4 + Math.random() * 2.4,
          color: COLORS[i % COLORS.length],
          alpha: 0.35 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    const spawnBurst = (bx, by) => {
      for (let i = 0; i < 22; i++) {
        const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.25
        const speed = 1.8 + Math.random() * 3.8
        sparks.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          r: 1.8 + Math.random() * 2.2,
          color: COLORS[i % COLORS.length],
        })
      }
    }

    resize()
    initParticles()

    const onResize = () => {
      resize()
      initParticles()
    }
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      spawnBurst(e.clientX - rect.left, e.clientY - rect.top)
    }

    window.addEventListener('resize', onResize)
    const section = canvas.parentElement
    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)
    section.addEventListener('click', onClick)

    const links = [[], [], [], []]
    const tick = (t) => {
      ctx.clearRect(0, 0, w, h)

      // Cursor warm golden aura
      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200)
        grad.addColorStop(0, 'rgba(255, 216, 12, 0.16)')
        grad.addColorStop(0.5, 'rgba(210, 229, 52, 0.06)')
        grad.addColorStop(1, 'rgba(255, 216, 12, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2)
        ctx.fill()
      }

      // Update & draw drifting starlight particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!reduced) {
          p.x += p.vx + Math.sin(t * 0.001 + p.phase) * 0.18
          p.y += p.vy

          if (mouse.active) {
            const dx = mouse.x - p.x
            const dy = mouse.y - p.y
            const dist = Math.hypot(dx, dy)
            if (dist < 170 && dist > 1) {
              const force = (1 - dist / 170) * 0.045
              p.x += dx * force
              p.y += dy * force
            }
          }

          if (p.y < -12) {
            p.y = h + 12
            p.x = Math.random() * w
          }
          if (p.x < -12) p.x = w + 12
          if (p.x > w + 12) p.x = -12
        }

        const pulse = 0.7 + 0.3 * Math.sin(t * 0.003 + p.phase)
        ctx.globalAlpha = p.alpha * pulse
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()

        // Constellation lines to nearby particles & cursor
        if (mouse.active) {
          const md = Math.hypot(mouse.x - p.x, mouse.y - p.y)
          if (md < 145) {
            ctx.globalAlpha = (1 - md / 145) * 0.42
            ctx.strokeStyle = '#ffd80c'
            ctx.lineWidth = 0.9
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = p.x - q.x, dy = p.y - q.y
          if (dx > 95 || dx < -95 || dy > 95 || dy < -95) continue
          const d2 = dx * dx + dy * dy
          if (d2 < 9025) {
            // fade by distance, quantised into 4 opacity buckets so all lines draw in 4 strokes instead of one each
            const b = Math.min(3, Math.floor((1 - Math.sqrt(d2) / 95) * 4))
            links[b].push(p.x, p.y, q.x, q.y)
          }
        }
      }
      ctx.strokeStyle = '#ffd80c'
      ctx.lineWidth = 0.6
      for (let b = 0; b < 4; b++) {
        const L = links[b]
        if (!L.length) continue
        ctx.globalAlpha = ((b + 0.5) / 4) * 0.16
        ctx.beginPath()
        for (let k = 0; k < L.length; k += 4) { ctx.moveTo(L[k], L[k + 1]); ctx.lineTo(L[k + 2], L[k + 3]) }
        ctx.stroke()
        L.length = 0
      }

      // Click celebratory sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vx *= 0.96
        s.vy = s.vy * 0.96 + 0.05
        s.life -= 0.025
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        ctx.globalAlpha = s.life
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      raf = running ? requestAnimationFrame(tick) : 0
    }

    let visible = false
    let running = false
    const sync = () => {
      const want = visible && !document.hidden
      if (want && !running) { running = true; raf = requestAnimationFrame(tick) }
      else if (!want && running) { running = false; cancelAnimationFrame(raf); raf = 0 }
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() }, { rootMargin: '100px 0px' })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('resize', onResize)
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
      section.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  )
}

/** Per-character 3D perspective flip reveal. (The per-letter blur() filter was removed: animating blur on ~14 large
 *  letters forced a full repaint every frame and made the section stutter while scrolling.) */
function FlipHeadline({ text, className = '', baseDelay = 0 }) {
  return (
    <span className={`inline-flex flex-wrap ${className}`} style={{ perspective: '900px' }}>
      {text.split('').map((ch, idx) => (
        <motion.span
          key={`${text}-${idx}`}
          className="inline-block origin-bottom"
          initial={{ opacity: 0, rotateX: -85, y: 24 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{
            duration: 0.7,
            delay: baseDelay + idx * 0.045,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  )
}

const OTHER_AWARDS = [
  {
    id: 'catalyst-2025',
    title: 'Yuva Collaboration Catalyst Award',
    subtitle: 'For driving impactful youth engagement and championing the spirit of Yi YUVA',
    tenure: '2025 – 2026',
    awardedBy: 'Yi Chennai · CII',
    venue: 'Student Welfare Office, VIT Chennai & ITC Grand Chola',
    accent: '#ffd80c',
    photos: [
      {
        src: '/img/award-catalyst-college.webp',
        alt: 'Yuva Collaboration Catalyst Award 2025 — Student Welfare Office, VIT Chennai',
        label: 'Student Welfare Office, VIT Chennai',
      },
      {
        src: '/img/award-catalyst-trophy.webp',
        alt: 'Yuva Collaboration Catalyst Award 2025 — Trophy',
        label: 'Award Trophy',
      },
      {
        src: '/img/award-catalyst-chola.webp',
        alt: 'Yuva Collaboration Catalyst Award 2025 — ITC Grand Chola',
        label: 'ITC Grand Chola · Yi Annual Session',
      },
    ],
  },
  {
    id: 'upcoming-2024',
    title: 'Best Upcoming Institute',
    subtitle: 'Recognized at Yuva Felicitation for outstanding chapter growth and campus initiatives',
    tenure: '2024 – 2025',
    awardedBy: 'Yi Chennai · CII',
    venue: 'ITC Grand Chola',
    accent: '#d2e534',
    photos: [
      {
        src: '/img/award-upcoming-stage.webp',
        alt: 'Best Upcoming Institute Award — Yuva Felicitation Stage (2024-2025)',
        label: 'Yuva Felicitation · Stage',
      },
      {
        src: '/img/award-upcoming-chola.webp',
        alt: 'Best Upcoming Institute Award — ITC Grand Chola (2024-2025)',
        label: 'ITC Grand Chola',
      },
    ],
  },
]

function HonorCard({ award, idx, onPhoto }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const current = award.photos[activeIdx] || award.photos[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col overflow-hidden rounded-2xl border border-[#ffd80c]/35 bg-[#16120c]/90 p-4 transition hover:border-[#ffd80c]"
    >
      <button
        type="button"
        onClick={() => onPhoto && onPhoto(award.photos, activeIdx)}
        className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#ffd80c]/25 bg-[#1d1810] text-left focus:outline-none"
        aria-label={`View ${award.title} photos`}
      >
        <img
          {...imgProps(current.src, '(min-width: 768px) 45vw, 100vw')}
          alt={current.alt}
          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3.5">
          <span
            className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink"
            style={{ background: award.accent }}
          >
            {award.tenure}
          </span>
          <span className="truncate whitespace-nowrap rounded-full border border-parchment/40 bg-black/55 px-2.5 py-1 font-mono text-[10px] text-parchment backdrop-blur-sm transition group-hover:border-[#ffd80c] group-hover:text-[#ffd80c]">
            {current.label} · View ({award.photos.length})
          </span>
        </div>
      </button>

      {/* Thumbnail strip */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {award.photos.map((p, pIdx) => {
          const isSelected = pIdx === activeIdx
          return (
            <button
              key={p.src}
              type="button"
              onClick={() => setActiveIdx(pIdx)}
              className={`group/thumb relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-[#1d1810] transition ${isSelected
                ? 'border-[#ffd80c] ring-1 ring-[#ffd80c]'
                : 'border-parchment/20 opacity-65 hover:opacity-100'
                }`}
              title={p.label}
              aria-label={`Preview ${p.label}`}
            >
              <img {...imgProps(p.src, '160px')} alt={p.alt} className="h-full w-full object-cover object-top" />
            </button>
          )
        })}
      </div>

      {/* Award details */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-bone/75"
          >
            <span style={{ color: award.accent }}>{award.awardedBy}</span>
            <span>•</span>
            <span>{award.venue}</span>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.18 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="display-md mt-1 text-xl text-parchment transition-colors duration-300 hover:text-[#2dd4bf] md:text-2xl"
          >
            {award.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.25 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-1 text-xs leading-relaxed text-bone/80"
          >
            {award.subtitle}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Award({ onPhoto }) {
  const [imgError, setImgError] = useState(false)
  const photo = {
    src: '/img/best-club-award.webp',
    alt: 'YUVA VIT Chennai — Best Club Award in Social & Outreach Category (2025-2026)',
    label: 'Best Club Award · 2025–2026',
  }

  // 3D magnetic tilt on the award photo frame
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 180, damping: 20 })

  const handleCardMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleCardLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section
      id="award"
      className="relative isolate overflow-hidden border-t border-b border-ink bg-[#0d0b08] py-20 text-parchment md:py-28"
    >
      {/* Unique interactive golden starlight constellation background */}
      <AwardField />

      {/* Subtle radial spotlight */}
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(circle at 72% 45%, rgba(255, 216, 12, 0.18), transparent 54%), radial-gradient(circle at 18% 80%, rgba(210, 229, 52, 0.1), transparent 45%)',
        }}
      />

      {/* Top prestigious gold ticker bar */}
      <div className="mb-14 border-y border-[#ffd80c]/35 bg-[#ffd80c] py-2 text-[#0d0b08]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
          <span>★ Prestigious Honors</span>
          <span>•</span>
          <span>Best Club Award (2025–2026)</span>
          <span>•</span>
          <span>Yuva Collaboration Catalyst Award (2025–2026)</span>
          <span>•</span>
          <span>Best Upcoming Institute (2024–2025) ★</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        {/* Floating Sticker */}
        <Sticker
          kind="burst"
          color={FIC.lime}
          textColor="#000"
          shouts={['Best Club!', 'No. 1', 'Social & Outreach', '2025–2026']}
          rot={-9}
          size="clamp(76px,10vw,144px)"
          className="right-[4%] -top-4 md:right-[6%] md:-top-6"
        />

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Left Column — New 3D Flip + Shimmer Typography */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#ffd80c]/50 bg-[#ffd80c]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#ffd80c]"
            >
              <motion.svg
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
              </motion.svg>
              <span>VIT Chennai · 2025–2026 Tenure</span>
            </motion.div>

            <h2 className="display-md leading-[0.88] tracking-[-0.04em]">
              <span className="block text-[clamp(48px,7.6vw,112px)] text-parchment">
                <FlipHeadline text="Best Club" baseDelay={0.05} />
              </span>

              {/* Metallic Gold Shimmer "Award" */}
              <span className="relative block text-[clamp(54px,8.2vw,122px)]">
                <FlipHeadline
                  text="Award"
                  baseDelay={0.28}
                  className="text-[#ffd80c] [text-shadow:0_0_28px_rgba(255,216,12,0.5)]"
                />
              </span>

              {/* Kinetic tracking-contracting "Social & Outreach" */}
              <motion.span
                className="block pt-2 text-[clamp(32px,5vw,70px)] text-[#d2e534]"
                initial={{ opacity: 0, letterSpacing: '0.18em', x: -16 }}
                whileInView={{ opacity: 1, letterSpacing: '-0.03em', x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                Social &amp; Outreach
              </motion.span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.75, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-bone/90 md:text-xl"
            >
              Recognized as the{' '}
              <span className="font-semibold text-[#ffd80c]">Best Club in the Social &amp; Outreach Category</span>{' '}
              at VIT Chennai — a milestone honoring a year of relentless community impact, inclusive outreach,
              and purpose-driven student leadership.
            </motion.p>

            {/* Three Highlight Pills */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { k: 'Category', v: 'Social & Outreach', accent: '#ffd80c' },
                { k: 'Awarded By', v: 'VIT Chennai', accent: '#d2e534' },
                { k: 'Tenure', v: '2025 – 2026', accent: '#ffb4a2' },
              ].map((item, idx) => (
                <motion.div
                  key={item.k}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: 0.65 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3, borderColor: item.accent }}
                  className="rounded-xl border border-parchment/20 bg-parchment/[0.04] px-4 py-3.5 transition"
                >
                  <p className="eyebrow text-[10px]" style={{ color: item.accent }}>
                    {item.k}
                  </p>
                  <p className="mt-1 font-sans text-sm font-bold text-parchment">{item.v}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column — 3D Tilt Framed Showcase Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className="relative"
          >
            <motion.button
              type="button"
              onClick={() => !imgError && onPhoto && onPhoto([photo], 0)}
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="group relative block w-full overflow-hidden rounded-2xl border-2 border-[#ffd80c] bg-[#16120c] p-3 text-left shadow-[10px_10px_0px_#ffd80c] focus:outline-none"
              aria-label="View Best Club Award photo"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#ffd80c]/40 bg-[#1d1810]">
                {!imgError ? (
                  <img
                    {...imgProps(photo.src, '(min-width: 1024px) 560px, 100vw')}
                    alt={photo.alt}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                    <svg className="mb-3 h-16 w-16 text-[#ffd80c]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                    </svg>
                    <p className="display-md text-2xl text-[#ffd80c]">Best Club Award</p>
                    <p className="mt-1 font-mono text-xs text-bone/70">Social &amp; Outreach · 2025–2026</p>
                  </div>
                )}

                {/* Diagonal gold sheen sweep on hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                {/* Bottom gradient + badge */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                  <div>
                    <span className="inline-block rounded-full bg-[#ffd80c] px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                      2025–2026 Tenure
                    </span>
                    <p className="mt-1.5 font-sans text-sm font-semibold text-parchment">
                      Best Club — Social &amp; Outreach Category
                    </p>
                  </div>
                  {!imgError && (
                    <span className="rounded-full border border-parchment/40 bg-black/50 px-3 py-1 font-mono text-[10px] text-parchment backdrop-blur-sm transition group-hover:border-[#ffd80c] group-hover:text-[#ffd80c]">
                      Click to view
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Featured Yi & Chapter Awards */}
        <div className="mt-14 border-t border-[#2dd4bf]/25 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="eyebrow text-[#2dd4bf]"
              >
                Yi Chennai &amp; Chapter Recognitions
              </motion.p>
              <h3 className="display-md mt-1 text-3xl text-parchment md:text-4xl">
                <FlipHeadline text="More Featured" baseDelay={0.05} />{' '}
                <FlipHeadline text="Awards" baseDelay={0.28} className="text-[#2dd4bf]" />
              </h3>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs text-bone/70"
            >
              Select any thumbnail or click a photo to inspect full gallery
            </motion.p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {OTHER_AWARDS.map((award, idx) => (
              <HonorCard key={award.id} award={award} idx={idx} onPhoto={onPhoto} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
