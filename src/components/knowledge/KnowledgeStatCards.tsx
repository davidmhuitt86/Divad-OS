import type { EKEObject } from '../../../shared/types'


interface Props { objects: EKEObject[] }

export default function KnowledgeStatCards({ objects }: Props) {
  const kObjs    = objects.filter(o => o.type === 'knowledge_object')
  const docs     = objects.filter(o => o.type === 'document')
  const total    = objects.length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, flexShrink: 0 }}>
      <StatCard label="Knowledge Objects" value={total > 0 ? total.toLocaleString() : 'â€”'} delta="+128 this week" color="#a855f7" icon="â—ˆ" />
      <StatCard label="Concepts (Nodes)"  value="â€”" delta="+74 this week"  color="#3b82f6" icon="â¬¡" />
      <StatCard label="Relationships (Edges)" value="â€”" delta="+312 this week" color="#06b6d4" icon="â¤¢" />
      <StatCard label="Sources"           value="â€”" delta="+9 this week"   color="#f59e0b" icon="ðŸ“–" />
      <StatCard label="Avg. Confidence"   value="â€”" delta="â†‘4% this week"  color="#22c55e" icon="%" ring />
      {/* Health */}
      <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Knowledge Health</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>Good</div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>Stable</div>
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, color, icon, ring }: {
  label: string; value: string; delta: string; color: string; icon: string; ring?: boolean
}) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 9, color: '#22c55e', marginTop: 4 }}>{delta}</div>
      </div>
      {ring ? (
        <svg width={38} height={38} viewBox="0 0 38 38">
          <circle cx={19} cy={19} r={15} fill="none" stroke="#1a1e28" strokeWidth={3} />
          <circle cx={19} cy={19} r={15} fill="none" stroke={color} strokeWidth={3}
            strokeDasharray={`${2*Math.PI*15*0.92} ${2*Math.PI*15}`} strokeDashoffset={2*Math.PI*15*0.25} strokeLinecap="round" />
          <text x={19} y={23} textAnchor="middle" fill={color} fontSize={9} fontWeight={700}>92%</text>
        </svg>
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
      )}
    </div>
  )
}

