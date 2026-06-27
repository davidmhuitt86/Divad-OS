import { useState } from 'react'
import { Search } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

interface Props { objects: EKEObject[] }

export default function KnowledgeRightPanel({ objects }: Props) {
  const [query, setQuery] = useState('')

  const total     = objects.length
  const published = objects.filter(o => o.status === 'published' || o.status === 'approved').length
  const score     = total > 0 ? Math.round((published / total) * 100) : 0

  const R = 42; const CX = 50; const CY = 50; const CIRC = 2 * Math.PI * R

  const filtered = query
    ? objects.filter(o => o.title.toLowerCase().includes(query.toLowerCase()) || o.type.includes(query.toLowerCase()))
    : []

  // Recent â€” sort by updated_at
  const recentActivity = [...objects]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5)

  return (
    <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
      {/* Knowledge Health */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Knowledge Health</span>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1a1e28" strokeWidth={8} />
              {score > 0 && (
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#22c55e" strokeWidth={7}
                  strokeDasharray={`${CIRC * score / 100} ${CIRC}`}
                  strokeDashoffset={CIRC * 0.25}
                  strokeLinecap="round" />
              )}
              <text x={CX} y={CY - 4} textAnchor="middle" fill="#e2e8f0" fontSize={18} fontWeight={700}>{score}</text>
              <text x={CX} y={CY + 11} textAnchor="middle" fill="#475569" fontSize={9}>/100</text>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Published</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{published} <span style={{ fontSize: 9, color: '#475569', fontWeight: 400 }}>objects</span></div>
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>In Review</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{objects.filter(o => o.status === 'in_review').length} <span style={{ fontSize: 9, color: '#475569', fontWeight: 400 }}>objects</span></div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Draft</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>{objects.filter(o => o.status === 'draft').length} <span style={{ fontSize: 9, color: '#475569', fontWeight: 400 }}>objects</span></div>
              </div>
            </div>
          </div>
          {total === 0 && (
            <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', marginTop: 8 }}>No objects in database yet</div>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Quick Search</span>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search objects by name or type..."
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 26, paddingRight: 8, paddingTop: 6, paddingBottom: 6, background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, color: '#e2e8f0', fontSize: 10, outline: 'none' }} />
          </div>
          {query && (
            <div style={{ marginTop: 6, maxHeight: 120, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', padding: '4px 0' }}>No results</div>
              ) : filtered.slice(0, 5).map(o => (
                <div key={o.id} style={{ padding: '4px 0', fontSize: 10, color: '#94a3b8', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2e8f0'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}>
                  {o.title}
                </div>
              ))}
            </div>
          )}
          {!query && total > 0 && (
            <div style={{ fontSize: 9, color: '#2a3042', marginTop: 6 }}>{total} objects available to search</div>
          )}
          {total === 0 && (
            <div style={{ fontSize: 9, color: '#2a3042', marginTop: 6, fontStyle: 'italic' }}>No objects in database</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flex: 1 }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Recently Updated</span>
        </div>
        <div style={{ padding: '6px 0' }}>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '12px', fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No recent activity</div>
          ) : recentActivity.map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 12px', borderBottom: '1px solid #1a1e2833' }}>
              <div style={{ width: 24, height: 24, borderRadius: 4, background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                {o.type[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
                <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{o.type.replace(/_/g,' ')} Â· {o.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

