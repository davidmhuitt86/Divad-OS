import { useState, useMemo } from 'react'
import { Plus, ChevronDown, Eye, Share2, Download, MoreHorizontal, ArrowRight, Circle } from 'lucide-react'
import { useStore } from '../store'
import LayoutPanel from '../components/layout/LayoutPanel'
import LayoutLock  from '../components/layout/LayoutLock'
import { usePageLayout } from '../hooks/usePageLayout'

const PANELS = ['statCards', 'chartsRow', 'recentTable']

const TABS = ['Overview', 'My Reports', 'Shared with Me', 'Scheduled', 'Templates', 'Data Sources']

const CATEGORIES = [
  { key: 'all',         label: 'All Reports'         },
  { key: 'project',     label: 'Project Reports'      },
  { key: 'engineering', label: 'Engineering Reports'  },
  { key: 'quality',     label: 'Quality Reports'      },
  { key: 'performance', label: 'Performance Reports'  },
  { key: 'compliance',  label: 'Compliance Reports'   },
  { key: 'custom',      label: 'Custom Reports'       },
]

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Reports() {
  const { objects, activity, openWizard, setActivePage, navigateToObjects } = useStore()
  const [tab, setTab] = useState('Overview')
  const [category, setCategory] = useState('all')
  const layout = usePageLayout('reports', PANELS)

  const recentActivity = useMemo(() =>
    [...activity].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6),
    [activity]
  )

  // Use objects as available data context
  const totalObjects = objects.length

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#0d0f14', position: 'relative' }}>
      {/* Left sidebar */}
      <div style={{ width: 196, borderRight: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', padding: '14px 0', flexShrink: 0, overflowY: 'auto' }}>
        <SideSection label="Quick Create">
          {([
            ['New Report',          '📊', () => openWizard('document')],
            ['Report from Template','📋', () => openWizard('document')],
            ['Schedule Report',     '🕐', () => setTab('Scheduled')],
            ['Export Data',         '📤', () => setTab('Data Sources')],
          ] as [string, string, () => void][]).map(([label, icon, action]) => (
            <SideBtn key={label} label={label} icon={icon} onClick={action} />
          ))}
        </SideSection>

        <div style={{ margin: '10px 14px', height: 1, background: '#1a1e28' }} />

        <SideSection label="Report Categories">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: category === c.key ? '#3b82f6' : '#94a3b8', width: '100%', textAlign: 'left', fontWeight: category === c.key ? 600 : 400, borderRight: category === c.key ? '2px solid #3b82f6' : '2px solid transparent' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: category === c.key ? '#3b82f6' : '#2a3042', flexShrink: 0, display: 'inline-block' }} />
              {c.label}
            </button>
          ))}
        </SideSection>

        <div style={{ margin: '10px 14px', height: 1, background: '#1a1e28' }} />

        <SideSection label="System Status">
          <div style={{ padding: '6px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, cursor: 'pointer' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>All Systems Operational</span>
            </div>
            <div style={{ fontSize: 9, color: '#475569' }}>
              <div>Last Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div style={{ marginTop: 3 }}>Database objects: {totalObjects}</div>
            </div>
          </div>
        </SideSection>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, lineHeight: 1 }}>Reports</h1>
              <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>Insight. Analysis. Intelligence.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openWizard('document')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
                📊 Create Report
              </button>
              <button onClick={() => openWizard('document')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
                <Plus size={13} /> New Report <ChevronDown size={11} />
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1a1e28' }}>
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
          {tab === 'Overview' && <OverviewTab objects={objects} onSetTab={setTab} />}
          {tab !== 'Overview' && (
            <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{tab}</div>
              <div style={{ fontSize: 11, color: '#2a3042' }}>No reports exist yet. Create your first report to get started.</div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 260, borderLeft: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
        {/* Report Insights */}
        <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Report Insights</div>
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', marginBottom: 8 }}>No reports generated yet.</div>
          <button onClick={() => setTab('My Reports')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            View All Insights <ArrowRight size={10} />
          </button>
        </div>

        {/* Recent Activity */}
        <div style={{ borderBottom: '1px solid #1a1e28', padding: '12px 14px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Activity</span>
            <button onClick={() => setTab('My Reports')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All</button>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>No activity recorded yet</div>
          ) : recentActivity.map(ev => (
            <div key={ev.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#3b82f6', fontWeight: 700, flexShrink: 0 }}>
                {ev.actor === 'agent' ? 'AI' : 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.summary}</div>
                <div style={{ fontSize: 9, color: '#2a3042', marginTop: 2 }}>
                  {ev.actor === 'agent' ? 'AI Assistant' : 'You'} · {relativeTime(ev.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scheduled Reports */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scheduled Reports</span>
            <button onClick={() => setTab('Scheduled')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All</button>
          </div>
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', marginBottom: 8 }}>No scheduled reports</div>
          <button onClick={() => setTab('Scheduled')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            Manage Schedules <ArrowRight size={10} />
          </button>
        </div>
      </div>
      <LayoutLock layout={layout} />
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ objects, onSetTab }: { objects: any[]; onSetTab: (t: string) => void }) {
  const totalObjects = objects.length
  const byType: Record<string, number> = {}
  for (const o of objects) byType[o.type] = (byType[o.type] ?? 0) + 1
  const typeDist = Object.entries(byType).sort((a, b) => b[1] - a[1])

  const DONUT_COLORS = ['#3b82f6','#22c55e','#a855f7','#f59e0b','#06b6d4','#ef4444']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        <StatCard label="Total Reports"      value="—" sub="No reports yet"       color="#3b82f6" icon="📋" />
        <StatCard label="Reports Generated"  value="—" sub="No reports yet"       color="#22c55e" icon="📊" />
        <StatCard label="Scheduled Reports"  value="—" sub="No schedules"         color="#a855f7" icon="🕐" />
        <StatCard label="Data Sources"       value={totalObjects > 0 ? String(totalObjects) : '—'} sub={totalObjects > 0 ? 'Objects available' : 'No data yet'} color="#f59e0b" icon="🗄️" />
        <StatCard label="Report Views"       value="—" sub="No views yet"         color="#06b6d4" icon="👁️" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 10 }}>
        {/* Reports Overview chart — empty state */}
        <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', flex: 1 }}>Reports Overview</span>
            <button style={{ fontSize: 9, color: '#475569', background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Last 30 Days</button>
            <button style={{ fontSize: 9, color: '#475569', background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Daily</button>
          </div>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            {/* Empty chart scaffold */}
            <svg width="100%" height={160} viewBox="0 0 600 160">
              {/* Grid */}
              {[0,40,80,120,160].map(y => (
                <line key={y} x1={0} y1={y} x2={600} y2={y} stroke="#1a1e2866" strokeWidth={1} />
              ))}
              {/* Y labels */}
              {[100,75,50,25,0].map((v, i) => (
                <text key={v} x={8} y={i * 40 + 5} fill="#2a3042" fontSize={9}>{v}</text>
              ))}
              {/* X labels */}
              {['Apr 20','Apr 25','Apr 30','May 5','May 10','May 15','May 19'].map((d, i) => (
                <text key={d} x={30 + i * 90} y={155} fill="#2a3042" fontSize={8}>{d}</text>
              ))}
              <text x={300} y={80} textAnchor="middle" fill="#2a3042" fontSize={11} fontStyle="italic">No report data available</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
              {[['#3b82f6','Reports Generated'],['#22c55e','Report Views'],['#a855f7','Data Points']].map(([c,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 9, color: '#2a3042' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reports by Type — use object type distribution as proxy */}
        <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>
              {typeDist.length > 0 ? 'Objects by Type' : 'Reports by Type'}
            </span>
          </div>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 14 }}>
            {typeDist.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No data in database yet</div>
              </div>
            ) : (
              <>
                {/* Donut */}
                <svg width={120} height={120} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                  {(() => {
                    const total = typeDist.reduce((s, [,c]) => s + c, 0)
                    const CIRC = 2 * Math.PI * 44
                    let offset = CIRC * 0.25
                    return typeDist.slice(0, 6).map(([type, count], i) => {
                      const pct = count / total
                      const dash = CIRC * pct
                      const el = <circle key={type} cx={60} cy={60} r={44} fill="none"
                        stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth={16}
                        strokeDasharray={`${dash} ${CIRC}`} strokeDashoffset={offset} strokeLinecap="butt" />
                      offset -= dash
                      return el
                    })
                  })()}
                  <text x={60} y={56} textAnchor="middle" fill="#e2e8f0" fontSize={18} fontWeight={700}>{totalObjects}</text>
                  <text x={60} y={71} textAnchor="middle" fill="#475569" fontSize={9}>Total</text>
                </svg>
                {/* Legend */}
                <div style={{ flex: 1 }}>
                  {typeDist.slice(0, 6).map(([type, count], i) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 9, color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {type.replace(/_/g,' ')}
                      </span>
                      <span style={{ fontSize: 9, color: '#e2e8f0', fontWeight: 600 }}>{count}</span>
                      <span style={{ fontSize: 8, color: '#475569' }}>
                        ({Math.round(count / totalObjects * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports table */}
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '9px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Recent Reports</span>
          <button onClick={() => onSetTab('My Reports')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#3b82f6' }}>View All Reports</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: '#0d0f14' }}>
              {['Report Name','Type','Created By','Created','Status','Views','Actions'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1a1e28', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#2a3042', fontStyle: 'italic' }}>
                No reports have been created yet. Use "New Report" to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: string }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 9, color: '#475569', marginTop: 3 }}>{sub}</div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
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

function SideBtn({ label, icon, onClick }: { label: string; icon: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8', width: '100%', textAlign: 'left' }}>
      <span style={{ color: '#3b82f6' }}>+</span> {label}
    </button>
  )
}
