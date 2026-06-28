import { useEffect, useState } from 'react'
import { useStore } from '../store'
import MissionBrief from '../components/panels/MissionBrief'
import ActivityFeed from '../components/panels/ActivityFeed'
import SystemOverview from '../components/panels/SystemOverview'
import AgentChat from '../components/panels/AgentChat'
import OpenItems from '../components/panels/OpenItems'
import KnowledgeGraph from '../components/panels/KnowledgeGraph'
import QuickActions from '../components/panels/QuickActions'
import LayoutPanel from '../components/layout/LayoutPanel'
import LayoutLock from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'
import type { EKEObject } from '../../shared/types'

const PANELS = ['missionBrief', 'activityFeed', 'systemOverview', 'openItems', 'agentChat', 'knowledgeGraph', 'quickActions']

export default function Home() {
  const { loadAppState, loadActivity, loadObjects } = useStore()
  const layout = usePageLayout('home', PANELS)
  const [graphData, setGraphData] = useState<{ nodes: EKEObject[]; edges: { source_id: string; target_id: string }[] }>({ nodes: [], edges: [] })

  useEffect(() => {
    loadAppState(); loadActivity(); loadObjects()
    const isElectron = typeof window !== 'undefined' && !!window.divadOS
    if (isElectron) {
      window.divadOS.graph.snapshot().then(d => setGraphData(d as any))
      const unsubActivity = window.divadOS.on('activity:new', () => loadActivity())
      const unsubState    = window.divadOS.on('state:refresh', () => {
        loadAppState(); loadObjects()
        window.divadOS.graph.snapshot().then(d => setGraphData(d as any))
      })
      return () => { unsubActivity(); unsubState() }
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10, padding: 10, overflow: 'hidden', position: 'relative' }}>
      {/* Top row */}
      <div style={layout.unlocked
        ? { display: 'flex', flexWrap: 'wrap', gap: 10, flexShrink: 0 }
        : { display: 'grid', gridTemplateColumns: '260px 1fr 200px 180px', gap: 10, height: 220, flexShrink: 0 }
      }>
        {layout.sorted.filter(id => ['missionBrief','activityFeed','systemOverview','openItems'].includes(id)).map(id => (
          <LayoutPanel key={id} id={id} layout={layout}
            lockedStyle={id === 'missionBrief' ? { width: 260 } : id === 'systemOverview' ? { width: 200 } : id === 'openItems' ? { width: 180 } : { flex: 1 }}>
            {id === 'missionBrief'  && <MissionBrief />}
            {id === 'activityFeed'  && <ActivityFeed />}
            {id === 'systemOverview'&& <SystemOverview />}
            {id === 'openItems'     && <OpenItems />}
          </LayoutPanel>
        ))}
      </div>

      {/* Bottom row */}
      <div style={layout.unlocked
        ? { display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minHeight: 0 }
        : { display: 'flex', gap: 10, flex: 1, minHeight: 0 }
      }>
        {layout.sorted.filter(id => ['agentChat','knowledgeGraph','quickActions'].includes(id)).map(id => (
          <LayoutPanel key={id} id={id} layout={layout}
            lockedStyle={id === 'agentChat' ? { flex: 1, minWidth: 0 } : id === 'knowledgeGraph' ? { width: 300, display: 'flex', flexDirection: 'column' } : { width: 180, flexShrink: 0 }}>
            {id === 'agentChat' && <AgentChat />}
            {id === 'knowledgeGraph' && (
              <div className="panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="panel-header">
                  <span className="panel-title">Knowledge Graph</span>
                  {graphData.nodes.length > 0 && <span style={{ fontSize: 10, color: '#475569' }}>{graphData.nodes.length} nodes</span>}
                </div>
                <div style={{ flex: 1, minHeight: 0, padding: 8 }}>
                  <KnowledgeGraph nodes={graphData.nodes} edges={graphData.edges} />
                </div>
              </div>
            )}
            {id === 'quickActions' && <QuickActions />}
          </LayoutPanel>
        ))}
      </div>

      <LayoutLock layout={layout} />
    </div>
  )
}
