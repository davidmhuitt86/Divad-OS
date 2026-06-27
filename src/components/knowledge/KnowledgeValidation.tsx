import { ArrowRight } from 'lucide-react'

const SEGMENTS = [
  { label: 'Validated',    count: 8732, pct: 69, color: '#22c55e' },
  { label: 'Pending',      count: 1248, pct: 10, color: '#f59e0b' },
  { label: 'Needs Review', count: 1892, pct: 15, color: '#a855f7' },
  { label: 'Conflicting',  count:  689, pct:  6, color: '#ef4444' },
]

export default function KnowledgeValidation() {
  const R = 52; const CX = 70; const CY = 70; const CIRC = 2 * Math.PI * R
  let offset = CIRC * 0.25

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Knowledge Validation</span>
      </div>
      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Donut */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={140} height={140} viewBox="0 0 140 140">
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1a1e28" strokeWidth={14} />
            {SEGMENTS.map(s => {
              const dash = CIRC * s.pct / 100
              const el = <circle key={s.label} cx={CX} cy={CY} r={R} fill="none" stroke={s.color} strokeWidth={13}
                strokeDasharray={`${dash} ${CIRC}`} strokeDashoffset={offset} strokeLinecap="butt" />
              offset -= dash
              return el
            })}
            <text x={CX} y={CY - 4} textAnchor="middle" fill="#e2e8f0" fontSize={18} fontWeight={700}>1,248</text>
            <text x={CX} y={CY + 12} textAnchor="middle" fill="#475569" fontSize={9}>Pending</text>
          </svg>
        </div>
        {/* Legend */}
        <div style={{ flex: 1 }}>
          {SEGMENTS.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{s.count.toLocaleString()}</span>
              <span style={{ fontSize: 9, color: '#475569', width: 28, textAlign: 'right' }}>({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '8px 12px', borderTop: '1px solid #1a1e28' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
          Go to Validation Center <ArrowRight size={10} />
        </button>
      </div>
    </div>
  )
}
