import { useRef, useCallback } from 'react'
import { Eye, EyeOff, Maximize2, GripVertical } from 'lucide-react'
import type { PageLayout } from '../../hooks/usePageLayout'

interface Props {
  id: string
  layout: PageLayout
  children: React.ReactNode
  lockedStyle?: React.CSSProperties
  className?: string
}

export default function LayoutPanel({ id, layout, children, lockedStyle, className }: Props) {
  const { unlocked, isVisible, togglePanel, setSize, fitSize, getPanel, setDragFrom, swapOrder, bumpActivity } = layout
  const panel   = getPanel(id)
  const visible = isVisible(id)
  const ref     = useRef<HTMLDivElement>(null)

  // ── Resize — handles sit INSIDE the panel boundary to avoid overflow:hidden clipping ──
  const makeResizeHandler = useCallback((axis: 'x' | 'y' | 'both') =>
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const el = ref.current
      if (!el) return

      const startX = e.clientX, startY = e.clientY
      const startW = el.offsetWidth, startH = el.offsetHeight

      // Lock cursor for the whole resize
      const cursorMap = { x: 'ew-resize', y: 'ns-resize', both: 'nwse-resize' }
      const overlay = document.createElement('div')
      overlay.style.cssText = `position:fixed;inset:0;z-index:99999;cursor:${cursorMap[axis]}`
      document.body.appendChild(overlay)

      function onMove(me: MouseEvent) {
        if (!el) return
        if (axis === 'x' || axis === 'both')
          el.style.width  = `${Math.max(140, startW + me.clientX - startX)}px`
        if (axis === 'y' || axis === 'both')
          el.style.height = `${Math.max(80,  startH + me.clientY - startY)}px`
      }
      function onUp(me: MouseEvent) {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup',   onUp)
        document.body.removeChild(overlay)
        const w = (axis === 'x' || axis === 'both') ? Math.max(140, startW + me.clientX - startX) : (panel.w ?? (el?.offsetWidth ?? startW))
        const h = (axis === 'y' || axis === 'both') ? Math.max(80,  startH + me.clientY - startY) : (panel.h ?? (el?.offsetHeight ?? startH))
        setSize(id, w, h)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup',   onUp)
    },
  [id, panel.w, panel.h, setSize])

  // ── Drag-to-reorder: full visual ghost + live target highlight ───────────────
  const onGripMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragFrom(id)
    bumpActivity()

    // Ghost label follows cursor
    const ghost = document.createElement('div')
    ghost.style.cssText = [
      'position:fixed', 'z-index:99999', 'pointer-events:none',
      'background:rgba(59,130,246,0.18)', 'border:2px dashed rgba(59,130,246,0.8)',
      'border-radius:8px', 'padding:6px 14px',
      'font-size:11px', 'font-weight:600', 'color:#60a5fa',
      'transform:translate(-50%,-130%)', 'white-space:nowrap',
      'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
      `left:${e.clientX}px`, `top:${e.clientY}px`,
    ].join(';')
    ghost.textContent = '⊹ Moving panel…'
    document.body.appendChild(ghost)
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'

    let currentTarget: string | null = null

    function clearHighlight() {
      if (currentTarget) {
        const el = document.querySelector(`[data-panel-id="${currentTarget}"]`)
        el?.removeAttribute('data-drag-over')
      }
      currentTarget = null
    }

    function onMove(me: MouseEvent) {
      ghost.style.left = `${me.clientX}px`
      ghost.style.top  = `${me.clientY}px`

      // Temporarily disable pointer-events on dragging panel so we see through it
      if (ref.current) ref.current.style.pointerEvents = 'none'
      const stack = document.elementsFromPoint(me.clientX, me.clientY)
      if (ref.current) ref.current.style.pointerEvents = ''

      const hit = stack.find(el =>
        el.hasAttribute('data-panel-id') && el.getAttribute('data-panel-id') !== id
      )
      const hoverId = hit?.getAttribute('data-panel-id') ?? null

      if (hoverId !== currentTarget) {
        clearHighlight()
        currentTarget = hoverId
        if (currentTarget) {
          document.querySelector(`[data-panel-id="${currentTarget}"]`)
            ?.setAttribute('data-drag-over', 'true')
        }
      }
    }

    function onUp(me: MouseEvent) {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      clearHighlight()
      document.body.removeChild(ghost)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      // Final target check at drop position
      if (ref.current) ref.current.style.pointerEvents = 'none'
      const stack = document.elementsFromPoint(me.clientX, me.clientY)
      if (ref.current) ref.current.style.pointerEvents = ''

      const hit = stack.find(el =>
        el.hasAttribute('data-panel-id') && el.getAttribute('data-panel-id') !== id
      )
      const targetId = hit?.getAttribute('data-panel-id')
      if (targetId) swapOrder(id, targetId)
      setDragFrom(null)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
  }, [id, setDragFrom, swapOrder, bumpActivity])

  // ── Locked render ──────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div style={{ ...lockedStyle, display: visible ? undefined : 'none' }} className={className}>
        {children}
      </div>
    )
  }

  const sizeStyle: React.CSSProperties = panel.w
    ? { width: panel.w, height: panel.h, flexShrink: 0 }
    : { flexShrink: 0 }

  return (
    <div
      ref={ref}
      data-panel-id={id}
      draggable={false}
      style={{
        ...sizeStyle,
        order: panel.order,
        position: 'relative',
        display: visible ? 'flex' : 'none',
        flexDirection: 'column',
        minWidth: 140,
        minHeight: 80,
        borderRadius: 8,
        border: '2px solid rgba(59,130,246,0.3)',
        opacity: 1,
        overflow: 'hidden',   // handles sit inside, no clipping issues
        userSelect: 'none',
      }}
      className={className}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(13,15,20,0.95)', backdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(59,130,246,0.2)',
        padding: '3px 6px',
        zIndex: 20,
      }}>
        {/* Drag grip */}
        <div
          onMouseDown={onGripMouseDown}
          title="Drag to reorder panel"
          style={{ cursor: 'grab', color: '#94a3b8', display: 'flex', padding: '2px 4px', borderRadius: 4 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2e8f0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
        >
          <GripVertical size={13} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Fit to content */}
        <button
          onClick={() => fitSize(id)}
          title="Reset to auto size"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 3, borderRadius: 3 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2e8f0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}
        >
          <Maximize2 size={11} />
        </button>

        {/* Visibility toggle */}
        <button
          onClick={() => togglePanel(id)}
          title={visible ? 'Hide panel' : 'Show panel'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: visible ? '#60a5fa' : '#64748b', display: 'flex', padding: 3, borderRadius: 3 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2e8f0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = visible ? '#60a5fa' : '#64748b'}
        >
          {visible ? <Eye size={11} /> : <EyeOff size={11} />}
        </button>
      </div>

      {/* ── Content with interaction blocker ────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        {children}
        {/* Blocks all clicks to panel content while layout is unlocked */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          cursor: 'default', background: 'rgba(13,15,20,0.12)',
        }} />
      </div>

      {/* ── Right-edge resize (full height minus toolbar) ────────────────── */}
      <div
        onMouseDown={makeResizeHandler('x')}
        title="Drag to resize width"
        style={{
          position: 'absolute',
          top: 26, bottom: 10, right: 0,
          width: 8, cursor: 'ew-resize', zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => {
          const bar = e.currentTarget.querySelector('div') as HTMLElement
          if (bar) bar.style.background = 'rgba(59,130,246,0.7)'
        }}
        onMouseLeave={e => {
          const bar = e.currentTarget.querySelector('div') as HTMLElement
          if (bar) bar.style.background = 'rgba(59,130,246,0.35)'
        }}
      >
        <div style={{ width: 3, height: '50%', borderRadius: 2, background: 'rgba(59,130,246,0.35)', transition: 'background 0.15s' }} />
      </div>

      {/* ── Bottom-edge resize (full width minus corner) ─────────────────── */}
      <div
        onMouseDown={makeResizeHandler('y')}
        title="Drag to resize height"
        style={{
          position: 'absolute',
          bottom: 0, left: 10, right: 10,
          height: 8, cursor: 'ns-resize', zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => {
          const bar = e.currentTarget.querySelector('div') as HTMLElement
          if (bar) bar.style.background = 'rgba(59,130,246,0.7)'
        }}
        onMouseLeave={e => {
          const bar = e.currentTarget.querySelector('div') as HTMLElement
          if (bar) bar.style.background = 'rgba(59,130,246,0.35)'
        }}
      >
        <div style={{ height: 3, width: '50%', borderRadius: 2, background: 'rgba(59,130,246,0.35)', transition: 'background 0.15s' }} />
      </div>

      {/* ── Corner resize (both) ─────────────────────────────────────────── */}
      <div
        onMouseDown={makeResizeHandler('both')}
        title="Drag to resize"
        style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 16, height: 16, cursor: 'nwse-resize', zIndex: 31,
          background: 'linear-gradient(135deg, transparent 45%, rgba(59,130,246,0.6) 45%)',
          borderRadius: '0 0 6px 0',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, transparent 45%, rgba(59,130,246,0.9) 45%)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, transparent 45%, rgba(59,130,246,0.6) 45%)'}
      />
    </div>
  )
}
