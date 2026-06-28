import { useState, useMemo } from 'react'
import { Search, ArrowUp, ArrowDown, Eye, Edit2, FileText, ChevronRight } from 'lucide-react'
import { useStore } from '../../store'
import { TYPE_CONFIG } from '../wizard/CreationWizard'
import type { EKEObject } from '../../../shared/types'
import type { GroupKey } from './RepoList'

const STATUS_PILL: Record<string, { bg: string; text: string }> = {
  draft:      { bg: '#f59e0b22', text: '#f59e0b' },
  in_review:  { bg: '#3b82f622', text: '#3b82f6' },
  approved:   { bg: '#22c55e22', text: '#22c55e' },
  published:  { bg: '#22c55e33', text: '#4ade80' },
  revised:    { bg: '#a855f722', text: '#a855f7' },
  archived:   { bg: '#47556922', text: '#475569' },
}

type SortKey = 'title' | 'type' | 'status' | 'updated_at' | 'revision'

interface Props {
  groupKey: GroupKey
  selectedId: string | null
  onSelect: (obj: EKEObject) => void
}

export default function FileExplorer({ groupKey, selectedId, onSelect }: Props) {
  const { objects, openObject, openWizardEdit } = useStore()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updated_at')
  const [sortAsc, setSortAsc] = useState(false)

  const filtered = useMemo(() => {
    let list = objects

    // filter by group
    if (groupKey === 'all') {
      // no filter
    } else if (groupKey.startsWith('repo:')) {
      const repo = groupKey.slice(5)
      list = list.filter(o => (o.metadata as Record<string, unknown>).repository === repo)
    } else if (groupKey.startsWith('type:')) {
      const type = groupKey.slice(5)
      list = list.filter(o => o.type === type)
    } else if (groupKey.startsWith('status:')) {
      const status = groupKey.slice(7)
      list = list.filter(o => o.status === status)
    } else if (groupKey.startsWith('dis:')) {
      const cat = groupKey.slice(4)
      list = list.filter(o => o.dis_category === cat)
    }

    // search
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.engineering_id?.toLowerCase().includes(q) ||
        o.short_name?.toLowerCase().includes(q) ||
        o.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // sort
    list = [...list].sort((a, b) => {
      let va: string | number = ''
      let vb: string | number = ''
      if (sortKey === 'title')      { va = a.title.toLowerCase(); vb = b.title.toLowerCase() }
      else if (sortKey === 'type')  { va = a.type; vb = b.type }
      else if (sortKey === 'status'){ va = a.status; vb = b.status }
      else if (sortKey === 'updated_at') { va = a.updated_at; vb = b.updated_at }
      else if (sortKey === 'revision')   { va = a.revision; vb = b.revision }
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })

    return list
  }, [objects, groupKey, query, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p)
    else { setSortKey(key); setSortAsc(false) }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? (sortAsc ? <ArrowUp size={9} /> : <ArrowDown size={9} />)
      : null

  const groupLabel = (() => {
    if (groupKey === 'all') return 'All Objects'
    if (groupKey.startsWith('repo:')) return groupKey.slice(5)
    if (groupKey.startsWith('type:')) return TYPE_CONFIG[groupKey.slice(5)]?.label ?? groupKey.slice(5)
    if (groupKey.startsWith('status:')) return groupKey.slice(7).replace('_', ' ')
    if (groupKey.startsWith('dis:')) return `DIS: ${groupKey.slice(4)}`
    return groupKey
  })()

  const thStyle: React.CSSProperties = {
    padding: '6px 10px', fontSize: 9, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    textAlign: 'left', background: 'none', border: 'none',
    cursor: 'pointer', whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 4,
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', minWidth: 0 }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
          <FileText size={11} color="#475569" />
          <span style={{ fontSize: 10, color: '#475569' }}>Repository</span>
          <ChevronRight size={10} color="#2a3042" />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{groupLabel}</span>
          <span style={{ fontSize: 9, color: '#2a3042', flexShrink: 0 }}>({filtered.length})</span>
        </div>
        {/* Search */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search size={10} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..."
            style={{ paddingLeft: 22, paddingRight: 8, paddingTop: 4, paddingBottom: 4, background: '#0d0f14', border: '1px solid #222736', borderRadius: 5, color: '#e2e8f0', fontSize: 10, outline: 'none', width: 160 }} />
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 90px 80px 60px 72px', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
        {([['title','Name'], ['type','Type'], ['status','Status'], ['updated_at','Modified'], ['revision','Rev']] as [SortKey, string][]).map(([k, label]) => (
          <button key={k} onClick={() => toggleSort(k)} style={{ ...thStyle }}>
            {label} <SortIcon col={k} />
          </button>
        ))}
        <div style={{ padding: '6px 10px' }} />
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: '#2a3042' }}>
            <FileText size={28} />
            <div style={{ fontSize: 11 }}>{query ? 'No results match your search' : 'No objects in this group'}</div>
          </div>
        ) : filtered.map(obj => {
          const cfg = TYPE_CONFIG[obj.type]
          const pill = STATUS_PILL[obj.status] ?? STATUS_PILL.draft
          const isSelected = obj.id === selectedId
          const updatedDate = new Date(obj.updated_at)
          const now = Date.now()
          const diffMs = now - updatedDate.getTime()
          const diffDays = Math.floor(diffMs / 86400000)
          const dateStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? `${diffDays}d ago` : updatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

          return (
            <div key={obj.id}
              onClick={() => onSelect(obj)}
              onDoubleClick={() => openObject(obj)}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 90px 80px 60px 72px',
                alignItems: 'center',
                background: isSelected ? '#1a1e28' : 'transparent',
                borderBottom: '1px solid #1a1e2844',
                cursor: 'pointer',
                transition: 'background 0.08s',
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#0d0f14' }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {/* Name */}
              <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{cfg?.icon ?? '📄'}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.title}</div>
                  {obj.engineering_id && (
                    <div style={{ fontSize: 9, color: '#2a3042', fontFamily: 'monospace' }}>{obj.engineering_id}</div>
                  )}
                </div>
              </div>
              {/* Type */}
              <div style={{ padding: '7px 10px' }}>
                <span style={{ fontSize: 9, color: '#475569' }}>{cfg?.label ?? obj.type}</span>
              </div>
              {/* Status */}
              <div style={{ padding: '7px 10px' }}>
                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: pill.bg, color: pill.text, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {obj.status.replace('_', ' ')}
                </span>
              </div>
              {/* Modified */}
              <div style={{ padding: '7px 10px' }}>
                <span style={{ fontSize: 10, color: '#475569' }}>{dateStr}</span>
              </div>
              {/* Revision */}
              <div style={{ padding: '7px 10px' }}>
                <span style={{ fontSize: 10, color: '#2a3042', fontFamily: 'monospace' }}>v{obj.revision}</span>
              </div>
              {/* Actions */}
              <div style={{ padding: '4px 8px', display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button onClick={e => { e.stopPropagation(); openObject(obj) }}
                  title="Open"
                  style={{ padding: '3px 6px', background: 'none', border: '1px solid #1a1e28', borderRadius: 4, cursor: 'pointer', color: '#475569', display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#3b82f6'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#475569'}
                >
                  <Eye size={11} />
                </button>
                <button onClick={e => { e.stopPropagation(); openWizardEdit(obj) }}
                  title="Edit"
                  style={{ padding: '3px 6px', background: 'none', border: '1px solid #1a1e28', borderRadius: 4, cursor: 'pointer', color: '#475569', display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#a78bfa'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#475569'}
                >
                  <Edit2 size={11} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
