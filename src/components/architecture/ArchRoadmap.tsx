import type { EKEObject } from '../../../shared/types'

interface Props { phases: EKEObject[] }

const PLACEHOLDER_PHASES = [
  { id: 'p1', label: 'AP-001', name: 'Foundation Architecture',      start: 'May 1',   end: 'May 30, 2025',  pct: 68, color: '#3b82f6' },
  { id: 'p2', label: 'AP-002', name: 'Core Engine Architecture',     start: 'May 31',  end: 'Jun 30, 2025',  pct: 0,  color: '#475569' },
  { id: 'p3', label: 'AP-003', name: 'Knowledge Graph Architecture', start: 'Jul 1',   end: 'Jul 31, 2025',  pct: 0,  color: '#475569' },
  { id: 'p4', label: 'AP-004', name: 'Divad OS Architecture',        start: 'Aug 1',   end: 'Aug 31, 2025',  pct: 0,  color: '#475569' },
  { id: 'p5', label: 'AP-005', name: 'EKE Modules Architecture',     start: 'Sep 1',   end: 'Sep 30, 2025',  pct: 0,  color: '#475569' },
]

export default function ArchRoadmap({ phases }: Props) {
  const data = phases.length > 0
    ? phases.map((ap, i) => ({
        id: ap.id,
        label: `AP-${String(i+1).padStart(3,'0')}`,
        name: ap.title.replace(/AP-0*\d+\s*/i,'') || ap.title,
        start: new Date(ap.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
        end:   new Date(ap.updated_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
        pct:   (ap.metadata as Record<string,unknown>)?.progress as number ?? 0,
        color: ap.status === 'in_review' ? '#3b82f6' : ap.status === 'approved' ? '#22c55e' : '#475569',
      }))
    : PLACEHOLDER_PHASES

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Architecture Roadmap</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6' }}>View Full Roadmap</button>
      </div>
      <div style={{ padding: '12px 14px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 12, minWidth: 600 }}>
          {data.map(ap => (
            <div key={ap.id} style={{ flex: 1, minWidth: 100 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ap.color, marginBottom: 2 }}>{ap.label}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, lineHeight: 1.3 }}>{ap.name}</div>
              <div style={{ fontSize: 9, color: '#2a3042', marginBottom: 2 }}>{ap.start} — {ap.end}</div>
              <div style={{ height: 3, background: '#1a1e28', borderRadius: 2, marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${ap.pct}%`, background: ap.color, borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${ap.color}`, background: ap.pct > 0 ? ap.color : 'transparent' }} />
                <span style={{ fontSize: 9, color: '#475569' }}>{ap.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
