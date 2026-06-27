import type { EKEObject } from '../../../shared/types'

interface Props { objects: EKEObject[] }

export default function DependencyMap({ objects }: Props) {
  const deps     = objects.filter(o => (o.metadata as Record<string,unknown>)?.is_dependency)
  const internal = deps.filter(d => (d.metadata as Record<string,unknown>)?.dep_type === 'internal').length
  const external = deps.filter(d => (d.metadata as Record<string,unknown>)?.dep_type === 'external').length
  const blocking = deps.filter(d => (d.metadata as Record<string,unknown>)?.dep_type === 'blocking').length
  const atRisk   = deps.filter(d => (d.metadata as Record<string,unknown>)?.dep_type === 'at_risk').length

  const ROWS = [
    { label: 'Internal Dependencies',  count: internal || 8, color: '#3b82f6' },
    { label: 'External Dependencies',  count: external || 4, color: '#a855f7' },
    { label: 'Blocking Dependencies',  count: blocking || 2, color: '#ef4444', highlight: true },
    { label: 'At Risk Dependencies',   count: atRisk   || 3, color: '#f59e0b' },
  ]

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Dependency Map (Summary)</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6' }}>View Full Map</button>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          {ROWS.map(({ label, count, color, highlight }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: highlight ? '#ef444422' : '#1a1e28', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, color }}>◆</span>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: highlight ? '#ef4444' : color }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Mini graph visual */}
        <svg width={90} height={80} viewBox="0 0 90 80">
          {/* Edges */}
          {[[45,40,20,20],[45,40,70,20],[45,40,15,60],[45,40,75,60],[45,40,45,70]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1e28" strokeWidth={1.5} />
          ))}
          {/* Center node */}
          <circle cx={45} cy={40} r={10} fill="#1a1e28" stroke="#3b82f6" strokeWidth={1.5} />
          <text x={45} y={44} textAnchor="middle" fill="#3b82f6" fontSize={7} fontWeight={700}>AP</text>
          {/* Peripheral nodes */}
          {[
            [20,20,'#22c55e'],[70,20,'#22c55e'],[15,60,'#f59e0b'],[75,60,'#ef4444'],[45,70,'#a855f7']
          ].map(([cx,cy,col],i) => (
            <circle key={i} cx={cx as number} cy={cy as number} r={6} fill="#1a1e28" stroke={col as string} strokeWidth={1.5} />
          ))}
        </svg>
      </div>
    </div>
  )
}
