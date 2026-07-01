import { useState } from 'react'
import { CheckCircle2, HelpCircle, Wand2, AlertTriangle, Ruler, Share2, ChevronDown } from 'lucide-react'
import type { WorkspaceAnalysis } from '../../../shared/types'

const PANEL_BG = '#13161e'
const BORDER = '#1a1e28'

function CollapsibleSection({ icon, color, label, count, defaultOpen = true, children }: {
  icon: React.ReactNode; color: string; label: string; count: number; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 10, borderBottom: '1px solid #1a1e2833', paddingBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, marginBottom: open ? 6 : 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ color, display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1, textAlign: 'left' }}>{label} ({count})</span>
        <ChevronDown size={11} style={{ color: '#475569', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }} />
      </button>
      {open && children}
    </div>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', padding: '2px 0' }}>{label}</div>
}

export default function LiveAnalysisPanel({ analysis, loading }: { analysis: WorkspaceAnalysis | null; loading: boolean }) {
  const a = analysis

  return (
    <div style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Live Analysis</span>
        {loading && <span style={{ fontSize: 9, color: '#3b82f6' }}>Analyzing…</span>}
      </div>

      <div style={{ padding: '10px 12px', overflowY: 'auto', flex: 1 }}>
        {!a && !loading && (
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>Start typing engineering content to see live analysis.</div>
        )}

        {a && (
          <>
            <CollapsibleSection icon={<CheckCircle2 size={12} />} color="#22c55e" label="Known Objects" count={a.knownObjects.length}>
              {a.knownObjects.length === 0 ? <EmptyRow label="No known objects matched." /> : a.knownObjects.map((o, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', fontSize: 11 }}>
                  <span style={{ color: '#e2e8f0' }}>{o.name}</span>
                  <span style={{ color: '#475569', fontSize: 9 }}>{o.objectNumber}</span>
                </div>
              ))}
            </CollapsibleSection>

            <CollapsibleSection icon={<HelpCircle size={12} />} color="#a855f7" label="Candidate Objects" count={a.candidateObjects.length}>
              {a.candidateObjects.length === 0 ? <EmptyRow label="No candidate objects detected." /> : a.candidateObjects.map((o, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', fontSize: 11 }}>
                  <span style={{ color: '#e2e8f0' }}>{o.observedName}</span>
                  <span style={{ color: '#475569', fontSize: 9 }}>Unknown</span>
                </div>
              ))}
            </CollapsibleSection>

            <CollapsibleSection icon={<Ruler size={12} />} color="#3b82f6" label="Measurements" count={a.measurements.length} defaultOpen={false}>
              {a.measurements.length === 0 ? <EmptyRow label="No measurements extracted." /> : a.measurements.map((m, i) => (
                <div key={i} style={{ padding: '4px 0', fontSize: 11, color: '#e2e8f0' }}>{JSON.stringify(m)}</div>
              ))}
            </CollapsibleSection>

            <CollapsibleSection icon={<Share2 size={12} />} color="#38bdf8" label="Relationships" count={a.relationships.length} defaultOpen={false}>
              {a.relationships.length === 0 ? <EmptyRow label="No relationships identified." /> : a.relationships.map((r, i) => (
                <div key={i} style={{ padding: '4px 0', fontSize: 11, color: '#e2e8f0' }}>{JSON.stringify(r)}</div>
              ))}
            </CollapsibleSection>

            <CollapsibleSection icon={<AlertTriangle size={12} />} color="#f59e0b" label="Warnings" count={a.warnings.length}>
              {a.warnings.length === 0 ? <EmptyRow label="No warnings." /> : a.warnings.map((w, i) => (
                <div key={i} style={{ padding: '4px 0', fontSize: 11, color: '#f59e0b' }}>{w}</div>
              ))}
            </CollapsibleSection>

            <CollapsibleSection icon={<Wand2 size={12} />} color="#ec4899" label="Suggested Corrections" count={a.suggestedCorrections.length}>
              {a.suggestedCorrections.length === 0 ? <EmptyRow label="No suggested corrections." /> : a.suggestedCorrections.map((c, i) => (
                <div key={i} style={{ padding: '4px 0', fontSize: 11, color: '#94a3b8' }}>
                  {c.observed} <span style={{ color: '#3b82f6' }}>→</span> {c.suggested}
                </div>
              ))}
            </CollapsibleSection>
          </>
        )}
      </div>

      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#475569', marginBottom: 4 }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Confidence</span>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>{a ? a.confidence : 0}%</span>
        </div>
        <div style={{ height: 5, background: BORDER, borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${a?.confidence ?? 0}%`, background: '#22c55e', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  )
}
