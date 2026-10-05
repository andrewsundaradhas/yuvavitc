// Perforated postage-stamp seal with ember sunburst
export default function Stamp({ className = '' }) {
  const rays = Array.from({ length: 24 })
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label="Yuva VIT Chennai seal">
      <rect x="4" y="4" width="192" height="232" rx="11" fill="#e2dedb" stroke="#1d1d1b" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
      <rect x="14" y="14" width="172" height="212" rx="6" fill="none" stroke="#1d1d1b" strokeWidth="1" />
      <g transform="translate(100 98)" stroke="#c03f13" strokeWidth="5" strokeLinecap="round">
        {rays.map((_, i) => <line key={i} x1="0" y1={i % 2 ? -34 : -30} x2="0" y2={i % 2 ? -62 : -52} transform={`rotate(${i * 15})`} />)}
        <circle r="22" fill="#c03f13" stroke="none" />
      </g>
      <path d="M40 176 q 20 -16 36 -2 t 40 -4 t 44 2" fill="none" stroke="#1d1d1b" strokeWidth="1.5" />
      <g fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="600" letterSpacing="1.5" fill="#1d1d1b">
        <text x="28" y="198">YUVA</text><text x="172" y="198" textAnchor="end">VIT</text>
        <text x="28" y="214">CHENNAI</text><text x="172" y="214" textAnchor="end">MAGAZINE</text>
      </g>
    </svg>
  )
}
