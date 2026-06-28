import { useState, useMemo } from 'react'
import { Search, FolderOpen, Folder, ChevronRight, ChevronDown, Database, Tag } from 'lucide-react'
import { useStore } from '../../store'
import { TYPE_CONFIG } from '../wizard/CreationWizard'

export type GroupKey =
  | 'all'
  | `repo:${string}`
  | `type:${string}`
  | `status:${string}`
  | `dis:${string}`

interface TreeNode {
  key: GroupKey
  label: string
  count: number
  icon?: React.ReactNode
  children?: TreeNode[]
}

interface Props {
  selected: GroupKey
  onSelect: (key: GroupKey) => void
}

export default function RepoList({ selected, onSelect }: Props) {
  const { objects } = useStore()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    repos: true, types: false, status: false,
  })

  const toggle = (k: string) => setExpanded(p => ({ ...p, [k]: !p[k] }))

  const tree = useMemo<TreeNode[]>(() => {
    // Repositories from metadata
    const repoCounts: Record<string, number> = {}
    for (const o of objects) {
      const r = (o.metadata as Record<string, unknown>).repository as string | undefined
      if (r) repoCounts[r] = (repoCounts[r] ?? 0) + 1
    }
    const repoNodes: TreeNode[] = Object.entries(repoCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        key: `repo:${name}` as GroupKey,
        label: name,
        count,
        icon: <Folder size={11} />,
      }))

    // Types
    const typeCounts: Record<string, number> = {}
    for (const o of objects) typeCounts[o.type] = (typeCounts[o.type] ?? 0) + 1
    const typeNodes: TreeNode[] = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => {
        const cfg = TYPE_CONFIG[type]
        return {
          key: `type:${type}` as GroupKey,
          label: cfg?.label ?? type,
          count,
          icon: <span style={{ fontSize: 11, lineHeight: 1 }}>{cfg?.icon}</span>,
        }
      })

    // Status
    const statusCounts: Record<string, number> = {}
    for (const o of objects) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
    const statusNodes: TreeNode[] = Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([s, count]) => ({
        key: `status:${s}` as GroupKey,
        label: s.replace('_', ' '),
        count,
      }))

    // DIS categories
    const disCounts: Record<string, number> = {}
    for (const o of objects) {
      if (o.dis_category) disCounts[o.dis_category] = (disCounts[o.dis_category] ?? 0) + 1
    }
    const disNodes: TreeNode[] = Object.entries(disCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({
        key: `dis:${cat}` as GroupKey,
        label: cat,
        count,
        icon: <Tag size={10} />,
      }))

    return [
      { key: 'all', label: 'All Objects', count: objects.length, icon: <Database size={11} /> },
      { key: 'repos' as GroupKey, label: 'Repositories', count: repoNodes.reduce((s, n) => s + n.count, 0), icon: <FolderOpen size={11} />, children: repoNodes },
      { key: 'types' as GroupKey, label: 'By Type', count: objects.length, icon: <Tag size={11} />, children: typeNodes },
      { key: 'status_group' as GroupKey, label: 'By Status', count: objects.length, icon: <Tag size={11} />, children: statusNodes },
      ...(disNodes.length > 0 ? [{ key: 'dis_group' as GroupKey, label: 'DIS Categories', count: disNodes.reduce((s, n) => s + n.count, 0), icon: <Tag size={11} />, children: disNodes }] : []),
    ]
  }, [objects])

  const filteredTree = query.trim()
    ? tree.flatMap(n => {
        const children = n.children?.filter(c => c.label.toLowerCase().includes(query.toLowerCase())) ?? []
        return children.length > 0 ? children : n.label.toLowerCase().includes(query.toLowerCase()) ? [n] : []
      })
    : null

  const renderNode = (node: TreeNode, depth = 0) => {
    const isGroup = !!node.children
    const isExpanded = expanded[node.key]
    const isSelected = selected === node.key

    return (
      <div key={node.key}>
        <button
          onClick={() => {
            if (isGroup) toggle(node.key)
            else onSelect(node.key)
            if (!isGroup) onSelect(node.key)
          }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 6,
            padding: `5px 10px 5px ${10 + depth * 12}px`,
            background: isSelected ? '#1a1e28' : 'none',
            border: 'none',
            borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          {isGroup
            ? (isExpanded ? <ChevronDown size={10} color="#475569" /> : <ChevronRight size={10} color="#475569" />)
            : <span style={{ width: 10 }} />}
          <span style={{ color: isSelected ? '#3b82f6' : '#475569', display: 'flex', flexShrink: 0 }}>
            {node.icon ?? <Folder size={11} />}
          </span>
          <span style={{ flex: 1, fontSize: 11, color: isSelected ? '#e2e8f0' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: isGroup ? 'none' : 'none' }}>
            {node.label}
          </span>
          <span style={{ fontSize: 9, color: '#2a3042', flexShrink: 0 }}>{node.count}</span>
        </button>
        {isGroup && isExpanded && node.children?.map(c => renderNode(c, depth + 1))}
      </div>
    )
  }

  return (
    <div style={{ width: 220, display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Browse</span>
      </div>
      <div style={{ padding: '6px 8px', borderBottom: '1px solid #1a1e28' }}>
        <div style={{ position: 'relative' }}>
          <Search size={10} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter..."
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 22, paddingRight: 6, paddingTop: 4, paddingBottom: 4, background: '#0d0f14', border: '1px solid #222736', borderRadius: 5, color: '#e2e8f0', fontSize: 10, outline: 'none' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4, paddingBottom: 4 }}>
        {(filteredTree ?? tree).map(n => renderNode(n))}
      </div>
    </div>
  )
}
