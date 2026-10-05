import { motion } from 'framer-motion'

// Full-bleed ink display banner — the system's signature section break
export default function Banner({ children, size = 'clamp(80px, 21vw, 300px)', glow = false, className = '', stickers }) {
  return (
    <div className={`relative overflow-hidden bg-ink py-8 md:py-12 ${className}`} aria-hidden="false">
      {glow && <div className="teal-wash absolute inset-0" />}
      <motion.div initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="display relative whitespace-nowrap text-center text-parchment" style={{ fontSize: size }}>
        {children}
      </motion.div>
      {stickers}
    </div>
  )
}
