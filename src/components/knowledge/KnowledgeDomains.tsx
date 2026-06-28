import type { EKEObject } from '../../../shared/types'
import { useStore } from '../../store'

interface Props { objects: EKEObject[] }

const TYPE_LABEL: Record<string, string> = {
  document:          'Documents',
  task:              'Tasks',
  knowledge_object:  'Knowledge Objects',
  decision:          'Decisions',
  architecture_phase:'Architecture Phases',
  research:          'Research',
  meeting:           'Meetings',
  journal:           'Journal',
  product:           'Products',
  requirement:       'Requirements',
  risk:              'Risks',
  question:          'Questions',
  standard:          'Standards',
  apo:               'APOs',
  apt:               'APTs',
  apm:               'APMs',
  aar:               'AARs',
  mit:               'MITs',
}

const TYPE_COLOR: Record<string, string> = {
  document: '#3b82f6', task: '#22c55e', knowledge_object: '#a855f7',
  decision: '#f59e0b', architecture_phase: '#06b6d4', requirement: '#ef4444',
  risk: '#f97316', research: '#8b5cf6', standard: '#64748b',
}

export default function KnowledgeDomains({ objects }: Props) {
  const { navigateToObjects } = useStore()
  // Group by type
  const byType: Record<string, EKEObject[]> = {}
  for (const o of objects) {
    if (!byType[o.type]) byType[o.type] = []
    byType[o.type].push(o)
  }
  const sorted = Object.entries(byType).sort((a, b) => b[1].length - a[1].length)
  const maxCount = sorted[0]?.[1].length ?? 1

  // Most connected (by parent_id references)
  const parentCounts: Record<string, number> = {}
  for (const o of objects) {
    if (o.parent_id) parentCounts[o.parent_id] = (parentCounts[o.parent_id] ?? 0) + 1
  }
  const topParent = Object.entries(parentCounts).sort((a, b) => b[1] - a[1])[0]
  const topParentObj = topParent ? objects.find(o => o.id === topParent[0]) : null

  // Fastest growing type (last 7 days)
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString()
  const recentByType: Record<string, number> = {}
  for (const o of objects) {
    if (o.created_at > cutoff) recentByType[o.type] = (recentByType[o.type] ?? 0) + 1
  }
  const fastestType = Object.entries(recentByType).sort((a, b) => b[1] - a[1])[0]

  return (
    <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
      {/* Object Types */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Object Types</span>
        </div>
        <div style={{ padding: '6px 0', flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {sorted.length === 0 ? (
            <div style={{ padding: '12px', fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No objects in database</div>
          ) : sorted.slice(0, 8).map(([type, objs]) => {
            const color = TYPE_COLOR[type] ?? '#475569'
            const pct = Math.round((objs.length / maxCount) * 100)
            return (
              <div key={type} onClick={() => navigateToObjects(type)} style={{ padding: '7px 12px', borderBottom: '1px solid #1a1e2833', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{TYPE_LABEL[type] ?? type}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color }}>{objs.length}</span>
                </div>
                <div style={{ height: 2, background: '#1a1e28', borderRadius: 1 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 1 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Knowledge Insights</span>
        </div>
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <InsightRow icon="ðŸ”—" label="Most Referenced Object"
            title={topParentObj?.title ?? 'â€”'}
            sub={topParent ? `Referenced by ${topParent[1]} object${topParent[1] === 1 ? '' : 's'}` : 'No references found'} />
          <InsightRow icon="ðŸ“ˆ" label="Fastest Growing Type (7 days)"
            title={fastestType ? (TYPE_LABEL[fastestType[0]] ?? fastestType[0]) : 'â€”'}
            sub={fastestType ? `+${fastestType[1]} this week` : 'No new objects this week'} />
          <InsightRow icon="ðŸ“Š" label="Total Objects"
            title={String(objects.length)}
            sub={`Across ${sorted.length} type${sorted.length !== 1 ? 's' : ''}`} />
        </div>
      </div>
    </div>
  )
}

function InsightRow({ icon, label, title, sub }: { icon: string; label: string; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{title}</div>
        <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  )
}

