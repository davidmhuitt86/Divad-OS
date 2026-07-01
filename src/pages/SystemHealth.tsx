import { Activity } from 'lucide-react'

interface ServiceStatus { name: string; status: 'Operational' | 'Warning' | 'Offline'; detail: string }

const STATUS_COLOR: Record<ServiceStatus['status'], string> = {
  Operational: '#22c55e', Warning: '#f59e0b', Offline: '#ef4444',
}

const SERVICES: ServiceStatus[] = [
  { name: 'EKE Service (REST API)', status: 'Operational', detail: 'http://127.0.0.1:3000' },
  { name: 'PostgreSQL',             status: 'Operational', detail: 'eke @ localhost:5432' },
  { name: 'Neo4j (Knowledge Graph)', status: 'Offline',     detail: 'Not yet integrated' },
  { name: 'Qdrant (Vector Search)',  status: 'Offline',     detail: 'Not yet integrated' },
]

// System Health — placeholder view per AP-002 Milestone 4.
export default function SystemHealth() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d0f14', padding: '14px 16px 16px', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Activity size={18} style={{ color: '#22c55e' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>System Health</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SERVICES.map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[s.status], boxShadow: `0 0 6px ${STATUS_COLOR[s.status]}aa`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{s.name}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>{s.detail}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLOR[s.status] }}>{s.status}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, fontStyle: 'italic', color: '#2a3042' }}>
        EKE Service / PostgreSQL status reflects this milestone's real integration; Neo4j and Qdrant are out of scope.
      </div>
    </div>
  )
}
