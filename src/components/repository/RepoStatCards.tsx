export default function RepoStatCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
      <StatCard label="Total Repositories" value="—" sub="No git integration" color="#3b82f6"  icon="🗂️" />
      <StatCard label="Total Commits"       value="—" sub="No git integration" color="#a855f7"  icon="📝" />
      <StatCard label="Total Files"         value="—" sub="No git integration" color="#22c55e"  icon="📁" />
      <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Storage Used</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>—</div>
          <div style={{ fontSize: 9, color: '#475569', marginTop: 3 }}>No git integration</div>
        </div>
        <svg width={38} height={38} viewBox="0 0 38 38">
          <circle cx={19} cy={19} r={15} fill="none" stroke="#1a1e28" strokeWidth={3} />
          <text x={19} y={23} textAnchor="middle" fill="#f59e0b" fontSize={8}>—</text>
        </svg>
      </div>
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Last Backup</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', lineHeight: 1 }}>—</div>
        <div style={{ fontSize: 9, color: '#475569', marginTop: 3 }}>No git integration</div>
      </div>
    </div>
  )
}

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
