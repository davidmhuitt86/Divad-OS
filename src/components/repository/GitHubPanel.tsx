import { useState, useEffect } from 'react'
import { Github, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, Loader2, Link2, Trash2 } from 'lucide-react'
import { useStore, isSyncCurrent } from '../../store'

export default function GitHubPanel() {
  const { githubConfig, loadGitHubConfig, saveGitHubConfig, triggerSync, checkConnectivity, lastSyncAt, isSyncing, syncError, isOffline, objects } = useStore()

  const [form, setForm] = useState({ url: '', branch: 'main' })
  const [showForm, setShowForm] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connectStatus, setConnectStatus] = useState<{ ok: boolean; error?: string } | null>(null)
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [syncResult, setSyncResult] = useState<{ pushed: number; pulled: number; errors: string[] } | null>(null)

  const syncCurrent = isSyncCurrent(lastSyncAt)

  useEffect(() => { loadGitHubConfig() }, [])
  useEffect(() => {
    if (githubConfig) setForm({ url: githubConfig.url, branch: githubConfig.branch })
  }, [githubConfig])

  const testConn = async (cfg = form) => {
    if (!window.divadOS?.github) return { ok: false, error: 'Bridge not available' }
    setTesting(true)
    setConnectStatus(null)
    try {
      const result = await window.divadOS.github.connectTest(cfg)
      setConnectStatus(result)
      return result
    } catch (e) {
      const err = { ok: false, error: String(e) }
      setConnectStatus(err)
      return err
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!form.url.trim()) { setSaveStatus({ ok: false, msg: 'Enter a repository URL first.' }); return }
    setSaving(true)
    setSaveStatus({ ok: true, msg: 'Testing connection...' })
    const result = await testConn()
    if (!result.ok) {
      setSaveStatus({ ok: false, msg: `Cannot reach repository: ${result.error ?? 'unknown error'}` })
      setSaving(false)
      return
    }
    try {
      await saveGitHubConfig({ url: form.url.trim(), branch: form.branch.trim() || 'main' })
      setSaveStatus({ ok: true, msg: `✓ Connected to ${form.url}` })
      setShowForm(false)
    } catch (e) {
      setSaveStatus({ ok: false, msg: `Save failed: ${String(e)}` })
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async () => {
    await saveGitHubConfig({ url: '', branch: 'main' })
    setForm({ url: '', branch: 'main' })
    setConnectStatus(null)
    setSaveStatus(null)
    setSyncResult(null)
  }

  const handleSync = async () => {
    setSyncResult(null)
    const result = await triggerSync()
    if (result.success) {
      setSyncResult({ pushed: result.pushed ?? 0, pulled: result.pulled ?? 0, errors: result.errors ?? [] })
    }
  }

  const isConfigured = !!(githubConfig?.url)
  const repoLabel = githubConfig?.url?.replace('https://github.com/', '') ?? githubConfig?.url ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Status header */}
      <div style={{ padding: '14px 16px', background: '#0d0f14', border: `1px solid ${isConfigured ? (isOffline ? '#f97316' : '#22c55e') : '#1a1e28'}`, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isConfigured ? 10 : 0 }}>
          <Github size={18} color={isConfigured ? (isOffline ? '#f97316' : '#22c55e') : '#475569'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
              {isConfigured ? repoLabel : 'No Repository Connected'}
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
              {isConfigured
                ? (isOffline ? '⚠️ Offline — read-only mode' : `Branch: ${githubConfig!.branch} · Auth via Git Credential Manager`)
                : 'Connect a GitHub repository — uses your system Git credentials'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {isConfigured && (
              <button onClick={handleDisconnect}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#1a1e28', border: '1px solid #ef444433', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#ef4444' }}>
                <Trash2 size={11} /> Disconnect
              </button>
            )}
            <button onClick={() => { setShowForm(f => !f); setSaveStatus(null); setConnectStatus(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#94a3b8' }}>
              {showForm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isConfigured ? 'Change' : 'Add Repo'}
            </button>
          </div>
        </div>

        {isConfigured && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <StatChip label="Last Sync" value={lastSyncAt ? new Date(lastSyncAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'} color={syncCurrent ? '#22c55e' : '#f59e0b'} />
            <StatChip label="Objects" value={String(objects.length)} color="#3b82f6" />
            <StatChip label="Status" value={syncCurrent ? 'In Sync' : 'Stale'} color={syncCurrent ? '#22c55e' : '#f59e0b'} />
          </div>
        )}
      </div>

      {/* Config form */}
      {showForm && (
        <div style={{ padding: '16px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>Connect Repository</div>
          <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.6 }}>
            Uses your system Git Credential Manager — no PAT required. Make sure you have access to the repository.
          </div>

          <Field label="Repository URL">
            <input
              value={form.url}
              onChange={e => { setForm(f => ({ ...f, url: e.target.value })); setConnectStatus(null); setSaveStatus(null) }}
              placeholder="https://github.com/davidmhuitt86/Divad-OS"
              style={inputStyle}
            />
          </Field>

          <Field label="Branch">
            <input
              value={form.branch}
              onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
              placeholder="main"
              style={{ ...inputStyle, width: 160 }}
            />
          </Field>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => testConn()}
              disabled={!form.url.trim() || testing || saving}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 6, cursor: (!form.url.trim() || testing || saving) ? 'not-allowed' : 'pointer', fontSize: 11, color: '#94a3b8', opacity: !form.url.trim() ? 0.4 : 1, flexShrink: 0 }}>
              {testing ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={11} />}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {connectStatus && !testing && (
              <span style={{ fontSize: 10, color: connectStatus.ok ? '#22c55e' : '#fca5a5', flex: 1 }}>
                {connectStatus.ok ? '✓ Reachable' : `✗ ${connectStatus.error}`}
              </span>
            )}

            <button onClick={handleSave}
              disabled={!form.url.trim() || saving || testing}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 18px', background: '#3b82f6', border: 'none', borderRadius: 6, cursor: (!form.url.trim() || saving || testing) ? 'not-allowed' : 'pointer', fontSize: 11, color: '#fff', fontWeight: 600, marginLeft: 'auto', opacity: !form.url.trim() ? 0.4 : 1, flexShrink: 0 }}>
              {saving ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={11} />}
              {saving ? 'Connecting...' : 'Save & Connect'}
            </button>
          </div>

          {saveStatus && (
            <div style={{ padding: '10px 12px', background: saveStatus.ok ? '#22c55e11' : '#ef444411', border: `1px solid ${saveStatus.ok ? '#22c55e33' : '#ef444433'}`, borderRadius: 6, fontSize: 11, color: saveStatus.ok ? '#22c55e' : '#fca5a5' }}>
              {saveStatus.msg}
            </div>
          )}
        </div>
      )}

      {/* Sync controls */}
      {isConfigured && (
        <div style={{ padding: '14px 16px', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Repository Sync</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Push local objects · Pull remote changes · Commit via git</div>
            </div>
            <button onClick={handleSync} disabled={isSyncing || isOffline}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: isSyncing ? '#1a1e28' : '#3b82f6', border: 'none', borderRadius: 7, cursor: (isSyncing || isOffline) ? 'not-allowed' : 'pointer', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              {isSyncing
                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Syncing...</>
                : <><RefreshCw size={13} /> Sync Now</>}
            </button>
          </div>

          {!syncCurrent && !isSyncing && (
            <div style={{ padding: '10px 12px', background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={13} color="#f59e0b" />
              <div style={{ fontSize: 11, color: '#f59e0b' }}>
                {lastSyncAt ? 'Last sync was more than 24 hours ago.' : 'No sync on record.'} Object creation is locked until you sync.
              </div>
            </div>
          )}

          {syncError && (
            <div style={{ padding: '10px 12px', background: '#ef444411', border: '1px solid #ef444433', borderRadius: 6, fontSize: 11, color: '#fca5a5', marginBottom: 10 }}>
              ✗ {syncError}
            </div>
          )}

          {syncResult && (
            <div style={{ padding: '10px 12px', background: '#22c55e11', border: '1px solid #22c55e33', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>✓ Sync complete</div>
              <div style={{ fontSize: 10, color: '#4ade80' }}>↑ {syncResult.pushed} objects pushed · ↓ pulled remote changes</div>
              {syncResult.errors.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 10, color: '#fca5a5' }}>{syncResult.errors[0]}</div>
              )}
            </div>
          )}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1a1e28', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#2a3042', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>How it works</div>
            {[
              ['✓', 'Uses your system Git credentials — no PAT needed'],
              ['✓', 'Objects are written as JSON and committed to your repo'],
              ['✓', 'Remote changes are pulled before each push'],
              ['⚠', 'Object creation is locked if last sync was over 24 hours ago'],
            ].map(([icon, text]) => (
              <div key={text} style={{ fontSize: 10, color: '#475569', display: 'flex', gap: 6 }}>
                <span style={{ color: icon === '✓' ? '#22c55e' : '#f59e0b' }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '7px 10px', background: color + '11', border: `1px solid ${color}33`, borderRadius: 6 }}>
      <div style={{ fontSize: 9, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '6px 10px',
  background: '#080a0f', border: '1px solid #222736', borderRadius: 5,
  color: '#e2e8f0', fontSize: 12, outline: 'none',
}
