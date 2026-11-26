import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { domains, tenures, team } from '../data'
import MicroSlats from './ui/MicroSlats'
import { Sticker, FIC } from './Sticker'

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 180, damping: 14 }
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
}

function MemberCard({ member, index }) {
  const d = domains[member.domain] || { name: 'Leadership', color: '#ffd80c' }
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, scale: 1.01 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-ink bg-parchment p-3.5 text-ink shadow-[4px_4px_0px_#8a53ff] transition duration-200"
    >
      <div>
        <div className="mb-2.5 flex items-start justify-between gap-1.5">
          <span
            className="pill inline-block px-2.5 py-0.5 text-[10px] font-bold text-ink border border-ink/30"
            style={{ background: member.color || d.color }}
          >
            {member.role}
          </span>
          <span className="font-mono text-[10px] text-charcoal/60">
            #{member.id}
          </span>
        </div>

        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg border border-ink bg-bone">
          <img
            src={member.photo}
            alt={member.name}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        </div>

        <h3 className="display-md text-lg leading-tight text-ink group-hover:text-ember transition sm:text-xl">
          {member.name}
        </h3>
      </div>

      {member.department && (
        <div className="mt-3 border-t border-ink/15 pt-2">
          <p className="eyebrow text-[9px] text-charcoal">Department</p>
          <p className="font-sans text-[11px] font-semibold text-ink line-clamp-1">
            {member.department}
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default function Team() {
  const [tenure, setTenure] = useState('2026-27')

  const filtered = useMemo(() => {
    return team.filter((m) => m.tenure === tenure)
  }, [tenure])

  const faculty = useMemo(() => filtered.filter((m) => m.category === 'Faculty'), [filtered])
  const core = useMemo(() => filtered.filter((m) => m.category !== 'Faculty'), [filtered])

  return (
    <section id="team" className="relative isolate overflow-hidden bg-[#0c0814] py-20 text-parchment md:py-28 border-t border-ink">
      {/* Interactive MicroSlats background — Violet & Lime colorway */}
      <div className="absolute inset-0 -z-10">
        <MicroSlats
          preset="swell"
          color="#8a53ff"
          glintColor="#d2e534"
          backgroundColor="#0c0814"
          slatWidth={9}
          slatHeight={26}
          gap={3}
          roundness={1}
          interactive
          cursorStrength={1.2}
          cursorSize={70}
          swirl={0.5}
          trail={1.8}
          lean={0.6}
          intro
          introDuration={2}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        {/* Floating sticker badge */}
        <Sticker
          kind="burst"
          color={FIC.yellow}
          textColor="#000"
          shouts={['Core Reveal!', 'Meet the team', 'Passion & Action', 'Leaders']}
          rot={8}
          size="clamp(72px,10vw,150px)"
          className="right-[3%] top-[1%] md:right-[5%] md:top-[2%]"
        />

        {/* Animated heading — staggered word reveal */}
        <motion.div
          className="mb-10 grid gap-6 md:mb-14 md:grid-cols-[1fr_auto] md:items-end"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="eyebrow mb-4 text-teal">Core Reveal · Meet The Team</p>
            <motion.h2
              className="display-md leading-[.82] tracking-[-0.05em] text-parchment"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ staggerChildren: 0.18 }}
            >
              {/* Line 1: "The Minds Behind" */}
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block text-[clamp(40px,6vw,96px)] text-parchment"
                  variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  The Minds Behind
                </motion.span>
              </span>
              {/* Line 2: "YUVA" — massive Electric Lime */}
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-[clamp(52px,9vw,130px)] leading-[0.9] text-[#d2e534] drop-shadow-[0_0_30px_rgba(210,229,52,0.6)]"
                  variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  YUVA
                </motion.span>
              </span>
            </motion.h2>
          </div>
          <p className="max-w-xs text-xl text-bone">
            Dedicated student leaders driving initiatives, outreach, and innovation across tenures.
          </p>
        </motion.div>

        {/* Tenure Switcher */}
        <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-parchment/20 pb-8">
          <span className="eyebrow text-parchment/70">Select Tenure:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tenures).map(([k, t]) => {
              const active = tenure === k
              const count = team.filter((m) => m.tenure === k && m.category !== 'Faculty').length
              return (
                <button
                  key={k}
                  onClick={() => setTenure(k)}
                  className={`pill flex items-center gap-2 border px-5 py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 ${active
                      ? 'border-[#d2e534] bg-[#d2e534] text-[#0c0814] shadow-md'
                      : 'border-parchment/30 bg-[#0c0814]/80 text-parchment hover:border-parchment'
                    }`}
                >
                  <span>{t.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${active ? 'bg-[#0c0814] text-[#d2e534]' : 'bg-parchment/15 text-parchment'
                    }`}>
                    {count} Members
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tenure Sections — unified entrance animation across all three tenures */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tenure}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Faculty Coordinators */}
            {faculty.length > 0 && (
              <div className="mb-12">
                <div className="mb-6 flex items-center gap-3">
                  <h3 className="display-md text-2xl text-[#d2e534] sm:text-3xl">
                    Faculty Coordinators
                  </h3>
                  <span className="h-px flex-1 bg-parchment/20" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {faculty.map((member, i) => (
                    <MemberCard key={member.id} member={member} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Core & Board Members */}
            {core.length > 0 && (
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <h3 className="display-md text-2xl text-parchment sm:text-3xl">
                    Board &amp; Core Members
                  </h3>
                  <span className="h-px flex-1 bg-parchment/20" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {core.map((member, i) => (
                    <MemberCard key={member.id} member={member} index={i} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Empty state if no members in a filtered category */}
        {filtered.length === 0 && (
          <div className="my-12 rounded-2xl border-2 border-dashed border-ink/30 bg-bone/50 p-12 text-center">
            <h4 className="display-md text-3xl text-ink/70">No Members Listed Yet</h4>
            <p className="mt-2 font-serif italic text-charcoal">
              Core reveal members for this section will be announced soon.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
