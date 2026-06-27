export default function RepoBottomRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, flexShrink: 0 }}>
      <EmptyPanel title="Recent Commits"         icon="📝" msg="No commit history available" />
      <EmptyPanel title="Branches"               icon="🌿" msg="No branch data available" />
      <EmptyPanel title="Commit Activity"        icon="📊" msg="No activity data available" />
    </div>
  )
}

function EmptyPanel({ title, icon, msg }: { title: string; icon: string; msg: string }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>{title}</span>
      </div>
      <div style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 10, color: '#2a3042', fontStyle: 'italic' }}>{msg}</span>
        <span style={{ fontSize: 9, color: '#1a1e28' }}>Git integration required</span>
      </div>
    </div>
  )
}
