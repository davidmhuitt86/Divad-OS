import { useState, useMemo, useEffect } from 'react'
import { Plus, ChevronDown, Search, MoreHorizontal, X, ArrowRight } from 'lucide-react'
import { useStore } from '../store'
import type { EKEObject, ObjectStatus, ObjectType } from '../../shared/types'
import LayoutLock from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'

const OBJ_PANELS = ['sidebar', 'main', 'detail']

const STATUS_COLOR: Record<ObjectStatus, string> = {
  draft:     '#3b82f6',
  in_review: '#f59e0b',
  approved:  '#22c55e',
  published: '#22c55e',
  revised:   '#a855f7',
  archived:  '#475569',
}

const TYPE_ICON: Record<string, string> = {
  document: '📄', task: '✅', knowledge_object: '◈', decision: '⚖️',
  architecture_phase: '🏗️', requirement: '📋', risk: '⚠️', research: '🔬',
  standard: '📏', apo: '🎯', apt: '🔧', meeting: '📅', journal: '📓',
  product: '📦', question: '❓', apm: '📐', aar: '📑', mit: '🎯',
}

const PAGE_SIZE = 10

export default function Objects() {
  const { objects, openObject, objectTypeFilter, objectStatusFilter, clearObjectFilters, openWizard, setActivePage } = useStore()
  const layout = usePageLayout('objects', OBJ_PANELS)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState<EKEObject | null>(null)
  const [relCount, setRelCount]     = useState<number | null>(null)

  // Apply store-level navigation filters on mount (e.g. from "View All Risks")
  useEffect(() => {
    if (objectTypeFilter)   { setTypeFilter(objectTypeFilter);   setPage(1) }
    if (objectStatusFilter) { setStatusFilter(objectStatusFilter); setPage(1) }
    clearObjectFilters()
  }, [])

  const isElectron = typeof window !== 'undefined' && !!window.divadOS
  useEffect(() => {
    if (!isElectron) return
    window.divadOS.relationships.count().then(setRelCount)
  }, [objects.length])

  const types   = useMemo(() => Array.from(new Set(objects.map(o => o.type))).sort(), [objects])
  const statuses = useMemo(() => Array.from(new Set(objects.map(o => o.status))).sort(), [objects])

  const filtered = useMemo(() => objects.filter(o => {
    if (typeFilter   !== 'all' && o.type   !== typeFilter)   return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) &&
        !o.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [objects, typeFilter, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Status counts for sidebar
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const o of objects) counts[o.status] = (counts[o.status] ?? 0) + 1
    return counts
  }, [objects])

  // Type distribution for bottom chart
  const typeDist = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const o of objects) counts[o.type] = (counts[o.type] ?? 0) + 1
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [objects])

  const recentObjects = useMemo(() =>
    [...objects].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    [objects]
  )

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Left sidebar filters */}
      <div style={{ width: 200, background: '#0d0f14', borderRight: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', padding: '14px 0', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '0 14px 10px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Create</div>
        {([['New Object', undefined], ['From Template', 'document'], ['Import Object', undefined]] as [string, string | undefined][]).map(([a, type]) => (
          <button key={a} onClick={() => openWizard(type)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', textAlign: 'left', width: '100%' }}>
            <span style={{ color: '#3b82f6' }}>+</span> {a}
          </button>
        ))}

        <div style={{ margin: '12px 14px', height: 1, background: '#1a1e28' }} />
        <div style={{ padding: '0 14px 8px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Object Filters</div>

        <div style={{ padding: '0 14px 6px', fontSize: 9, color: '#475569' }}>Type</div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          style={{ margin: '0 14px 10px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, color: '#94a3b8', fontSize: 10, padding: '5px 8px', cursor: 'pointer' }}>
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
        </select>

        <div style={{ padding: '0 14px 6px', fontSize: 9, color: '#475569' }}>Status</div>
        <div style={{ padding: '0 14px' }}>
          {(['all', ...Object.keys(statusCounts)] as string[]).map(s => (
            <div key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {s !== 'all' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[s as ObjectStatus] ?? '#475569' }} />}
                <span style={{ fontSize: 11, color: statusFilter === s ? '#e2e8f0' : '#94a3b8', textTransform: s === 'all' ? undefined : 'capitalize' }}>
                  {s === 'all' ? 'All Statuses' : s.replace(/_/g,' ')}
                </span>
              </div>
              <span style={{ fontSize: 10, color: '#475569' }}>{s === 'all' ? objects.length : statusCounts[s] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #1a1e28' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Objects</h1>
            <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Every element. Every connection. Every asset.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setActivePage('knowledge')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
              Object Graph
            </button>
            <button onClick={() => openWizard()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              <Plus size={13} /> New Object <ChevronDown size={11} />
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '10px 16px', flexShrink: 0 }}>
          <StatCard label="Total Objects"   value={objects.length} color="#a855f7" />
          <StatCard label="Active Objects"  value={objects.filter(o => o.status !== 'archived').length} color="#22c55e" sub={`${objects.length > 0 ? Math.round(objects.filter(o=>o.status!=='archived').length/objects.length*100) : 0}% of total`} />
          <StatCard label="Object Types"    value={types.length}   color="#3b82f6" sub="Unique types" />
          <StatCard label="Relationships"   value={relCount ?? '—'} color="#06b6d4" sub={relCount !== null ? `${relCount} connection${relCount !== 1 ? 's' : ''}` : 'Loading…'} />
          <StatCard label="Avg. Confidence" value="—"              color="#f59e0b" sub="Not tracked yet" />
        </div>

        {/* Table header */}
        <div style={{ padding: '6px 16px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#475569' }}>Objects ({filtered.length})</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search objects..."
                style={{ paddingLeft: 24, paddingRight: 8, paddingTop: 5, paddingBottom: 5, background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, color: '#e2e8f0', fontSize: 10, outline: 'none', width: 180 }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#13161e', position: 'sticky', top: 0 }}>
                {['Name', 'Type', 'Status', 'Owner', 'Updated', 'ID'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1a1e28', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                <th style={{ width: 32, borderBottom: '1px solid #1a1e28' }} />
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#2a3042', fontStyle: 'italic' }}>
                  {objects.length === 0 ? 'No objects in database yet' : 'No objects match the current filters'}
                </td></tr>
              ) : pageItems.map(obj => (
                <tr key={obj.id} onClick={() => setSelected(obj)} onDoubleClick={() => openObject(obj)}
                  style={{ borderBottom: '1px solid #1a1e2866', cursor: 'pointer', background: selected?.id === obj.id ? 'rgba(59,130,246,0.05)' : 'transparent' }}
                  onMouseEnter={e => { if (selected?.id !== obj.id) (e.currentTarget as HTMLElement).style.background = '#13161e' }}
                  onMouseLeave={e => { if (selected?.id !== obj.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{TYPE_ICON[obj.type] ?? '◈'}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{obj.title}</div>
                        {obj.description && <div style={{ fontSize: 9, color: '#475569', marginTop: 1, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{obj.type.replace(/_/g,' ')}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLOR[obj.status], background: STATUS_COLOR[obj.status] + '22', border: `1px solid ${STATUS_COLOR[obj.status]}44`, borderRadius: 4, padding: '2px 7px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {obj.status.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{obj.owner ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }}>{relativeTime(obj.updated_at)}</td>
                  <td style={{ padding: '10px 12px', color: '#2a3042', fontFamily: 'monospace', fontSize: 10 }}>{obj.id.slice(0, 8)}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <button onClick={e => { e.stopPropagation(); openObject(obj) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}><MoreHorizontal size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#475569' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} objects
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <PageBtn label="‹" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <PageBtn key={n} label={String(n)} active={n === page} onClick={() => setPage(n)} />
            ))}
            {totalPages > 5 && <PageBtn label="…" disabled />}
            <PageBtn label="›" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 16px 14px', flexShrink: 0 }}>
          {/* Type distribution */}
          <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Object Types Distribution</span>
            </div>
            <div style={{ padding: '8px 12px', display: 'flex', gap: 10 }}>
              {/* Donut */}
              {typeDist.length > 0 ? (
                <>
                  <svg width={80} height={80} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
                    {(() => {
                      const total = typeDist.reduce((s, [,c]) => s + c, 0)
                      const COLORS = ['#3b82f6','#a855f7','#22c55e','#f59e0b','#06b6d4','#ef4444','#8b5cf6','#64748b']
                      let offset = 2 * Math.PI * 30 * 0.25
                      const CIRC = 2 * Math.PI * 30
                      return typeDist.slice(0, 8).map(([type, count], i) => {
                        const pct = count / total
                        const dash = CIRC * pct
                        const el = <circle key={type} cx={40} cy={40} r={30} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={12}
                          strokeDasharray={`${dash} ${CIRC}`} strokeDashoffset={offset} strokeLinecap="butt" />
                        offset -= dash
                        return el
                      })
                    })()}
                    <text x={40} y={36} textAnchor="middle" fill="#e2e8f0" fontSize={12} fontWeight={700}>{objects.length}</text>
                    <text x={40} y={49} textAnchor="middle" fill="#475569" fontSize={7}>Total</text>
                  </svg>
                  <div style={{ flex: 1, overflowY: 'auto', maxHeight: 80 }}>
                    {typeDist.slice(0, 6).map(([type, count], i) => {
                      const COLORS = ['#3b82f6','#a855f7','#22c55e','#f59e0b','#06b6d4','#ef4444']
                      const pct = objects.length > 0 ? Math.round(count / objects.length * 100) : 0
                      return (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                          <div style={{ width: 7, height: 7, borderRadius: 1, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 9, color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{type.replace(/_/g,' ')}</span>
                          <span style={{ fontSize: 9, color: '#475569' }}>{count} ({pct}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', padding: '8px 0' }}>No objects yet</div>
              )}
            </div>
          </div>

          {/* Status overview */}
          <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1e28' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Object Status Overview</span>
            </div>
            <div style={{ padding: '10px 12px', overflowY: 'auto', maxHeight: 180 }}>
              {Object.keys(statusCounts).length === 0 ? (
                <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No objects yet</div>
              ) : Object.entries(statusCounts).map(([s, c]) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[s as ObjectStatus] ?? '#475569', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#94a3b8', flex: 1, textTransform: 'capitalize' }}>{s.replace(/_/g,' ')}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently created */}
          <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recently Created</span>
            </div>
            <div style={{ padding: '4px 0', overflowY: 'auto', maxHeight: 200 }}>
              {recentObjects.length === 0 ? (
                <div style={{ padding: '12px', fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No objects yet</div>
              ) : recentObjects.map(o => (
                <div key={o.id} onClick={() => setSelected(o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ fontSize: 13 }}>{TYPE_ICON[o.type] ?? '◈'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
                    <div style={{ fontSize: 9, color: '#475569' }}>{o.type.replace(/_/g,' ')} · {relativeTime(o.created_at)}</div>
                  </div>
                  <span style={{ fontSize: 9, color: '#2a3042', fontFamily: 'monospace' }}>{o.id.slice(0,6)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right detail panel */}
      {selected && (
        <div style={{ width: 300, background: '#13161e', borderLeft: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Object Detail</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}><X size={13} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {TYPE_ICON[selected.type] ?? '◈'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>{selected.title}</div>
                <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLOR[selected.status], background: STATUS_COLOR[selected.status] + '22', border: `1px solid ${STATUS_COLOR[selected.status]}44`, borderRadius: 4, padding: '1px 6px', textTransform: 'capitalize' }}>
                  {selected.status.replace(/_/g,' ')}
                </span>
              </div>
            </div>

            {selected.description && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{selected.description}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <Field label="Type"     value={selected.type.replace(/_/g,' ')} />
              <Field label="Status"   value={selected.status.replace(/_/g,' ')} />
              <Field label="Owner"    value={selected.owner ?? '—'} />
              <Field label="Priority" value={selected.priority ?? '—'} />
              <Field label="Revision" value={`v${selected.revision}`} />
              <Field label="ID"       value={selected.id.slice(0,12)} mono />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Field label="Created"      value={new Date(selected.created_at).toLocaleString()} />
              <div style={{ marginTop: 6 }}>
                <Field label="Last Updated" value={new Date(selected.updated_at).toLocaleString()} />
              </div>
            </div>

            {selected.tags.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {selected.tags.map(t => (
                    <span key={t} style={{ fontSize: 9, color: '#94a3b8', background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, padding: '2px 7px' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.parent_id && (
              <div style={{ marginBottom: 12 }}>
                <Field label="Parent ID" value={selected.parent_id.slice(0,12)} mono />
              </div>
            )}
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1e28', flexShrink: 0 }}>
            <button onClick={() => openObject(selected)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              Open Object <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
      <LayoutLock layout={layout} />
    </div>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: '#475569', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#475569', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: mono ? 'monospace' : undefined }}>{value}</div>
    </div>
  )
}

function PageBtn({ label, active, disabled, onClick }: { label: string; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: 26, height: 26, borderRadius: 4, border: '1px solid ' + (active ? '#3b82f6' : '#1a1e28'), background: active ? '#3b82f6' : 'transparent', color: active ? '#fff' : disabled ? '#2a3042' : '#94a3b8', fontSize: 10, cursor: disabled ? 'default' : 'pointer' }}>
      {label}
    </button>
  )
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
