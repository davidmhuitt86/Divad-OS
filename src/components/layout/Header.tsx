import { useState } from 'react'
import { Search, Bell } from 'lucide-react'
import { useStore } from '../../store'

export default function Header() {
  const { appState, searchQuery, setSearchQuery, runSearch } = useStore()
  const [focused, setFocused] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)
    if (q.length > 1) runSearch(q)
  }

  return (
    <header style={{ height: 56, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', background: '#13161e', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
      {/* Greeting */}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, lineHeight: 1 }}>{greeting}, David</div>
        <div style={{ color: '#475569', fontSize: 11, marginTop: 3, fontStyle: 'italic' }}>"Discipline. Knowledge. Execution. Results."</div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
        borderRadius: 6, border: `1px solid ${focused ? 'rgba(59,130,246,0.4)' : '#222736'}`,
        background: '#1a1e28', width: 340, transition: 'border-color 0.15s',
      }}>
        <Search size={13} style={{ color: '#475569', flexShrink: 0 }} />
        <input
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Universal Search (Objects, Docs, Tasks, Decisions...)"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: '#e2e8f0', fontFamily: 'inherit' }}
        />
        <kbd style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>⌘K</kbd>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {appState.currentAP && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6' }}>
            {appState.currentAP.title}
          </div>
        )}
        {appState.currentMIT && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            MIT — {appState.currentMIT.title.slice(0, 22)}{appState.currentMIT.title.length > 22 ? '…' : ''}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
          <Bell size={15} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#3b82f6', fontSize: 10, fontWeight: 700 }}>DH</span>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1 }}>David</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Chief Engineer</div>
          </div>
        </div>
      </div>
    </header>
  )
}
