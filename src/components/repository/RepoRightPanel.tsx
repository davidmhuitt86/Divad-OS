interface Props { repoName: string }

export default function RepoRightPanel({ repoName }: Props) {
  return (
    <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', flex: 1 }}>
        <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Repository Overview</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔌</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Git not connected</div>
            <div style={{ fontSize: 10, color: '#2a3042' }}>Repository metadata will appear here once git integration is linked.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
