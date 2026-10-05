import { domains } from '../data'

export default function Marquee() {
  const row = Object.values(domains)
  return (
    <div className="overflow-hidden bg-ember py-3 text-parchment" aria-hidden="true">
      <div className="marquee flex w-max gap-8 whitespace-nowrap">
        {[...row, ...row, ...row, ...row].map((d, i) => (
          <span key={i} className="display-md flex items-center gap-8 text-3xl uppercase">{d.name} <span>✦</span></span>
        ))}
      </div>
    </div>
  )
}
