import { useState } from 'react'
import { Bot, User, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityEvent } from '../../../shared/types'
import { useStore } from '../../store'

const TABS = ['ACTIVITY FEED', 'TERMINAL', 'GIT STATUS', 'AI LOGS']

export default function BottomPanels({ activity }: { activity: ActivityEvent[] }) {
  const [tab, setTab] = useState('ACTIVITY FEED')

  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '9px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', background: 'none', border: 'none', cursor: 'pointer', color: tab === t ? '#e2e8f0' : '#475569', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent', transition: 'all 0.1s' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {tab === 'ACTIVITY FEED' && <ActivityFeedTab activity={activity} />}
        {tab === 'TERMINAL'      && <TerminalTab />}
        {tab === 'GIT STATUS'    && <GitStatusTab />}
        {tab === 'AI LOGS'       && <AILogsTab activity={activity} />}
      </div>
    </div>
  )
}

function ActivityFeedTab({ activity }: { activity: ActivityEvent[] }) {
  const { objects, openObject, setActivePage } = useStore()

  function handleClick(event: ActivityEvent) {
    const obj = objects.find(o => o.id === (event as any).object_id)
    if (obj) { openObject(obj); return }
    setActivePage('operations')
  }

  if (activity.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: '#2a3042' }}>No activity yet</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {activity.map(event => (
        <div key={event.id} onClick={() => handleClick(event)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid #1a1e2844', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: (event as any).actor === 'agent' ? 'rgba(59,130,246,0.1)' : '#1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {(event as any).actor === 'agent' ? <Bot size={11} color="#3b82f6" /> : <User size={11} color="#94a3b8" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.summary}</div>
            {(event as any).object_title && <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{(event as any).object_title}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, color: '#2a3042', fontFamily: 'monospace', flexShrink: 0 }}>
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
            </div>
            <ArrowRight size={9} style={{ color: '#2a3042' }} />
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
      <div style={{ color: '#22c55e', marginTop: 8 }}>divad@os:~/divad-os$ <span>█</span></div>
    </div>
  )
}

function GitStatusTab() {
  const { setActivePage } = useStore()
  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        {[
          { label: 'Commits (Today)', value: '—', color: '#3b82f6' },
          { label: 'Open PRs',        value: '—', color: '#a855f7' },
          { label: 'Open Issues',     value: '—', color: '#f59e0b' },
          { label: 'Branches',        value: '—', color: '#06b6d4' },
        ].map(({ label, value, color }) => (
          <div key={label} onClick={() => setActivePage('repository')}
            style={{ textAlign: 'center', background: '#1a1e28', borderRadius: 6, padding: '10px 8px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#222736'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setActivePage('repository')} style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        Go to Repository <ArrowRight size={10} />
      </button>
    </div>
  )
}

function AILogsTab({ activity }: { activity: ActivityEvent[] }) {
  const { setActivePage } = useStore()
  const agentEvents = activity.filter(e => (e as any).actor === 'agent')
  if (agentEvents.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
        <div style={{ fontSize: 11, color: '#2a3042' }}>No AI activity yet</div>
        <button onClick={() => setActivePage('workspace')} style={{ fontSize: 10, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Open AI Workspace</button>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {agentEvents.map(event => (
        <div key={event.id} onClick={() => setActivePage('workspace')}
          style={{ display: 'flex', gap: 10, padding: '8px 14px', borderBottom: '1px solid #1a1e2844', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <div style={{ fontSize: 10, color: '#2a3042', fontFamily: 'monospace', flexShrink: 0, paddingTop: 2 }}>
            {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{event.summary}</div>
          {(event as any).object_title && <div style={{ fontSize: 11, color: '#3b82f6', marginLeft: 'auto', flexShrink: 0 }}>{(event as any).object_title}</div>}
        </div>
      ))}
    </div>
  )
}
