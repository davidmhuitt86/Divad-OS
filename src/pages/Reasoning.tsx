import { useState } from 'react'
import { Cpu } from 'lucide-react'

interface ReasoningStep { text: string; evidence: string }
interface ReasoningChain { id: string; title: string; confidence: number; steps: ReasoningStep[]; conclusion: string }

const CHAINS: ReasoningChain[] = [
  {
    id: 'RC-000123',
    title: 'No Start Diagnosis',
    confidence: 84,
    steps: [
      { text: 'Battery voltage is normal (12.48V)',              evidence: 'EVD-000340' },
      { text: 'Fuel pressure within spec (55 PSI)',               evidence: 'EVD-000340' },
      { text: 'Cylinder 4 compression is 0 PSI',                  evidence: 'EVD-000340' },
      { text: 'Camshaft position sensor codes present',           evidence: 'EVD-000341' },
    ],
    conclusion: 'Possible timing or sensor fault causing cylinder 4 misfire.',
  },
  {
    id: 'RC-000098',
    title: 'Infotainment Reboot Loop',
    confidence: 61,
    steps: [
      { text: 'Head unit power cycles every 90 seconds', evidence: 'EVD-000312' },
      { text: 'No related DTC codes found',              evidence: 'EVD-000313' },
    ],
    conclusion: 'Likely a software fault; hardware unlikely to be root cause.',
  },
]

// Reasoning — placeholder view per AP-002 Milestone 4. Purely visual;
// no AI reasoning engine wired up yet (explicitly out of scope).
export default function Reasoning() {
  const [selectedId, setSelectedId] = useState(CHAINS[0].id)
  const selected = CHAINS.find(c => c.id === selectedId) ?? CHAINS[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d0f14', padding: '14px 16px 16px', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Cpu size={18} style={{ color: '#a855f7' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Reasoning</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 10, flex: 1, minHeight: 0 }}>
        <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflowY: 'auto' }}>
          <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>
            Reasoning Chains
          </div>
          {CHAINS.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', borderLeft: c.id === selectedId ? '2px solid #a855f7' : '2px solid transparent', background: c.id === selectedId ? 'rgba(168,85,247,0.08)' : 'transparent', cursor: 'pointer' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{c.title}</div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{c.id} · {c.confidence}% confidence</div>
            </button>
          ))}
        </div>

        <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '16px 18px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{selected.title}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{selected.id}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a855f7' }}>{selected.confidence}%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selected.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1a1e28', border: '1px solid #a855f755', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#a855f7', flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 12, color: '#e2e8f0' }}>{s.text}</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>Evidence: {s.evidence}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: '10px 12px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Conclusion</div>
            <div style={{ fontSize: 12, color: '#e2e8f0' }}>{selected.conclusion}</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, fontStyle: 'italic', color: '#2a3042', flexShrink: 0 }}>
        Placeholder data — AI reasoning engine not implemented yet.
      </div>
    </div>
  )
}
