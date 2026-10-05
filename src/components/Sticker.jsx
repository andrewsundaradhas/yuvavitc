import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

export const FIC = { violet: '#8a53ff', coral: '#fd4b38', yellow: '#ffd80c', lime: '#3ccb09', cream: '#ffe9ce' }

const star = (n, ro, ri) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI / n) * i - Math.PI / 2
    const r = i % 2 ? ri : ro
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')

/**
 * Fictional-style die-cut sticker. Drag it, hover to wiggle, tap to make it shout the next line.
 * kind: burst | circle | bubble | label
 */
export function Sticker({ kind = 'burst', color = FIC.coral, textColor = '#fff', shouts = [''], rot = 0, size = 'clamp(120px,15vw,220px)', n = 16, delay = 0, className = '', style, draggable = true }) {
  const [i, setI] = useState(0)
  const bob = useMemo(() => 3 + Math.random() * 2, [])
  const text = shouts[i % shouts.length]
  const ring = kind === 'bubble' || kind === 'label' ? 'shadow-[0_0_0_2px_#ffd80c]' : ''
  const base = 'font-round font-bold leading-[.92] uppercase'

  const body = {
    burst: (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full"><polygon points={star(n, 49, 39)} fill={color} /></svg>
        <motion.span key={i} initial={{ scale: 0.4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }} className={`${base} relative px-3 text-center`} style={{ color: textColor, fontSize: `calc(${size} * .17)` }}>{text}</motion.span>
      </div>
    ),
    circle: (
      <div className="flex items-center justify-center rounded-full text-center" style={{ width: size, height: size, background: color }}>
        <motion.span key={i} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }} className={`${base} px-4`} style={{ color: textColor, fontSize: `calc(${size} * .17)` }}>{text}</motion.span>
      </div>
    ),
    bubble: (
      <div className={`relative rounded-[15px] bg-white px-6 py-4 ${ring}`}>
        <motion.span key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="block font-round text-[clamp(18px,2vw,32px)] font-semibold normal-case text-black">{text}</motion.span>
        <span className="absolute -bottom-3 left-8 h-5 w-6 bg-white [clip-path:polygon(0_0,100%_0,0_100%)]" />
      </div>
    ),
    label: (
      <div className={`rounded-[5px] px-6 py-2 ${ring}`} style={{ background: color }}>
        <motion.span key={i} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }} className={`${base} block whitespace-nowrap text-[clamp(16px,1.8vw,28px)]`} style={{ color: textColor }}>{text}</motion.span>
      </div>
    ),
  }[kind]

  return (
    <motion.div
      data-sticker className={`pointer-events-auto absolute z-20 touch-pan-y select-none ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`} style={style}
      drag={draggable} dragDirectionLock dragMomentum={false} dragElastic={0.25}
      initial={{ scale: 0, rotate: rot - 50, opacity: 0 }} whileInView={{ scale: 1, rotate: rot, opacity: 1 }} viewport={{ once: true, margin: '-60px 0px -60px 0px' }}
      whileHover={{ scale: 1.12, rotate: rot + 6 }} whileTap={{ scale: 0.9 }} whileDrag={{ scale: 1.14, zIndex: 50 }}
      onTap={() => shouts.length > 1 && setI((v) => v + 1)}
      transition={{ type: 'spring', stiffness: 380, damping: 12, delay }}
    >
      <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: bob, repeat: Infinity, ease: 'easeInOut' }}>{body}</motion.div>
    </motion.div>
  )
}

/** A one-shot shout that bursts out of a click point and fades. */
export function Shout({ x, y, text, color, rot, onDone }) {
  return (
    <motion.div className="pointer-events-none absolute z-30" style={{ left: x, top: y, x: '-50%', y: '-50%' }}
      initial={{ scale: 0, rotate: rot - 40, opacity: 1 }} animate={{ scale: [0, 1.25, 1], rotate: rot, opacity: [1, 1, 1, 0], y: ['-50%', '-50%', '-50%', '-150%'] }}
      transition={{ duration: 1.3, times: [0, 0.2, 0.4, 1], ease: 'easeOut' }} onAnimationComplete={onDone}>
      <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full"><polygon points={star(14, 49, 38)} fill={color} /></svg>
        <span className="relative font-round text-[26px] font-bold uppercase leading-none" style={{ color: color === FIC.yellow || color === FIC.lime ? '#000' : '#fff' }}>{text}</span>
      </div>
    </motion.div>
  )
}
