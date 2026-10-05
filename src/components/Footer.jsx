export default function Footer({ onReplay }) {
  return (
    <footer className="border-t border-ink bg-parchment px-5 py-8 md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-2">
        <div>
          <img src="/images/yuva-logo.png" alt="Yuva — Learning Beyond Education" className="mb-3 h-24 w-auto" />
          <p className="nameplate text-4xl leading-none md:text-5xl">Yuva VIT Chennai</p>
        </div>
        <div className="md:text-right">
          <p>Event Magazine</p>
          <p className="text-charcoal">All Rights Reserved</p>
          <button onClick={onReplay} className="eyebrow mt-3 underline underline-offset-4 hover:text-ember">Replay intro</button>
        </div>
      </div>
    </footer>
  )
}
