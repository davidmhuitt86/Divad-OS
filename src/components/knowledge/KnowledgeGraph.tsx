import { useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

const NODES = [
  { id: 'center',  label: 'Universal Object',    x: 0.50, y: 0.45, r: 28, color: '#3b82f6', type: 'object'    },
  { id: 'arch',    label: 'Architecture Phase',  x: 0.50, y: 0.10, r: 18, color: '#a855f7', type: 'concept'   },
  { id: 'obj',     label: 'Object Model',        x: 0.82, y: 0.28, r: 16, color: '#a855f7', type: 'concept'   },
  { id: 'commit',  label: 'Repository Commit',   x: 0.82, y: 0.62, r: 16, color: '#f59e0b', type: 'document'  },
  { id: 'engdoc',  label: 'Engineering Document',x: 0.50, y: 0.80, r: 16, color: '#f59e0b', type: 'document'  },
  { id: 'req',     label: 'Requirement',         x: 0.18, y: 0.62, r: 16, color: '#22c55e', type: 'process'   },
  { id: 'workflow',label: 'Workflow Task',       x: 0.18, y: 0.28, r: 16, color: '#22c55e', type: 'process'   },
  { id: 'source',  label: 'Knowledge Source',    x: 0.22, y: 0.08, r: 14, color: '#06b6d4', type: 'source'    },
  { id: 'n1',      label: '',                    x: 0.66, y: 0.16, r: 6,  color: '#2a3042', type: 'node'      },
  { id: 'n2',      label: '',                    x: 0.72, y: 0.50, r: 6,  color: '#2a3042', type: 'node'      },
  { id: 'n3',      label: '',                    x: 0.38, y: 0.82, r: 6,  color: '#2a3042', type: 'node'      },
  { id: 'n4',      label: '',                    x: 0.32, y: 0.20, r: 6,  color: '#2a3042', type: 'node'      },
]

const EDGES = [
  ['center','arch'],['center','obj'],['center','commit'],['center','engdoc'],
  ['center','req'],['center','workflow'],['center','source'],
  ['arch','source'],['arch','n1'],['obj','n1'],['obj','n2'],
  ['commit','n2'],['engdoc','n3'],['req','n3'],['workflow','n4'],['source','n4'],
]

const LEGEND = [
  { color: '#3b82f6', label: 'Concept'   },
  { color: '#a855f7', label: 'Object'    },
  { color: '#22c55e', label: 'Process'   },
  { color: '#f59e0b', label: 'Document'  },
  { color: '#06b6d4', label: 'Source'    },
  { color: '#475569', label: 'Relationship', dash: true },
]

export default function KnowledgeGraph() {
  const [mode, setMode] = useState<'2D'|'3D'>('2D')
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({ active: false, lastX: 0, lastY: 0 })
  const W = 400; const H = 320

  const pos = (n: typeof NODES[0]) => ({ x: n.x * W, y: n.y * H })

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setScale(s => Math.max(0.2, Math.min(6, s * factor)))
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
    <div style={{ flex: 1, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', flex: 1 }}>Knowledge Graph View</span>
        {(['2D','3D'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 600, borderRadius: 4, border: '1px solid ' + (mode===m ? '#3b82f6' : '#1a1e28'), background: mode===m ? 'rgba(59,130,246,0.15)' : 'transparent', color: mode===m ? '#3b82f6' : '#475569', cursor: 'pointer' }}>{m}</button>
        ))}
        <button onClick={() => setScale(s => Math.min(6, s * 1.2))} title="Zoom in" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 3 }}><ZoomIn size={12} /></button>
        <button onClick={() => setScale(s => Math.max(0.2, s / 1.2))} title="Zoom out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 3 }}><ZoomOut size={12} /></button>
        <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }) }} title="Reset view" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 3 }}><Maximize2 size={12} /></button>
        <span style={{ fontSize: 9, color: '#2a3042', fontFamily: 'monospace' }}>{Math.round(scale * 100)}%</span>
        <select style={{ background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, color: '#94a3b8', fontSize: 10, padding: '3px 6px', cursor: 'pointer' }}>
          <option>All Domains</option>
        </select>
      </div>

      {/* Graph SVG with pan/zoom */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'grab' }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`} style={{ transformOrigin: `${W/2}px ${H/2}px` }}>
            {/* Edges */}
            {EDGES.map(([a, b]) => {
              const na = NODES.find(n => n.id === a)!
              const nb = NODES.find(n => n.id === b)!
              const pa = pos(na); const pb = pos(nb)
              return <line key={a+b} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#1a1e28" strokeWidth={1.5} strokeDasharray={na.id==='center'||nb.id==='center' ? '' : '3,3'} />
            })}
            {/* Nodes */}
            {NODES.map(n => {
              const p = pos(n)
              return (
                <g key={n.id} style={{ cursor: 'pointer' }}>
                  {n.r > 10 && <circle cx={p.x} cy={p.y} r={n.r + 6} fill={n.color + '18'} />}
                  <circle cx={p.x} cy={p.y} r={n.r} fill="#13161e" stroke={n.color} strokeWidth={n.id==='center' ? 2.5 : 1.5} />
                  {n.id === 'center' && <circle cx={p.x} cy={p.y} r={n.r - 8} fill={n.color + '33'} />}
                  {n.label && (
                    <text x={p.x} y={p.y + n.r + 11} textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="Inter, system-ui, sans-serif">
                      {n.label}
                    </text>
                  )}
                  {n.id === 'center' && (
                    <text x={p.x} y={p.y + 3} textAnchor="middle" fill="#3b82f6" fontSize={7} fontWeight="700" fontFamily="Inter, system-ui">Universal Object</text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Legend + status */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid #1a1e28', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.dash ? 'transparent' : l.color, border: l.dash ? `1.5px dashed ${l.color}` : 'none' }} />
              <span style={{ fontSize: 9, color: '#475569' }}>{l.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: '#2a3042' }}>
          Nodes: 3,842 · Relationships: 28,743 · Displaying: 124 of 3,842 nodes · Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
