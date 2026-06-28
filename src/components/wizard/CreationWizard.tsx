import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles, Plus, Link2, Check, Loader2, Send, RotateCcw } from 'lucide-react'
import { useStore, isSyncCurrent } from '../../store'
import type { EKEObject } from '../../../shared/types'

// ─── Type Configuration ───────────────────────────────────────────────────────
export const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  document:           { icon: '📄', label: 'Document',           color: '#3b82f6' },
  knowledge_object:   { icon: '🧠', label: 'Knowledge Object',   color: '#a855f7' },
  architecture_phase: { icon: '🏛️', label: 'Architecture Phase', color: '#06b6d4' },
  apo:                { icon: '🎯', label: 'Objective (APO)',     color: '#22c55e' },
  apt:                { icon: '✅', label: 'Task (APT)',          color: '#4ade80' },
  apm:                { icon: '📐', label: 'APM',                 color: '#06b6d4' },
  decision:           { icon: '⚖️', label: 'Decision Record',    color: '#f59e0b' },
  research:           { icon: '📚', label: 'Research',            color: '#8b5cf6' },
  meeting:            { icon: '📝', label: 'Meeting',             color: '#3b82f6' },
  journal:            { icon: '📒', label: 'Journal',             color: '#94a3b8' },
  requirement:        { icon: '📋', label: 'Requirement',         color: '#ef4444' },
  risk:               { icon: '⚠️', label: 'Risk',               color: '#f97316' },
  question:           { icon: '❓', label: 'Question',            color: '#64748b' },
  standard:           { icon: '⚙️', label: 'Standard',           color: '#64748b' },
  product:            { icon: '📦', label: 'Product',             color: '#22c55e' },
  aar:                { icon: '📑', label: 'AAR (Lesson Learned)',color: '#94a3b8' },
  mit:                { icon: '🏆', label: 'MIT',                 color: '#f59e0b' },
  task:               { icon: '✅', label: 'Task',                color: '#22c55e' },
}

// ─── Wizard State ─────────────────────────────────────────────────────────────
interface WizardState {
  step: 1 | 2 | 3 | 4 | 5
  objectType: string
  title: string
  description: string
  owner: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  metadata: Record<string, unknown>
  tags: string[]
  tagInput: string
  linkedObjectIds: string[]
  repository: string
  aiAssistOpen: boolean
  aiLoading: boolean
  aiResult: string
  targetStatus: 'draft' | 'in_review' | 'published'
  creating: boolean
  created: boolean
  error: string
}

const DEFAULT_STATE: WizardState = {
  step: 1,
  objectType: '',
  title: '',
  description: '',
  owner: 'David',
  priority: 'medium',
  metadata: {},
  tags: [],
  tagInput: '',
  linkedObjectIds: [],
  repository: 'Divad Canon',
  aiAssistOpen: false,
  aiLoading: false,
  aiResult: '',
  targetStatus: 'draft',
  creating: false,
  created: false,
  error: '',
}

const STEP_LABELS = ['Choose', 'Describe', 'Connect', 'Validate', 'Create']

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function CreationWizard() {
  const { wizardOpen, wizardInitialType, editingObject, closeWizard, loadObjects, lastSyncAt, githubConfig, setActivePage, isOffline } = useStore()
  const [s, setS] = useState<WizardState>(DEFAULT_STATE)

  const upd = useCallback((patch: Partial<WizardState>) => setS(prev => ({ ...prev, ...patch })), [])

  useEffect(() => {
    if (wizardOpen) {
      if (editingObject) {
        const m = editingObject.metadata as Record<string, unknown>
        setS({
          ...DEFAULT_STATE,
          objectType: editingObject.type,
          title: editingObject.title,
          description: editingObject.description ?? '',
          owner: editingObject.owner ?? 'David',
          priority: editingObject.priority ?? 'medium',
          tags: editingObject.tags,
          linkedObjectIds: (m.linkedObjectIds as string[]) ?? [],
          repository: (m.repository as string) ?? 'Divad Canon',
          metadata: m,
          targetStatus: editingObject.status === 'archived' ? 'draft' : (editingObject.status as WizardState['targetStatus']),
          step: 2,
        })
      } else if (wizardInitialType) {
        setS({ ...DEFAULT_STATE, objectType: wizardInitialType, step: 2 })
      } else {
        setS(DEFAULT_STATE)
      }
    }
  }, [wizardOpen, wizardInitialType, editingObject?.id])

  if (!wizardOpen) return null

  const isEditing = !!editingObject
  const cfg = TYPE_CONFIG[s.objectType] ?? { icon: '📄', label: 'Object', color: '#3b82f6' }
  const canNext = s.step === 1 ? !!s.objectType : s.step === 2 ? !!s.title.trim() : true

  const next = () => {
    if (s.step < 5 && canNext) upd({ step: (s.step + 1) as WizardState['step'] })
  }
  const back = () => {
    if (s.step > (isEditing ? 2 : 1)) upd({ step: (s.step - 1) as WizardState['step'] })
  }

  const syncLocked = githubConfig && !isSyncCurrent(lastSyncAt)
  const offlineLocked = isOffline

  const handleCreate = async () => {
    if (!window.divadOS) { upd({ error: 'Electron bridge not available.' }); return }
    if (!isEditing && offlineLocked) { upd({ error: 'You are offline. Connect to GitHub and sync before creating objects.' }); return }
    if (!isEditing && syncLocked) { upd({ error: 'Your last sync was more than 24 hours ago. Go to Repository → Sync to unlock creation.' }); return }
    upd({ creating: true, error: '' })
    try {
      if (isEditing) {
        await window.divadOS.objects.update(editingObject.id, {
          title: s.title.trim(),
          description: s.description.trim() || null,
          status: s.targetStatus,
          owner: s.owner || null,
          tags: s.tags,
          priority: s.priority,
          metadata: { ...s.metadata, repository: s.repository, linkedObjectIds: s.linkedObjectIds },
        })
      } else {
        await window.divadOS.objects.create({
          type: s.objectType as import('../../../shared/types').ObjectType,
          title: s.title.trim(),
          description: s.description.trim() || null,
          status: s.targetStatus,
          owner: s.owner || null,
          tags: s.tags,
          priority: s.priority,
          metadata: { ...s.metadata, repository: s.repository, linkedObjectIds: s.linkedObjectIds },
          parent_id: null,
        })
      }
      await loadObjects()
      upd({ creating: false, created: true })
      setTimeout(closeWizard, 1200)
    } catch (err: unknown) {
      upd({ creating: false, error: String(err) })
    }
  }

  const handleAIAssist = async (action: string) => {
    if (!window.divadOS) { upd({ aiResult: 'AI not available outside Electron.' }); return }
    upd({ aiLoading: true, aiResult: '' })
    try {
      const prompt = buildAIPrompt(action, s)
      const result = await window.divadOS.agent.send(prompt)
      upd({ aiLoading: false, aiResult: result?.message?.content ?? 'No response.' })
    } catch {
      upd({ aiLoading: false, aiResult: 'AI request failed.' })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div onClick={closeWizard} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />

      {/* Modal */}
      <div style={{ position: 'relative', width: s.aiAssistOpen ? 860 : 580, maxHeight: '90vh', display: 'flex', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

        {/* Main panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 12 }}>
            {s.objectType && <span style={{ fontSize: 22 }}>{cfg.icon}</span>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
                {isEditing ? `Edit ${cfg.label}` : s.objectType ? `New ${cfg.label}` : 'Create New Object'}
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                {isEditing ? `Editing v${editingObject.revision} — Step ${s.step} of 5 — ${STEP_LABELS[s.step - 1]}` : `Step ${s.step} of 5 — ${STEP_LABELS[s.step - 1]}`}
              </div>
            </div>
            <button onClick={() => upd({ aiAssistOpen: !s.aiAssistOpen })}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: s.aiAssistOpen ? '#7c3aed22' : '#1a1e28', border: `1px solid ${s.aiAssistOpen ? '#7c3aed' : '#222736'}`, borderRadius: 6, cursor: 'pointer', fontSize: 11, color: s.aiAssistOpen ? '#a78bfa' : '#94a3b8' }}>
              <Sparkles size={12} /> AI Assist
            </button>
            <button onClick={closeWizard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', padding: '10px 20px', gap: 0 }}>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const done = n < s.step
              const active = n === s.step
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', flex: n < 5 ? 1 : 'unset' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: done ? '#22c55e' : active ? cfg.color : '#1a1e28', color: done || active ? '#fff' : '#475569', border: `1px solid ${done ? '#22c55e' : active ? cfg.color : '#222736'}`, flexShrink: 0 }}>
                      {done ? <Check size={11} /> : n}
                    </div>
                    <span style={{ fontSize: 9, color: active ? '#e2e8f0' : done ? '#22c55e' : '#475569', fontWeight: active ? 600 : 400 }}>{label}</span>
                  </div>
                  {n < 5 && <div style={{ flex: 1, height: 1, background: done ? '#22c55e33' : '#1a1e28', margin: '0 6px' }} />}
                </div>
              )
            })}
          </div>

          {/* Step content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 12px' }}>
            {s.step === 1 && <Step1 s={s} upd={upd} />}
            {s.step === 2 && <Step2 s={s} upd={upd} />}
            {s.step === 3 && <Step3 s={s} upd={upd} />}
            {s.step === 4 && <Step4 s={s} upd={upd} onAI={handleAIAssist} />}
            {s.step === 5 && <Step5 s={s} upd={upd} isEditing={isEditing} />}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={back} disabled={s.step <= (isEditing ? 2 : 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'none', border: '1px solid #222736', borderRadius: 6, cursor: s.step <= (isEditing ? 2 : 1) ? 'not-allowed' : 'pointer', fontSize: 12, color: s.step <= (isEditing ? 2 : 1) ? '#2a3042' : '#94a3b8' }}>
              <ChevronLeft size={13} /> Back
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={closeWizard} style={{ padding: '7px 14px', background: 'none', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#475569' }}>Cancel</button>
              {s.step < 5
                ? <button onClick={next} disabled={!canNext} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', background: canNext ? cfg.color : '#1a1e28', border: 'none', borderRadius: 6, cursor: canNext ? 'pointer' : 'not-allowed', fontSize: 12, color: canNext ? '#fff' : '#475569', fontWeight: 600 }}>
                    Next <ChevronRight size={13} />
                  </button>
                : <button onClick={handleCreate} disabled={s.creating || s.created} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 20px', background: s.created ? '#22c55e' : '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 700 }}>
                    {s.creating
                      ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> {isEditing ? 'Saving...' : 'Creating...'}</>
                      : s.created
                        ? <><Check size={12} /> {isEditing ? 'Saved!' : 'Created!'}</>
                        : isEditing
                          ? <><Check size={12} /> Save Changes</>
                          : <><Plus size={12} /> Create {cfg.label}</>}
                  </button>}
            </div>
          </div>
        </div>

        {/* AI Assist panel */}
        {s.aiAssistOpen && <AIAssistPanel s={s} upd={upd} />}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Step 1: Choose Type ──────────────────────────────────────────────────────
function Step1({ s, upd }: { s: WizardState; upd: (p: Partial<WizardState>) => void }) {
  const types = Object.entries(TYPE_CONFIG)
  return (
    <div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>What would you like to create?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {types.map(([key, cfg]) => (
          <button key={key} onClick={() => upd({ objectType: key })}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: s.objectType === key ? cfg.color + '22' : '#0d0f14', border: `1px solid ${s.objectType === key ? cfg.color : '#1a1e28'}`, borderRadius: 7, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{cfg.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.objectType === key ? '#e2e8f0' : '#94a3b8' }}>{cfg.label}</div>
            </div>
            {s.objectType === key && <Check size={12} color={cfg.color} style={{ marginLeft: 'auto' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Describe ─────────────────────────────────────────────────────────
function Step2({ s, upd }: { s: WizardState; upd: (p: Partial<WizardState>) => void }) {
  const meta = (key: string, val: unknown) => upd({ metadata: { ...s.metadata, [key]: val } })
  const m = s.metadata as Record<string, string>
  const cfg = TYPE_CONFIG[s.objectType] ?? { color: '#3b82f6' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Core fields */}
      <Field label="Title *">
        <Input value={s.title} onChange={v => upd({ title: v })} placeholder={`${TYPE_CONFIG[s.objectType]?.label ?? 'Object'} title...`} />
      </Field>
      <Field label="Description — include everything you know">
        <textarea value={s.description} onChange={e => upd({ description: e.target.value })}
          placeholder="Paste everything you have: conversation logs, brainstorm notes, AI chat transcripts, meeting summaries, external agent outputs, field observations, or raw ideas. The more context you provide here, the better your AI assistant can structure, summarize, and connect this knowledge."
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.6 }} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Owner">
          <Input value={s.owner} onChange={v => upd({ owner: v })} />
        </Field>
        <Field label="Priority">
          <select value={s.priority} onChange={e => upd({ priority: e.target.value as WizardState['priority'] })} style={selectStyle}>
            {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </Field>
      </div>

      {/* Type-specific fields */}
      <div style={{ borderTop: '1px solid #1a1e2866', paddingTop: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{TYPE_CONFIG[s.objectType]?.label} Details</div>
        <TypeFields type={s.objectType} m={m} meta={meta} cfg={cfg} />
      </div>
    </div>
  )
}

function TypeFields({ type, m, meta }: { type: string; m: Record<string,string>; meta: (k:string,v:unknown)=>void; cfg: { color: string } }) {
  switch (type) {
    case 'document': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Field label="Document Type">
          <select value={m.docType ?? ''} onChange={e => meta('docType', e.target.value)} style={selectStyle}>
            <option value="">Select type...</option>
            {['PRD','SOP','Standard','Business Plan','Manual','Constitution','Whitepaper','Report','README','Architecture','Specification'].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Content (Markdown)">
          <textarea value={m.content ?? ''} onChange={e => meta('content', e.target.value)}
            placeholder="# Title&#10;&#10;Start writing..."
            style={{ ...inputStyle, minHeight: 120, fontFamily: 'monospace', fontSize: 11, resize: 'vertical' }} />
        </Field>
        <Field label="Version">
          <Input value={m.version ?? '1.0'} onChange={v => meta('version', v)} placeholder="1.0" />
        </Field>
      </div>
    )
    case 'architecture_phase': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="AP Number"><Input value={m.apNumber ?? ''} onChange={v => meta('apNumber', v)} placeholder="AP-001" /></Field>
          <Field label="Mission"><Input value={m.mission ?? ''} onChange={v => meta('mission', v)} placeholder="Phase mission..." /></Field>
        </div>
        <Field label="Definition of Done">
          <textarea value={m.definitionOfDone ?? ''} onChange={e => meta('definitionOfDone', e.target.value)}
            placeholder="What does completion look like?" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
        </Field>
        <Field label="AI Review">
          <Toggle checked={m.aiReview === 'true'} onChange={v => meta('aiReview', String(v))} label="Enable AI Review" />
        </Field>
      </div>
    )
    case 'apo': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="AP Reference"><Input value={m.apReference ?? ''} onChange={v => meta('apReference', v)} placeholder="AP-001" /></Field>
          <Field label="Objective Number"><Input value={m.apoNumber ?? ''} onChange={v => meta('apoNumber', v)} placeholder="APO-001" /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Assigned To"><Input value={m.assignedTo ?? 'David'} onChange={v => meta('assignedTo', v)} /></Field>
          <Field label="Estimated Duration"><Input value={m.estimatedDuration ?? ''} onChange={v => meta('estimatedDuration', v)} placeholder="5 days" /></Field>
        </div>
      </div>
    )
    case 'apt': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Parent APO"><Input value={m.apoReference ?? ''} onChange={v => meta('apoReference', v)} placeholder="APO-001" /></Field>
          <Field label="Estimated Hours"><Input value={m.hours ?? ''} onChange={v => meta('hours', v)} placeholder="8" type="number" /></Field>
        </div>
        <Field label="Definition of Complete">
          <textarea value={m.definitionOfComplete ?? ''} onChange={e => meta('definitionOfComplete', e.target.value)}
            placeholder="What does done look like?" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
        </Field>
      </div>
    )
    case 'decision': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Decision Number"><Input value={m.ddrNumber ?? ''} onChange={v => meta('ddrNumber', v)} placeholder="DDR-0001" /></Field>
          <Field label="Review Date"><Input value={m.reviewDate ?? ''} onChange={v => meta('reviewDate', v)} type="date" /></Field>
        </div>
        <Field label="Problem Statement">
          <textarea value={m.problem ?? ''} onChange={e => meta('problem', e.target.value)}
            placeholder="What problem are we solving?" style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} />
        </Field>
        <Field label="Decision">
          <textarea value={m.decision ?? ''} onChange={e => meta('decision', e.target.value)}
            placeholder="What was decided?" style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} />
        </Field>
        <Field label="Alternatives Considered">
          <textarea value={m.alternatives ?? ''} onChange={e => meta('alternatives', e.target.value)}
            placeholder="What else was considered?" style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} />
        </Field>
        <Field label="Consequences">
          <textarea value={m.consequences ?? ''} onChange={e => meta('consequences', e.target.value)}
            placeholder="What are the implications?" style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} />
        </Field>
      </div>
    )
    case 'meeting': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Date & Time"><Input value={m.date ?? ''} onChange={v => meta('date', v)} type="datetime-local" /></Field>
          <Field label="Attendees"><Input value={m.attendees ?? ''} onChange={v => meta('attendees', v)} placeholder="David, ..." /></Field>
        </div>
        <Field label="Agenda">
          <textarea value={m.agenda ?? ''} onChange={e => meta('agenda', e.target.value)}
            placeholder="Meeting agenda..." style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} />
        </Field>
        <Field label="Notes">
          <textarea value={m.notes ?? ''} onChange={e => meta('notes', e.target.value)}
            placeholder="Meeting notes..." style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} />
        </Field>
        <Field label="Action Items">
          <textarea value={m.actionItems ?? ''} onChange={e => meta('actionItems', e.target.value)}
            placeholder="- [ ] Action item..." style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} />
        </Field>
      </div>
    )
    case 'knowledge_object': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Knowledge Domain">
            <select value={m.domain ?? ''} onChange={e => meta('domain', e.target.value)} style={selectStyle}>
              <option value="">Select domain...</option>
              {['Automotive','Industrial','HVAC','Electrical','Robotics','General Engineering','Software','Mechanical','Systems'].map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Object Type">
            <select value={m.knowledgeType ?? ''} onChange={e => meta('knowledgeType', e.target.value)} style={selectStyle}>
              <option value="">Select type...</option>
              {['Concept','Fact','Rule','Process','Principle','Formula','Standard','Specification'].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Evidence Source">
            <select value={m.evidenceSource ?? ''} onChange={e => meta('evidenceSource', e.target.value)} style={selectStyle}>
              <option value="">Select source...</option>
              {['Service Manual','Repository','AI Generated','Imported','Manual Entry','Test Data','Field Observation'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Confidence (%)">
            <Input value={m.confidence ?? '80'} onChange={v => meta('confidence', v)} type="number" placeholder="80" />
          </Field>
        </div>
        <Field label="Engineering Notes">
          <textarea value={m.engineeringNotes ?? ''} onChange={e => meta('engineeringNotes', e.target.value)}
            placeholder="Technical notes, references, constraints..." style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
        </Field>
      </div>
    )
    case 'risk': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Severity">
            <select value={m.severity ?? ''} onChange={e => meta('severity', e.target.value)} style={selectStyle}>
              <option value="">Select...</option>
              {['Low','Medium','High','Critical'].map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Likelihood">
            <select value={m.likelihood ?? ''} onChange={e => meta('likelihood', e.target.value)} style={selectStyle}>
              <option value="">Select...</option>
              {['Rare','Unlikely','Possible','Likely','Certain'].map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={m.riskStatus ?? 'open'} onChange={e => meta('riskStatus', e.target.value)} style={selectStyle}>
              {['open','mitigated','accepted','closed'].map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Mitigation Plan">
          <textarea value={m.mitigation ?? ''} onChange={e => meta('mitigation', e.target.value)}
            placeholder="How will this risk be mitigated?" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
        </Field>
      </div>
    )
    case 'requirement': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Requirement Type">
            <select value={m.reqType ?? ''} onChange={e => meta('reqType', e.target.value)} style={selectStyle}>
              <option value="">Select...</option>
              {['Functional','Non-Functional','Performance','Safety','Regulatory','Interface'].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Requirement ID"><Input value={m.reqId ?? ''} onChange={v => meta('reqId', v)} placeholder="REQ-001" /></Field>
        </div>
        <Field label="Acceptance Criteria">
          <textarea value={m.acceptanceCriteria ?? ''} onChange={e => meta('acceptanceCriteria', e.target.value)}
            placeholder="How will this requirement be verified?" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
        </Field>
      </div>
    )
    default: return (
      <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic', padding: '4px 0' }}>
        No additional fields for this object type.
      </div>
    )
  }
}

// ─── Step 3: Connect ──────────────────────────────────────────────────────────
function Step3({ s, upd }: { s: WizardState; upd: (p: Partial<WizardState>) => void }) {
  const { objects } = useStore()
  const [search, setSearch] = useState('')

  const filteredObjs = search.trim()
    ? objects.filter(o => o.title.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : []

  const linkObj = (id: string) => {
    if (!s.linkedObjectIds.includes(id)) {
      upd({ linkedObjectIds: [...s.linkedObjectIds, id] })
    }
  }
  const unlinkObj = (id: string) => upd({ linkedObjectIds: s.linkedObjectIds.filter(x => x !== id) })
  const addTag = () => {
    const t = s.tagInput.trim().toLowerCase()
    if (t && !s.tags.includes(t)) { upd({ tags: [...s.tags, t], tagInput: '' }) }
  }
  const removeTag = (t: string) => upd({ tags: s.tags.filter(x => x !== t) })

  const linkedObjs = objects.filter(o => s.linkedObjectIds.includes(o.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field label="Repository">
        <select value={s.repository} onChange={e => upd({ repository: e.target.value })} style={selectStyle}>
          {['Divad Canon','Engineering Library','Project Archive','Standards Vault'].map(r => <option key={r}>{r}</option>)}
        </select>
      </Field>

      <Field label="Tags">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
          {s.tags.map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 12, fontSize: 10, color: '#94a3b8' }}>
              #{t}
              <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Input value={s.tagInput} onChange={v => upd({ tagInput: v })} placeholder="Add tag..."
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
          <button onClick={addTag} style={{ padding: '6px 12px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 5, cursor: 'pointer', color: '#94a3b8', fontSize: 11 }}>
            <Plus size={12} />
          </button>
        </div>
      </Field>

      <Field label="Link Existing Objects">
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Input value={search} onChange={setSearch} placeholder="Search objects to link..." />
          {filteredObjs.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#13161e', border: '1px solid #1a1e28', borderRadius: 6, zIndex: 10, maxHeight: 160, overflowY: 'auto' }}>
              {filteredObjs.map(o => (
                <button key={o.id} onClick={() => { linkObj(o.id); setSearch('') }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #1a1e2844' }}>
                  <span style={{ fontSize: 14 }}>{TYPE_CONFIG[o.type]?.icon ?? '📄'}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#e2e8f0' }}>{o.title}</div>
                    <div style={{ fontSize: 9, color: '#475569' }}>{o.type}</div>
                  </div>
                  <Link2 size={10} color="#475569" style={{ marginLeft: 'auto' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        {linkedObjs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {linkedObjs.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 5 }}>
                <span style={{ fontSize: 14 }}>{TYPE_CONFIG[o.type]?.icon ?? '📄'}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{o.title}</span>
                <button onClick={() => unlinkObj(o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 14, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
        {linkedObjs.length === 0 && !search && (
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', padding: '4px 0' }}>No linked objects — search above to link.</div>
        )}
      </Field>
    </div>
  )
}

// ─── Step 4: Validate ─────────────────────────────────────────────────────────
function Step4({ s, upd, onAI }: { s: WizardState; upd: (p: Partial<WizardState>) => void; onAI: (action: string) => void }) {
  const cfg = TYPE_CONFIG[s.objectType] ?? { color: '#3b82f6', label: 'Object' }
  const issues: string[] = []
  if (!s.description.trim()) issues.push('No description provided')
  if (s.tags.length === 0) issues.push('No tags — objects without tags are harder to find')
  if (s.linkedObjectIds.length === 0) issues.push('No linked objects — consider connecting related items')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '12px 14px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Object Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
          <KV k="Type" v={`${cfg.icon} ${cfg.label}`} />
          <KV k="Title" v={s.title || '—'} />
          <KV k="Owner" v={s.owner || '—'} />
          <KV k="Priority" v={s.priority} />
          <KV k="Repository" v={s.repository} />
          <KV k="Tags" v={s.tags.length > 0 ? s.tags.join(', ') : '—'} />
          <KV k="Linked Objects" v={String(s.linkedObjectIds.length)} />
        </div>
      </div>

      {issues.length > 0 && (
        <div style={{ padding: '10px 14px', background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>⚠️ Validation Warnings</div>
          {issues.map(i => <div key={i} style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>• {i}</div>)}
        </div>
      )}

      {issues.length === 0 && (
        <div style={{ padding: '10px 14px', background: '#22c55e11', border: '1px solid #22c55e33', borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#22c55e' }}>✓ Object looks good — ready to create</div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>AI Validation</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {['Complete Metadata','Suggest Relationships','Improve Description','Generate Tags','Review Structure','Find Similar Objects'].map(action => (
            <button key={action} onClick={() => onAI(action)} disabled={s.aiLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 6, cursor: 'pointer', fontSize: 10, color: '#94a3b8' }}>
              <Sparkles size={10} color="#7c3aed" /> {action}
            </button>
          ))}
        </div>
        {s.aiLoading && <div style={{ fontSize: 10, color: '#7c3aed', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> AI is reviewing...</div>}
        {s.aiResult && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#7c3aed11', border: '1px solid #7c3aed33', borderRadius: 6, fontSize: 10, color: '#c4b5fd', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {s.aiResult}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 5: Create / Save ────────────────────────────────────────────────────
function Step5({ s, upd, isEditing }: { s: WizardState; upd: (p: Partial<WizardState>) => void; isEditing?: boolean }) {
  const { lastSyncAt, githubConfig, isOffline, setActivePage, closeWizard } = useStore()
  const syncLocked = githubConfig && !isSyncCurrent(lastSyncAt)
  const cfg = TYPE_CONFIG[s.objectType] ?? { icon: '📄', label: 'Object', color: '#3b82f6' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!isEditing && isOffline && (
        <div style={{ padding: '12px 14px', background: '#ef444411', border: '2px solid #ef444444', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', marginBottom: 4 }}>🔴 Offline — Creation Locked</div>
          <div style={{ fontSize: 11, color: '#fca5a5', lineHeight: 1.6 }}>You are not connected to GitHub. You can view existing objects but cannot create new ones until you reconnect and sync.</div>
        </div>
      )}
      {!isEditing && syncLocked && !isOffline && (
        <div style={{ padding: '12px 14px', background: '#f59e0b11', border: '2px solid #f59e0b44', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>⚠️ Sync Required — Creation Locked</div>
          <div style={{ fontSize: 11, color: '#fbbf24', lineHeight: 1.6, marginBottom: 8 }}>Your last sync was more than 24 hours ago. You must sync with the repository before creating new objects.</div>
          <button onClick={() => { closeWizard(); setActivePage('repository') }}
            style={{ padding: '6px 14px', background: '#f59e0b', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, color: '#000', fontWeight: 700 }}>
            Go to Repository → Sync Now
          </button>
        </div>
      )}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{isEditing ? 'Update Status' : 'Choose Initial Status'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {([
            ['draft',     '🟡 Draft',              'Visible only to you. Can be edited freely. No approval required.'],
            ['in_review', '🔵 Submit for Review',   'Notifies team. Moves to approval queue. Cannot be edited until reviewed.'],
            ['published', '🟢 Publish Immediately', 'Available to all. Marks as approved. Use for urgent or pre-approved items.'],
          ] as [WizardState['targetStatus'], string, string][]).map(([val, label, desc]) => (
            <button key={val} onClick={() => upd({ targetStatus: val })}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: s.targetStatus === val ? cfg.color + '18' : '#0d0f14', border: `1px solid ${s.targetStatus === val ? cfg.color : '#1a1e28'}`, borderRadius: 7, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>{desc}</div>
              </div>
              {s.targetStatus === val && <Check size={14} color={cfg.color} style={{ marginTop: 2, flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 14px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{isEditing ? 'Edit Summary' : 'Creation Summary'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10 }}>
          <KV k="Type" v={`${cfg.icon} ${cfg.label}`} />
          <KV k="Status" v={s.targetStatus.replace('_', ' ')} />
          <KV k="Tags" v={String(s.tags.length)} />
          <KV k="Linked Objects" v={String(s.linkedObjectIds.length)} />
        </div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #1a1e28', fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>"{s.title}"</div>
      </div>

      {s.error && (
        <div style={{ padding: '10px 12px', background: '#ef444411', border: '1px solid #ef444433', borderRadius: 6, fontSize: 10, color: '#fca5a5' }}>
          ⚠️ {s.error}
        </div>
      )}
    </div>
  )
}

// ─── AI Assist Panel ──────────────────────────────────────────────────────────
interface ChatMessage { role: 'user' | 'assistant'; content: string }

const QUICK_CHIPS = ['Generate Draft', 'Improve Description', 'Generate Tags', 'Suggest Relationships', 'Complete Metadata', 'Review Structure']

function AIAssistPanel({ s, upd }: { s: WizardState; upd: (p: Partial<WizardState>) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const buildContext = () => {
    const cfg = TYPE_CONFIG[s.objectType]
    return [
      `You are an AI assistant helping an engineer create a new ${cfg?.label ?? s.objectType} object in Divad OS, an Engineering Knowledge Engine.`,
      `Current object context:`,
      `- Type: ${cfg?.label ?? s.objectType}`,
      `- Title: "${s.title || '(untitled)'}"`,
      `- Description: "${s.description || '(none)'}"`,
      `- Tags: [${s.tags.join(', ') || 'none'}]`,
      `- Owner: ${s.owner || 'unset'}`,
      `- Priority: ${s.priority}`,
      `- Repository: ${s.repository}`,
      `- Linked objects: ${s.linkedObjectIds.length}`,
      ``,
      `Be concise and practical. Respond in plain text unless lists or structure genuinely help.`,
    ].join('\n')
  }

  const send = async (text: string) => {
    const userMsg = text.trim()
    if (!userMsg || loading) return
    setInput('')
    const next: ChatMessage[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(next)
    setLoading(true)

    try {
      if (!window.divadOS) throw new Error('Electron bridge not available')
      const systemCtx = buildContext()
      const history = next.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')
      const fullPrompt = `${systemCtx}\n\nConversation so far:\n${history}\n\nAssistant:`
      const result = await window.divadOS.agent.send(fullPrompt)
      const reply = result?.message?.content ?? 'No response received.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${String(err)}` }])
    } finally {
      setLoading(false)
    }
  }

  const sendChip = (chip: string) => {
    const prompts: Record<string, string> = {
      'Generate Draft':        `Generate a draft description for this ${s.objectType}.`,
      'Improve Description':   `Improve my current description: "${s.description || '(empty)'}"`,
      'Generate Tags':         `Suggest 6-8 relevant tags for this object. Return as comma-separated lowercase words.`,
      'Suggest Relationships': `What types of existing objects should this ${s.objectType} be linked to, and why?`,
      'Complete Metadata':     `What metadata fields am I missing or should fill in for this ${s.objectType}?`,
      'Review Structure':      `Review my current object and identify any structural issues or missing fields.`,
    }
    send(prompts[chip] ?? chip)
  }

  const clearChat = () => setMessages([])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div style={{ width: 280, borderLeft: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', background: '#0a0c12' }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={14} color="#a78bfa" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>AI Assist</span>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} title="Clear chat"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic', textAlign: 'center', paddingTop: 8 }}>
            Ask anything or use a quick action below
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '90%', padding: '8px 11px', borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
              background: m.role === 'user' ? '#3b82f622' : '#1a1e28',
              border: `1px solid ${m.role === 'user' ? '#3b82f644' : '#222736'}`,
              fontSize: 11, color: m.role === 'user' ? '#93c5fd' : '#c4b5fd',
              lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {m.content}
            </div>
            <div style={{ fontSize: 9, color: '#2a3042', marginTop: 3, paddingLeft: 2, paddingRight: 2 }}>
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ padding: '8px 11px', background: '#1a1e28', border: '1px solid #222736', borderRadius: '10px 10px 10px 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Loader2 size={10} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 11, color: '#7c3aed' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #1a1e2866', display: 'flex', flexWrap: 'wrap', gap: 5, flexShrink: 0 }}>
        {QUICK_CHIPS.map(chip => (
          <button key={chip} onClick={() => sendChip(chip)} disabled={loading}
            style={{ padding: '4px 9px', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 10, color: '#7c3aed', whiteSpace: 'nowrap' }}>
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px 12px', borderTop: '1px solid #1a1e28', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end', background: '#13161e', border: '1px solid #222736', borderRadius: 8, padding: '6px 8px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask the AI anything... (Enter to send)"
            rows={2}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: 11, color: '#e2e8f0', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto' }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading}
            style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 6, background: input.trim() && !loading ? '#7c3aed' : '#1a1e28', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={12} color={input.trim() && !loading ? '#fff' : '#2a3042'} />
          </button>
        </div>
        <div style={{ fontSize: 9, color: '#2a3042', marginTop: 4, textAlign: 'right' }}>Shift+Enter for new line</div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', onKeyDown, style: extra }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void; style?: React.CSSProperties
}) {
  return (
    <input type={type} value={value} placeholder={placeholder} onKeyDown={onKeyDown}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, ...extra }} />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
      <div onClick={() => onChange(!checked)}
        style={{ width: 32, height: 18, borderRadius: 9, background: checked ? '#3b82f6' : '#1a1e28', border: `1px solid ${checked ? '#3b82f6' : '#222736'}`, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 14 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
    </div>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{v}</div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '6px 10px',
  background: '#0d0f14', border: '1px solid #222736', borderRadius: 5,
  color: '#e2e8f0', fontSize: 11, outline: 'none',
}
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px',
  background: '#0d0f14', border: '1px solid #222736', borderRadius: 5,
  color: '#e2e8f0', fontSize: 11, outline: 'none', cursor: 'pointer',
}

function buildAIPrompt(action: string, s: WizardState): string {
  const ctx = `Object Type: ${s.objectType}, Title: "${s.title}", Description: "${s.description}", Tags: [${s.tags.join(', ')}]`
  const prompts: Record<string, string> = {
    'Generate Draft':          `Generate a draft description for a ${s.objectType} titled "${s.title}". Keep it concise and professional.`,
    'Complete Metadata':       `Given this engineering object: ${ctx}. Suggest additional metadata fields and values that would make this more complete.`,
    'Suggest Relationships':   `For a ${s.objectType} titled "${s.title}", suggest what types of objects it should be linked to and why.`,
    'Find Similar Objects':    `What types of existing objects in an engineering knowledge base might be similar to a ${s.objectType} titled "${s.title}"?`,
    'Improve Description':     `Improve this description for a ${s.objectType}: "${s.description}". Make it clearer and more useful for engineers.`,
    'Generate Tags':           `Generate 5-8 relevant tags for a ${s.objectType} titled "${s.title}". Return them as comma-separated lowercase words.`,
    'Review Structure':        `Review this ${s.objectType} object: ${ctx}. Identify any structural issues or missing required fields.`,
    'Search Existing Objects': `Describe what existing objects I should search for before creating a new ${s.objectType} titled "${s.title}" to avoid duplicates.`,
  }
  return prompts[action] ?? `Help me with: ${action}. Context: ${ctx}`
}
