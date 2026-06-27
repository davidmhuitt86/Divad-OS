import { useState } from 'react'
import { Bot, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityEvent } from '../../../shared/types'

const TABS = ['ACTIVITY FEED', 'TERMINAL', 'GIT STATUS', 'AI LOGS']

export default function BottomPanels({ activity }: { activity: ActivityEvent[] }) {
  const [tab, setTab] = useState('ACTIVITY FEED')

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '9px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t ? '#e2e8f0' : '#475569',
              borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
              transition: 'all 0.1s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {tab === 'ACTIVITY FEED' && <ActivityFeedTab activity={activity} />}
        {tab === 'TERMINAL' && <TerminalTab />}
        {tab === 'GIT STATUS' && <GitStatusTab />}
        {tab === 'AI LOGS' && <AILogsTab activity={activity} />}
      </div>
    </div>
  )
}

function ActivityFeedTab({ activity }: { activity: ActivityEvent[] }) {
  if (activity.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: '#2a3042' }}>No activity yet</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {activity.map(event => (
        <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid #1a1e2844' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: event.actor === 'agent' ? 'rgba(59,130,246,0.1)' : '#1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {event.actor === 'agent' ? <Bot size={11} color="#3b82f6" /> : <User size={11} color="#94a3b8" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.summary}</div>
            {event.object_title && <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{event.object_title}</div>}
          </div>
          <div style={{ fontSize: 10, color: '#2a3042', fontFamily: 'monospace', flexShrink: 0 }}>
            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}

function TerminalTab() {
  return (
    <div style={{ padding: 14, fontFamily: 'monospace', fontSize: 12 }}>
      <div style={{ color: '#22c55e' }}>divad@os:~/divad-os$</div>
      <div style={{ color: '#94a3b8', marginTop: 4 }}>Terminal integration coming in next build.</div>
      <div style={{ color: '#22c55e', marginTop: 8 }}>divad@os:~/divad-os$ <span style={{ animation: 'pulse 1s infinite' }}>█</span></div>
    </div>
  )
}

function GitStatusTab() {
  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        {[
          { label: 'Commits (Today)', value: '—', color: '#3b82f6' },
          { label: 'Open PRs', value: '—', color: '#a855f7' },
          { label: 'Open Issues', value: '—', color: '#f59e0b' },
          { label: 'Branches', value: '—', color: '#06b6d4' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center', background: '#1a1e28', borderRadius: 6, padding: '10px 8px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>Git integration coming in next build.</div>
    </div>
  )
}

function AILogsTab({ activity }: { activity: ActivityEvent[] }) {
  const agentEvents = activity.filter(e => e.actor === 'agent')
  if (agentEvents.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: '#2a3042' }}>No AI activity yet</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {agentEvents.map(event => (
        <div key={event.id} style={{ display: 'flex', gap: 10, padding: '8px 14px', borderBottom: '1px solid #1a1e2844' }}>
          <div style={{ fontSize: 10, color: '#2a3042', fontFamily: 'monospace', flexShrink: 0, paddingTop: 2 }}>
            {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{event.summary}</div>
          {event.object_title && <div style={{ fontSize: 11, color: '#3b82f6', marginLeft: 'auto', flexShrink: 0 }}>{event.object_title}</div>}
        </div>
      ))}
    </div>
  )
}
