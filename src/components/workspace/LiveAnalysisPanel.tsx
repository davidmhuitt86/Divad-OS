import { CheckCircle2, HelpCircle, Wand2, AlertTriangle } from 'lucide-react'
import type { WorkspaceAnalysis } from '../../../shared/types'

const PANEL_BG = '#13161e'
const BORDER = '#1a1e28'

function SectionHeader({ icon, color, label, count }: { icon: React.ReactNode; color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label} ({count})</span>
    </div>
  )
}

export default function LiveAnalysisPanel({ analysis, loading }: { analysis: WorkspaceAnalysis | null; loading: boolean }) {
  const empty = !analysis || (
    analysis.knownObjects.length === 0 && analysis.candidateObjects.length === 0 &&
    analysis.warnings.length === 0 && analysis.suggestedCorrections.length === 0
  )

  return (
    <div style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Live Analysis</span>
        {loading && <span style={{ fontSize: 9, color: '#3b82f6' }}>Analyzing…</span>}
      </div>

      <div style={{ padding: '10px 12px', overflowY: 'auto', flex: 1 }}>
        {empty && !loading && (
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>Start typing engineering content to see live analysis.</div>
        )}

        {analysis && analysis.knownObjects.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionHeader icon={<CheckCircle2 size={12} />} color="#22c55e" label="Known Objects" count={analysis.knownObjects.length} />
            {analysis.knownObjects.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderBottom: '1px solid #1a1e2833', fontSize: 11 }}>
                <span style={{ color: '#e2e8f0' }}>{o.name}</span>
                <span style={{ color: '#475569', fontSize: 9 }}>{o.objectNumber}</span>
              </div>
            ))}
          </div>
        )}

        {analysis && analysis.candidateObjects.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionHeader icon={<HelpCircle size={12} />} color="#a855f7" label="Candidate Objects" count={analysis.candidateObjects.length} />
            {analysis.candidateObjects.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderBottom: '1px solid #1a1e2833', fontSize: 11 }}>
                <span style={{ color: '#e2e8f0' }}>{o.observedName}</span>
                <span style={{ color: '#475569', fontSize: 9 }}>Unknown</span>
              </div>
            ))}
          </div>
        )}

        {analysis && analysis.suggestedCorrections.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionHeader icon={<Wand2 size={12} />} color="#3b82f6" label="Suggested Corrections" count={analysis.suggestedCorrections.length} />
            {analysis.suggestedCorrections.map((c, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #1a1e2833', fontSize: 11, color: '#94a3b8' }}>
                {c.observed} <span style={{ color: '#3b82f6' }}>→</span> {c.suggested}
              </div>
            ))}
          </div>
        )}

        {analysis && analysis.warnings.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionHeader icon={<AlertTriangle size={12} />} color="#f59e0b" label="Warnings" count={analysis.warnings.length} />
            {analysis.warnings.map((w, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #1a1e2833', fontSize: 11, color: '#f59e0b' }}>{w}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#475569', marginBottom: 4 }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Confidence</span>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>{analysis ? analysis.confidence : 0}%</span>
        </div>
        <div style={{ height: 5, background: BORDER, borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${analysis?.confidence ?? 0}%`, background: '#22c55e', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  )
}
