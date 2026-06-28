import { useRef, useCallback } from 'react'
import { Eye, EyeOff, Maximize2, GripVertical } from 'lucide-react'
import type { PageLayout } from '../../hooks/usePageLayout'

interface Props {
  id: string
  layout: PageLayout
  children: React.ReactNode
  /** Base style applied when locked (width, height, flex, gridColumn etc.) */
  lockedStyle?: React.CSSProperties
  className?: string
}

export default function LayoutPanel({ id, layout, children, lockedStyle, className }: Props) {
  const { unlocked, isVisible, togglePanel, setSize, fitSize, dragFrom, setDragFrom, swapOrder, getPanel } = layout
  const panel    = getPanel(id)
  const visible  = isVisible(id)
  const resizeRef = useRef<HTMLDivElement>(null)
  const dragging  = dragFrom === id

  // ── Resize via bottom-right handle ───────────────────────────────────────────
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const el  = resizeRef.current
    if (!el) return
    const startX = e.clientX
    const startY = e.clientY
    const startW = el.offsetWidth
    const startH = el.offsetHeight

    function onMove(me: MouseEvent) {
      const w = Math.max(120, startW + me.clientX - startX)
      const h = Math.max(80,  startH + me.clientY - startY)
      el!.style.width  = `${w}px`
      el!.style.height = `${h}px`
    }
    function onUp(me: MouseEvent) {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      const w = Math.max(120, startW + me.clientX - startX)
      const h = Math.max(80,  startH + me.clientY - startY)
      setSize(id, w, h)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [id, setSize])

  // ── Drag-to-reorder ───────────────────────────────────────────────────────────
  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = 'move'
    setDragFrom(id)
  }
  function onDragOver(e: React.DragEvent) {
    if (dragFrom && dragFrom !== id) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    if (dragFrom && dragFrom !== id) {
      swapOrder(dragFrom, id)
      setDragFrom(null)
    }
  }
  function onDragEnd() { setDragFrom(null) }

  // ── Resolved size ─────────────────────────────────────────────────────────────
  const sizeStyle: React.CSSProperties = unlocked && panel.w
    ? { width: panel.w, height: panel.h, minWidth: 0, minHeight: 0, flexShrink: 0 }
    : {}

  const baseStyle: React.CSSProperties = unlocked
    ? { ...sizeStyle, position: 'relative', display: visible ? undefined : 'none' }
    : { ...lockedStyle, display: visible ? undefined : 'none' }

  if (!unlocked) {
    return <div style={baseStyle} className={className}>{children}</div>
  }

  const isDropTarget = dragFrom && dragFrom !== id

  return (
    <div
      ref={resizeRef}
      style={{
        ...baseStyle,
        outline: dragging
          ? '2px dashed rgba(59,130,246,0.7)'
          : isDropTarget
            ? '2px dashed rgba(168,85,247,0.6)'
            : '2px solid rgba(59,130,246,0.25)',
        borderRadius: 8,
        position: 'relative',
        transition: 'outline-color 0.15s',
        cursor: 'default',
        opacity: dragging ? 0.5 : 1,
        overflow: 'hidden',
      }}
      className={className}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Unlock toolbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(13,15,20,0.92)', backdropFilter: 'blur(4px)',
        borderBottom: '1px solid rgba(59,130,246,0.2)',
        padding: '3px 6px',
      }}>
        {/* Drag handle */}
        <div style={{ cursor: 'grab', color: '#475569', display: 'flex', marginRight: 4 }}>
          <GripVertical size={12} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Fit to content */}
        <button
          onClick={() => fitSize(id)}
          title="Fit to content"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 2, borderRadius: 3 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#475569'}
        >
          <Maximize2 size={11} />
        </button>

        {/* Visibility toggle */}
        <button
          onClick={() => togglePanel(id)}
          title={visible ? 'Hide panel' : 'Show panel'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: visible ? '#3b82f6' : '#475569', display: 'flex', padding: 2, borderRadius: 3 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2e8f0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = visible ? '#3b82f6' : '#475569'}
        >
          {visible ? <Eye size={11} /> : <EyeOff size={11} />}
        </button>
      </div>

      {/* Content — padded below toolbar */}
      <div style={{ paddingTop: 24, height: '100%', boxSizing: 'border-box' }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        title="Drag to resize"
        style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 14, height: 14, cursor: 'nwse-resize', zIndex: 30,
          background: 'linear-gradient(135deg, transparent 50%, rgba(59,130,246,0.5) 50%)',
          borderBottomRightRadius: 6,
        }}
      />
    </div>
  )
}
