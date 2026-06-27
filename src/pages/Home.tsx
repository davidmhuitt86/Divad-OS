import { useEffect, useState } from 'react'
import { useStore } from '../store'
import MissionBrief from '../components/panels/MissionBrief'
import ActivityFeed from '../components/panels/ActivityFeed'
import SystemOverview from '../components/panels/SystemOverview'
import AgentChat from '../components/panels/AgentChat'
import OpenItems from '../components/panels/OpenItems'
import KnowledgeGraph from '../components/panels/KnowledgeGraph'
import type { EKEObject } from '../../shared/types'

export default function Home() {
  const { loadAppState, loadActivity, loadObjects } = useStore()
  const [graphData, setGraphData] = useState<{ nodes: EKEObject[]; edges: { source_id: string; target_id: string }[] }>({ nodes: [], edges: [] })

  useEffect(() => {
    loadAppState()
    loadActivity()
    loadObjects()

    const isElectron = typeof window !== 'undefined' && !!window.divadOS
    if (isElectron) {
      window.divadOS.graph.snapshot().then(d => setGraphData(d as { nodes: EKEObject[]; edges: { source_id: string; target_id: string }[] }))
      const unsubActivity = window.divadOS.on('activity:new', () => loadActivity())
      const unsubState = window.divadOS.on('state:refresh', () => {
        loadAppState()
        loadObjects()
        window.divadOS.graph.snapshot().then(d => setGraphData(d as { nodes: EKEObject[]; edges: { source_id: string; target_id: string }[] }))
      })
      return () => { unsubActivity(); unsubState() }
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10, padding: 10, overflow: 'hidden' }}>
      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 200px 180px', gap: 10, height: 220, flexShrink: 0 }}>
        <MissionBrief />
        <ActivityFeed />
        <SystemOverview />
        <OpenItems />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <AgentChat />
        </div>
        <div className="panel" style={{ width: 320, display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <span className="panel-title">Knowledge Graph</span>
            {graphData.nodes.length > 0 && (
              <span style={{ fontSize: 10, color: '#475569' }}>{graphData.nodes.length} nodes</span>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: 8 }}>
            <KnowledgeGraph nodes={graphData.nodes} edges={graphData.edges} />
          </div>
        </div>
      </div>
    </div>
  )
}
