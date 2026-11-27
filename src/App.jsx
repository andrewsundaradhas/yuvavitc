import { lazy, Suspense, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { events } from './data'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Award from './components/Award'
const About = lazy(() => import('./components/About'))
const Tide = lazy(() => import('./components/Tide'))
const PrintTable = lazy(() => import('./components/PrintTable'))
import Marquee from './components/Marquee'
import Events from './components/Events'
import EventModal from './components/EventModal'
import Domains from './components/Domains'
import Team from './components/Team'
const Gallery = lazy(() => import('./components/Gallery'))
import Lightbox from './components/Lightbox'
import Footer from './components/Footer'
import Queries from './components/Queries'
import Preloader from './components/Preloader'

export default function App() {
  const [intro, setIntro] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !window.location.search.includes('nointro'))
  const [ready, setReady] = useState(!intro)
  const [heroKey, setHeroKey] = useState(0)
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const [box, setBox] = useState(null) // { photos, index }

  const nav = useCallback((d) => setActive((e) => events[(events.findIndex((x) => x.n === e.n) + d + events.length) % events.length]), [])
  const close = useCallback(() => setActive(null), [])
  const onReady = useCallback(() => setReady(true), [])
  const onDone = useCallback(() => setIntro(false), [])
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
        <Suspense fallback={<div className="min-h-[600px] bg-[#ffd80c]" />}>
          <About />
        </Suspense>
        <Events filter={filter} setFilter={setFilter} onOpen={setActive} />
        <Domains onPick={setFilter} />
        <Team />
        <Suspense fallback={<div className="min-h-[88svh] bg-[#050505]" />}>
          <Tide />
        </Suspense>
        <Suspense fallback={<div className="min-h-[700px]" />}>
          <PrintTable />
        </Suspense>
        <Suspense fallback={<div className="min-h-[700px] bg-[#050505]" />}>
          <Gallery onPhoto={(photos, index) => setBox({ photos, index })} />
        </Suspense>
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
