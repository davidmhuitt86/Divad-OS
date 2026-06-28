import { X, ExternalLink, GitBranch } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

interface Props {
  object: EKEObject | null
  onClose: () => void
  onOpenInWorkspace?: () => void
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft:      { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
  in_review:  { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  approved:   { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e' },
  published:  { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  revised:    { bg: 'rgba(168,85,247,0.1)',  color: '#a855f7' },
  archived:   { bg: 'rgba(71,85,105,0.1)',   color: '#475569' },
}

export default function RightContextPanel({ object, onClose, onOpenInWorkspace }: Props) {
  if (!object) return null

  const statusStyle = STATUS_COLORS[object.status] ?? STATUS_COLORS.draft

  return (
    <div style={{
      width: 260, background: '#13161e', borderLeft: '1px solid #1a1e28',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Context</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', marginTop: 1 }}>
            {object.type.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Title */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>{object.title}</div>
        </div>

        {/* Description */}
        {object.description && (
          <div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>{object.description}</div>
          </div>
        )}

        {/* Owner */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Owner</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#3b82f6', fontWeight: 700 }}>
                {object.owner === 'agent' ? 'AI' : 'DH'}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{object.owner === 'agent' ? 'AI Assistant' : 'David'}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Status</div>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: statusStyle.bg, color: statusStyle.color, fontWeight: 500 }}>
            {object.status.replace('_', ' ')}
          </span>
        </div>

        {/* Priority */}
        {object.priority && (
          <div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Priority</div>
            <div style={{ fontSize: 12, color: object.priority === 'critical' ? '#ef4444' : object.priority === 'high' ? '#f59e0b' : '#94a3b8', fontWeight: 500, textTransform: 'uppercase' }}>
              {object.priority}
            </div>
          </div>
        )}

        {/* Tags */}
        {object.tags.length > 0 && (
          <div>
            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {object.tags.map(tag => (
                <span key={tag} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: '#1a1e28', color: '#94a3b8', border: '1px solid #222736' }}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Revision */}
        <div>
          <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Revision</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
            <GitBranch size={10} />
            v{object.revision} · {new Date(object.updated_at).toLocaleDateString()}
          </div>
        </div>

        {/* Timestamps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8, borderTop: '1px solid #1a1e28' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: '#2a3042' }}>Created</span>
            <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{new Date(object.created_at).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: '#2a3042' }}>Updated</span>
            <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{new Date(object.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={onOpenInWorkspace} style={{ width: '100%', padding: '7px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ExternalLink size={12} />
          Open in Workspace
        </button>
      </div>
    </div>
  )
}
