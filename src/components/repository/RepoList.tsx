import { useState } from 'react'
import { Search, Plus } from 'lucide-react'

interface Props { selected: string; onSelect: (id: string) => void }

export default function RepoList({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('')
  // no real repos until git integration
  return (
    <div style={{ width: 240, display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Repositories</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex' }}><Plus size={13} /></button>
      </div>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1a1e28' }}>
        <div style={{ position: 'relative' }}>
          <Search size={11} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search repositories..."
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 24, paddingRight: 8, paddingTop: 5, paddingBottom: 5, background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, color: '#e2e8f0', fontSize: 10, outline: 'none' }} />
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🗂️</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>No repositories</div>
          <div style={{ fontSize: 10, color: '#2a3042' }}>Git integration not yet connected</div>
        </div>
      </div>
    </div>
  )
}
