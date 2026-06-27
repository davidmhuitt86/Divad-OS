import { Flag, Target, Zap, CheckSquare, BookOpen } from 'lucide-react'
import type { AppState } from '../../../shared/types'

export default function MissionBriefing({ appState }: { appState: AppState }) {
  const items = [
    { label: 'Current Mission',   icon: <Flag size={12} />,        value: appState.mission,                    color: '#3b82f6' },
    { label: 'Mission Phase',     icon: <BookOpen size={12} />,    value: appState.currentAP?.title,           color: '#06b6d4' },
    { label: 'Phase Mission',     icon: <Target size={12} />,      value: appState.currentAP?.description,     color: '#a855f7' },
    { label: 'Phase Objective',   icon: <Target size={12} />,      value: appState.currentAPO?.title,          color: '#22c55e' },
    { label: 'Phase Task',        icon: <Zap size={12} />,         value: appState.currentAPT?.title,          color: '#f59e0b' },
    { label: "Today's Focus",     icon: <CheckSquare size={12} />, value: appState.currentMIT?.title,          color: '#ef4444' },
  ]

  const hasAny = items.some(i => i.value)

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>Mission Briefing</span>
      </div>
      <div style={{ padding: '8px 0', flex: 1 }}>
        {!hasAny ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140, fontSize: 11, color: '#2a3042', flexDirection: 'column', gap: 6 }}>
            <Flag size={18} />
            <span>No mission context set</span>
            <span style={{ fontSize: 10 }}>Ask the agent to configure your AP</span>
          </div>
        ) : items.map(({ label, icon, value, color }) => value ? (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 14px' }}>
            <div style={{ color, marginTop: 1, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12.5, color: '#e2e8f0', fontWeight: 500 }}>{value}</div>
            </div>
          </div>
        ) : null)}
      </div>
    </div>
  )
}
