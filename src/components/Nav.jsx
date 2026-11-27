import { motion, useScroll, useSpring } from 'framer-motion'
import { StaggeredMenu } from './ui/StaggeredMenu'

const items = [
  { label: 'Home', ariaLabel: 'Back to the top', link: '#top' },
  { label: 'Awards & Honors', ariaLabel: 'Club awards and honors', link: '#award' },
  { label: 'About', ariaLabel: 'About Yuva VIT Chennai', link: '#about' },
  { label: 'Events', ariaLabel: 'See all sixteen events', link: '#events' },
  { label: 'Domains', ariaLabel: 'Browse the seven domains', link: '#domains' },
  { label: 'Meet the Team', ariaLabel: 'Meet the team and core reveal', link: '#team' },
  { label: 'Prints', ariaLabel: 'The print table', link: '#prints' },
  { label: 'Gallery', ariaLabel: 'Photo gallery', link: '#gallery' },
  { label: 'Queries', ariaLabel: 'Send us a query', link: '#queries' },
]

const Logo = (
  <a href="#top" className="nameplate flex items-center gap-2 text-[30px] leading-none text-ink md:text-[34px]" aria-label="Yuva VIT Chennai — home">
    <img src="/images/yuva-mark.png" alt="" className="h-8 w-auto" />
    Yuva VIT Chennai
  </a>
)

export default function Nav() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <>
      {/* parchment bar + scroll progress sit under the menu's own header */}
      <div className="fixed inset-x-0 top-0 z-30 h-14 border-b border-ink bg-parchment" aria-hidden="true">
        <motion.div style={{ scaleX }} className="absolute -bottom-px left-0 h-[3px] w-full origin-left bg-ember" />
      </div>
      <StaggeredMenu
        isFixed className="yuva-menu" position="right" logo={Logo}
        items={items} displaySocials={false} displayItemNumbering
        colors={['#ffd80c', '#fd4b38', '#8a53ff']} accentColor="#c03f13"
        menuButtonColor="#1d1d1b" openMenuButtonColor="#1d1d1b" changeMenuColorOnOpen={false}
      />
    </>
  )
}
