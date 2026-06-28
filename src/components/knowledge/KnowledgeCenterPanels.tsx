import { ArrowRight } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'
import { useStore } from '../../store'

interface Props { objects: EKEObject[] }

const TYPE_ICON: Record<string, string> = {
  document: 'ðŸ“„', task: 'âœ…', knowledge_object: 'â—ˆ', decision: 'âš–ï¸',
  architecture_phase: 'ðŸ—ï¸', requirement: 'ðŸ“‹', risk: 'âš ï¸', research: 'ðŸ”¬',
  standard: 'ðŸ“', apo: 'ðŸŽ¯', apt: 'ðŸ”§', meeting: 'ðŸ“…', journal: 'ðŸ““',
}

const FEATURED_TYPES = ['architecture_phase', 'apo', 'apt', 'document', 'knowledge_object']

export default function KnowledgeCenterPanels({ objects }: Props) {
  const { navigateToObjects, openObject } = useStore()
  const recent = [...objects]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5)

  // Featured: group high-value types
  const featured = FEATURED_TYPES
    .map(type => ({ type, objs: objects.filter(o => o.type === type) }))
    .filter(g => g.objs.length > 0)
    .slice(0, 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 280, flexShrink: 0 }}>
      {/* Recent Objects */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Recently Updated</span>
          <button onClick={() => navigateToObjects()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {recent.length === 0 ? (
            <div style={{ padding: '12px', fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No objects in database</div>
          ) : recent.map(obj => (
            <div key={obj.id} onClick={() => openObject(obj)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderBottom: '1px solid #1a1e2833', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                {TYPE_ICON[obj.type] ?? 'â—ˆ'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.title}</div>
                <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{obj.type.replace(/_/g,' ')} Â· Updated {relativeTime(obj.updated_at)}</div>
              </div>
              <StatusDot status={obj.status} />
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid #1a1e28' }}>
          <button onClick={() => navigateToObjects()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All Objects <ArrowRight size={10} />
          </button>
        </div>
      </div>

      {/* Object Groups */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Object Collections</span>
        </div>
        <div style={{ padding: '6px 0', overflowY: 'auto' }}>
          {featured.length === 0 ? (
            <div style={{ padding: '12px', fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No collections yet</div>
          ) : featured.map(g => (
            <div key={g.type} onClick={() => navigateToObjects(g.type)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                {TYPE_ICON[g.type] ?? 'â—ˆ'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{g.type.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{g.objs.length} object{g.objs.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'published' || status === 'approved' ? '#22c55e'
    : status === 'in_review' ? '#f59e0b'
    : status === 'draft' ? '#3b82f6'
    : '#475569'
  return <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, marginTop: 4, flexShrink: 0 }} />
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

