import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Bell, X, User, Settings, KeyRound, LogOut, HelpCircle, Keyboard, ChevronDown, Bot, Cpu } from 'lucide-react'
import { useStore } from '../../store'
import type { EKEObject } from '../../../shared/types'

const TYPE_ICON: Record<string, string> = {
  document: '📄', task: '✅', knowledge_object: '◈', decision: '⚖️',
  architecture_phase: '🏗️', requirement: '📋', risk: '⚠️', research: '🔬',
  standard: '📏', apo: '🎯', apt: '🔧', meeting: '📅', journal: '📓',
  product: '📦', question: '❓', apm: '📐', aar: '📑', mit: '🎯',
}

const STATUS_COLOR: Record<string, string> = {
  draft: '#3b82f6', in_review: '#f59e0b', approved: '#22c55e',
  published: '#22c55e', revised: '#a855f7', archived: '#475569',
}

function groupByType(results: EKEObject[]): Map<string, EKEObject[]> {
  const map = new Map<string, EKEObject[]>()
  for (const obj of results) {
    if (!map.has(obj.type)) map.set(obj.type, [])
    map.get(obj.type)!.push(obj)
  }
  return map
}

// Read header display prefs from settings
function getHeaderSettings() {
  try {
    const s = localStorage.getItem('divad-os-settings')
    const p = s ? JSON.parse(s) : {}
    return {
      showGreeting:    p.headerShowGreeting    ?? true,
      showQuote:       p.headerShowQuote       ?? true,
      showAIAssistant: p.headerShowAIAssistant ?? true,
    }
  } catch { return { showGreeting: true, showQuote: true, showAIAssistant: true } }
}

const HEADER_H = 108

export default function Header() {
  const {
    searchQuery, searchResults, setSearchQuery, runSearch, openObject,
    notificationsOpen, toggleNotifications, closeNotifications,
    userMenuOpen, toggleUserMenu, closeUserMenu,
    setActivePage,
  } = useStore()

  const [focused,   setFocused]   = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef     = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const bellRef      = useRef<HTMLDivElement>(null)
  const avatarRef    = useRef<HTMLDivElement>(null)

  const showOverlay = focused && searchQuery.trim().length > 1
  const flat        = searchResults
  const grouped     = groupByType(flat)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const hPrefs   = getHeaderSettings()

  // ─── Search handlers ─────────────────────────────────────────────────────────
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)
    setActiveIdx(-1)
    if (q.length > 1) runSearch(q)
    else runSearch('')
  }
  function clearSearch() {
    setSearchQuery(''); runSearch(''); setActiveIdx(-1); inputRef.current?.focus()
  }
  function selectResult(obj: EKEObject) {
    openObject(obj); setSearchQuery(''); runSearch(''); setActiveIdx(-1); inputRef.current?.blur()
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showOverlay) return
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter' && activeIdx >= 0 && flat[activeIdx]) { e.preventDefault(); selectResult(flat[activeIdx]) }
    else if (e.key === 'Escape') { e.preventDefault(); setFocused(false); inputRef.current?.blur() }
  }

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault(); inputRef.current?.focus(); inputRef.current?.select(); setFocused(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [handleGlobalKey])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false)
      if (bellRef.current   && !bellRef.current.contains(e.target as Node))   closeNotifications()
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) closeUserMenu()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header style={{
      height: HEADER_H,
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '0 20px 0 20px',
      background: '#0d0f14',
      borderBottom: '1px solid #1a1e28',
      flexShrink: 0,
      position: 'relative',
      zIndex: 100,
      // right padding leaves room for Windows traffic-light controls (~150px)
      paddingRight: 164,
      WebkitAppRegion: 'drag',
    } as unknown as React.CSSProperties}>

      {/* ── Logo ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, WebkitAppRegion: 'no-drag' } as unknown as React.CSSProperties}>
        <img src="/boot/divad-mark.png" alt="mark" style={{ height: 52, width: 'auto' }} />
        <div style={{ borderLeft: '1px solid #1a1e28', paddingLeft: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.04em', lineHeight: 1 }}>DIVAD OS</div>
          <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4 }}>Engineering Knowledge Engine</div>
          {hPrefs.showGreeting && (
            <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 5, fontWeight: 600 }}>{greeting}, David</div>
          )}
          {hPrefs.showQuote && (
            <div style={{ fontSize: 9, color: '#2a3042', fontStyle: 'italic', marginTop: 2 }}>"Discipline. Knowledge. Execution."</div>
          )}
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────────── */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', maxWidth: 560, WebkitAppRegion: 'no-drag' } as unknown as React.CSSProperties}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
          borderRadius: showOverlay ? '8px 8px 0 0' : 8,
          border: `1px solid ${focused ? 'rgba(59,130,246,0.45)' : '#222736'}`,
          borderBottom: showOverlay ? '1px solid #222736' : undefined,
          background: '#13161e', transition: 'border-color 0.15s',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
        }}>
          <Search size={14} style={{ color: focused ? '#3b82f6' : '#475569', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search everything...  (Objects, Documents, Tasks, People)"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: '#e2e8f0', fontFamily: 'inherit' }}
          />
          {searchQuery ? (
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }}>
              <X size={12} />
            </button>
          ) : (
            <kbd style={{ fontSize: 10, color: '#2a3042', fontFamily: 'monospace', padding: '2px 6px', background: '#0d0f14', border: '1px solid #222736', borderRadius: 4 }}>Ctrl K</kbd>
          )}
        </div>

        {showOverlay && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#13161e', border: '1px solid rgba(59,130,246,0.25)',
            borderTop: 'none', borderRadius: '0 0 8px 8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxHeight: 420, overflowY: 'auto', zIndex: 200,
          }}>
            {flat.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#475569', fontSize: 12, fontStyle: 'italic' }}>
                No results for "{searchQuery}"
              </div>
            ) : (
              <>
                {Array.from(grouped.entries()).map(([type, items]) => (
                  <div key={type}>
                    <div style={{ padding: '8px 14px 4px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#0d0f14' }}>
                      {type.replace(/_/g, ' ')} · {items.length}
                    </div>
                    {items.map(obj => {
                      const globalIdx = flat.indexOf(obj)
                      const isActive  = globalIdx === activeIdx
                      return (
                        <div key={obj.id}
                          onMouseDown={e => { e.preventDefault(); selectResult(obj) }}
                          onMouseEnter={() => setActiveIdx(globalIdx)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent' }}>
                          <span style={{ fontSize: 15, flexShrink: 0 }}>{TYPE_ICON[obj.type] ?? '◈'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.title}</div>
                            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{obj.type.replace(/_/g, ' ')}{obj.owner ? ` · ${obj.owner}` : ''}</div>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, color: STATUS_COLOR[obj.status] ?? '#475569', background: (STATUS_COLOR[obj.status] ?? '#475569') + '22', border: `1px solid ${(STATUS_COLOR[obj.status] ?? '#475569')}44`, textTransform: 'capitalize', flexShrink: 0 }}>
                            {obj.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div style={{ padding: '8px 14px', borderTop: '1px solid #1a1e2880', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#2a3042' }}>{flat.length} result{flat.length !== 1 ? 's' : ''}</span>
                  <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#2a3042' }}>
                    <span><kbd style={{ fontFamily: 'monospace' }}>↑↓</kbd> navigate</span>
                    <span><kbd style={{ fontFamily: 'monospace' }}>↵</kbd> open</span>
                    <span><kbd style={{ fontFamily: 'monospace' }}>esc</kbd> close</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right actions ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, WebkitAppRegion: 'no-drag' } as unknown as React.CSSProperties}>

        {/* Notifications */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button onClick={toggleNotifications}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: notificationsOpen ? 'rgba(59,130,246,0.1)' : '#13161e', border: `1px solid ${notificationsOpen ? 'rgba(59,130,246,0.35)' : '#1a1e28'}`, borderRadius: 8, cursor: 'pointer', color: notificationsOpen ? '#3b82f6' : '#94a3b8' }}>
            <Bell size={15} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Notifications</span>
            <span style={{ fontSize: 10, fontWeight: 700, background: '#3b82f6', color: '#fff', borderRadius: 10, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>8</span>
          </button>
          {notificationsOpen && <NotificationsPanel />}
        </div>

        {/* AI Assistant */}
        {hPrefs.showAIAssistant && (
          <button onClick={() => setActivePage('workspace')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.35)'; (e.currentTarget as HTMLElement).style.color = '#3b82f6' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1e28'; (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #60a5fa, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={12} color="#fff" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600 }}>AI Assistant</span>
          </button>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: '#1a1e28' }} />

        {/* User */}
        <div ref={avatarRef} style={{ position: 'relative' }}>
          <div onClick={toggleUserMenu}
            style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: userMenuOpen ? 'rgba(59,130,246,0.07)' : 'transparent', border: `1px solid ${userMenuOpen ? 'rgba(59,130,246,0.2)' : 'transparent'}` }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: '2px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>DH</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>David</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>Chief Engineer</div>
            </div>
            <ChevronDown size={12} style={{ color: '#475569' }} />
          </div>
          {userMenuOpen && <UserMenuDropdown onNavigate={(page) => { setActivePage(page); closeUserMenu() }} />}
        </div>
      </div>
    </header>
  )
}

function NotificationsPanel() {
  const [activeTab, setActiveTab] = useState('All')
  const tabs = ['All', 'Unread', 'Mentions', 'Task Updates', 'Approvals', 'System Alerts']
  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, background: '#13161e', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 300 }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Notifications</span>
        <button style={{ fontSize: 10, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Mark All as Read</button>
      </div>
      <div style={{ display: 'flex', overflowX: 'auto', padding: '6px 10px', borderBottom: '1px solid #1a1e28', gap: 4 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, whiteSpace: 'nowrap', fontWeight: t === activeTab ? 600 : 400, background: t === activeTab ? 'rgba(59,130,246,0.15)' : 'transparent', color: t === activeTab ? '#3b82f6' : '#475569' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ padding: '32px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
        <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>No {activeTab.toLowerCase()} notifications</div>
      </div>
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1e28', textAlign: 'center' }}>
        <button style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View All Notifications</button>
      </div>
    </div>
  )
}

function UserMenuDropdown({ onNavigate }: { onNavigate: (page: string) => void }) {
  const items: [string, React.ReactNode, () => void][] = [
    ['Profile',              <User size={13} />,     () => onNavigate('settings')],
    ['My Settings',          <Settings size={13} />, () => onNavigate('settings')],
    ['API Keys',             <KeyRound size={13} />, () => onNavigate('settings')],
    ['Help & Documentation', <HelpCircle size={13} />, () => onNavigate('settings')],
    ['Keyboard Shortcuts',   <Keyboard size={13} />, () => onNavigate('settings')],
  ]
  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 220, background: '#13161e', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 300, overflow: 'hidden' }}>
      <div style={{ padding: '14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>DH</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>David Huitt</div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Chief Engineer</div>
        </div>
      </div>
      {items.map(([label, icon, action]) => (
        <button key={label} onClick={action}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#94a3b8', textAlign: 'left' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
          <span style={{ color: '#475569' }}>{icon}</span>{label}
        </button>
      ))}
      <div style={{ borderTop: '1px solid #1a1e28' }}>
        <button
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444', textAlign: 'left' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
          <LogOut size={13} /> Log Out
        </button>
      </div>
    </div>
  )
}
