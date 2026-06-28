import { Eye, Edit2, Tag, Clock, User, Hash, FileText } from 'lucide-react'
import { useStore } from '../../store'
import type { EKEObject } from '../../../shared/types'
import { TYPE_CONFIG } from '../wizard/CreationWizard'

const STATUS_COLORS: Record<string, string> = {
  draft: '#f59e0b', in_review: '#3b82f6', approved: '#22c55e',
  published: '#4ade80', revised: '#a855f7', archived: '#475569',
}

interface Props { obj: EKEObject | null }

export default function RepoRightPanel({ obj }: Props) {
  const { openObject, openWizardEdit } = useStore()

  if (!obj) {
    return (
      <div style={{ width: 230, display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Preview</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#2a3042', padding: 16 }}>
          <FileText size={28} />
          <div style={{ fontSize: 11, textAlign: 'center' }}>Select an object to preview it here</div>
        </div>
      </div>
    )
  }

  const cfg = TYPE_CONFIG[obj.type]
  const statusColor = STATUS_COLORS[obj.status] ?? '#475569'

  return (
    <div style={{ width: 230, display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Preview</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Object header */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #1a1e28' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>{cfg?.icon ?? '📄'}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 6 }}>{obj.title}</div>
          {obj.short_name && (
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>{obj.short_name}</div>
          )}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: (cfg?.color ?? '#3b82f6') + '22', color: cfg?.color ?? '#3b82f6', fontWeight: 600 }}>
              {cfg?.label ?? obj.type}
            </span>
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: statusColor + '22', color: statusColor, fontWeight: 600 }}>
              {obj.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Meta rows */}
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid #1a1e28' }}>
          {obj.engineering_id && (
            <MetaRow icon={<Hash size={10} />} label="Engineering ID">
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#a78bfa' }}>{obj.engineering_id}</span>
            </MetaRow>
          )}
          <MetaRow icon={<Hash size={10} />} label="Permanent ID">
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#2a3042' }}>{obj.id}</span>
          </MetaRow>
          <MetaRow icon={<User size={10} />} label="Owner">
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{obj.owner ?? '—'}</span>
          </MetaRow>
          <MetaRow icon={<Clock size={10} />} label="Modified">
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              {new Date(obj.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </MetaRow>
          <MetaRow icon={<Clock size={10} />} label="Revision">
            <span style={{ fontSize: 10, color: '#94a3b8' }}>v{obj.revision}</span>
          </MetaRow>
          {obj.priority && (
            <MetaRow icon={<span style={{ width: 8, height: 8, borderRadius: '50%', background: { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }[obj.priority] ?? '#475569', display: 'inline-block', flexShrink: 0 }} />} label="Priority">
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{obj.priority}</span>
            </MetaRow>
          )}
        </div>

        {/* Description snippet */}
        {obj.description && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Context</div>
            <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as const }}>
              {obj.description}
            </p>
          </div>
        )}

        {/* Body snippet */}
        {obj.body && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Body</div>
            <pre style={{ fontSize: 10, color: '#475569', lineHeight: 1.5, margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflow: 'hidden', maxHeight: 80 }}>
              {obj.body.slice(0, 200)}{obj.body.length > 200 ? '…' : ''}
            </pre>
          </div>
        )}

        {/* Tags */}
        {obj.tags.length > 0 && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <Tag size={10} color="#2a3042" />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {obj.tags.map(t => (
                <span key={t} style={{ fontSize: 9, padding: '2px 7px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 10, color: '#475569' }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #1a1e28', display: 'flex', gap: 6 }}>
        <button onClick={() => openObject(obj)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
          <Eye size={12} /> Open
        </button>
        <button onClick={() => openWizardEdit(obj)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', background: '#3b82f622', border: '1px solid #3b82f644', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#3b82f6', fontWeight: 500 }}>
          <Edit2 size={12} /> Edit
        </button>
      </div>
    </div>
  )
}

function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <span style={{ color: '#475569', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: 9, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ paddingLeft: 14 }}>{children}</div>
    </div>
  )
}
