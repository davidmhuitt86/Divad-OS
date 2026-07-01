import { History } from 'lucide-react'

interface TimelineEvent { time: string; label: string; kind: 'session' | 'evidence' | 'candidate' | 'commit' | 'object' }

const KIND_COLOR: Record<TimelineEvent['kind'], string> = {
  session: '#3b82f6', evidence: '#22c55e', candidate: '#a855f7', commit: '#f59e0b', object: '#38bdf8',
}

const EVENTS: TimelineEvent[] = [
  { time: '5/14 8:17 AM', label: 'Session WS-000116 created',        kind: 'session' },
  { time: '5/15 1:05 PM', label: 'Evidence added',                    kind: 'evidence' },
  { time: '5/15 9:03 AM', label: 'Candidate CAN-000121 suggested',    kind: 'candidate' },
  { time: '5/16 4:35 PM', label: 'Commit CM-000253 created',          kind: 'commit' },
  { time: '5/17 3:41 PM', label: 'Object OBJ-000122 created',         kind: 'object' },
]

// Timeline — placeholder view per AP-002 Milestone 4. Static mock events;
// no real event store wired up yet.
export default function Timeline() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d0f14', padding: '14px 16px 16px', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <History size={18} style={{ color: '#3b82f6' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Timeline</h1>
      </div>

      <div style={{ flex: 1, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '24px 20px', overflowY: 'auto' }}>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: 2, background: '#1a1e28' }} />
          {EVENTS.map((ev, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 22 }}>
              <div style={{ position: 'absolute', left: -20, top: 2, width: 10, height: 10, borderRadius: '50%', background: KIND_COLOR[ev.kind], boxShadow: `0 0 6px ${KIND_COLOR[ev.kind]}aa` }} />
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>{ev.time}</div>
              <div style={{ fontSize: 12, color: '#e2e8f0' }}>{ev.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 10, fontStyle: 'italic', color: '#2a3042', flexShrink: 0 }}>
        Placeholder events — live event history in a future milestone.
      </div>
    </div>
  )
}
