import { useEffect, useRef, useState } from 'react'
import { Network } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    // Simple force-directed layout approximation (static, no physics loop)
    const positions: Record<string, { x: number; y: number }> = {}
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2
      const radius = Math.min(W, H) * 0.35
      positions[n.id] = {
        x: W / 2 + Math.cos(angle) * radius,
        y: H / 2 + Math.sin(angle) * radius,
      }
    })

    ctx.clearRect(0, 0, W, H)

    // Draw edges
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

    // Draw nodes
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
  }, [nodes, edges, hovered])

  if (nodes.length === 0) {
    return (
      <div className="empty-state h-full">
        <Network size={18} />
        <span>No objects in graph yet</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 text-[10px] text-text-muted font-mono">
        {nodes.length} nodes · {edges.length} edges
      </div>
    </div>
  )
}
