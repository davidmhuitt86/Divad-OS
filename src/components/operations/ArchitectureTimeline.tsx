import { Check, Circle } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

const AP_LABELS = ['Foundation', 'Core Engine', 'Knowledge Graph', 'Divad OS', 'EKE Modules']

interface Props {
  objects: EKEObject[]
  currentAPId: string | null
  onViewRoadmap?: () => void
  onViewAllMilestones?: () => void
}

export default function ArchitectureTimeline({ objects, currentAPId, onViewRoadmap, onViewAllMilestones }: Props) {
  const aps = objects.filter(o => o.type === 'architecture_phase')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))

  // Build display phases — use real APs if they exist, pad with placeholders
  const phases = AP_LABELS.map((fallbackLabel, i) => {
    const real = aps[i]
    return {
      id: real?.id ?? `placeholder-${i}`,
      label: real ? real.title.replace(/AP-0*\d+\s*/i, '').trim() || fallbackLabel : fallbackLabel,
      apNum: real ? `AP-${String(i + 1).padStart(3, '0')}` : `AP-${String(i + 1).padStart(3, '0')}`,
      isActive: real?.id === currentAPId,
      isComplete: real?.status === 'approved' || real?.status === 'published',
      hasData: !!real,
      progress: real?.id === currentAPId ? (real?.metadata as Record<string, unknown>)?.progress as number ?? 0 : 0,
    }
  })

  const hasAPs = aps.length > 0

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>Architecture Timeline</span>
        <button onClick={onViewRoadmap} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View Roadmap</button>
      </div>

      {!hasAPs ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, fontSize: 11, color: '#2a3042', flexDirection: 'column', gap: 6 }}>
          <Circle size={18} />
          <span>No Architecture Phases defined</span>
        </div>
      ) : (
        <div style={{ padding: '16px 14px' }}>
          {/* Timeline bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#1a1e28', transform: 'translateY(-50%)', zIndex: 0 }} />
            {phases.map((phase, i) => (
              <div key={phase.id} style={{ flex: 1, display: 'flex', justifyContent: i === 0 ? 'flex-start' : i === phases.length - 1 ? 'flex-end' : 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: phase.isComplete ? '#22c55e' : phase.isActive ? '#3b82f6' : '#1a1e28',
                  border: `2px solid ${phase.isComplete ? '#22c55e' : phase.isActive ? '#3b82f6' : '#222736'}`,
                  boxShadow: phase.isActive ? '0 0 10px rgba(59,130,246,0.4)' : 'none',
                }}>
                  {phase.isComplete ? <Check size={11} color="#fff" /> : (
                    <span style={{ fontSize: 9, fontWeight: 700, color: phase.isActive ? '#fff' : '#475569' }}>{i + 1}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Labels */}
          <div style={{ display: 'flex' }}>
            {phases.map((phase, i) => (
              <div key={phase.id} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === phases.length - 1 ? 'right' : 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: phase.isActive ? '#3b82f6' : phase.hasData ? '#94a3b8' : '#2a3042' }}>{phase.apNum}</div>
                <div style={{ fontSize: 10, color: phase.isActive ? '#e2e8f0' : '#475569', marginTop: 1 }}>{phase.label}</div>
                <div style={{ fontSize: 9, color: phase.isActive ? '#3b82f6' : '#2a3042', marginTop: 1 }}>
                  {phase.isActive ? `${phase.progress}%` : phase.isComplete ? '100%' : '0%'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Milestones */}
      <div style={{ borderTop: '1px solid #1a1e28', padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>Upcoming Milestones</span>
          <button onClick={onViewAllMilestones} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
        </div>
        <UpcomingMilestones objects={objects} />
      </div>
    </div>
  )
}

function UpcomingMilestones({ objects }: { objects: EKEObject[] }) {
  const milestones = objects
    .filter(o => o.type === 'apm' || (o.type === 'task' && o.priority === 'critical'))
    .slice(0, 3)

  if (milestones.length === 0) {
    return <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No upcoming milestones</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {milestones.map(m => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#475569' }}>›</span>
          <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{m.title}</span>
          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>
            {new Date(m.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  )
}
