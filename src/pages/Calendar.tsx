import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, ChevronDown, Filter, Settings } from 'lucide-react'
import { useStore } from '../store'
import type { EKEObject } from '../../shared/types'

const VIEWS = ['Month', 'Week', 'Day', 'Agenda', 'Timeline']
const DOW   = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#22c55e',
}
const STATUS_COLOR: Record<string, string> = {
  draft: '#3b82f6', in_review: '#f59e0b', approved: '#22c55e',
  published: '#22c55e', revised: '#a855f7', archived: '#475569',
}

const MY_CALENDARS = [
  { label: 'My Calendar',        color: '#3b82f6', checked: true  },
  { label: 'Tasks',              color: '#3b82f6', checked: true  },
  { label: 'Projects',           color: '#a855f7', checked: true  },
  { label: 'Team Events',        color: '#f59e0b', checked: true  },
  { label: 'Reviews & Meetings', color: '#ef4444', checked: true  },
  { label: 'Holidays',           color: '#475569', checked: false },
]

export default function Calendar() {
  const { objects, openWizard, setActivePage } = useStore()
  const [view,      setView]      = useState('Month')
  const [curDate,   setCurDate]   = useState(new Date())

  const today = new Date()
  const year  = curDate.getFullYear()
  const month = curDate.getMonth()

  // Build calendar grid (6 weeks × 7 days)
  const calDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()  // 0=Sun
    const daysInMonth    = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const cells: { date: Date; inMonth: boolean }[] = []

    // Prev month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false })
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), inMonth: true })
    }
    // Next month fill
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(year, month + 1, d), inMonth: false })
    }
    return cells
  }, [year, month])

  // Mini calendar for right panel
  const miniCalDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrev  = new Date(year, month, 0).getDate()
    const cells: { date: Date; inMonth: boolean }[] = []
    for (let i = firstDay - 1; i >= 0; i--)
      cells.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false })
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ date: new Date(year, month, d), inMonth: true })
    const rem = 42 - cells.length
    for (let d = 1; d <= rem; d++)
      cells.push({ date: new Date(year, month + 1, d), inMonth: false })
    return cells
  }, [year, month])

  const tasks = useMemo(() => objects.filter(o => o.type === 'task' && o.status !== 'archived'), [objects])
  const meetings = useMemo(() => objects.filter(o => o.type === 'meeting'), [objects])

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()

  const prevMonth = () => setCurDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurDate(new Date(year, month + 1, 1))
  const goToday   = () => setCurDate(new Date())

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#0d0f14' }}>
      {/* Left sidebar */}
      <div style={{ width: 196, borderRight: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', padding: '14px 0', flexShrink: 0, overflowY: 'auto' }}>
        <SideSection label="Quick Create">
          {([
            ['New Event',       () => openWizard('meeting')],
            ['New Task',        () => openWizard('task')],
            ['Schedule Meeting',() => openWizard('meeting')],
            ['New Reminder',    () => openWizard('task')],
          ] as [string, () => void][]).map(([l, action]) => (
            <SideBtn key={l} label={l} onClick={action} />
          ))}
        </SideSection>

        <div style={{ margin: '10px 14px', height: 1, background: '#1a1e28' }} />

        <SideSection label="Calendar Views">
          {VIEWS.map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: view === v ? '#3b82f6' : '#94a3b8', width: '100%', textAlign: 'left', fontWeight: view === v ? 600 : 400, borderRight: view === v ? '2px solid #3b82f6' : '2px solid transparent' }}>
              {v === 'Month' ? '▦' : v === 'Week' ? '▤' : v === 'Day' ? '▥' : v === 'Agenda' ? '☰' : '─'}
              <span style={{ marginLeft: 4 }}>{v}</span>
            </button>
          ))}
        </SideSection>

        <div style={{ margin: '10px 14px', height: 1, background: '#1a1e28' }} />

        <SideSection label="My Calendars">
          {MY_CALENDARS.map(c => (
            <label key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', cursor: 'pointer' }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: c.checked ? c.color : 'transparent', border: `2px solid ${c.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{c.label}</span>
            </label>
          ))}
        </SideSection>

        <div style={{ padding: '10px 14px 0' }}>
          <button onClick={() => setActivePage('settings')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Settings size={11} /> Manage Calendars
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Calendar</h1>
            <p style={{ fontSize: 11, color: '#475569', margin: '3px 0 0', fontStyle: 'italic' }}>Plan. Schedule. Collaborate.</p>
          </div>
          <div style={{ flex: 1 }} />
          {/* View tabs */}
          <div style={{ display: 'flex', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 6, overflow: 'hidden' }}>
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '6px 12px', background: view === v ? '#3b82f6' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: view === v ? '#fff' : '#475569', fontWeight: view === v ? 600 : 400 }}>
                {v}
              </button>
            ))}
          </div>
          {/* Nav */}
          <button onClick={goToday} style={{ padding: '6px 12px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#94a3b8' }}>Today</button>
          <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: 5, background: '#1a1e28', border: '1px solid #222736', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={13} /></button>
          <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: 5, background: '#1a1e28', border: '1px solid #222736', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={13} /></button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
            {MONTHS[month]} {year} <ChevronDown size={13} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#94a3b8' }}>
            <Filter size={11} /> Filters
          </button>
          <button onClick={() => openWizard('meeting')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#3b82f6', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#fff', fontWeight: 600 }}>
            <Plus size={11} /> New Event <ChevronDown size={10} />
          </button>
        </div>

        {/* Calendar grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {view === 'Month' ? (
            <>
              {/* DOW headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
                {DOW.map(d => (
                  <div key={d} style={{ padding: '6px 10px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.08em' }}>{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', overflow: 'hidden' }}>
                {calDays.map((cell, i) => {
                  const today_ = isToday(cell.date)
                  const inMonth = cell.inMonth
                  // Meeting objects on this date (by created_at date matching)
                  const dayMeetings = meetings.filter(m => {
                    const d = new Date(m.created_at)
                    return d.getDate() === cell.date.getDate() && d.getMonth() === cell.date.getMonth() && d.getFullYear() === cell.date.getFullYear()
                  })
                  return (
                    <div key={i} style={{ border: '1px solid #1a1e2866', padding: '4px 6px', background: today_ ? 'rgba(59,130,246,0.05)' : 'transparent', cursor: 'pointer', overflow: 'hidden', minHeight: 0 }}
                      onMouseEnter={e => { if (!today_) (e.currentTarget as HTMLElement).style.background = '#13161e' }}
                      onMouseLeave={e => { if (!today_) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: today_ ? '#3b82f6' : 'transparent', marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: today_ ? 700 : 400, color: today_ ? '#fff' : inMonth ? '#94a3b8' : '#2a3042' }}>
                          {cell.date.getDate()}
                        </span>
                      </div>
                      {/* Real meeting objects on this day */}
                      {dayMeetings.slice(0, 2).map(m => (
                        <div key={m.id} style={{ fontSize: 9, color: '#e2e8f0', background: '#3b82f622', border: '1px solid #3b82f644', borderRadius: 3, padding: '1px 4px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          🤝 {m.title}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a3042', fontStyle: 'italic', fontSize: 13 }}>
              {view} view — no calendar integration yet
            </div>
          )}
        </div>

        {/* Bottom stat bar */}
        <div style={{ borderTop: '1px solid #1a1e28', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', flexShrink: 0 }}>
          {[
            { icon: '📅', label: 'Events This Month',  value: meetings.length > 0 ? meetings.length : '—', sub: 'No calendar integration' },
            { icon: '✅', label: 'Tasks Due',           value: tasks.length > 0 ? tasks.length : '—',    sub: tasks.length > 0 ? `${tasks.filter(t=>t.status==='in_review').length} in review` : 'No tasks yet' },
            { icon: '🤝', label: 'Meetings',            value: meetings.length > 0 ? meetings.length : '—', sub: 'From database' },
            { icon: '👥', label: 'Attendees',           value: '—',  sub: 'No calendar integration' },
            { icon: '🎯', label: 'Focus Time',          value: '—',  sub: 'Not tracked yet' },
            { icon: '🚩', label: 'Deadlines',           value: '—',  sub: 'No deadlines set' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRight: i < 5 ? '1px solid #1a1e28' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#13161e', border: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 8, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 8, color: '#475569', marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 260, borderLeft: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
        {/* Agenda */}
        <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Agenda</span>
            <button onClick={() => setView('Agenda')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View Full Agenda</button>
          </div>
          {meetings.length === 0 ? (
            <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No calendar events. Add meetings as objects to see them here.</div>
          ) : meetings.slice(0, 4).map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{m.title}</div>
                <div style={{ fontSize: 9, color: '#475569' }}>{new Date(m.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Tasks */}
        <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>My Tasks</span>
            <button onClick={() => setActivePage('workspace')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All Tasks</button>
          </div>
          {tasks.length === 0 ? (
            <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No tasks in database</div>
          ) : tasks.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, cursor: 'pointer' }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, border: `2px solid ${STATUS_COLOR[t.status] ?? '#475569'}`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
              {t.priority && (
                <span style={{ fontSize: 9, fontWeight: 600, color: PRIORITY_COLOR[t.priority], flexShrink: 0 }}>
                  {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mini calendar */}
        <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}><ChevronLeft size={12} /></button>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}><ChevronRight size={12} /></button>
          </div>
          {/* DOW mini */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 8, color: '#475569', fontWeight: 700, padding: '2px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {miniCalDays.map((cell, i) => {
              const tod = isToday(cell.date)
              return (
                <div key={i} style={{ textAlign: 'center', padding: '2px', cursor: 'pointer' }}>
                  <span style={{ display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: tod ? '#3b82f6' : 'transparent', fontSize: 9, color: tod ? '#fff' : cell.inMonth ? '#94a3b8' : '#2a3042', fontWeight: tod ? 700 : 400 }}>
                    {cell.date.getDate()}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 10 }}>
            {[['#3b82f6','My Calendar'],['#22c55e','Tasks'],['#a855f7','Projects'],['#f59e0b','Events'],['#ef4444','Reviews'],['#475569','Holidays']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 8, color: '#475569' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Upcoming Events</span>
            <button onClick={() => setView('Agenda')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All</button>
          </div>
          {meetings.length === 0 ? (
            <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No upcoming events</div>
          ) : meetings.slice(0, 3).map(m => (
            <div key={m.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{m.title}</div>
                <div style={{ fontSize: 9, color: '#475569' }}>{new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

function SideBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', width: '100%', textAlign: 'left' }}>
      <span style={{ color: '#3b82f6' }}>+</span> {label}
    </button>
  )
}
