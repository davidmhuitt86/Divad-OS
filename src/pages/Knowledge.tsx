import { BookOpen } from 'lucide-react'
import { useStore } from '../store'
import KnowledgeStatCards    from '../components/knowledge/KnowledgeStatCards'
import KnowledgeDomains      from '../components/knowledge/KnowledgeDomains'
import KnowledgeGraph        from '../components/knowledge/KnowledgeGraph'
import KnowledgeValidation   from '../components/knowledge/KnowledgeValidation'
import KnowledgeCenterPanels from '../components/knowledge/KnowledgeCenterPanels'
import KnowledgeRightPanel   from '../components/knowledge/KnowledgeRightPanel'

export default function Knowledge() {
  const { objects: allObjs } = useStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 14, gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Knowledge</h1>
          <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Capture. Connect. Understand. Apply.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#a855f7', fontWeight: 600 }}>
          <BookOpen size={13} /> Knowledge Explorer
        </button>
      </div>

      {/* Stat cards */}
      <KnowledgeStatCards objects={allObjs} />

      {/* Main body */}
      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
        {/* Left: Domains + Insights */}
        <KnowledgeDomains objects={allObjs} />

        {/* Center: graph + validation stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
          <KnowledgeGraph />
          <KnowledgeValidation />
        </div>

        {/* Center-right: Recent objects + Featured */}
        <KnowledgeCenterPanels objects={allObjs} />

        {/* Right: Health + Quick Search + Activity */}
        <KnowledgeRightPanel objects={allObjs} />
      </div>
    </div>
  )
}
