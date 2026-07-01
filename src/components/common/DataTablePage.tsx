import { useState } from 'react'
import { Search, Filter, type LucideIcon } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  width?: string
  render?: (row: T) => React.ReactNode
}

const STATUS_COLOR: Record<string, string> = {
  Active: '#22c55e', Completed: '#3b82f6', Draft: '#f59e0b', Verified: '#22c55e',
  Pending: '#f59e0b', New: '#3b82f6', Open: '#ef4444', Acknowledged: '#f59e0b',
  Resolved: '#22c55e', High: '#ef4444', Medium: '#f59e0b', Low: '#475569',
  Warning: '#f59e0b', Conflict: '#ef4444',
}

export function StatusPill({ value }: { value: string }) {
  const color = STATUS_COLOR[value] ?? '#475569'
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color, background: color + '1c', border: `1px solid ${color}44`, borderRadius: 4, padding: '2px 7px' }}>
      {value}
    </span>
  )
}

// Placeholder page shell for sidebar sections without a dedicated
// implementation yet — reused across Sessions/Drafts/Commit History/
// Universal Objects/Knowledge Candidates/Relationships/Evidence/
// Conflicts/Suggested Corrections/Users/Audit Log. Data is static/mock;
// nothing here reads from or writes to a database.
export default function DataTablePage<T extends { id: string }>({
  icon: Icon, title, primaryActionLabel, searchPlaceholder, columns, rows,
}: {
  icon: LucideIcon
  title: string
  primaryActionLabel?: string
  searchPlaceholder?: string
  columns: Column<T>[]
  rows: T[]
}) {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()))
    : rows

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d0f14', padding: '14px 16px 16px', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={18} style={{ color: '#3b82f6' }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{title}</h1>
        </div>
        {primaryActionLabel && (
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff' }}>
            {primaryActionLabel}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 6, padding: '6px 10px' }}>
          <Search size={13} style={{ color: '#475569' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 12 }}
          />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
          <Filter size={12} /> Filter
        </button>
      </div>

      <div style={{ flex: 1, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1e28' }}>
              {columns.map(c => (
                <th key={c.key} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', width: c.width }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: '#2a3042', fontStyle: 'italic' }}>
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            ) : filtered.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid #1a1e2866' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e2844'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                {columns.map(c => (
                  <td key={c.key} style={{ padding: '9px 12px', color: '#94a3b8' }}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#475569', flexShrink: 0 }}>
        <span>Showing 1 to {filtered.length} of {filtered.length}</span>
        <span style={{ fontStyle: 'italic', color: '#2a3042' }}>Placeholder data — full implementation in a future milestone</span>
      </div>
    </div>
  )
}
