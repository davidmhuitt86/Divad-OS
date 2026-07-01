import { Share2 } from 'lucide-react'

// Knowledge Graph — placeholder only per AP-002 Milestone 4. No graph
// engine (Neo4j / rendering library) is wired up yet; this is a static
// illustrative diagram, not real data.
export default function Graph() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d0f14', padding: '14px 16px 16px', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Share2 size={18} style={{ color: '#3b82f6' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Knowledge Graph</h1>
      </div>

      <div style={{ flex: 1, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Knowledge Graph Preview</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 520 260" width="520" height="260">
            <g fontFamily="Inter, sans-serif" fontSize="10" fill="#94a3b8">
              <line x1="130" y1="40"  x2="260" y2="90"  stroke="#2a3042" strokeWidth="1.5" />
              <line x1="260" y1="90"  x2="140" y2="150" stroke="#2a3042" strokeWidth="1.5" />
              <line x1="260" y1="90"  x2="260" y2="150" stroke="#2a3042" strokeWidth="1.5" />
              <line x1="260" y1="90"  x2="380" y2="150" stroke="#2a3042" strokeWidth="1.5" />
              <line x1="260" y1="150" x2="260" y2="210" stroke="#2a3042" strokeWidth="1.5" strokeDasharray="3,3" />

              <rect x="60"  y="20"  width="140" height="34" rx="6" fill="#1e3a8a33" stroke="#3b82f6" />
              <text x="130" y="41" textAnchor="middle" fill="#e2e8f0" fontWeight="600">2002 Dodge Ram 1500</text>

              <rect x="190" y="72"  width="140" height="34" rx="6" fill="#1e3a8a33" stroke="#3b82f6" />
              <text x="260" y="93" textAnchor="middle" fill="#e2e8f0" fontWeight="600">4.7L Magnum V8 Engine</text>

              <rect x="70"  y="132" width="110" height="34" rx="6" fill="#5b21b633" stroke="#a855f7" />
              <text x="125" y="153" textAnchor="middle" fill="#e2e8f0">PCM</text>

              <rect x="200" y="132" width="120" height="34" rx="6" fill="#5b21b633" stroke="#a855f7" />
              <text x="260" y="153" textAnchor="middle" fill="#e2e8f0">Transmission</text>

              <rect x="330" y="132" width="150" height="34" rx="6" fill="#5b21b633" stroke="#a855f7" />
              <text x="405" y="153" textAnchor="middle" fill="#e2e8f0">Connector C104</text>

              <rect x="190" y="194" width="140" height="34" rx="6" fill="#f59e0b22" stroke="#f59e0b" />
              <text x="260" y="215" textAnchor="middle" fill="#fbbf24">Compression Cyl. 4 — 0 PSI</text>
            </g>
          </svg>
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1e28', display: 'flex', gap: 14, fontSize: 10, color: '#475569' }}>
          <LegendDot color="#3b82f6" label="Vehicle / Engine" />
          <LegendDot color="#a855f7" label="Component" />
          <LegendDot color="#f59e0b" label="Measurement / Issue" />
        </div>
      </div>

      <div style={{ fontSize: 10, fontStyle: 'italic', color: '#2a3042', flexShrink: 0 }}>
        Graph rendering engine (Neo4j) not implemented yet — this is a static illustrative preview.
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} /> {label}
    </span>
  )
}
