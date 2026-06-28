import { TrendingUp, Target, CheckSquare, AlertTriangle } from 'lucide-react'
import type { AppState, EKEObject } from '../../../shared/types'
import { useStore } from '../../store'

interface Props { appState: AppState; objects: EKEObject[] }

export default function StatCards({ appState, objects }: Props) {
  const { setActivePage, navigateToObjects, openObject } = useStore()

  const activeTasks   = objects.filter(o => o.type === 'task' && (o.status === 'in_review' || o.status === 'draft'))
  const highPriority  = activeTasks.filter(o => o.priority === 'high' || o.priority === 'critical')
  const inProgress    = activeTasks.filter(o => o.status === 'in_review')
  const totalObjects  = objects.length
  const approved      = objects.filter(o => o.status === 'approved' || o.status === 'published').length
  const progress      = totalObjects > 0 ? Math.round((approved / totalObjects) * 100) : 0
  const onTrack       = highPriority.length === 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flexShrink: 0 }}>
      {/* Mission Status */}
      <StatCard
        label="MISSION STATUS" icon={<TrendingUp size={14} />} iconColor="#22c55e"
        isEmpty={totalObjects === 0} emptyLabel="No data yet"
        onClick={() => setActivePage('operations')}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#22c55e', lineHeight: 1 }}>{progress}%</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#22c55e' }}>{onTrack ? 'On Track' : 'At Risk'}</div>
        </div>
        {totalObjects > 0 && (
          <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>{approved} of {totalObjects} objects approved</div>
        )}
      </StatCard>

      {/* Architecture Progress */}
      <StatCard
        label="ARCHITECTURE PROGRESS" icon={<TrendingUp size={14} />} iconColor="#3b82f6"
        isEmpty={!appState.currentAP} emptyLabel="No active AP"
        onClick={() => appState.currentAP ? openObject(appState.currentAP) : setActivePage('architecture')}
      >
        {appState.currentAP && (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', lineHeight: 1 }}>{appState.currentAP.title}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{appState.currentAP.description ?? 'Foundation Architecture'}</div>
            <div style={{ marginTop: 8, height: 3, background: '#1a1e28', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#3b82f6', borderRadius: 2, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>In Progress · Click to open</div>
          </>
        )}
      </StatCard>

      {/* Today's Objective */}
      <StatCard
        label="TODAY'S OBJECTIVE" icon={<Target size={14} />} iconColor="#a855f7"
        isEmpty={!appState.currentAPO} emptyLabel="No active objective"
        onClick={() => appState.currentAPO ? openObject(appState.currentAPO) : setActivePage('architecture')}
      >
        {appState.currentAPO && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>{appState.currentAPO.title}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
                {appState.currentAPO.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </>
        )}
      </StatCard>

      {/* Active Tasks */}
      <StatCard
        label="ACTIVE TASKS" icon={<CheckSquare size={14} />} iconColor="#f59e0b"
        isEmpty={activeTasks.length === 0} emptyLabel="No active tasks"
        onClick={() => navigateToObjects('task')}
      >
        {activeTasks.length > 0 && (
          <>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{activeTasks.length}</div>
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {highPriority.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#ef4444' }}>
                  <AlertTriangle size={10} /> {highPriority.length} High Priority
                </div>
              )}
              {inProgress.length > 0 && (
                <div style={{ fontSize: 11, color: '#475569' }}>{inProgress.length} In Progress</div>
              )}
            </div>
          </>
        )}
      </StatCard>
    </div>
  )
}

function StatCard({ label, icon, iconColor, isEmpty, emptyLabel, children, onClick }: {
  label: string; icon: React.ReactNode; iconColor: string
  isEmpty: boolean; emptyLabel: string; children?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1a1e28'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ color: iconColor }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>{label}</span>
      </div>
      {isEmpty ? (
        <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>{emptyLabel}</div>
      ) : children}
    </div>
  )
}
