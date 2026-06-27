interface Props { repoName: string }

export default function FileExplorer({ repoName }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, overflow: 'hidden', minWidth: 0 }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>File Explorer</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📁</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>No files to display</div>
          <div style={{ fontSize: 11, color: '#2a3042' }}>Git integration is not yet connected.</div>
          <div style={{ fontSize: 11, color: '#2a3042', marginTop: 2 }}>Files will appear here once a repository is linked.</div>
        </div>
      </div>
    </div>
  )
}
