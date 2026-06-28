import { useEffect, useState } from 'react'
import { useStore } from '../store'
import StatCards from '../components/operations/StatCards'
import MissionBriefing from '../components/operations/MissionBriefing'
import ArchitectureTimeline from '../components/operations/ArchitectureTimeline'
import { OpenRisks, DecisionsPending } from '../components/operations/RiskDecisionPanels'
import BottomPanels from '../components/operations/BottomPanels'
import RightContextPanel from '../components/operations/RightContextPanel'
import LayoutPanel from '../components/layout/LayoutPanel'
import LayoutLock from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'
import type { EKEObject } from '../../shared/types'

const PANELS = ['statCards', 'missionBriefing', 'archTimeline', 'openRisks', 'decisions', 'bottomPanels']

export default function Operations() {
  const { appState, objects, activity, loadAppState, loadActivity, loadObjects, setActivePage, navigateToObjects, openObject } = useStore()
  const [selectedObject, setSelectedObject] = useState<EKEObject | null>(null)
  const layout = usePageLayout('operations', PANELS)

  useEffect(() => {
    loadAppState(); loadActivity(); loadObjects()
    const isElectron = typeof window !== 'undefined' && !!window.divadOS
    if (isElectron) {
      const unsubActivity = window.divadOS.on('activity:new', () => loadActivity())
      const unsubState    = window.divadOS.on('state:refresh', () => { loadAppState(); loadObjects() })
      return () => { unsubActivity(); unsubState() }
    }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Page header */}
        <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #1a1e28', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Operations</h1>
              <span style={{ fontSize: 12, color: '#475569' }}>Mission Command Center</span>
            </div>
            <div style={{ fontSize: 11, color: '#2a3042', marginTop: 2 }}>Real-time overview of mission status, architecture progress, and engineering operations.</div>
          </div>
          <button onClick={() => setActivePage('settings')} style={{ fontSize: 11, color: '#475569', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3b82f655'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#222736'}>
            Customize
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <LayoutPanel id="statCards" layout={layout}>
            <StatCards appState={appState} objects={objects} />
          </LayoutPanel>

          <div style={layout.unlocked ? { display: 'flex', flexWrap: 'wrap', gap: 12 } : { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12 }}>
            <LayoutPanel id="missionBriefing" layout={layout} lockedStyle={{ width: 300 }}>
              <MissionBriefing appState={appState} />
            </LayoutPanel>
            <LayoutPanel id="archTimeline" layout={layout} lockedStyle={{ flex: 1 }}>
              <ArchitectureTimeline
                objects={objects} currentAPId={appState.currentAP?.id ?? null}
                onViewRoadmap={() => setActivePage('architecture')}
                onViewAllMilestones={() => navigateToObjects('apm')}
              />
            </LayoutPanel>
          </div>

          <div style={layout.unlocked ? { display: 'flex', flexWrap: 'wrap', gap: 12 } : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <LayoutPanel id="openRisks" layout={layout} lockedStyle={{ flex: 1 }}>
              <OpenRisks objects={objects} onSelect={setSelectedObject} onViewAll={() => navigateToObjects('risk')} />
            </LayoutPanel>
            <LayoutPanel id="decisions" layout={layout} lockedStyle={{ flex: 1 }}>
              <DecisionsPending objects={objects} onSelect={setSelectedObject} onViewAll={() => navigateToObjects('decision')} />
            </LayoutPanel>
          </div>

          <LayoutPanel id="bottomPanels" layout={layout} lockedStyle={{ minHeight: 200 }}>
            <BottomPanels activity={activity} />
          </LayoutPanel>
        </div>
      </div>

      <RightContextPanel
        object={selectedObject}
        onClose={() => setSelectedObject(null)}
        onOpenInWorkspace={() => { if (selectedObject) { openObject(selectedObject); setActivePage('workspace') } }}
      />

      <LayoutLock layout={layout} />
    </div>
  )
}
