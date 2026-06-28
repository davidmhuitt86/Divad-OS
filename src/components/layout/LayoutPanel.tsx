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
  const { unlocked, isVisible, togglePanel, setSize, fitSize, getPanel, dragFrom, setDragFrom, swapOrder, bumpActivity } = layout
  const panel   = getPanel(id)
  const visible = isVisible(id)
  const ref     = useRef<HTMLDivElement>(null)

  // ── Resize helper — axis: 'x' | 'y' | 'both' ──────────────────────────────
  const makeResizeHandler = useCallback((axis: 'x' | 'y' | 'both') =>
    (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation()
      const el = ref.current; if (!el) return
      const startX = e.clientX, startY = e.clientY
      const startW = el.offsetWidth,  startH = el.offsetHeight

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
        const w = (axis === 'x' || axis === 'both') ? Math.max(140, startW + me.clientX - startX) : (panel.w ?? (el?.offsetWidth ?? startW))
        const h = (axis === 'y' || axis === 'both') ? Math.max(80,  startH + me.clientY - startY) : (panel.h ?? (el?.offsetHeight ?? startH))
        setSize(id, w, h)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup',   onUp)
    },
  [id, panel.w, panel.h, setSize])

  // ── Drag-to-reorder via pointer tracking ───────────────────────────────────
  const onGripMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragFrom(id)
    bumpActivity()

    function onUp(me: MouseEvent) {
      document.removeEventListener('mouseup', onUp)
      // Temporarily hide the dragging panel so elementsFromPoint finds what's under it
      if (ref.current) ref.current.style.pointerEvents = 'none'
      const stack = document.elementsFromPoint(me.clientX, me.clientY)
      if (ref.current) ref.current.style.pointerEvents = ''
      const target = stack.find(el =>
        el.hasAttribute('data-panel-id') && el.getAttribute('data-panel-id') !== id
      )
      const targetId = target?.getAttribute('data-panel-id')
      if (targetId) swapOrder(id, targetId)
      setDragFrom(null)
    }
    document.addEventListener('mouseup', onUp)
  }, [id, setDragFrom, swapOrder, bumpActivity])

  // ── Locked render ──────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div style={{ ...lockedStyle, display: visible ? undefined : 'none' }} className={className}>
        {children}
      </div>
    )
  }

  const isDragging  = dragFrom === id
  const isDropTarget = dragFrom !== null && dragFrom !== id
  const sizeStyle: React.CSSProperties = panel.w
    ? { width: panel.w, height: panel.h, flexShrink: 0 }
    : { flexShrink: 0 }

  return (
    <div
      ref={ref}
      data-panel-id={id}
      style={{
        ...sizeStyle,
        order: panel.order,
        position: 'relative',
        display: visible ? 'flex' : 'none',
        flexDirection: 'column',
        minWidth: 140,
        minHeight: 80,
        borderRadius: 8,
        outline: isDragging
          ? '2px dashed rgba(59,130,246,0.7)'
          : isDropTarget
            ? '2px dashed rgba(168,85,247,0.7)'
            : '2px solid rgba(59,130,246,0.3)',
        opacity: isDragging ? 0.5 : 1,
        transition: 'outline-color 0.12s, opacity 0.12s',
        overflow: 'visible',
      }}
      className={className}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(13,15,20,0.95)', backdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '6px 6px 0 0',
        padding: '3px 6px',
        userSelect: 'none',
      }}>
        {/* Drag grip */}
        <div
          onMouseDown={onGripMouseDown}
          title="Drag to reorder"
          style={{ cursor: 'grab', color: '#94a3b8', display: 'flex', padding: '0 2px' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2e8f0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
        >
          <GripVertical size={13} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Fit to content */}
        <button
          onClick={() => fitSize(id)}
          title="Reset size to auto"
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

      {/* ── Content area with interaction blocker ─────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', paddingTop: 26, minHeight: 0 }}>
        {children}
        {/* Transparent overlay blocks all clicks to panel content while unlocked */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          cursor: 'default', background: 'rgba(13,15,20,0.18)',
          borderRadius: '0 0 6px 6px',
        }} />
      </div>

      {/* ── Bottom edge resize ─────────────────────────────────────── */}
      <div
        onMouseDown={makeResizeHandler('y')}
        title="Drag to resize height"
        style={{
          position: 'absolute', bottom: -4, left: 16, right: 16, height: 10,
          cursor: 's-resize', zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ width: '40%', height: 3, borderRadius: 2, background: 'rgba(59,130,246,0.45)' }} />
      </div>

      {/* ── Right edge resize ──────────────────────────────────────── */}
      <div
        onMouseDown={makeResizeHandler('x')}
        title="Drag to resize width"
        style={{
          position: 'absolute', top: 16, right: -4, bottom: 16, width: 10,
          cursor: 'e-resize', zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ height: '40%', width: 3, borderRadius: 2, background: 'rgba(59,130,246,0.45)' }} />
      </div>

      {/* ── Corner resize (both axes) ──────────────────────────────── */}
      <div
        onMouseDown={makeResizeHandler('both')}
        title="Drag to resize"
        style={{
          position: 'absolute', bottom: -4, right: -4,
          width: 16, height: 16, cursor: 'nwse-resize', zIndex: 31,
          background: 'linear-gradient(135deg, transparent 45%, rgba(59,130,246,0.7) 45%)',
          borderRadius: '0 0 6px 0',
        }}
      />

      {/* Drop target highlight */}
      {isDropTarget && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 6,
          background: 'rgba(168,85,247,0.08)', zIndex: 5, pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}
