import { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle, ShieldAlert, BookOpen } from 'lucide-react'

// ─── Shared styles (must be declared before PAGES uses them) ──────────────────
const bodyText: React.CSSProperties = {
  fontSize: 12, color: '#64748b', lineHeight: 1.8, margin: 0,
}
const sectionLabel: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em',
}

const STORAGE_KEY = 'divad-os-guide-accepted'

export function hasAcceptedGuide(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch { return false }
}

function markAccepted(name: string) {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
    localStorage.setItem('divad-os-guide-signer', name)
    localStorage.setItem('divad-os-guide-date', new Date().toISOString())
  } catch {}
}

// ─── Page definitions ─────────────────────────────────────────────────────────
const PAGES = [
  {
    id: 'welcome',
    title: 'Welcome to Divad OS',
    subtitle: 'Engineering Knowledge Engine Operating System · Version 0.1',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={bodyText}>
          Divad OS is the operational interface for the <strong style={{ color: '#e2e8f0' }}>Engineering Knowledge Engine (EKE)</strong>, developed by Divad Technology Group. Rather than managing files alone, it manages engineering knowledge through a Universal Object Model — allowing every document, task, decision, architecture phase, and engineering artifact to become connected, searchable, versioned, and traceable.
        </p>
        <p style={bodyText}>
          Every page within Divad OS has a single responsibility, but all pages operate on the same underlying knowledge base.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 8 }}>
          {[
            ['🏛️', 'Architecture', 'Design and track Engineering Phases, Objectives, and Decisions'],
            ['🧠', 'Knowledge', 'Explore connected engineering knowledge through the Knowledge Graph'],
            ['📦', 'Objects', 'Every artifact in the system is a versioned, traceable Object'],
            ['🗂️', 'Repository', 'Store and version every document and engineering artifact'],
            ['📊', 'Operations', 'Your daily command center — mission, priorities, and AI briefing'],
            ['💼', 'Workspace', 'Your personal productivity and task management center'],
          ].map(([icon, title, desc]) => (
            <div key={String(title)} style={{ padding: '12px 14px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 8 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'navigation',
    title: 'Navigation & Pages',
    subtitle: 'Understanding every section of the system',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          ['📊', 'Operations', 'The command center. Open this first each day. Review today\'s mission, current Architecture Phase, AI recommendations, repository health, pending approvals, and today\'s priorities.'],
          ['🏛️', 'Architecture', 'Design the Engineering Knowledge Engine. Create Architecture Phases (AP), Missions (APM), Objectives (APO), Tasks (APT), Decision Records (DDR), Technical Specifications, and Roadmaps.'],
          ['🗂️', 'Repository', 'Manage every document stored by Divad OS. Browse, upload, version, and publish engineering artifacts. The Repository stores artifacts; the EKE stores knowledge.'],
          ['🧠', 'Knowledge', 'Explore engineering knowledge. Browse the Knowledge Graph, search concepts, explore domains, validate information, and review confidence scores.'],
          ['📦', 'Objects', 'Everything inside Divad OS is an Object — documents, tasks, decisions, standards, products, wiring diagrams, meetings, and more. Objects are the foundation.'],
          ['💼', 'Workspace', 'Your personal engineering workspace. View assigned tasks, open recent documents, pin important objects, and organize daily work.'],
          ['📈', 'Reports', 'Analyze engineering progress. Generate Progress, Architecture, Repository, AI, Knowledge, and Compliance reports. Export as PDF, Excel, Markdown, or JSON.'],
          ['📅', 'Calendar', 'Schedule engineering work. Schedule meetings, architecture reviews, milestones, and document reviews.'],
          ['⚙️', 'Settings', 'Customize Divad OS — appearance, notifications, AI behavior, security, integrations, and workspace defaults.'],
        ].map(([icon, title, desc]) => (
          <div key={String(title)} style={{ display: 'flex', gap: 14, padding: '12px 14px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 8 }}>
            <span style={{ fontSize: 20, flexShrink: 0, paddingTop: 2 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'objects',
    title: 'Objects & the Universal Object Model',
    subtitle: 'The core building block of everything in Divad OS',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={bodyText}>
          Everything in Divad OS is represented as an <strong style={{ color: '#e2e8f0' }}>Object</strong>. Every object contains the same core fields: ID, Type, Title, Description, Status, Version, Owner, Relationships, History, Tags, Attachments, AI Summary, Confidence, and Permissions.
        </p>
        <div>
          <div style={sectionLabel}>Object Lifecycle</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', marginTop: 8 }}>
            {['Draft', 'Review', 'Approved', 'Published', 'Revised', 'Archived'].map((s, i, arr) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ padding: '6px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{s}</div>
                {i < arr.length - 1 && <div style={{ width: 24, height: 1, background: '#3b82f633', position: 'relative' }}><span style={{ position: 'absolute', top: -7, left: 7, color: '#3b82f6', fontSize: 12 }}>→</span></div>}
              </div>
            ))}
          </div>
          <p style={{ ...bodyText, marginTop: 10, fontSize: 10, color: '#475569' }}>Nothing is ever overwritten. Every revision becomes part of the permanent engineering record.</p>
        </div>
        <div>
          <div style={sectionLabel}>Creating a New Object</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {['Select Objects or click Create in the top bar', 'Choose an Object Type from the list', 'Enter a title and description', 'Select an owner and set a priority', 'Add tags for discoverability', 'Link related objects to build relationships', 'Click Create — the object is created in Draft status'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#3b82f622', border: '1px solid #3b82f644', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#3b82f6', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, paddingTop: 2 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={sectionLabel}>Object Types</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {['Document','Architecture Phase','Task','Requirement','Research','Meeting','Decision','Knowledge Object','Standard','Procedure','Risk','Issue','Product','Module','Component','Wire','Connector','Terminal','Journal','Question','Lesson Learned','Custom Object'].map(t => (
              <span key={t} style={{ padding: '3px 10px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 12, fontSize: 10, color: '#64748b' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'workflows',
    title: 'Workflows, AI & Daily Operations',
    subtitle: 'How to work effectively inside Divad OS',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={sectionLabel}>Daily Workflow</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {[
              'Open Operations — read the Mission Brief',
              'Review AI recommendations and daily priorities',
              'Complete your Most Important Task (MIT)',
              'Create or revise engineering objects',
              'Approve pending work in the review queue',
              'Record architecture decisions (DDR)',
              'Update documentation in the Repository',
              'Complete an After Action Review (AAR) if required',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#22c55e22', border: '1px solid #22c55e44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', paddingTop: 1 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={sectionLabel}>AI Assistant</div>
          <p style={bodyText}>The AI Assistant acts as your engineering partner. It can answer questions, create objects, draft documents, generate specifications, review architecture, identify missing relationships, summarize revisions, and suggest improvements.</p>
          <div style={{ padding: '12px 14px', background: '#7c3aed11', border: '1px solid #7c3aed33', borderRadius: 8, marginTop: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>Example prompts:</div>
            {['"Create an Architecture Phase."', '"Generate a new PRD."', '"Find every object related to the Universal Object Model."', '"Show documents waiting for approval."', '"Summarize today\'s work."'].map(p => (
              <div key={p} style={{ fontSize: 11, color: '#7c3aed', marginBottom: 4, fontStyle: 'italic' }}>{p}</div>
            ))}
          </div>
          <p style={{ ...bodyText, marginTop: 10, fontSize: 10, color: '#475569' }}>The AI assists engineering decisions but does not replace engineering judgment.</p>
        </div>
        <div>
          <div style={sectionLabel}>Keyboard Shortcuts</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            {[['Ctrl+K','Universal Search'],['Ctrl+N','Create Object'],['Ctrl+D','New Document'],['Ctrl+Shift+A','Architecture'],['Ctrl+Shift+O','Operations'],['Ctrl+Shift+R','Repository'],['Ctrl+Shift+K','Knowledge'],['Ctrl+,','Settings']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 5 }}>
                <span style={{ fontSize: 10, color: '#64748b' }}>{v}</span>
                <kbd style={{ fontSize: 9, padding: '2px 6px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 4, color: '#94a3b8', fontFamily: 'monospace' }}>{k}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'philosophy',
    title: 'Engineering Philosophy',
    subtitle: 'The principles behind Divad OS',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Everything is an Object', 'Every artifact, decision, document, task, standard, product, and idea is represented as a structured Object in the Engineering Knowledge Engine.'],
            ['Nothing is ever lost', 'No object is ever deleted. Everything is archived, versioned, and permanently available in the engineering record.'],
            ['Every revision is preserved', 'When you revise an object, the previous version remains. History is immutable. The engineering record grows but never shrinks.'],
            ['Relationships create understanding', 'Objects linked together form context. A requirement linked to a decision, linked to an architecture phase, linked to a specification — creates traceable engineering logic.'],
            ['Knowledge is more valuable than files', 'A file is a container. An Object in the EKE is knowledge — typed, versioned, owned, related, and retrievable by AI and humans alike.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 16px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f622', border: '1px solid #3b82f644', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#3b82f6', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 20px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, textAlign: 'center', marginTop: 4 }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>▲</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>Divad Technology Group</div>
          <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>"Discipline. Knowledge. Execution. Results."</div>
        </div>
      </div>
    ),
  },
  {
    id: 'accept',
    title: 'Acknowledgement & Access Authorization',
    subtitle: 'You must read and sign this page before entering Divad OS',
    content: null, // rendered separately in the final step
  },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserGuide({ onAccepted }: { onAccepted: () => void }) {
  const [page, setPage] = useState(0)
  const [signature, setSignature] = useState('')
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const totalPages = PAGES.length
  const current = PAGES[page]
  const isFinal = page === totalPages - 1
  const isFirst = page === 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const handleAccept = () => {
    const trimmed = signature.trim()
    if (!trimmed) { setError('You must type your full name to acknowledge and proceed.'); return }
    markAccepted(trimmed)
    onAccepted()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#080a0f', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#e2e8f0' }}>

      {/* Top bar */}
      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid #1a1e28', flexShrink: 0, background: '#0d0f14' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 11 }}>▲</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>DIVAD OS</div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>User Guide & Access Authorization</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BookOpen size={12} color="#475569" />
          <span style={{ fontSize: 11, color: '#475569' }}>Page {page + 1} of {totalPages}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#1a1e28', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', width: `${((page + 1) / totalPages) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left nav */}
        <div style={{ width: 220, borderRight: '1px solid #1a1e28', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {PAGES.map((p, i) => {
            const done = i < page
            const active = i === page
            return (
              <button key={p.id} onClick={() => i <= page && setPage(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: active ? 'rgba(59,130,246,0.08)' : 'none', border: 'none', borderRight: `2px solid ${active ? '#3b82f6' : 'transparent'}`, cursor: i <= page ? 'pointer' : 'not-allowed', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? '#22c55e22' : active ? 'rgba(59,130,246,0.15)' : '#1a1e28', border: `1px solid ${done ? '#22c55e55' : active ? 'rgba(59,130,246,0.4)' : '#222736'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done ? <CheckCircle size={10} color="#22c55e" /> : <span style={{ fontSize: 9, color: active ? '#3b82f6' : '#2a3042', fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 11, color: active ? '#e2e8f0' : done ? '#22c55e' : '#2a3042', fontWeight: active ? 600 : 400, lineHeight: 1.3 }}>{p.title}</span>
              </button>
            )
          })}
        </div>

        {/* Main content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '36px 48px 40px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.2 }}>{current.title}</div>
              <div style={{ fontSize: 13, color: '#475569' }}>{current.subtitle}</div>
            </div>

            {!isFinal && current.content}

            {isFinal && <FinalPage signature={signature} setSignature={setSignature} error={error} setError={setError} />}
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderTop: '1px solid #1a1e28', flexShrink: 0, background: '#0d0f14' }}>
        <button onClick={() => setPage(p => p - 1)} disabled={isFirst}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'none', border: '1px solid #222736', borderRadius: 7, cursor: isFirst ? 'not-allowed' : 'pointer', fontSize: 12, color: isFirst ? '#1a1e28' : '#94a3b8' }}>
          <ChevronLeft size={14} /> Previous
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          {PAGES.map((_, i) => (
            <div key={i} style={{ width: i === page ? 20 : 6, height: 6, borderRadius: 3, background: i < page ? '#22c55e' : i === page ? '#3b82f6' : '#1a1e28', transition: 'all 0.2s' }} />
          ))}
        </div>

        {!isFinal
          ? <button onClick={() => setPage(p => p + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 20px', background: '#3b82f6', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              Next <ChevronRight size={14} />
            </button>
          : <button onClick={handleAccept} disabled={!signature.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 24px', background: signature.trim() ? '#22c55e' : '#1a1e28', border: `1px solid ${signature.trim() ? '#22c55e' : '#222736'}`, borderRadius: 7, cursor: signature.trim() ? 'pointer' : 'not-allowed', fontSize: 12, color: signature.trim() ? '#fff' : '#2a3042', fontWeight: 700, transition: 'all 0.2s' }}>
              <CheckCircle size={14} /> I Acknowledge & Accept
            </button>
        }
      </div>
    </div>
  )
}

// ─── Final page ───────────────────────────────────────────────────────────────
function FinalPage({ signature, setSignature, error, setError }: {
  signature: string; setSignature: (v: string) => void
  error: string; setError: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Classified notice */}
      <div style={{ padding: '20px 22px', background: 'rgba(239,68,68,0.07)', border: '2px solid rgba(239,68,68,0.35)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <ShieldAlert size={20} color="#ef4444" />
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Internally Classified — Access Notice</div>
        </div>
        <p style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.8, marginBottom: 12 }}>
          By accessing Divad OS, you are being granted access to the root of Divad Technology Group and all information contained within it. This includes engineering records, architecture decisions, internal documents, trade secrets, business plans, product specifications, and all proprietary knowledge.
        </p>
        <p style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.8, marginBottom: 12 }}>
          All information within this system is <strong>internally classified</strong>. It may only be shared with other employees or authorized personnel of Divad Technology Group. Sharing, copying, distributing, or disclosing any content to external parties without explicit written authorization is strictly prohibited.
        </p>
        <p style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.8, fontWeight: 700 }}>
          You are responsible for protecting this information at all times.
        </p>
      </div>

      {/* Acknowledgement statements */}
      <div style={{ padding: '18px 22px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 14 }}>By signing below, you confirm that you have:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Read and understood the Divad OS User Guide in its entirety.',
            'Understood the purpose, structure, and workflows of the Engineering Knowledge Engine.',
            'Understood that all information within this system is internally classified.',
            'Agreed not to share, copy, or disclose any content to unauthorized parties.',
            'Accepted responsibility for the security and integrity of the information you access.',
            'Understood that your access and activity within this system may be logged and reviewed.',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <CheckCircle size={14} color="#22c55e" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signature box */}
      <div style={{ padding: '18px 22px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Digital Signature</div>
        <div style={{ fontSize: 10, color: '#475569', marginBottom: 14, lineHeight: 1.6 }}>
          Type your full legal name below to confirm you have carefully and thoughtfully read this guide, understand your responsibilities, and agree to the terms above. You will not be permitted to proceed until this is complete.
        </div>
        <div style={{ position: 'relative' }}>
          <input
            value={signature}
            onChange={e => { setSignature(e.target.value); setError('') }}
            placeholder="Type your full name here..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: '#080a0f', border: `1px solid ${error ? '#ef4444' : signature.trim() ? '#22c55e55' : '#222736'}`, borderRadius: 7, fontSize: 14, color: '#e2e8f0', fontFamily: 'Georgia, serif', fontStyle: signature ? 'italic' : 'normal', outline: 'none', letterSpacing: '0.02em' }}
          />
          {signature.trim() && (
            <CheckCircle size={16} color="#22c55e" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
          )}
        </div>
        {error && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 8 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ fontSize: 10, color: '#2a3042' }}>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div style={{ fontSize: 10, color: '#2a3042' }}>Divad Technology Group — Engineering OS v0.1</div>
        </div>
      </div>

    </div>
  )
}

