import { CheckCircle2, Loader2, Circle } from 'lucide-react'

const STEPS = [
  'Reading engineering text',
  'Identifying engineering entities',
  'Searching EKE database',
  'Detecting unknown objects',
  'Calculating confidence',
]

export default function AIThinkingPanel({ loading, hasRun }: { loading: boolean; hasRun: boolean }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>AI Thinking</span>
      </div>
      <div style={{ padding: '10px 12px', flex: 1, overflowY: 'auto' }}>
        {!hasRun && !loading ? (
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>Idle — waiting for engineering input.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: loading ? '#94a3b8' : '#e2e8f0' }}>
                {loading
                  ? <Loader2 size={12} className="spin" style={{ color: '#3b82f6' }} />
                  : hasRun
                    ? <CheckCircle2 size={12} style={{ color: '#22c55e' }} />
                    : <Circle size={12} style={{ color: '#2a3042' }} />}
                {step}{i === STEPS.length - 1 && !loading && hasRun ? ' — ready for review' : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
