import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../../store'
import { TYPE_CONFIG } from './CreationWizard'

const MENU_ITEMS = [
  'document', 'knowledge_object', 'architecture_phase', 'apo', 'apt',
  'decision', 'research', 'meeting', 'journal', 'requirement',
  'risk', 'question', 'standard', 'product',
]

export default function CreateMenu() {
  const [open, setOpen] = useState(false)
  const { openWizard } = useStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const select = (type: string) => {
    setOpen(false)
    openWizard(type)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: open ? '#3b82f6' : '#1d4ed8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
        <Plus size={14} /> Create
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 220, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px 6px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #1a1e28' }}>
            Create New
          </div>
          <div style={{ padding: '4px 0', maxHeight: 340, overflowY: 'auto' }}>
            {MENU_ITEMS.map(type => {
              const cfg = TYPE_CONFIG[type]
              if (!cfg) return null
              return (
                <button key={type} onClick={() => select(type)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                  <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{cfg.icon}</span>
                  <span style={{ fontSize: 12, color: '#e2e8f0' }}>{cfg.label}</span>
                </button>
              )
            })}
            <div style={{ height: 1, background: '#1a1e28', margin: '4px 0' }} />
            <button onClick={() => { setOpen(false); openWizard() }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
              <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>➕</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Custom Object</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
