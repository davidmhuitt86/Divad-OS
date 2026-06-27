import { useEffect, useRef } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

interface Props {
  activeAP: EKEObject | null
  apos: EKEObject[]
  apts: EKEObject[]
}

const STATUS_COLORS: Record<string, string> = {
  published:  '#22c55e',
  approved:   '#22c55e',
  in_review:  '#3b82f6',
  draft:      '#475569',
  archived:   '#2a3042',
}

function safeTitle(obj: EKEObject | null | undefined, prefix: string, fallback: string): string {
  if (!obj) return fallback
  const t = obj.title ?? ''
  const m = t.match(new RegExp(prefix + '[\\d.]+'))
  return m ? m[0] : fallback
}

function safeSub(obj: EKEObject | null | undefined, prefix: string, maxLen: number): string {
  if (!obj) return ''
  const t = obj.title ?? ''
  const stripped = t.replace(new RegExp(prefix + '[\\d.]+\\s*', 'i'), '').trim()
  return (stripped || t).slice(0, maxLen)
}

export default function ArchGraph({ activeAP, apos, apts }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width  = canvas.offsetWidth || 400
    const H = canvas.height = canvas.offsetHeight || 400

    ctx.clearRect(0, 0, W, H)

    if (!activeAP && apos.length === 0) return

    const PAD    = 24
    const NODE_W = 110
    const NODE_H = 42

    const APO_COUNT = Math.max(apos.length, 1)
    const COL_W = Math.max((W - PAD * 2) / APO_COUNT, NODE_W + 12)

    const apX = W / 2
    const apY = 54
    const apLabel = safeTitle(activeAP, 'AP-', 'AP-???')
    const apSub   = safeSub(activeAP, 'AP-', 22)

    drawNode(ctx, apX, apY, apLabel, apSub || 'Active Phase', '#3b82f6', 'rgba(59,130,246,0.25)', NODE_W + 20, NODE_H)

    if (apos.length === 0) return

    apos.forEach((apo, col) => {
      if (!apo) return
      const x = PAD + col * COL_W + COL_W / 2
      const y = 140
      const color = STATUS_COLORS[apo.status ?? 'draft'] ?? '#475569'
      const apoLabel = safeTitle(apo, 'APO-', `APO-${String(col + 1).padStart(3, '0')}`)
      const apoSub   = safeSub(apo, 'APO-', 16)

      // Line AP → APO
      ctx.strokeStyle = '#222736'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.moveTo(apX, apY + NODE_H / 2)
      ctx.lineTo(x, y - NODE_H / 2)
      ctx.stroke()
      ctx.setLineDash([])

      drawNode(ctx, x, y, apoLabel, apoSub, color, color + '44', NODE_W, NODE_H)

      const colApts = apts.filter(t => t && t.parent_id === apo.id).slice(0, 3)
      colApts.forEach((apt, row) => {
        if (!apt) return
        const ty = 220 + row * 74
        const tcolor = STATUS_COLORS[apt.status ?? 'draft'] ?? '#475569'
        const aptLabel = safeTitle(apt, 'APT-', `APT-${String(col + 1).padStart(3, '0')}.${row + 1}`)
        const aptSub   = safeSub(apt, 'APT-', 14)
        const prevY = row === 0 ? y + NODE_H / 2 : 220 + (row - 1) * 74 + NODE_H / 2

        ctx.strokeStyle = '#1a1e28'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, prevY)
        ctx.lineTo(x, ty - NODE_H / 2)
        ctx.stroke()

        drawNode(ctx, x, ty, aptLabel, aptSub, tcolor, tcolor + '22', NODE_W - 8, NODE_H - 4, apt.status)
      })
    })
  }, [activeAP, apos, apts])

  return (
    <div style={{ flex: 1, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Architecture Overview (Graph)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, padding: '4px 8px', fontSize: 11, color: '#94a3b8', cursor: 'pointer' }}>Fit View</button>
          {([ZoomIn, ZoomOut, Maximize2] as const).map((Icon, i) => (
            <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}><Icon size={13} /></button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {(!activeAP && apos.length === 0) ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: '#2a3042' }}>No architecture data yet</div>
            <div style={{ fontSize: 10, color: '#1a1e28' }}>Ask the agent to create AP-001 with objectives and tasks</div>
          </div>
        ) : (
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        )}
      </div>

      <div style={{ padding: '8px 14px', borderTop: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', flexShrink: 0 }}>
        {[
          { color: '#3b82f6', label: 'Phase (AP)',      sq: true  },
          { color: '#a855f7', label: 'Objective (APO)', sq: true  },
          { color: '#f59e0b', label: 'Task (APT)',       sq: true  },
          { color: '#22c55e', label: 'Completed',        sq: false },
          { color: '#3b82f6', label: 'In Progress',      sq: false },
          { color: '#475569', label: 'Not Started',      sq: false },
        ].map(({ color, label, sq }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {sq
              ? <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
              : <div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${color}`, background: 'transparent' }} />
            }
            <span style={{ fontSize: 9, color: '#475569' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  label: string, sub: string,
  borderColor: string, fillColor: string,
  w: number, h: number,
  status?: string
) {
  const x = cx - w / 2
  const y = cy - h / 2
  ctx.fillStyle = '#13161e'
  ctx.beginPath(); roundRect(ctx, x, y, w, h, 6); ctx.fill()
  ctx.strokeStyle = borderColor; ctx.lineWidth = 1.5
  ctx.beginPath(); roundRect(ctx, x, y, w, h, 6); ctx.stroke()
  ctx.fillStyle = fillColor
  ctx.beginPath(); roundRect(ctx, x, y, w, h, 6); ctx.fill()
  ctx.fillStyle = '#e2e8f0'; ctx.font = '600 10px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(label, cx, cy - 3)
  ctx.fillStyle = '#94a3b8'; ctx.font = '9px Inter, system-ui, sans-serif'
  ctx.fillText(sub.slice(0, 18), cx, cy + 10)
  if (status) {
    const dc = STATUS_COLORS[status] ?? '#475569'
    ctx.fillStyle = dc; ctx.beginPath(); ctx.arc(x + w - 9, cy, 4, 0, Math.PI * 2); ctx.fill()
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}
