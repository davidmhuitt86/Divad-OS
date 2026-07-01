import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Upload, Clipboard, Trash2, FileDown, Save, CheckCircle2 } from 'lucide-react'
import LiveAnalysisPanel from '../components/workspace/LiveAnalysisPanel'
import KnowledgeGraphPreview from '../components/workspace/KnowledgeGraphPreview'
import AIThinkingPanel from '../components/workspace/AIThinkingPanel'
import { analyzeWorkspace } from '../services/workspaceApi'
import type { WorkspaceAnalysis } from '../../shared/types'

const DEBOUNCE_MS = 500
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'csv', 'json', 'log'])
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg'])
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'docx'])
const UPLOAD_ACCEPT = '.txt,.md,.csv,.json,.pdf,.docx,.png,.jpg,.jpeg'
const FUTURE_MILESTONE = 'Available in a future milestone.'

const STORAGE_KEY_TEXT = 'divad-os-workspace-text'
const STORAGE_KEY_ID = 'divad-os-workspace-id'

function makeSessionCode(id: string): string {
  return `WS-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
}

function loadWorkspaceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_ID)
    if (existing) return existing
  } catch { /* ignore */ }
  const id = crypto.randomUUID()
  try { localStorage.setItem(STORAGE_KEY_ID, id) } catch { /* ignore */ }
  return id
}

function loadStoredText(): string {
  try { return localStorage.getItem(STORAGE_KEY_TEXT) ?? '' } catch { return '' }
}

function extOf(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export default function EngineeringWorkspace() {
  const workspaceId = useMemo(loadWorkspaceId, [])
  const sessionCode = useMemo(() => makeSessionCode(workspaceId), [workspaceId])

  const [text, setText] = useState(loadStoredText)
  const [analysis, setAnalysis] = useState<WorkspaceAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Workspace contents survive refresh via local storage — nothing is sent
  // to a database (out of scope for this milestone).
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_TEXT, text) } catch { /* ignore */ }
  }, [text])

  const runAnalysis = useCallback(async (value: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeWorkspace(workspaceId, value)
      if (result.success && result.analysis) {
        setAnalysis(result.analysis)
        setLastAnalyzedAt(new Date().toLocaleTimeString())
      } else {
        setError(result.error ?? 'Analysis failed.')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
      setHasRun(true)
    }
  }, [workspaceId])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.trim().length === 0) {
      setAnalysis(null)
      return
    }
    debounceRef.current = setTimeout(() => { runAnalysis(text) }, DEBOUNCE_MS)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [text, runAnalysis])

  function showNotice(msg: string) {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  function loadFile(file: File) {
    const ext = extOf(file.name)
    if (TEXT_EXTENSIONS.has(ext)) {
      const reader = new FileReader()
      reader.onload = () => setText(String(reader.result ?? ''))
      reader.onerror = () => showNotice(`Failed to read ${file.name}.`)
      reader.readAsText(file)
      return
    }
    if (IMAGE_EXTENSIONS.has(ext)) {
      showNotice('Image parsing not implemented yet.')
      return
    }
    if (DOCUMENT_EXTENSIONS.has(ext)) {
      showNotice(`Document parsing not implemented yet (${ext.toUpperCase()}).`)
      return
    }
    showNotice(`Unsupported file type: .${ext}`)
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  async function handlePasteButton() {
    try {
      const clipText = await navigator.clipboard.readText()
      setText(prev => (prev ? prev + '\n' + clipText : clipText))
    } catch {
      showNotice('Clipboard access denied — use Ctrl+V in the editor instead.')
    }
  }

  function handleClear() {
    setText('')
    setAnalysis(null)
    setHasRun(false)
    setError(null)
    setLastAnalyzedAt(null)
  }

  const charCount = text.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d0f14', padding: '14px 16px 16px', gap: 10 }}>
      <input ref={fileInputRef} type="file" accept={UPLOAD_ACCEPT} onChange={handleFileInputChange} style={{ display: 'none' }} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Engineering Workspace</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 11, color: '#475569' }}>
            <span>Workspace Session: <strong style={{ color: '#94a3b8' }}>{sessionCode}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e' }}>
              <span className="status-dot" /> Live
            </span>
            {loading && <span style={{ color: '#3b82f6' }}>Auto-analyzing…</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confidence</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{analysis ? `${analysis.confidence}%` : '—'}</div>
        </div>
      </div>

      {notice && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 11, padding: '6px 10px', borderRadius: 6, flexShrink: 0 }}>
          {notice}
        </div>
      )}

      {/* Editor + Live Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 10, flex: '1 1 55%', minHeight: 0 }}>
        <div
          style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          data-drag-over={dragOver ? 'true' : undefined}
        >
          <div style={{ padding: '9px 12px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>Raw Engineering Input</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={handleUploadClick} style={btnStyle('#3b82f6')}><Upload size={11} /> Upload</button>
              <button onClick={handlePasteButton} style={btnStyle('#475569')}><Clipboard size={11} /> Paste</button>
              <button onClick={handleClear} style={btnStyle('#475569')}><Trash2 size={11} /> Clear</button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type, paste, or drop engineering notes, DTC codes, measurements, part numbers…"
            spellCheck={false}
            style={{
              flex: 1, width: '100%', resize: 'none', border: 'none', outline: 'none',
              background: 'transparent', color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, lineHeight: 1.6, padding: '10px 12px',
            }}
          />
          <div style={{ padding: '6px 12px', borderTop: '1px solid #1a1e28', display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#475569', flexShrink: 0 }}>
            <span>{lastAnalyzedAt ? `Last analyzed: ${lastAnalyzedAt}` : 'Not yet analyzed'}{error ? ` · ${error}` : ''}</span>
            <span>{charCount.toLocaleString()} characters · Auto-analyze: ON ({DEBOUNCE_MS}ms)</span>
          </div>
        </div>

        <LiveAnalysisPanel analysis={analysis} loading={loading} />
      </div>

      {/* Knowledge Graph Preview + AI Thinking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: '1 1 30%', minHeight: 0 }}>
        <KnowledgeGraphPreview />
        <AIThinkingPanel loading={loading} hasRun={hasRun} />
      </div>

      {/* Bottom command bar */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button disabled style={actionBtnStyle('#22c55e', true)} title={FUTURE_MILESTONE}>
          <CheckCircle2 size={13} /> Commit to EKE
        </button>
        <button disabled style={actionBtnStyle('#3b82f6', true)} title={FUTURE_MILESTONE}>
          <Save size={13} /> Save Draft
        </button>
        <button disabled style={actionBtnStyle('#3b82f6', true)} title={FUTURE_MILESTONE}>
          <FileDown size={13} /> Export Session
        </button>
        <button onClick={handleUploadClick} style={actionBtnStyle('#3b82f6', false)}>
          <Upload size={13} /> Upload File
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={handleClear} style={actionBtnStyle('#ef4444', false)}>
          <Trash2 size={13} /> Clear Workspace
        </button>
      </div>
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', fontSize: 10,
    background: 'none', border: `1px solid ${color}44`, borderRadius: 5, color, cursor: 'pointer',
  }
}

function actionBtnStyle(color: string, disabled: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12, fontWeight: 600,
    background: disabled ? '#1a1e28' : `${color}18`, border: `1px solid ${disabled ? '#222736' : color + '55'}`,
    borderRadius: 6, color: disabled ? '#475569' : color, cursor: disabled ? 'not-allowed' : 'pointer',
  }
}
