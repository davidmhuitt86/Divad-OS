import { BookOpen } from 'lucide-react'
import { useStore } from '../store'
import { useEffect } from 'react'
import KnowledgeStatCards    from '../components/knowledge/KnowledgeStatCards'
import KnowledgeDomains      from '../components/knowledge/KnowledgeDomains'
import KnowledgeGraph        from '../components/knowledge/KnowledgeGraph'
import KnowledgeValidation   from '../components/knowledge/KnowledgeValidation'
import KnowledgeCenterPanels from '../components/knowledge/KnowledgeCenterPanels'
import KnowledgeRightPanel   from '../components/knowledge/KnowledgeRightPanel'
import LayoutPanel from '../components/layout/LayoutPanel'
import LayoutLock  from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'

const PANELS = ['statCards', 'domains', 'graph', 'validation', 'centerPanels', 'rightPanel']

export default function Knowledge() {
  const { objects: allObjs, loadObjects, navigateToObjects } = useStore()
  const layout = usePageLayout('knowledge', PANELS)
  useEffect(() => { loadObjects() }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 14, gap: 10, position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Knowledge</h1>
          <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Capture. Connect. Understand. Apply.</p>
        </div>
        <button onClick={() => navigateToObjects('knowledge_object')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#a855f7', fontWeight: 600 }}>
          <BookOpen size={13} /> Knowledge Explorer
        </button>
      </div>

      {/* Stat cards */}
      <LayoutPanel id="statCards" layout={layout}>
        <KnowledgeStatCards objects={allObjs} />
      </LayoutPanel>

      {/* Main body */}
      <div style={layout.unlocked ? { display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1, minHeight: 0 } : { display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        <LayoutPanel id="domains" layout={layout} lockedStyle={{ flexShrink: 0 }}>
          <KnowledgeDomains objects={allObjs} />
        </LayoutPanel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
          <LayoutPanel id="graph" layout={layout} lockedStyle={{ flex: 1 }}>
            <KnowledgeGraph />
          </LayoutPanel>
          <LayoutPanel id="validation" layout={layout} lockedStyle={{ flexShrink: 0 }}>
            <KnowledgeValidation />
          </LayoutPanel>
        </div>

        <LayoutPanel id="centerPanels" layout={layout} lockedStyle={{ flexShrink: 0 }}>
          <KnowledgeCenterPanels objects={allObjs} />
        </LayoutPanel>

        <LayoutPanel id="rightPanel" layout={layout} lockedStyle={{ flexShrink: 0 }}>
          <KnowledgeRightPanel objects={allObjs} />
        </LayoutPanel>
      </div>

      <LayoutLock layout={layout} />
    </div>
  )
}
