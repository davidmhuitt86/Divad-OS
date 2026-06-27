import type { EKEObject, AppState } from '../../../shared/types'

interface Props { objects: EKEObject[]; appState: AppState | null }

export default function ArchStatCards({ objects, appState }: Props) {
  const aps   = objects.filter(o => o.type === 'architecture_phase')
  const apos  = objects.filter(o => o.type === 'apo')
  const apts  = objects.filter(o => o.type === 'apt' || o.type === 'task')
  const deps  = objects.filter(o => o.type === 'requirement' && (o.metadata as Record<string,unknown>)?.is_dependency)
  const decs  = objects.filter(o => o.type === 'decision' && (o.status === 'draft' || o.status === 'in_review'))

  const approvedApos = apos.filter(o => o.status === 'approved' || o.status === 'published')
  const completedApts = apts.filter(o => o.status === 'approved' || o.status === 'published')

  const totalObjs = objects.length
  const doneObjs  = objects.filter(o => o.status === 'approved' || o.status === 'published').length
  const progress  = totalObjs > 0 ? Math.round((doneObjs / totalObjs) * 100) : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, flexShrink: 0 }}>
      {/* Active AP */}
      <div style={{ gridColumn: 'span 1', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.08))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: '12px 14px' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Active Architecture Phase</div>
        {appState?.currentAP ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>{(appState.currentAP.title ?? '').match(/AP-\d+/)?.[0] ?? 'AP-???'}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{(appState.currentAP.title ?? '').replace(/AP-0*\d+\s*/i,'') || appState.currentAP.title}</div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic', marginTop: 4 }}>No active phase</div>
        )}
      </div>

      {/* Overall Progress */}
      <Stat label="Overall Progress" value={`${progress}%`} sub="In Progress" color="#22c55e" donut={{ value: progress }} />

      {/* APOs */}
      <Stat label="Objectives (APO)" value={apos.length > 0 ? `${approvedApos.length} / ${apos.length}` : '—'} sub={apos.length > 0 ? 'On Track' : 'None defined'} color="#a855f7" />

      {/* APTs */}
      <Stat label="Tasks (APT)" value={apts.length > 0 ? `${completedApts.length} / ${apts.length}` : '—'} sub={apts.length > 0 ? 'In Progress' : 'None defined'} color="#f59e0b" />

      {/* Dependencies */}
      <Stat label="Dependencies" value={deps.length > 0 ? String(deps.length) : '—'} sub="Open" color="#06b6d4" />

      {/* Decisions */}
      <Stat label="Decisions" value={decs.length > 0 ? String(decs.length) : '—'} sub="Pending" color="#ef4444" />
    </div>
  )
}

function Stat({ label, value, sub, color, donut }: { label: string; value: string; sub: string; color: string; donut?: { value: number } }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{sub}</div>
      </div>
      {donut && (
        <svg width={44} height={44} viewBox="0 0 44 44">
          <circle cx={22} cy={22} r={18} fill="none" stroke="#1a1e28" strokeWidth={4} />
          <circle cx={22} cy={22} r={18} fill="none" stroke={color} strokeWidth={4}
            strokeDasharray={`${2 * Math.PI * 18 * donut.value / 100} ${2 * Math.PI * 18}`}
            strokeDashoffset={2 * Math.PI * 18 * 0.25}
            strokeLinecap="round" />
          <text x={22} y={26} textAnchor="middle" fill={color} fontSize={10} fontWeight={700}>{donut.value}%</text>
        </svg>
      )}
    </div>
  )
}
