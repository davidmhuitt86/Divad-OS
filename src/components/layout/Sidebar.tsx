import { useState, useRef, useEffect } from 'react'
import {
  Home, LayoutDashboard, Cpu, FolderGit2, Brain, Box,
  Briefcase, BarChart2, Calendar, Settings, Workflow,
  Plus, FileText, GitBranch, ListChecks, Upload, Bot,
  ChevronDown, Send, Loader2, ExternalLink,
  History, Share2, HelpCircle, ClipboardList, AlertTriangle, Wand2,
  Users, Activity, ClipboardCheck,
} from 'lucide-react'
import { useStore } from '../../store'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  implemented: boolean
  dot?: 'live' | 'ai'
}

interface NavSection {
  label: string
  badge?: string
  items: NavItem[]
}

// Navigation reorganized per AP-002 Milestone 4 sidebar redesign.
// Existing working pages are folded into the closest-fitting section;
// sections/items with no page built yet are marked implemented: false.
const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'home',                  label: 'Dashboard',             icon: Home,       implemented: true },
      { id: 'engineering-workspace', label: 'Engineering Workspace', icon: Workflow,   implemented: true, dot: 'live' },
      { id: 'workspace',             label: 'Workspace',             icon: Briefcase,  implemented: true },
      { id: 'calendar',              label: 'Calendar',              icon: Calendar,   implemented: true },
      { id: 'sessions',              label: 'Sessions',              icon: History,    implemented: false },
      { id: 'drafts',                label: 'Drafts',                icon: FileText,   implemented: false },
      { id: 'commit-history',        label: 'Commit History',        icon: GitBranch,  implemented: false },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { id: 'knowledge',            label: 'Knowledge',            icon: Brain,         implemented: true },
      { id: 'objects',               label: 'Universal Objects',    icon: Box,           implemented: true },
      { id: 'architecture',          label: 'Architecture',         icon: Cpu,           implemented: true },
      { id: 'knowledge-candidates',  label: 'Knowledge Candidates', icon: HelpCircle,    implemented: false },
      { id: 'relationships',         label: 'Relationships',        icon: Share2,        implemented: false },
      { id: 'evidence',              label: 'Evidence',             icon: ClipboardList, implemented: false },
    ],
  },
  {
    label: 'Visualization',
    items: [
      { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2,  implemented: false },
      { id: 'timeline',        label: 'Timeline',        icon: History, implemented: false },
    ],
  },
  {
    label: 'Analysis',
    badge: 'AI',
    items: [
      { id: 'assistant',              label: 'Reasoning',              icon: Bot,           implemented: true, dot: 'ai' },
      { id: 'reports',                label: 'Reports',                icon: BarChart2,     implemented: true },
      { id: 'conflicts',              label: 'Conflicts / Warnings',   icon: AlertTriangle, implemented: false },
      { id: 'suggested-corrections',  label: 'Suggested Corrections',  icon: Wand2,         implemented: false },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'settings',      label: 'Settings',      icon: Settings,        implemented: true },
      { id: 'repository',    label: 'Repository',    icon: FolderGit2,      implemented: true },
      { id: 'operations',    label: 'Operations',    icon: LayoutDashboard, implemented: true },
      { id: 'users',         label: 'Users',         icon: Users,           implemented: false },
      { id: 'system-health', label: 'System Health', icon: Activity,        implemented: false },
      { id: 'audit-log',     label: 'Audit Log',     icon: ClipboardCheck,  implemented: false },
    ],
  },
]

const DOT_COLOR: Record<'live' | 'ai', string> = { live: '#3b82f6', ai: '#a855f7' }

const QUICK_ACTIONS = [
  { label: 'New Object',       icon: Plus,       type: undefined            },
  { label: 'New Document',     icon: FileText,   type: 'document'           },
  { label: 'New AP / Mission', icon: Cpu,        type: 'architecture_phase' },
  { label: 'New Task',         icon: ListChecks, type: 'task'               },
  { label: 'New Decision',     icon: GitBranch,  type: 'decision'           },
  { label: 'Upload File',      icon: Upload,     type: undefined            },
]

function NavButton({ id, label, Icon, active, onClick, dot }: {
  id: string; label: string; Icon: React.ElementType; active: boolean; onClick: () => void; dot?: 'live' | 'ai'
}) {
  const [hovered, setHovered] = useState(false)
  const bg     = active ? 'rgba(59,130,246,0.1)' : hovered ? '#1a1e28' : 'transparent'
  const color  = active ? '#3b82f6' : hovered ? '#e2e8f0' : '#94a3b8'
  const border = active ? '2px solid #3b82f6' : '2px solid transparent'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', textAlign: 'left', border: 'none', cursor: 'pointer', fontSize: 12.5, background: bg, color, borderRight: border, transition: 'all 0.1s' }}
    >
      <Icon size={14} />
      <span style={{ flex: 1 }}>{label}</span>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: DOT_COLOR[dot], boxShadow: `0 0 5px ${DOT_COLOR[dot]}aa`, flexShrink: 0 }} />}
    </button>
  )
}

// Sub-item whose page hasn't been built yet — visible per the sidebar
// redesign reference but inert until its page ships.
function PlaceholderNavItem({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <div
      title="Coming soon"
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', fontSize: 12.5, color: '#3f4759', cursor: 'not-allowed' }}
    >
      <Icon size={14} />
      <span>{label}</span>
    </div>
  )
}

function SectionHeader({ label, badge }: { label: string; badge?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px 4px' }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 8, fontWeight: 700, color: '#a855f7', border: '1px solid #a855f755', background: '#a855f715', borderRadius: 3, padding: '0 4px' }}>{badge}</span>
      )}
    </div>
  )
}

// ── Persistent mini AI chat panel ──────────────────────────────────────────
function SidebarAIPanel({ onOpenFull }: { onOpenFull: () => void }) {
  const { messages, agentLoading, sendMessage } = useStore()
  const [open,  setOpen]  = useState(false)
  const [input, setInput] = useState('')
  const inputRef  = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function handleSend() {
    const text = input.trim()
    if (!text || agentLoading) return
    setInput('')
    await sendMessage(text)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleSend() }
  }

  const lastFew = messages.slice(-4)

  return (
    <div style={{ borderTop: '1px solid #1a1e2888', flexShrink: 0 }}>
      {/* Header row — always visible, click to expand/collapse */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', border: 'none', cursor: 'pointer',
          background: open ? 'rgba(59,130,246,0.07)' : 'transparent',
          borderLeft: open ? '2px solid rgba(59,130,246,0.5)' : '2px solid transparent',
          transition: 'all 0.1s',
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #60a5fa, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={11} color="#fff" />
        </div>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: open ? '#60a5fa' : '#94a3b8', textAlign: 'left' }}>Chief Engineer AI</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e88' }} />
          <ChevronDown size={11} style={{ color: '#475569', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div style={{ borderTop: '1px solid #1a1e28' }} className="fade-in">
          {/* Recent messages */}
          <div style={{ maxHeight: 180, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lastFew.length === 0 ? (
              <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>
                Ask me anything…
              </div>
            ) : (
              lastFew.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '90%', padding: '6px 10px',
                    borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    fontSize: 11, lineHeight: 1.5,
                    background: msg.role === 'user' ? '#1d4ed8' : '#1a1e28',
                    color: '#e2e8f0', border: msg.role === 'user' ? 'none' : '1px solid #222736',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {msg.content.length > 120 ? msg.content.slice(0, 120) + '…' : msg.content}
                  </div>
                </div>
              ))
            )}
            {agentLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                <Loader2 size={10} className="animate-spin" style={{ color: '#3b82f6' }} />
                <span style={{ fontSize: 10 }}>Thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{ padding: '6px 10px 8px', borderTop: '1px solid #1a1e28' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#1a1e28', borderRadius: 8, padding: '5px 8px', border: '1px solid #222736' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={agentLoading}
                placeholder="Quick question…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 11, fontFamily: 'inherit', caretColor: '#3b82f6' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || agentLoading}
                style={{ background: 'none', border: 'none', cursor: input.trim() && !agentLoading ? 'pointer' : 'default', color: input.trim() && !agentLoading ? '#3b82f6' : '#334155', display: 'flex', padding: 2, transition: 'color 0.15s' }}
              >
                <Send size={11} />
              </button>
            </div>
          </div>

          {/* Open full page */}
          <button
            onClick={onOpenFull}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 14px', border: 'none', borderTop: '1px solid #1a1e28', cursor: 'pointer', background: 'transparent', color: '#3b82f6', fontSize: 11, fontWeight: 600, transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.06)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <ExternalLink size={10} /> Open Full View
          </button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { activePage, setActivePage, openWizard } = useStore()

  return (
    <aside style={{ width: 208, display: 'flex', flexDirection: 'column', background: '#13161e', borderRight: '1px solid #1a1e28', flexShrink: 0, overflow: 'hidden' }}>

      {/* Main nav */}
      <nav style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ padding: '2px 0 2px' }}>
          {NAV_SECTIONS.map((section, i) => (
            <div key={section.label} style={i > 0 ? { borderTop: '1px solid #1a1e2866', marginTop: 2 } : undefined}>
              <SectionHeader label={section.label} badge={section.badge} />
              {section.items.map(({ id, label, icon: Icon, implemented, dot }) => (
                implemented
                  ? <NavButton key={id} id={id} label={label} Icon={Icon} active={activePage === id} onClick={() => setActivePage(id)} dot={dot} />
                  : <PlaceholderNavItem key={id} label={label} Icon={Icon} />
              ))}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ borderTop: '1px solid #1a1e2866', marginTop: 4, paddingTop: 6 }}>
          <div style={{ padding: '4px 14px 6px', fontSize: 9, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Quick Actions
          </div>
          {QUICK_ACTIONS.map(({ label, icon: Icon, type }) => (
            <button
              key={label}
              onClick={() => { if (label === 'Upload File') return; openWizard(type) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', textAlign: 'left', border: 'none', cursor: 'pointer', fontSize: 11.5, background: 'transparent', color: '#64748b', transition: 'all 0.1s' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#94a3b8'; el.style.background = '#1a1e28' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.color = '#64748b'; el.style.background = 'transparent' }}
            >
              <Icon size={11} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Chief Engineer AI — persistent collapsible panel */}
      <SidebarAIPanel onOpenFull={() => setActivePage('assistant')} />

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1e28', padding: '8px 14px', flexShrink: 0 }}>
        <NavButton id="settings" label="Settings" Icon={Settings} active={activePage === 'settings'} onClick={() => setActivePage('settings')} />
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #1a1e2844' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e88' }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>All Systems Operational</span>
          </div>
          <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>v0.1.0-alpha</div>
        </div>
      </div>
    </aside>
  )
}
