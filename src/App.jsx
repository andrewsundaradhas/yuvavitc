import { lazy, useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { events } from './data'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Award from './components/Award'
// Deferred sections: their code is off the critical path; after load + idle it is prefetched (download + parse only),
// so scrolling never waits on a chunk. Mounting still happens near the viewport (Deferred).
const loaders = { about: () => import('./components/About'), tide: () => import('./components/Tide'), prints: () => import('./components/PrintTable'), gallery: () => import('./components/Gallery') }
const About = lazy(loaders.about)
const Tide = lazy(loaders.tide)
const PrintTable = lazy(loaders.prints)
import Marquee from './components/Marquee'
import Events from './components/Events'
import EventModal from './components/EventModal'
import Domains from './components/Domains'
import Team from './components/Team'
const Gallery = lazy(loaders.gallery)
import Lightbox from './components/Lightbox'
import Footer from './components/Footer'
import Queries from './components/Queries'
import Preloader from './components/Preloader'
import Deferred, { whenQuiet } from './components/Deferred'
import { installAnchorSettle } from './lib/anchorSettle'

// The intro plays on the first visit only (D-006); "Replay intro" in the footer still plays it on demand.
const INTRO_SEEN = 'yuva:intro-seen'
const introSeen = () => { try { return localStorage.getItem(INTRO_SEEN) === '1' } catch { return false } }
const markIntroSeen = () => { try { localStorage.setItem(INTRO_SEEN, '1') } catch { /* private mode: intro just plays again */ } }

export default function App() {
  const [intro, setIntro] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !window.location.search.includes('nointro') && !introSeen())
  const [ready, setReady] = useState(!intro)
  const [heroKey, setHeroKey] = useState(0)
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const [box, setBox] = useState(null) // { photos, index }

  const nav = useCallback((d) => setActive((e) => events[(events.findIndex((x) => x.n === e.n) + d + events.length) % events.length]), [])
  const close = useCallback(() => setActive(null), [])
  const onReady = useCallback(() => setReady(true), [])
  const onDone = useCallback(() => setIntro(false), [])
  useEffect(() => { if (intro) markIntroSeen() }, [intro]) // seen as soon as it starts: a quick reload never replays it
  useEffect(() => installAnchorSettle(), [])
  useEffect(() => {
    // Background work, one job per quiet moment (no input for 1.2 s) so none of it lands mid-scroll: Prints' chunk
    // (three.js, 558 KB to evaluate), its ~240 ms fold simulation, then the gallery chunk. About/Tide/Prints themselves
    // idle-mount via Deferred idleAfter.
    let cancel = () => {}, id
    let printsMod
    const queue = [() => loaders.prints().then((m) => { printsMod = m }), () => printsMod?.warmPrints?.(), loaders.gallery]
    const next = () => { const job = queue.shift(); if (job) cancel = whenQuiet(() => { Promise.resolve().then(job).catch(() => {}).finally(next) }) }
    const go = () => { id = setTimeout(next, 2500) } // after the hero entrance (~2 s): background work must not compete with it
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true })
    return () => { clearTimeout(id); cancel(); window.removeEventListener('load', go) }
  }, [])
  const replay = () => { window.scrollTo(0, 0); setReady(false); setHeroKey((k) => k + 1); setIntro(true) }

  return (
    <>
      {intro && <Preloader onReady={onReady} onDone={onDone} />}
      <Nav />
      <main>
        {/* Hero mounts immediately (under the preloader) so its images/layout load during the intro; entrance plays on reveal */}
        <Hero key={heroKey} play={ready} onPick={setFilter} />
        <Marquee />
        <Intro />
        <Award onPhoto={(photos, index) => setBox({ photos, index })} />
        <Deferred id="about" idleAfter={2500} className="h-[1150px] bg-[#ffd80c] md:h-[1040px] xl:h-[1216px]"><About /></Deferred>
        <Events filter={filter} setFilter={setFilter} onOpen={setActive} />
        <Domains onPick={setFilter} />
        <Team />
        <Deferred idleAfter={2500} className="h-[772px] bg-[#050505] md:h-[707px] xl:h-[828px]"><Tide /></Deferred>
        <Deferred id="prints" idleAfter={2500} className="h-[1540px] bg-[#8a53ff] md:h-[935px] xl:h-[994px]"><PrintTable /></Deferred>
        <Deferred id="gallery" className="h-[761px] bg-[#050505] md:h-[942px] xl:h-[972px]"><Gallery onPhoto={(photos, index) => setBox({ photos, index })} /></Deferred>
        <Queries />
      </main>
      <Footer onReplay={replay} />
      <AnimatePresence>
        {active && <EventModal event={active} onClose={close} onNav={nav} onPhoto={(photos, index) => setBox({ photos, index })} />}
      </AnimatePresence>
      <AnimatePresence>
        {box && <Lightbox photos={box.photos} index={box.index} setIndex={(index) => setBox({ ...box, index })} onClose={() => setBox(null)} />}
      </AnimatePresence>
    </>
  )
}
