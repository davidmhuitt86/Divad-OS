import { useRef } from 'react'
import { Lock, Unlock, Eye } from 'lucide-react'
import type { PageLayout } from '../../hooks/usePageLayout'

interface Props { layout: PageLayout }

export default function LayoutLock({ layout }: Props) {
  const {
    unlocked, toggleUnlock,
    hiddenCount, showAllPanels,
    toggleSessionShow, sessionShow,
    setHoldShow,
  } = layout

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHolding = useRef(false)

  function onMouseDown() {
    isHolding.current = false
    holdTimer.current = setTimeout(() => {
      isHolding.current = true
      setHoldShow(true)
    }, 400)
  }
  function onMouseUp() {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (isHolding.current) {
      setHoldShow(false)
    } else {
      toggleSessionShow()
    }
  }
  function onMouseLeave() {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    setHoldShow(false)
    isHolding.current = false
  }

  return (
    <div style={{
      position: 'absolute', bottom: 10, right: 10, zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {/* Hidden panels indicator + master show */}
      {hiddenCount > 0 && (
        <button
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          title={`${hiddenCount} hidden panel${hiddenCount !== 1 ? 's' : ''} — click to toggle, hold to peek`}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: sessionShow ? 'rgba(59,130,246,0.2)' : 'rgba(13,15,20,0.7)',
            border: `1px solid ${sessionShow ? 'rgba(59,130,246,0.5)' : 'rgba(71,85,105,0.4)'}`,
            backdropFilter: 'blur(6px)',
            cursor: 'pointer', fontSize: 10, fontWeight: 600,
            color: sessionShow ? '#60a5fa' : '#64748b',
            transition: 'all 0.15s',
          }}
        >
          <Eye size={11} />
          {hiddenCount} hidden
        </button>
      )}

      {/* Restore all */}
      {hiddenCount > 0 && (
        <button
          onClick={showAllPanels}
          title="Restore all hidden panels permanently"
          style={{
            padding: '4px 8px', borderRadius: 20,
            background: 'rgba(13,15,20,0.7)', border: '1px solid rgba(71,85,105,0.4)',
            backdropFilter: 'blur(6px)', cursor: 'pointer', fontSize: 9,
            color: '#475569',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569' }}
        >
          Restore all
        </button>
      )}

      {/* Lock / Unlock toggle */}
      <button
        onClick={toggleUnlock}
        title={unlocked ? 'Lock layout' : 'Unlock layout to resize and rearrange panels'}
        style={{
          width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: unlocked ? 'rgba(59,130,246,0.15)' : 'rgba(13,15,20,0.55)',
          border: `1px solid ${unlocked ? 'rgba(59,130,246,0.4)' : 'rgba(71,85,105,0.3)'}`,
          backdropFilter: 'blur(6px)',
          cursor: 'pointer', color: unlocked ? '#3b82f6' : '#334155',
          transition: 'all 0.15s',
          boxShadow: unlocked ? '0 0 8px rgba(59,130,246,0.3)' : 'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = unlocked ? '#60a5fa' : '#64748b'
          el.style.borderColor = unlocked ? 'rgba(96,165,250,0.6)' : 'rgba(71,85,105,0.5)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = unlocked ? '#3b82f6' : '#334155'
          el.style.borderColor = unlocked ? 'rgba(59,130,246,0.4)' : 'rgba(71,85,105,0.3)'
        }}
      >
        {unlocked ? <Unlock size={12} /> : <Lock size={12} />}
      </button>
    </div>
  )
}
