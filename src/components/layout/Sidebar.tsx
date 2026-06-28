import { useState } from 'react'
import {
  Home, LayoutDashboard, Cpu, FolderGit2, Brain, Box,
  Briefcase, BarChart2, Calendar, Settings,
  Plus, FileText, GitBranch, ListChecks, Upload, Bot, ChevronRight
} from 'lucide-react'
import { useStore } from '../../store'

const NAV = [
  { id: 'home',         label: 'Dashboard',   icon: Home            },
  { id: 'operations',   label: 'Operations',  icon: LayoutDashboard },
  { id: 'architecture', label: 'Architecture', icon: Cpu             },
  { id: 'repository',   label: 'Repository',  icon: FolderGit2      },
  { id: 'knowledge',    label: 'Knowledge',   icon: Brain           },
  { id: 'objects',      label: 'Objects',     icon: Box             },
  { id: 'workspace',    label: 'Workspace',   icon: Briefcase       },
  { id: 'reports',      label: 'Reports',     icon: BarChart2       },
  { id: 'calendar',     label: 'Calendar',    icon: Calendar        },
]

const QUICK_ACTIONS = [
  { label: 'New Object',       icon: Plus       },
  { label: 'New Document',     icon: FileText   },
  { label: 'New AP / Mission', icon: Cpu        },
  { label: 'New Task',         icon: ListChecks },
  { label: 'New Decision',     icon: GitBranch  },
  { label: 'Upload File',      icon: Upload     },
  { label: 'Ask AI Assistant', icon: Bot        },
]

function NavButton({ id, label, Icon, active, onClick }: {
  id: string; label: string; Icon: React.ElementType; active: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const bg    = active ? 'rgba(59,130,246,0.1)' : hovered ? '#1a1e28' : 'transparent'
  const color = active ? '#3b82f6' : hovered ? '#e2e8f0' : '#94a3b8'
  const border = active ? '2px solid #3b82f6' : '2px solid transparent'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
        padding: '8px 14px', textAlign: 'left', border: 'none', cursor: 'pointer',
        fontSize: 12.5, background: bg, color, borderRight: border, transition: 'all 0.1s',
      }}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  )
}

const QUICK_ACTION_TYPES: Record<string, string | undefined> = {
  'New Object':       undefined,
  'New Document':     'document',
  'New AP / Mission': 'architecture_phase',
  'New Task':         'task',
  'New Decision':     'decision',
  'Upload File':      undefined,
  'Ask AI Assistant': undefined,
}

export default function Sidebar() {
  const { activePage, setActivePage, openWizard } = useStore()

  return (
    <aside style={{ width: 208, display: 'flex', flexDirection: 'column', background: '#13161e', borderRight: '1px solid #1a1e28', flexShrink: 0, overflow: 'hidden' }}>
      {/* Main nav */}
      <nav style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ padding: '6px 0 2px' }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <NavButton
              key={id}
              id={id}
              label={label}
              Icon={Icon}
              active={activePage === id}
              onClick={() => setActivePage(id)}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ borderTop: '1px solid #1a1e2866', marginTop: 4, paddingTop: 6 }}>
          <div style={{ padding: '4px 14px 6px', fontSize: 9, color: '#2a3042', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Quick Actions
          </div>
          {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                if (label === 'Ask AI Assistant') { setActivePage('home'); return }
                if (label === 'Upload File') return
                openWizard(QUICK_ACTION_TYPES[label])
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', textAlign: 'left', border: 'none', cursor: 'pointer',
                fontSize: 11.5, background: 'transparent', color: '#475569', transition: 'all 0.1s',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#94a3b8'; el.style.background = '#1a1e28' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.color = '#475569'; el.style.background = 'transparent' }}
            >
              <Icon size={11} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1e28', padding: '8px 14px', flexShrink: 0 }}>
        <NavButton
          id="settings"
          label="Settings"
          Icon={Settings}
          active={activePage === 'settings'}
          onClick={() => setActivePage('settings')}
        />
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #1a1e2844' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e88' }} />
            <span style={{ fontSize: 10, color: '#475569' }}>All Systems Operational</span>
          </div>
          <div style={{ fontSize: 10, color: '#2a3042', fontFamily: 'monospace' }}>v0.1.0-alpha</div>
        </div>
      </div>
    </aside>
  )
}
