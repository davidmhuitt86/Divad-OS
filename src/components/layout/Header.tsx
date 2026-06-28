import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Bell, X } from 'lucide-react'
import { useStore } from '../../store'
import CreateMenu from '../wizard/CreateMenu'
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

export default function Header() {
  const { appState, searchQuery, searchResults, setSearchQuery, runSearch, openObject } = useStore()
  const [focused, setFocused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const showOverlay = focused && searchQuery.trim().length > 1
  const flat = searchResults

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)
    setActiveIdx(-1)
    if (q.length > 1) runSearch(q)
    else runSearch('')
  }

  function clearSearch() {
    setSearchQuery('')
    runSearch('')
    setActiveIdx(-1)
    inputRef.current?.focus()
  }

  function selectResult(obj: EKEObject) {
    openObject(obj)
    setSearchQuery('')
    runSearch('')
    setActiveIdx(-1)
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showOverlay) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0 && flat[activeIdx]) {
      e.preventDefault()
      selectResult(flat[activeIdx])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  // ⌘K / Ctrl+K global shortcut
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
      setFocused(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [handleGlobalKey])

  // Close overlay on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const grouped = groupByType(flat)

  return (
    <header style={{ height: 56, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', background: '#13161e', borderBottom: '1px solid #1a1e28', flexShrink: 0, position: 'relative', zIndex: 100 }}>
      {/* Greeting */}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, lineHeight: 1 }}>{greeting}, David</div>
        <div style={{ color: '#475569', fontSize: 11, marginTop: 3, fontStyle: 'italic' }}>"Discipline. Knowledge. Execution. Results."</div>
      </div>

      {/* Search with overlay */}
      <div ref={containerRef} style={{ position: 'relative', width: 340 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          borderRadius: showOverlay ? '6px 6px 0 0' : 6,
          border: `1px solid ${focused ? 'rgba(59,130,246,0.4)' : '#222736'}`,
          borderBottom: showOverlay ? '1px solid #222736' : undefined,
          background: '#1a1e28', transition: 'border-color 0.15s',
        }}>
          <Search size={13} style={{ color: '#475569', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Universal Search (Objects, Docs, Tasks, Decisions...)"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: '#e2e8f0', fontFamily: 'inherit' }}
          />
          {searchQuery ? (
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }}>
              <X size={12} />
            </button>
          ) : (
            <kbd style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>⌘K</kbd>
          )}
        </div>

        {/* Results overlay */}
        {showOverlay && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#1a1e28', border: '1px solid rgba(59,130,246,0.3)',
            borderTop: 'none', borderRadius: '0 0 8px 8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            maxHeight: 420, overflowY: 'auto', zIndex: 200,
          }}>
            {flat.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#475569', fontSize: 12, fontStyle: 'italic' }}>
                No results for "{searchQuery}"
              </div>
            ) : (
              <>
                {/* Group by type */}
                {Array.from(grouped.entries()).map(([type, items]) => (
                  <div key={type}>
                    <div style={{ padding: '8px 14px 4px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#13161e' }}>
                      {type.replace(/_/g, ' ')} · {items.length}
                    </div>
                    {items.map(obj => {
                      const globalIdx = flat.indexOf(obj)
                      const isActive = globalIdx === activeIdx
                      return (
                        <div
                          key={obj.id}
                          onMouseDown={e => { e.preventDefault(); selectResult(obj) }}
                          onMouseEnter={() => setActiveIdx(globalIdx)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                            cursor: 'pointer', background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                            transition: 'background 0.08s',
                          }}
                        >
                          <span style={{ fontSize: 15, flexShrink: 0 }}>{TYPE_ICON[obj.type] ?? '◈'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {obj.title}
                            </div>
                            <div style={{ fontSize: 10, color: '#475569', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{obj.type.replace(/_/g, ' ')}</span>
                              {obj.owner && <><span>·</span><span>{obj.owner}</span></>}
                              {obj.tags.length > 0 && <><span>·</span><span>{obj.tags.slice(0, 2).join(', ')}</span></>}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                            color: STATUS_COLOR[obj.status] ?? '#475569',
                            background: (STATUS_COLOR[obj.status] ?? '#475569') + '22',
                            border: `1px solid ${(STATUS_COLOR[obj.status] ?? '#475569')}44`,
                            textTransform: 'capitalize', flexShrink: 0,
                          }}>
                            {obj.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* Footer */}
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
        <CreateMenu />
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
