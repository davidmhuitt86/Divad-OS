import { Home, Layers, Cpu, BookOpen, FolderGit2, Search, Bot, Calendar, BarChart2, Settings } from 'lucide-react'
import { useStore } from '../../store'

const NAV = [
  { id: 'home',         label: 'Home',         icon: Home },
  { id: 'operations',   label: 'Operations',   icon: Layers },
  { id: 'architecture', label: 'Architecture', icon: Cpu },
  { id: 'engineering',  label: 'Engineering',  icon: BookOpen },
  { id: 'repository',   label: 'Repository',   icon: FolderGit2 },
  { id: 'search',       label: 'Search',       icon: Search },
  { id: 'agent',        label: 'AI Assistant', icon: Bot },
  { id: 'calendar',     label: 'Calendar',     icon: Calendar },
  { id: 'reports',      label: 'Reports',      icon: BarChart2 },
]

export default function Sidebar() {
  const { activePage, setActivePage } = useStore()

  return (
    <aside style={{ width: 208, display: 'flex', flexDirection: 'column', background: '#13161e', borderRight: '1px solid #1a1e28', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #1a1e28' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 12 }}>▲</span>
        </div>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>DIVAD OS</div>
          <div style={{ color: '#475569', fontSize: 9, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Engineering OS</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', textAlign: 'left', border: 'none', cursor: 'pointer',
                fontSize: 13, transition: 'all 0.15s',
                background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: active ? '#3b82f6' : '#94a3b8',
                borderRight: active ? '2px solid #3b82f6' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#1a1e28'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' } }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1e28', padding: 12 }}>
        <button
          onClick={() => setActivePage('settings')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 12 }}
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
        <div style={{ marginTop: 10, padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e88' }} />
            <span style={{ fontSize: 10, color: '#475569' }}>All Systems Operational</span>
          </div>
          <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>v0.1.0-alpha</div>
        </div>
      </div>
    </aside>
  )
}
