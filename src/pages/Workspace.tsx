import { useState, useMemo } from 'react'
import { Plus, ArrowRight, Settings, ChevronRight, ChevronLeft } from 'lucide-react'
import { useStore } from '../store'
import type { EKEObject } from '../../shared/types'

const QUICK_CREATE_ACTIONS: [string, string, string | undefined][] = [
  ['New Object',   '◈', undefined],
  ['New Document', '📄', 'document'],
  ['New Task',     '✅', 'task'],
  ['New AP',       '🏗️', 'architecture_phase'],
  ['New APT',      '🔧', 'apt'],
]

const STATUS_COLOR: Record<string, string> = {
  draft: '#3b82f6', in_review: '#f59e0b', approved: '#22c55e',
  published: '#22c55e', revised: '#a855f7', archived: '#475569',
}

const TYPE_ICON: Record<string, string> = {
  document: '📄', task: '✅', knowledge_object: '◈', decision: '⚖️',
  architecture_phase: '🏗️', requirement: '📋', risk: '⚠️', research: '🔬',
  standard: '📏', apo: '🎯', apt: '🔧', meeting: '📅', journal: '📓',
  product: '📦', question: '❓', apm: '📐', aar: '📑', mit: '🎯',
}

const TABS = ['Overview', 'My Tasks', 'My Documents', 'My Objects', 'My APs', 'My APTs', 'Team Activity']

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#475569',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function phaseProgress(phase: EKEObject, allObjects: EKEObject[]): number {
  const children = allObjects.filter(o => o.parent_id === phase.id)
  if (children.length === 0) {
    if (phase.status === 'published' || phase.status === 'approved') return 100
    if (phase.status === 'in_review') return 60
    if (phase.status === 'draft') return 10
    return 0
  }
  const done = children.filter(o => o.status === 'published' || o.status === 'approved').length
  return Math.round((done / children.length) * 100)
}

export default function Workspace() {
  const { objects, activity, openWizard, setActivePage, openObject } = useStore()
  const [tab, setTab] = useState('Overview')

  const tasks      = useMemo(() => objects.filter(o => o.type === 'task'),              [objects])
  const documents  = useMemo(() => objects.filter(o => o.type === 'document'),          [objects])
  const phases     = useMemo(() => objects.filter(o => o.type === 'architecture_phase'),[objects])
  const apts       = useMemo(() => objects.filter(o => o.type === 'apt'),               [objects])
  const apos       = useMemo(() => objects.filter(o => o.type === 'apo'),               [objects])

  const activeTasks  = tasks.filter(o => o.status !== 'archived' && o.status !== 'published')
  const activePhases = phases.filter(o => o.status !== 'archived')
  const activeApts   = apts.filter(o => o.status !== 'archived')

  const recentWork = useMemo(() =>
    [...objects].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5),
    [objects]
  )
  const recentDocs = useMemo(() =>
    [...documents].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5),
    [documents]
  )
  const recentActivity = useMemo(() =>
    [...activity].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    [activity]
  )

  // Calendar: current week dates
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d
  })
  const DAY_LABELS = ['MON','TUE','WED','THU','FRI','SAT','SUN']

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#0d0f14' }}>
      {/* Left sidebar */}
      <div style={{ width: 196, borderRight: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', padding: '14px 0', flexShrink: 0, overflowY: 'auto' }}>
        <SideSection label="Quick Create">
          {QUICK_CREATE_ACTIONS.map(([label, , type]) => (
            <button key={label} onClick={() => openWizard(type)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', width: '100%', textAlign: 'left' }}>
              <span style={{ color: '#3b82f6' }}>+</span> {label}
            </button>
          ))}
        </SideSection>

        <div style={{ margin: '10px 14px', height: 1, background: '#1a1e28' }} />

        <SideSection label="Workspace Views">
          {['My Workspace', 'Team Workspace', 'Project Workspace', 'Executive Workspace'].map(v => (
            <button key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: v === 'My Workspace' ? '#3b82f6' : '#94a3b8', width: '100%', textAlign: 'left', fontWeight: v === 'My Workspace' ? 600 : 400 }}>
              {v}
            </button>
          ))}
        </SideSection>

        <div style={{ margin: '10px 14px', height: 1, background: '#1a1e28' }} />

        <SideSection label="Workspace Storage">
          <div style={{ padding: '6px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
                <circle cx={26} cy={26} r={20} fill="none" stroke="#1a1e28" strokeWidth={6} />
                <text x={26} y={30} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontWeight={700}>—</text>
              </svg>
              <div>
                <div style={{ fontSize: 9, color: '#475569', marginBottom: 4 }}>
                  <span style={{ color: '#3b82f6' }}>●</span> Used —
                </div>
                <div style={{ fontSize: 9, color: '#475569' }}>
                  <span style={{ color: '#22c55e' }}>●</span> Available —
                </div>
              </div>
            </div>
            <button onClick={() => setActivePage('settings')} style={{ width: '100%', padding: '5px', background: 'none', border: '1px solid #1a1e28', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#3b82f6' }}>
              Manage Storage
            </button>
          </div>
        </SideSection>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Workspace</h1>
              <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Your command center for focused engineering excellence.</p>
            </div>
            <button onClick={() => setActivePage('settings')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
              <Settings size={13} /> Customize Workspace
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1e28' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '8px 14px', background: 'none', border: 'none', borderBottom: `2px solid ${t === tab ? '#3b82f6' : 'transparent'}`, cursor: 'pointer', fontSize: 12, color: t === tab ? '#3b82f6' : '#475569', fontWeight: t === tab ? 600 : 400, marginBottom: -1, whiteSpace: 'nowrap' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>
          {tab === 'Overview' && (
            <OverviewTab
              objects={objects} tasks={tasks} documents={documents} phases={phases}
              apts={apts} activeTasks={activeTasks} activePhases={activePhases} activeApts={activeApts}
              recentWork={recentWork} recentDocs={recentDocs} recentActivity={recentActivity}
              onOpenWizard={openWizard} onOpenObject={openObject} onSetTab={setTab} onNavigate={setActivePage}
            />
          )}
          {tab === 'My Tasks' && <TasksTab tasks={tasks} onOpenWizard={openWizard} onOpenObject={openObject} />}
          {tab === 'My Documents' && <DocsTab documents={documents} onOpenObject={openObject} />}
          {tab === 'My Objects' && <SimpleListTab objects={objects} title="All Objects" onOpenObject={openObject} />}
          {tab === 'My APs' && <SimpleListTab objects={phases} title="Architecture Phases" onOpenObject={openObject} />}
          {tab === 'My APTs' && <SimpleListTab objects={apts} title="Architecture Tasks (APT)" onOpenObject={openObject} />}
          {tab === 'Team Activity' && <TeamActivityTab activity={recentActivity} />}
        </div>
      </div>

      {/* Right panel */}
      <RightPanel weekDays={weekDays} dayLabels={DAY_LABELS} today={today} activity={recentActivity} objects={objects} tasks={activeTasks} documents={documents} onOpenWizard={openWizard} onNavigate={setActivePage} />
    </div>
  )
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ objects, tasks, documents, phases, apts, activeTasks, activePhases, activeApts, recentWork, recentDocs, recentActivity, onOpenWizard, onOpenObject, onSetTab, onNavigate }: {
  objects: EKEObject[]; tasks: EKEObject[]; documents: EKEObject[]; phases: EKEObject[];
  apts: EKEObject[]; activeTasks: EKEObject[]; activePhases: EKEObject[]; activeApts: EKEObject[];
  recentWork: EKEObject[]; recentDocs: EKEObject[]; recentActivity: any[]
  onOpenWizard: (type?: string) => void; onOpenObject: (o: EKEObject) => void
  onSetTab: (t: string) => void; onNavigate: (page: string) => void
}) {
  // Quick access cards
  const QUICK: { label: string; count: number | null; sub: string; action: () => void }[] = [
    { label: 'My Tasks',     count: tasks.length,       sub: tasks.length === 1 ? '1 task' : `${tasks.length} tasks`, action: () => onSetTab('My Tasks') },
    { label: 'My Documents', count: documents.length,   sub: `${documents.length} docs`,   action: () => onSetTab('My Documents') },
    { label: 'My Objects',   count: objects.length,     sub: `${objects.length} objects`,  action: () => onSetTab('My Objects') },
    { label: 'Active APs',   count: activePhases.length, sub: 'phases',                   action: () => onSetTab('My APs') },
    { label: 'Active APTs',  count: activeApts.length,  sub: 'tasks',                      action: () => onSetTab('My APTs') },
    { label: 'Calendar',     count: null, sub: 'View',  action: () => onNavigate('calendar') },
    { label: 'Reports',      count: null, sub: 'View',  action: () => onNavigate('reports') },
    { label: 'Team',         count: null, sub: 'View',  action: () => onSetTab('Team Activity') },
  ]
  const ICONS = ['✅','📄','◈','🏗️','🔧','📅','📊','👥']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Quick access */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Quick Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
          {QUICK.map((q, i) => (
            <div key={q.label} onClick={q.action} style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '12px 8px', textAlign: 'center', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3b82f644'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1a1e28'}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{ICONS[i]}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>{q.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{q.count !== null ? q.count : q.sub}</div>
              {q.count !== null && <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{q.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Three-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 260px', gap: 10 }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Recent Work */}
          <Panel title="Recent Work" action="View All" onAction={() => onSetTab('My Objects')}>
            {recentWork.length === 0 ? <Empty msg="No recent activity" /> : recentWork.map(o => (
              <div key={o.id} onClick={() => onOpenObject(o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1e2833', cursor: 'pointer' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{TYPE_ICON[o.type] ?? '◈'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>{o.type.replace(/_/g,' ')}</div>
                </div>
                <span style={{ fontSize: 9, color: '#2a3042', flexShrink: 0 }}>{relativeTime(o.updated_at)}</span>
              </div>
            ))}
            {recentWork.length > 0 && (
              <button onClick={() => onSetTab('My Objects')} style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                View All Recent Items <ArrowRight size={10} />
              </button>
            )}
          </Panel>
          {/* Recent Docs */}
          <Panel title="Recent Documents" action="View All" onAction={() => onSetTab('My Documents')}>
            {recentDocs.length === 0 ? <Empty msg="No documents yet" /> : recentDocs.map(o => (
              <div key={o.id} onClick={() => onOpenObject(o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1e2833', cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: 5, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>Updated {relativeTime(o.updated_at)}</div>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* Center col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* My Tasks */}
          <Panel title="My Tasks" action="View All" onAction={() => onSetTab('My Tasks')} extra={
            <button onClick={() => onOpenWizard('task')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#3b82f6', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#fff', fontWeight: 600 }}>
              <Plus size={10} /> New Task
            </button>
          }>
            <TaskFilterRow tasks={tasks} onOpen={onOpenObject} />
          </Panel>
          {/* Work Timeline */}
          <Panel title="My Work Timeline" action={null}>
            {recentActivity.length === 0 ? (
              <Empty msg="No activity recorded yet. Actions like creating or updating objects will appear here." />
            ) : recentActivity.map(ev => (
              <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: '1px solid #1a1e2833' }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: '#1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#3b82f6', flexShrink: 0, fontWeight: 700 }}>
                  {ev.actor === 'agent' ? 'AI' : 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{ev.summary}</div>
                  <div style={{ fontSize: 9, color: '#2a3042', marginTop: 2 }}>{relativeTime(ev.created_at)}</div>
                </div>
                {ev.object_type && (
                  <span style={{ fontSize: 9, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 3, padding: '1px 5px', alignSelf: 'flex-start', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {ev.object_type.replace(/_/g,' ')}
                  </span>
                )}
              </div>
            ))}
            {recentActivity.length > 0 && (
              <button onClick={() => onSetTab('Team Activity')} style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                View Full Activity Timeline <ArrowRight size={10} />
              </button>
            )}
          </Panel>
        </div>

        {/* Right col */}
        <Panel title="Active Projects / Phases" action="View All" onAction={() => onSetTab('My APs')}>
          {activePhases.length === 0 && activeApts.length === 0 ? (
            <Empty msg="No active phases or tasks" />
          ) : (
            <>
              {activePhases.slice(0, 3).map(p => (
                <ProjectRow key={p.id} obj={p} allObjects={[...[]]} />
              ))}
              {activeApts.slice(0, 3).map(a => (
                <ProjectRow key={a.id} obj={a} allObjects={[...[]]} />
              ))}
            </>
          )}
          {(activePhases.length > 0 || activeApts.length > 0) && (
            <button onClick={() => onSetTab('My APs')} style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
              View All Projects <ArrowRight size={10} />
            </button>
          )}
        </Panel>
      </div>
    </div>
  )
}

function ProjectRow({ obj, allObjects }: { obj: EKEObject; allObjects: EKEObject[] }) {
  const pct = phaseProgress(obj, allObjects)
  const barColor = pct >= 75 ? '#22c55e' : pct >= 40 ? '#3b82f6' : '#f59e0b'
  return (
    <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #1a1e2833' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: '#1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
            {TYPE_ICON[obj.type] ?? '◈'}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{obj.title}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: barColor, flexShrink: 0 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: '#1a1e28', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function TaskFilterRow({ tasks, onOpen }: { tasks: EKEObject[]; onOpen?: (o: EKEObject) => void }) {
  const [filter, setFilter] = useState('all')
  const inProgress  = tasks.filter(o => o.status === 'in_review')
  const drafts      = tasks.filter(o => o.status === 'draft')
  const completed   = tasks.filter(o => o.status === 'published' || o.status === 'approved')

  const visible = filter === 'all' ? tasks : filter === 'in_progress' ? inProgress : filter === 'review' ? drafts : completed

  const tabs = [
    { key: 'all',         label: `All (${tasks.length})` },
    { key: 'in_progress', label: `In Progress (${inProgress.length})` },
    { key: 'review',      label: `Draft (${drafts.length})` },
    { key: 'completed',   label: `Done (${completed.length})` },
  ]

  return (
    <>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            style={{ padding: '3px 8px', fontSize: 10, borderRadius: 4, border: '1px solid ' + (filter===t.key ? '#3b82f6' : '#1a1e28'), background: filter===t.key ? 'rgba(59,130,246,0.15)' : 'transparent', color: filter===t.key ? '#3b82f6' : '#475569', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? <Empty msg="No tasks" /> : visible.slice(0, 5).map(t => (
        <div key={t.id} onClick={() => onOpen?.(t)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1e2833', cursor: 'pointer' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #3b82f6', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
          </div>
          {t.priority && (
            <span style={{ fontSize: 9, color: PRIORITY_COLOR[t.priority] ?? '#475569', fontWeight: 600, flexShrink: 0 }}>
              {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
            </span>
          )}
        </div>
      ))}
      {visible.length > 5 && (
        <button style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          +{visible.length - 5} more tasks
        </button>
      )}
    </>
  )
}

// ─── Sub-tab pages ────────────────────────────────────────────────────────────
function TasksTab({ tasks, onOpenWizard, onOpenObject }: { tasks: EKEObject[]; onOpenWizard?: (t?: string) => void; onOpenObject?: (o: EKEObject) => void }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>All Tasks ({tasks.length})</span>
        <button onClick={() => onOpenWizard?.('task')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#3b82f6', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#fff', fontWeight: 600 }}>
          <Plus size={11} /> New Task
        </button>
      </div>
      {tasks.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#2a3042', fontStyle: 'italic' }}>No tasks in database</div>
      ) : tasks.map(t => (
        <div key={t.id} onClick={() => onOpenObject?.(t)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #1a1e2866', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#13161e'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid ' + (STATUS_COLOR[t.status] ?? '#475569'), flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{t.title}</div>
            {t.description && <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{t.description.slice(0, 80)}{t.description.length > 80 ? '…' : ''}</div>}
          </div>
          {t.priority && <span style={{ fontSize: 10, fontWeight: 600, color: PRIORITY_COLOR[t.priority], flexShrink: 0 }}>{t.priority}</span>}
          <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLOR[t.status], background: STATUS_COLOR[t.status]+'22', border: `1px solid ${STATUS_COLOR[t.status]}44`, borderRadius: 4, padding: '2px 7px', textTransform: 'capitalize', flexShrink: 0 }}>
            {t.status.replace(/_/g,' ')}
          </span>
        </div>
      ))}
    </div>
  )
}

function DocsTab({ documents, onOpenObject }: { documents: EKEObject[]; onOpenObject?: (o: EKEObject) => void }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>All Documents ({documents.length})</span>
      </div>
      {documents.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#2a3042', fontStyle: 'italic' }}>No documents in database</div>
      ) : documents.map(d => (
        <div key={d.id} onClick={() => onOpenObject?.(d)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #1a1e2866', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{d.title}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>Updated {relativeTime(d.updated_at)}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLOR[d.status], background: STATUS_COLOR[d.status]+'22', border: `1px solid ${STATUS_COLOR[d.status]}44`, borderRadius: 4, padding: '2px 7px', textTransform: 'capitalize', flexShrink: 0 }}>
            {d.status.replace(/_/g,' ')}
          </span>
        </div>
      ))}
    </div>
  )
}

function SimpleListTab({ objects, title, onOpenObject }: { objects: EKEObject[]; title: string; onOpenObject?: (o: EKEObject) => void }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{title} ({objects.length})</span>
      </div>
      {objects.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#2a3042', fontStyle: 'italic' }}>No objects of this type in database</div>
      ) : objects.map(o => (
        <div key={o.id} onClick={() => onOpenObject?.(o)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #1a1e2866', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1a1e28'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
          <span style={{ fontSize: 16 }}>{TYPE_ICON[o.type] ?? '◈'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{o.title}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{o.type.replace(/_/g,' ')} · Updated {relativeTime(o.updated_at)}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLOR[o.status], background: STATUS_COLOR[o.status]+'22', borderRadius: 4, padding: '2px 7px', flexShrink: 0, textTransform: 'capitalize' }}>
            {o.status.replace(/_/g,' ')}
          </span>
        </div>
      ))}
    </div>
  )
}

function TeamActivityTab({ activity }: { activity: any[] }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Team Activity</span>
      </div>
      {activity.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#2a3042', fontStyle: 'italic' }}>No team activity recorded yet</div>
      ) : activity.map(ev => (
        <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid #1a1e2866' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#3b82f6', fontWeight: 700, flexShrink: 0 }}>
            {ev.actor === 'agent' ? 'AI' : 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#e2e8f0' }}>{ev.summary}</div>
            <div style={{ fontSize: 10, color: '#2a3042', marginTop: 2 }}>{relativeTime(ev.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Right Panel ──────────────────────────────────────────────────────────────
function RightPanel({ weekDays, dayLabels, today, activity, objects, tasks, documents, onOpenWizard, onNavigate }: {
  weekDays: Date[]; dayLabels: string[]; today: Date; activity: any[];
  objects: EKEObject[]; tasks: EKEObject[]; documents: EKEObject[]
  onOpenWizard?: (t?: string) => void; onNavigate?: (page: string) => void
}) {
  const inProgressTasks = tasks.filter(o => o.status === 'in_review' || o.status === 'draft')

  return (
    <div style={{ width: 280, borderLeft: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
      {/* Calendar */}
      <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calendar</span>
          <button onClick={() => onNavigate?.('calendar')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View Full Calendar</button>
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textAlign: 'center', marginBottom: 8 }}>
          {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 8 }}>
          {dayLabels.map(l => <div key={l} style={{ fontSize: 8, textAlign: 'center', color: '#475569', fontWeight: 700 }}>{l}</div>)}
          {weekDays.map(d => {
            const isToday = d.toDateString() === today.toDateString()
            return (
              <div key={d.toISOString()} style={{ textAlign: 'center', padding: '4px 2px', borderRadius: 4, background: isToday ? '#3b82f6' : 'transparent', cursor: 'pointer' }}>
                <span style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : '#94a3b8' }}>{d.getDate()}</span>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', textAlign: 'center', marginBottom: 6 }}>No calendar events</div>
        <button onClick={() => onOpenWizard?.('meeting')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '5px', background: 'none', border: '1px dashed #1a1e28', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#475569' }}>
          <Plus size={10} /> New Event
        </button>
      </div>

      {/* Notifications */}
      <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Notifications</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All</button>
        </div>
        <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No notifications</div>
      </div>

      {/* Activity Feed */}
      <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Activity Feed</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All</button>
        </div>
        {activity.length === 0 ? (
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No activity yet</div>
        ) : activity.slice(0, 4).map(ev => (
          <div key={ev.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#3b82f6', fontWeight: 700, flexShrink: 0 }}>
              {ev.actor === 'agent' ? 'AI' : 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{ev.summary}</div>
              <div style={{ fontSize: 9, color: '#2a3042', marginTop: 1 }}>{relativeTime(ev.created_at)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace Stats */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Workspace Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: 'Tasks\nIn Progress', value: inProgressTasks.length, icon: '✅' },
            { label: 'Documents\nOwned', value: documents.length, icon: '📄' },
            { label: 'Objects\nCreated', value: objects.length, icon: '◈' },
            { label: 'Activity\nEvents', value: activity.length, icon: '📊' },
          ].map(s => (
            <div key={s.label} style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 8, color: '#475569', marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Panel({ title, children, action, onAction, extra }: { title: string; children: React.ReactNode; action?: string | null; onAction?: () => void; extra?: React.ReactNode }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>{title}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {extra}
          {action && <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>{action}</button>}
        </div>
      </div>
      <div style={{ padding: '10px 12px' }}>{children}</div>
    </div>
  )
}

function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ padding: '0 14px 6px', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      {children}
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', padding: '8px 0' }}>{msg}</div>
}
