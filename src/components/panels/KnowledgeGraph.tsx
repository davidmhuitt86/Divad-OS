import { useEffect, useRef, useState } from 'react'
import { Network } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'
import { useStore } from '../../store'

interface Props {
  nodes: EKEObject[]
  edges: { source_id: string; target_id: string }[]
}

const TYPE_COLORS: Record<string, string> = {
  document:          '#3b82f6',
  task:              '#22c55e',
  knowledge_object:  '#a855f7',
  decision:          '#f59e0b',
  architecture_phase:'#06b6d4',
  risk:              '#ef4444',
  default:           '#475569',
}

export default function KnowledgeGraph({ nodes, edges }: Props) {
  const { openObject } = useStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const [hovered, setHovered] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({ active: false, lastX: 0, lastY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    const positions: Record<string, { x: number; y: number }> = {}
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2
      const radius = Math.min(W, H) * 0.35
      positions[n.id] = {
        x: W / 2 + Math.cos(angle) * radius,
        y: H / 2 + Math.sin(angle) * radius,
      }
    })
    positionsRef.current = positions

    ctx.clearRect(0, 0, W, H)
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    ctx.strokeStyle = '#1a1e28'
    ctx.lineWidth = 1
    edges.forEach(e => {
      const s = positions[e.source_id]
      const t = positions[e.target_id]
      if (!s || !t) return
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(t.x, t.y)
      ctx.stroke()
    })

    nodes.forEach(n => {
      const p = positions[n.id]
      const color = TYPE_COLORS[n.type] ?? TYPE_COLORS.default
      const r = n.id === hovered ? 7 : 5
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fillStyle = color + '33'
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    ctx.restore()
  }, [nodes, edges, hovered, pan, zoom])

  if (nodes.length === 0) {
    return (
      <div className="empty-state h-full">
        <Network size={18} />
        <span>No objects in graph yet</span>
      </div>
    )
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = ((e.clientX - rect.left) * scaleX - pan.x) / zoom
    const cy = ((e.clientY - rect.top)  * scaleY - pan.y) / zoom
    for (const node of nodes) {
      const p = positionsRef.current[node.id]
      if (!p) continue
      if (Math.sqrt((cx - p.x) ** 2 + (cy - p.y) ** 2) <= 8) {
        openObject(node)
        return
      }
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setZoom(z => Math.max(0.2, Math.min(6, z * factor)))
  }

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.lastX
    const dy = e.clientY - dragRef.current.lastY
    dragRef.current.lastX = e.clientX
    dragRef.current.lastY = e.clientY
    setPan(p => ({ x: p.x + dx, y: p.y + dy }))
  }

  const onMouseUp = () => { dragRef.current.active = false }

  return (
    <div
      className="relative w-full h-full"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ cursor: 'grab' }}
    >
      <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 text-[10px] text-text-muted font-mono" style={{ pointerEvents: 'none' }}>
        {nodes.length} nodes · {edges.length} edges · {Math.round(zoom * 100)}%
      </div>
      <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
        <button onClick={() => setZoom(z => Math.min(6, z * 1.2))} title="Zoom in" style={{ background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, padding: '3px 7px', fontSize: 11, color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>+</button>
        <button onClick={() => setZoom(z => Math.max(0.2, z / 1.2))} title="Zoom out" style={{ background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, padding: '3px 7px', fontSize: 11, color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} title="Reset" style={{ background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, padding: '3px 7px', fontSize: 10, color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>⊡</button>
      </div>
    </div>
  )
}
