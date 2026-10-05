import { motion } from 'framer-motion'

// Mixed-weight headlines: wrap the quiet clause in <span className="opacity-35">
export default function SectionHead({ label, title, children, dark = false }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mb-10 grid gap-6 md:mb-14 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className={`eyebrow mb-4 ${dark ? 'text-teal' : 'text-ember'}`}>{label}</p>
        <h2 className={`display-md text-[clamp(52px,8vw,122px)] leading-[.82] tracking-[-0.05em] ${dark ? 'text-parchment' : ''}`}>{title}</h2>
      </div>
      {children && <p className={`max-w-xs text-xl ${dark ? 'text-bone' : 'text-charcoal'}`}>{children}</p>}
    </motion.div>
  )
}
