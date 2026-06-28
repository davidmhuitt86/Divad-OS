import { AlertTriangle, GitBranch, ArrowRight } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

const RISK_COLORS: Record<string, string> = { critical: '#ef4444', high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }

export function OpenRisks({ objects, onSelect, onViewAll }: { objects: EKEObject[]; onSelect: (o: EKEObject) => void; onViewAll?: () => void }) {
  const risks = objects.filter(o => o.type === 'risk' && o.status !== 'archived').slice(0, 5)

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>Open Risks</span>
        <button onClick={onViewAll} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
      </div>
      {risks.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, fontSize: 11, color: '#2a3042', gap: 6 }}>
          <AlertTriangle size={14} />
          <span>No open risks</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {risks.map(risk => (
            <button
              key={risk.id}
              onClick={() => onSelect(risk)}
              style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a1e28' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: RISK_COLORS[risk.priority ?? 'low'] ?? '#22c55e', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
                  RISK-{risk.id.slice(0, 4).toUpperCase()}
                  <span style={{ marginLeft: 6, padding: '1px 5px', borderRadius: 3, fontSize: 9, background: `${RISK_COLORS[risk.priority ?? 'low']}22`, color: RISK_COLORS[risk.priority ?? 'low'], border: `1px solid ${RISK_COLORS[risk.priority ?? 'low']}44` }}>
                    {risk.priority ?? 'low'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{risk.title}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DecisionsPending({ objects, onSelect, onViewAll }: { objects: EKEObject[]; onSelect: (o: EKEObject) => void; onViewAll?: () => void }) {
  const decisions = objects.filter(o => o.type === 'decision' && (o.status === 'draft' || o.status === 'in_review')).slice(0, 5)

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>Decisions Pending</span>
        <button onClick={onViewAll} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
      </div>
      {decisions.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, fontSize: 11, color: '#2a3042', gap: 6 }}>
          <GitBranch size={14} />
          <span>No pending decisions</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {decisions.map(dec => (
            <button
              key={dec.id}
              onClick={() => onSelect(dec)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a1e28' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              <GitBranch size={11} color="#a855f7" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 1 }}>DDR-{dec.id.slice(0, 4).toUpperCase()}</div>
                <div style={{ fontSize: 12, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dec.title}</div>
              </div>
              <ArrowRight size={11} color="#2a3042" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
