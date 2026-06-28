import { useState, useEffect, useMemo } from 'react'
import { Network, Map, Plus, ChevronDown } from 'lucide-react'
import { useStore } from '../store'
import type { EKEObject } from '../../shared/types'
import ArchStatCards  from '../components/architecture/ArchStatCards'
import PhasesList     from '../components/architecture/PhasesList'
import ArchGraph      from '../components/architecture/ArchGraph'
import ArchRightPanel from '../components/architecture/ArchRightPanel'
import ArchRoadmap    from '../components/architecture/ArchRoadmap'
import DependencyMap  from '../components/architecture/DependencyMap'
import LayoutPanel from '../components/layout/LayoutPanel'
import LayoutLock  from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'

const PANELS = ['statCards', 'phasesList', 'mainView', 'rightPanel', 'roadmap', 'depMap']

export default function Architecture() {
  const { objects, activity, appState, loadObjects, loadAppState, loadActivity, openWizard, navigateToObjects } = useStore()
  const [selectedAP, setSelectedAP] = useState<EKEObject | null>(null)
  const [view, setView] = useState<'graph' | 'roadmap'>('graph')
  const layout = usePageLayout('architecture', PANELS)

  useEffect(() => { loadObjects(); loadAppState(); loadActivity() }, [])

  const phases = useMemo(() => objects.filter(o => o.type === 'architecture_phase'), [objects])
  const apos   = useMemo(() => objects.filter(o => o.type === 'apo'), [objects])
  const apts   = useMemo(() => objects.filter(o => o.type === 'apt' || o.type === 'task'), [objects])

  useEffect(() => {
    if (!selectedAP && phases.length > 0) setSelectedAP(appState?.currentAP ?? phases[0])
  }, [phases.length, appState?.currentAP?.id])

  const visibleApos = useMemo(() => selectedAP ? apos.filter(o => o.parent_id === selectedAP.id) : apos, [selectedAP, apos])
  const visibleApts = useMemo(() => visibleApos.length > 0 ? apts.filter(o => visibleApos.some(apo => apo.id === o.parent_id)) : apts, [visibleApos, apts])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 14, gap: 10, position: 'relative' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Architecture</h1>
          <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Design. Plan. Build. Excellence.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setView('graph')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: view === 'graph' ? 'rgba(59,130,246,0.1)' : '#1a1e28', border: `1px solid ${view === 'graph' ? 'rgba(59,130,246,0.3)' : '#222736'}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, color: view === 'graph' ? '#3b82f6' : '#94a3b8' }}>
            <Network size={13} /> Architecture Graph
          </button>
          <button onClick={() => setView('roadmap')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: view === 'roadmap' ? 'rgba(59,130,246,0.1)' : '#1a1e28', border: `1px solid ${view === 'roadmap' ? 'rgba(59,130,246,0.3)' : '#222736'}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, color: view === 'roadmap' ? '#3b82f6' : '#94a3b8' }}>
            <Map size={13} /> Roadmap View
          </button>
          <button onClick={() => openWizard('architecture_phase')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
            <Plus size={13} /> New AP <ChevronDown size={11} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <LayoutPanel id="statCards" layout={layout}>
        <ArchStatCards objects={objects} appState={appState} />
      </LayoutPanel>

      {/* Main 3-column */}
      <div style={layout.unlocked ? { display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minHeight: 0 } : { display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        <LayoutPanel id="phasesList" layout={layout} lockedStyle={{ flexShrink: 0 }}>
          <PhasesList phases={phases} activeId={selectedAP?.id ?? null} onSelect={setSelectedAP} onNewAP={() => openWizard('architecture_phase')} onViewAll={() => navigateToObjects('architecture_phase')} />
        </LayoutPanel>
        <LayoutPanel id="mainView" layout={layout} lockedStyle={{ flex: 1, minWidth: 0 }}>
          {view === 'graph' ? (
            <ArchGraph activeAP={selectedAP} apos={visibleApos} apts={visibleApts} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, height: '100%' }}>
              <ArchRoadmap phases={phases} />
              <DependencyMap objects={objects} />
            </div>
          )}
        </LayoutPanel>
        <LayoutPanel id="rightPanel" layout={layout} lockedStyle={{ flexShrink: 0 }}>
          <ArchRightPanel objects={objects} activity={activity} />
        </LayoutPanel>
      </div>

      {/* Bottom row */}
      <div style={layout.unlocked ? { display: 'flex', flexWrap: 'wrap', gap: 10, flexShrink: 0 } : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flexShrink: 0 }}>
        <LayoutPanel id="roadmap" layout={layout} lockedStyle={{ flex: 1 }}>
          <ArchRoadmap phases={phases} />
        </LayoutPanel>
        <LayoutPanel id="depMap" layout={layout} lockedStyle={{ flex: 1 }}>
          <DependencyMap objects={objects} />
        </LayoutPanel>
      </div>

      <LayoutLock layout={layout} />
    </div>
  )
}
