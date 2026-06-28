import { useState, useEffect } from 'react'
import { X, Edit2, CheckCircle, RotateCcw, Archive, Clock, Tag, User, Link2, Activity, ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react'
import { useStore } from '../../store'
import type { EKEObject, ActivityEvent } from '../../../shared/types'
import { TYPE_CONFIG } from '../wizard/CreationWizard'

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  draft:      { bg: '#f59e0b11', border: '#f59e0b44', text: '#f59e0b' },
  in_review:  { bg: '#3b82f611', border: '#3b82f644', text: '#3b82f6' },
  approved:   { bg: '#22c55e11', border: '#22c55e44', text: '#22c55e' },
  published:  { bg: '#22c55e18', border: '#22c55e66', text: '#4ade80' },
  revised:    { bg: '#a855f711', border: '#a855f744', text: '#a855f7' },
  archived:   { bg: '#47556911', border: '#47556944', text: '#475569' },
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ObjectViewer() {
  const { viewingObject, closeObject, objects, openObject, setActivePage, openWizardEdit } = useStore()
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [showMeta, setShowMeta] = useState(true)
  const [showActivity, setShowActivity] = useState(true)
  const [showLinks, setShowLinks] = useState(true)
  const [copied, setCopied] = useState(false)

  const obj = viewingObject

  useEffect(() => {
    if (!obj || typeof window === 'undefined' || !window.divadOS) return
    window.divadOS.activity.list(100).then((all: ActivityEvent[]) => {
      setActivity(all.filter(e => e.object_id === obj.id))
    })
  }, [obj?.id])

  if (!obj) return null

  const cfg = TYPE_CONFIG[obj.type] ?? { icon: '📄', label: obj.type, color: '#3b82f6' }
  const statusStyle = STATUS_COLORS[obj.status] ?? STATUS_COLORS.draft
  const linkedObjs = objects.filter(o => {
    const m = obj.metadata as Record<string, unknown>
    const linkedIds = m.linkedObjectIds as string[] | undefined
    return linkedIds?.includes(o.id)
  })

  const copyId = () => {
    navigator.clipboard?.writeText(obj.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleApprove = async () => {
    if (!window.divadOS) return
    await window.divadOS.objects.approve(obj.id)
    const updated = await window.divadOS.objects.get(obj.id)
    if (updated) openObject(updated)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 48 }}>
      <div onClick={closeObject} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />

      <div style={{ position: 'relative', width: '90%', maxWidth: 1000, maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: cfg.color + '18', border: `1px solid ${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {cfg.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', background: cfg.color + '18', border: `1px solid ${cfg.color}44`, borderRadius: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, borderRadius: 10, color: statusStyle.text, fontWeight: 600 }}>{obj.status.replace('_', ' ')}</span>
              {obj.priority && <span style={{ fontSize: 10, padding: '2px 8px', background: PRIORITY_COLORS[obj.priority] + '18', border: `1px solid ${PRIORITY_COLORS[obj.priority]}44`, borderRadius: 10, color: PRIORITY_COLORS[obj.priority], fontWeight: 600 }}>{obj.priority}</span>}
              <span style={{ fontSize: 10, color: '#2a3042' }}>v{obj.revision}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>{obj.title}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {obj.status === 'in_review' && (
              <button onClick={handleApprove} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#22c55e18', border: '1px solid #22c55e44', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                <CheckCircle size={12} /> Approve
              </button>
            )}
            {(obj.status === 'draft' || obj.status === 'approved' || obj.status === 'published') && (
              <button onClick={() => { closeObject(); openWizardEdit(obj) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#94a3b8' }}>
                <Edit2 size={12} /> Edit
              </button>
            )}
            <button onClick={closeObject} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Main content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Description */}
            {obj.description && (
              <Section title="Description">
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{obj.description}</p>
              </Section>
            )}

            {/* Type-specific metadata */}
            <MetadataFields obj={obj} />

            {/* Tags */}
            {obj.tags.length > 0 && (
              <Section title="Tags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {obj.tags.map(t => (
                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 12, fontSize: 10, color: '#94a3b8' }}>
                      <Tag size={9} />#{t}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Linked objects */}
            <Collapsible title={`Linked Objects (${linkedObjs.length})`} open={showLinks} toggle={() => setShowLinks(p => !p)}>
              {linkedObjs.length === 0
                ? <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No linked objects</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {linkedObjs.map(lo => {
                      const lc = TYPE_CONFIG[lo.type] ?? { icon: '📄', color: '#3b82f6', label: lo.type }
                      return (
                        <button key={lo.id} onClick={() => openObject(lo)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 7, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                          <span style={{ fontSize: 16 }}>{lc.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{lo.title}</div>
                            <div style={{ fontSize: 9, color: '#475569' }}>{lc.label} · {lo.status}</div>
                          </div>
                          <ExternalLink size={11} color="#2a3042" />
                        </button>
                      )
                    })}
                  </div>
              }
            </Collapsible>

            {/* Activity */}
            <Collapsible title={`Activity (${activity.length})`} open={showActivity} toggle={() => setShowActivity(p => !p)}>
              {activity.length === 0
                ? <div style={{ fontSize: 11, color: '#2a3042', fontStyle: 'italic' }}>No activity recorded</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activity.map(ev => (
                      <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #1a1e2844' }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: '#1a1e28', border: '1px solid #222736', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Activity size={11} color="#475569" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{ev.summary}</div>
                          <div style={{ fontSize: 9, color: '#2a3042', marginTop: 3 }}>{ev.actor} · {relativeTime(ev.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </Collapsible>
          </div>

          {/* Right sidebar */}
          <div style={{ width: 240, borderLeft: '1px solid #1a1e28', overflowY: 'auto', padding: '16px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Collapsible title="Details" open={showMeta} toggle={() => setShowMeta(p => !p)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MetaRow icon={<User size={10} />} label="Owner" value={obj.owner ?? '—'} />
                <MetaRow icon={<Clock size={10} />} label="Created" value={new Date(obj.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                <MetaRow icon={<Clock size={10} />} label="Updated" value={relativeTime(obj.updated_at)} />
                <MetaRow icon={<RotateCcw size={10} />} label="Revision" value={`v${obj.revision}`} />
                {obj.priority && <MetaRow icon={<span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[obj.priority!] ?? '#475569', display: 'inline-block' }} />} label="Priority" value={obj.priority} />}
                {!!(obj.metadata as Record<string,unknown>).repository && (
                  <MetaRow icon={<Archive size={10} />} label="Repository" value={String((obj.metadata as Record<string,unknown>).repository)} />
                )}
              </div>
            </Collapsible>

            {/* Object ID */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Object ID</div>
              <button onClick={copyId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 5, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <span style={{ fontSize: 9, color: '#2a3042', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.id}</span>
                <Copy size={9} color={copied ? '#22c55e' : '#2a3042'} />
              </button>
              {copied && <div style={{ fontSize: 9, color: '#22c55e', marginTop: 3 }}>Copied!</div>}
            </div>

            {/* Quick navigate */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Navigate To</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[['objects','Objects'],['knowledge','Knowledge'],['repository','Repository']].map(([page, label]) => (
                  <button key={page} onClick={() => { closeObject(); setActivePage(page) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'none', border: '1px solid #1a1e28', borderRadius: 5, cursor: 'pointer', fontSize: 10, color: '#475569', textAlign: 'left' }}>
                    <ExternalLink size={9} /> View in {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status actions */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Status</div>
              <StatusTimeline status={obj.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Type-specific metadata display ──────────────────────────────────────────
function MetadataFields({ obj }: { obj: EKEObject }) {
  const m = obj.metadata as Record<string, string | undefined>
  const fields: [string, string][] = []

  if (obj.type === 'document') {
    if (m.docType) fields.push(['Document Type', m.docType])
    if (m.version) fields.push(['Version', m.version])
    if (m.content) {
      return (
        <Section title="Content">
          <div style={{ padding: '12px 14px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 7, fontSize: 11, color: '#94a3b8', lineHeight: 1.8, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
            {m.content}
          </div>
          {fields.length > 0 && <FieldGrid fields={fields} />}
        </Section>
      )
    }
  }

  if (obj.type === 'decision') {
    if (m.ddrNumber) fields.push(['DDR Number', m.ddrNumber])
    if (m.reviewDate) fields.push(['Review Date', m.reviewDate])
    const sections = [
      ['Problem Statement', m.problem],
      ['Decision', m.decision],
      ['Alternatives Considered', m.alternatives],
      ['Consequences', m.consequences],
    ].filter(([, v]) => v) as [string, string][]

    if (sections.length === 0 && fields.length === 0) return null
    return (
      <Section title="Decision Record">
        {fields.length > 0 && <FieldGrid fields={fields} />}
        {sections.map(([label, value]) => (
          <div key={label} style={{ marginTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{value}</p>
          </div>
        ))}
      </Section>
    )
  }

  if (obj.type === 'meeting') {
    if (m.date) fields.push(['Date & Time', new Date(m.date).toLocaleString()])
    if (m.attendees) fields.push(['Attendees', m.attendees])
    const sections = [['Agenda', m.agenda], ['Notes', m.notes], ['Action Items', m.actionItems]].filter(([, v]) => v) as [string, string][]
    if (sections.length === 0 && fields.length === 0) return null
    return (
      <Section title="Meeting Details">
        {fields.length > 0 && <FieldGrid fields={fields} />}
        {sections.map(([label, value]) => (
          <div key={label} style={{ marginTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{value}</p>
          </div>
        ))}
      </Section>
    )
  }

  if (obj.type === 'knowledge_object') {
    if (m.domain) fields.push(['Domain', m.domain])
    if (m.knowledgeType) fields.push(['Knowledge Type', m.knowledgeType])
    if (m.evidenceSource) fields.push(['Evidence Source', m.evidenceSource])
    if (m.confidence) fields.push(['Confidence', `${m.confidence}%`])
    if (m.engineeringNotes) {
      return (
        <Section title="Knowledge Details">
          <FieldGrid fields={fields} />
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Engineering Notes</div>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{m.engineeringNotes}</p>
          </div>
        </Section>
      )
    }
  }

  if (obj.type === 'risk') {
    if (m.severity) fields.push(['Severity', m.severity])
    if (m.likelihood) fields.push(['Likelihood', m.likelihood])
    if (m.riskStatus) fields.push(['Risk Status', m.riskStatus])
    if (m.mitigation) {
      return (
        <Section title="Risk Details">
          <FieldGrid fields={fields} />
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Mitigation Plan</div>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{m.mitigation}</p>
          </div>
        </Section>
      )
    }
  }

  if (obj.type === 'architecture_phase') {
    if (m.apNumber) fields.push(['AP Number', m.apNumber])
    if (m.mission) fields.push(['Mission', m.mission])
    if (m.definitionOfDone) fields.push(['Definition of Done', m.definitionOfDone])
  }

  if (obj.type === 'apo') {
    if (m.apReference) fields.push(['AP Reference', m.apReference])
    if (m.apoNumber) fields.push(['APO Number', m.apoNumber])
    if (m.assignedTo) fields.push(['Assigned To', m.assignedTo])
    if (m.estimatedDuration) fields.push(['Est. Duration', m.estimatedDuration])
  }

  if (obj.type === 'apt') {
    if (m.apoReference) fields.push(['APO Reference', m.apoReference])
    if (m.hours) fields.push(['Estimated Hours', m.hours])
    if (m.definitionOfComplete) fields.push(['Definition of Complete', m.definitionOfComplete])
  }

  if (obj.type === 'requirement') {
    if (m.reqType) fields.push(['Requirement Type', m.reqType])
    if (m.reqId) fields.push(['Requirement ID', m.reqId])
    if (m.acceptanceCriteria) fields.push(['Acceptance Criteria', m.acceptanceCriteria])
  }

  if (fields.length === 0) return null
  return (
    <Section title="Details">
      <FieldGrid fields={fields} />
    </Section>
  )
}

function FieldGrid({ fields }: { fields: [string, string][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {fields.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

function StatusTimeline({ status }: { status: string }) {
  const stages = ['draft', 'in_review', 'approved', 'published', 'revised', 'archived']
  const idx = stages.indexOf(status)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {stages.map((s, i) => {
        const done = i <= idx
        const active = s === status
        const style = STATUS_COLORS[s] ?? STATUS_COLORS.draft
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? style.text : done ? '#1a1e28' : '#0d0f14', border: `1px solid ${active ? style.text : done ? '#222736' : '#1a1e28'}`, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: active ? style.text : done ? '#2a3042' : '#1a1e28', fontWeight: active ? 700 : 400 }}>{s.replace('_', ' ')}</span>
          </div>
        )
      })}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
        <div style={{ flex: 1, height: 1, background: '#1a1e28' }} />
      </div>
      {children}
    </div>
  )
}

function Collapsible({ title, open, toggle, children }: { title: string; open: boolean; toggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: open ? 10 : 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: '#1a1e28' }} />
        {open ? <ChevronUp size={11} color="#475569" /> : <ChevronDown size={11} color="#475569" />}
      </button>
      {open && children}
    </div>
  )
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#475569' }}>{icon}</span> {label}
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{value}</div>
    </div>
  )
}

function Link2Icon({ size }: { size: number }) {
  return <Link2 size={size} />
}
