import { Share2 } from 'lucide-react'

export default function KnowledgeGraphPreview() {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Knowledge Graph Preview</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#2a3042' }}>
        <Share2 size={28} />
        <span style={{ fontSize: 11, fontStyle: 'italic' }}>Graph rendering coming in a future milestone</span>
      </div>
    </div>
  )
}
