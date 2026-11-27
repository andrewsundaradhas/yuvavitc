// Perforated postage-stamp seal with Yuva logo
export default function Stamp({ className = '' }) {
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label="Yuva VIT Chennai seal">
      <rect x="4" y="4" width="192" height="232" rx="11" fill="#e2dedb" stroke="#1d1d1b" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
      <rect x="14" y="14" width="172" height="212" rx="6" fill="none" stroke="#1d1d1b" strokeWidth="1" />
      <image href="/images/yuva-logo-original.jpg" x="28" y="26" width="144" height="142" preserveAspectRatio="xMidYMid meet" />
      <g fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="600" letterSpacing="1.5" fill="#1d1d1b">
        <text x="28" y="198">YUVA</text><text x="172" y="198" textAnchor="end">VIT</text>
        <text x="28" y="214">CHENNAI</text><text x="172" y="214" textAnchor="end">MAGAZINE</text>
      </g>
    </svg>
  )
}
