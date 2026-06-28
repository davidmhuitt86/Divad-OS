import { ArrowRight } from 'lucide-react'
import type { EKEObject, ActivityEvent } from '../../../shared/types'
import { useStore } from '../../store'

interface Props {
  objects: EKEObject[]
  activity: ActivityEvent[]
}


export default function ArchRightPanel({ objects, activity }: Props) {
  const { navigateToObjects } = useStore()
  const total     = objects.length
  const completed = objects.filter(o => o.status === 'published' || o.status === 'approved').length
  const inProgress= objects.filter(o => o.status === 'in_review').length
  const planned   = objects.filter(o => o.status === 'draft').length
  const blocked   = 0
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0

  const decisions = objects.filter(o => o.type === 'decision').slice(0, 3)
  const recentAct = activity.slice(0, 4)

  const C = (pct: number) => 2 * Math.PI * 52 * pct / 100
  const CIRC = 2 * Math.PI * 52

  return (
    <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, overflowY: 'auto' }}>
      {/* Architecture Progress */}
      <Panel title="Architecture Progress">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width={70} height={70} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
            <circle cx={60} cy={60} r={52} fill="none" stroke="#1a1e28" strokeWidth={10} />
            {(() => {
              const completedPct = total > 0 ? Math.round(completed/total*100) : 0
              const inProgPct    = total > 0 ? Math.round(inProgress/total*100) : 0
              const plannedPct   = total > 0 ? Math.round(planned/total*100) : 0
              return (<>
                <circle cx={60} cy={60} r={52} fill="none" stroke="#22c55e" strokeWidth={10}
                  strokeDasharray={`${C(completedPct)} ${CIRC}`} strokeDashoffset={CIRC * 0.25} />
                <circle cx={60} cy={60} r={52} fill="none" stroke="#3b82f6" strokeWidth={10}
                  strokeDasharray={`${C(inProgPct)} ${CIRC}`} strokeDashoffset={CIRC * 0.25 - C(completedPct)} />
                <circle cx={60} cy={60} r={52} fill="none" stroke="#475569" strokeWidth={10}
                  strokeDasharray={`${C(plannedPct)} ${CIRC}`} strokeDashoffset={CIRC * 0.25 - C(completedPct) - C(inProgPct)} />
              </>)
            })()}
            <text x={60} y={55} textAnchor="middle" fill="#e2e8f0" fontSize={18} fontWeight={700}>{progress}%</text>
            <text x={60} y={72} textAnchor="middle" fill="#475569" fontSize={9}>Overall</text>
          </svg>
          <div style={{ flex: 1 }}>
            {[
              { label: 'Completed',   color: '#22c55e', pct: total > 0 ? Math.round(completed/total*100) : 0 },
              { label: 'In Progress', color: '#3b82f6', pct: total > 0 ? Math.round(inProgress/total*100) : 0 },
              { label: 'Planned',     color: '#475569', pct: total > 0 ? Math.round(planned/total*100) : 0 },
              { label: 'Blocked',     color: '#ef4444', pct: 0 },
            ].map(({ label, color, pct }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#94a3b8', flex: 1 }}>{label}</span>
                <span style={{ fontSize: 10, color: '#475569' }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Current Focus */}
      <Panel title="Current Focus">
        {objects.filter(o => o.status === 'in_review').length === 0 ? (
          <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No active focus set</div>
        ) : (() => {
          const focus = objects.find(o => o.status === 'in_review')!
          return (
            <>
              <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 700, marginBottom: 4 }}>
                {focus.type.toUpperCase()} — {focus.title.match(/[A-Z]+-[\d.]+/)?.[0] ?? focus.id.slice(0,8)}
              </div>
              <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600, marginBottom: 6 }}>{focus.title.replace(/[A-Z]+-[\d.]+\s*/,'')}</div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>Status: {focus.status}</div>
            </>
          )
        })()}
      </Panel>

      {/* Architecture Health */}
      <Panel title="Architecture Health">
        <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>Health metrics not yet computed</div>
      </Panel>

      {/* Recent Decisions */}
      <Panel title="Recent Decisions" action={{ label: 'View All', onClick: () => navigateToObjects('decision') }}>
        {decisions.length === 0 ? (
          <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No decisions recorded</div>
        ) : decisions.map(d => (
          <div key={d.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #1a1e2866' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}>{d.title.match(/DDR-\d+/)?.[0] ?? 'DDR'}</span>
            </div>
            <div style={{ fontSize: 11, color: '#e2e8f0' }}>{d.title.replace(/DDR-\d+\s*/i,'') || d.title}</div>
            <div style={{ fontSize: 9, color: '#2a3042', marginTop: 2 }}>{new Date(d.created_at).toLocaleDateString()}</div>
          </div>
        ))}
        <button onClick={() => navigateToObjects('decision')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 10, padding: 0 }}>
          Go to Decision Records <ArrowRight size={10} />
        </button>
      </Panel>

      {/* Activity Feed */}
      <Panel title="Activity Feed" action={{ label: 'View All', onClick: () => navigateToObjects() }}>
        {recentAct.length === 0 ? (
          <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No recent activity</div>
        ) : recentAct.map(ev => (
          <div key={ev.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: 4, background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: '#475569' }}>
              {ev.event_type?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{ev.summary}</div>
              <div style={{ fontSize: 9, color: '#2a3042', marginTop: 2 }}>{new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  )
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>{title}</span>
        {action && (
          <button onClick={action.onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>{action.label}</button>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>{children}</div>
    </div>
  )
}
