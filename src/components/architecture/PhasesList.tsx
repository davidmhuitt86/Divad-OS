import { Plus, MoreHorizontal } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

const STATUS_COLOR: Record<string, string> = {
  draft:      '#475569',
  in_review:  '#f59e0b',
  approved:   '#22c55e',
  published:  '#3b82f6',
  archived:   '#2a3042',
}

interface Props {
  phases: EKEObject[]
  activeId: string | null
  onSelect: (ap: EKEObject) => void
  onNewAP?: () => void
  onViewAll?: () => void
}

export default function PhasesList({ phases, activeId, onSelect, onNewAP, onViewAll }: Props) {
  return (
    <div style={{ width: 220, display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Phases (AP)</span>
        <button onClick={onNewAP} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex' }}>
          <Plus size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {phases.length === 0 ? (
          <div style={{ padding: 16, fontSize: 11, color: '#2a3042', textAlign: 'center', fontStyle: 'italic' }}>
            No architecture phases yet.<br />Ask the agent to create AP-001.
          </div>
        ) : (
          phases.map((ap, i) => {
            const apNum = `AP-${String(i + 1).padStart(3, '0')}`
            const isActive = ap.id === activeId
            const progress = (ap.metadata as Record<string, unknown>)?.progress as number ?? 0
            const statusColor = STATUS_COLOR[ap.status] ?? '#475569'
            const statusLabel = ap.status === 'in_review' ? 'In Progress' : ap.status.replace('_', ' ')

            return (
              <button
                key={ap.id}
                onClick={() => onSelect(ap)}
                style={{
                  width: '100%', padding: '10px 14px', textAlign: 'left', border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                  borderBottom: '1px solid #1a1e2866', transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#1a1e28' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#3b82f6' : '#94a3b8' }}>{apNum}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ap.title.replace(/AP-0*\d+\s*/i, '') || ap.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: statusColor }}>{statusLabel}</span>
                      <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>{progress}%</span>
                    </div>
                    {progress > 0 && (
                      <div style={{ marginTop: 5, height: 2, background: '#222736', borderRadius: 1 }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: statusColor, borderRadius: 1 }} />
                      </div>
                    )}
                  </div>
                  <MoreHorizontal size={13} style={{ color: '#2a3042', flexShrink: 0, marginLeft: 4 }} />
                </div>
              </button>
            )
          })
        )}
      </div>

      <div style={{ padding: 10, borderTop: '1px solid #1a1e28' }}>
        <button onClick={onViewAll} style={{ width: '100%', padding: '7px', fontSize: 11, color: '#475569', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, cursor: 'pointer' }}>
          View All Phases
        </button>
      </div>
    </div>
  )
}
