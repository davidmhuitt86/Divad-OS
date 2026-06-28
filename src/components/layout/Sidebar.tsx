import { useState, useRef, useEffect } from 'react'
import {
  Home, LayoutDashboard, Cpu, FolderGit2, Brain, Box,
  Briefcase, BarChart2, Calendar, Settings,
  Plus, FileText, GitBranch, ListChecks, Upload, Bot,
  ChevronDown, Send, Loader2, ExternalLink,
} from 'lucide-react'
import { useStore } from '../../store'

const NAV = [
  { id: 'home',         label: 'Dashboard',    icon: Home            },
  { id: 'operations',   label: 'Operations',   icon: LayoutDashboard },
  { id: 'architecture', label: 'Architecture', icon: Cpu             },
  { id: 'repository',   label: 'Repository',   icon: FolderGit2      },
  { id: 'knowledge',    label: 'Knowledge',    icon: Brain           },
  { id: 'objects',      label: 'Objects',      icon: Box             },
  { id: 'workspace',    label: 'Workspace',    icon: Briefcase       },
  { id: 'reports',      label: 'Reports',      icon: BarChart2       },
  { id: 'calendar',     label: 'Calendar',     icon: Calendar        },
]

const QUICK_ACTIONS = [
  { label: 'New Object',       icon: Plus,       type: undefined            },
  { label: 'New Document',     icon: FileText,   type: 'document'           },
  { label: 'New AP / Mission', icon: Cpu,        type: 'architecture_phase' },
  { label: 'New Task',         icon: ListChecks, type: 'task'               },
  { label: 'New Decision',     icon: GitBranch,  type: 'decision'           },
  { label: 'Upload File',      icon: Upload,     type: undefined            },
]

function NavButton({ id, label, Icon, active, onClick }: {
  id: string; label: string; Icon: React.ElementType; active: boolean; onClick: () => void
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
      <span>{label}</span>
    </button>
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
        <div style={{ padding: '6px 0 2px' }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <NavButton key={id} id={id} label={label} Icon={Icon} active={activePage === id} onClick={() => setActivePage(id)} />
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
