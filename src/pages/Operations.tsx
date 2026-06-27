import { useEffect, useState } from 'react'
import { useStore } from '../store'
import StatCards from '../components/operations/StatCards'
import MissionBriefing from '../components/operations/MissionBriefing'
import ArchitectureTimeline from '../components/operations/ArchitectureTimeline'
import { OpenRisks, DecisionsPending } from '../components/operations/RiskDecisionPanels'
import BottomPanels from '../components/operations/BottomPanels'
import RightContextPanel from '../components/operations/RightContextPanel'
import type { EKEObject } from '../../shared/types'

export default function Operations() {
  const { appState, objects, activity, loadAppState, loadActivity, loadObjects } = useStore()
  const [selectedObject, setSelectedObject] = useState<EKEObject | null>(null)

  useEffect(() => {
    loadAppState()
    loadActivity()
    loadObjects()

    const isElectron = typeof window !== 'undefined' && !!window.divadOS
    if (isElectron) {
      const unsubActivity = window.divadOS.on('activity:new', () => loadActivity())
      const unsubState = window.divadOS.on('state:refresh', () => { loadAppState(); loadObjects() })
      return () => { unsubActivity(); unsubState() }
    }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Page header */}
        <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #1a1e28', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Operations</h1>
              <span style={{ fontSize: 12, color: '#475569' }}>Mission Command Center</span>
            </div>
            <div style={{ fontSize: 11, color: '#2a3042', marginTop: 2 }}>
              Real-time overview of mission status, architecture progress, and engineering operations.
            </div>
          </div>
          <button style={{ fontSize: 11, color: '#475569', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}>
            Customize
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Stat cards */}
          <StatCards appState={appState} objects={objects} />

          {/* Middle row: Mission Briefing + Architecture Timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12 }}>
            <MissionBriefing appState={appState} />
            <ArchitectureTimeline
              objects={objects}
              currentAPId={appState.currentAP?.id ?? null}
            />
          </div>

          {/* Third row: Risks + Decisions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <OpenRisks objects={objects} onSelect={setSelectedObject} />
            <DecisionsPending objects={objects} onSelect={setSelectedObject} />
          </div>

          {/* Bottom panel */}
          <div style={{ minHeight: 200 }}>
            <BottomPanels activity={activity} />
          </div>
        </div>
      </div>

      {/* Right context panel */}
      <RightContextPanel object={selectedObject} onClose={() => setSelectedObject(null)} />
    </div>
  )
}
