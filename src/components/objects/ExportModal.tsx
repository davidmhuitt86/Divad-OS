import { useState, useEffect } from 'react'
import { X, FileText, Printer, Send, Download, Clock, CheckCircle, Loader2, FileCheck, PenLine } from 'lucide-react'
import type { EKEObject } from '../../../shared/types'

interface Props {
  obj: EKEObject
  onClose: () => void
}

type Format = 'pdf' | 'docx'
type Tab    = 'export' | 'history'

interface Sig { include: boolean; name: string; title: string; date: string }

// ─── Document HTML template ───────────────────────────────────────────────────
function buildDocumentHtml(obj: EKEObject, sig: Sig): string {
  const meta = obj.metadata as Record<string, string>
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const metaRows = [
    ['Document Type', obj.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
    ['Status',        obj.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
    ['Owner',         obj.owner ?? '—'],
    ['Priority',      obj.priority?.toUpperCase() ?? '—'],
    ['Revision',      `v${obj.revision}`],
    ['Created',       new Date(obj.created_at).toLocaleDateString()],
    ['Last Updated',  new Date(obj.updated_at).toLocaleDateString()],
    ['Object ID',     obj.id],
    ...(obj.tags?.length ? [['Tags', obj.tags.join(', ')]] : []),
    ...(meta.ddrNumber    ? [['DDR Number',    meta.ddrNumber]]    : []),
    ...(meta.domain       ? [['Domain',        meta.domain]]       : []),
    ...(meta.confidence   ? [['Confidence',    meta.confidence + '%']] : []),
  ].map(([k, v]) => `<tr><td class="meta-key">${k}</td><td class="meta-val">${v}</td></tr>`).join('')

  const contentSections: string[] = []
  if (obj.description) {
    contentSections.push(`<div class="section"><div class="section-title">Description</div><div class="content">${obj.description.replace(/\n/g, '<br>')}</div></div>`)
  }
  ;[
    ['Problem Statement', meta.problem],
    ['Decision',          meta.decision],
    ['Alternatives Considered', meta.alternatives],
    ['Consequences',      meta.consequences],
    ['Content',           meta.content],
    ['Engineering Notes', meta.engineeringNotes],
    ['Mitigation Plan',   meta.mitigation],
    ['Agenda',            meta.agenda],
    ['Meeting Notes',     meta.notes],
    ['Action Items',      meta.actionItems],
    ['Acceptance Criteria', meta.acceptanceCriteria],
    ['Definition of Done',  meta.definitionOfDone],
  ].forEach(([label, val]) => {
    if (val) contentSections.push(`<div class="section"><div class="section-title">${label}</div><div class="content">${String(val).replace(/\n/g, '<br>')}</div></div>`)
  })

  const sigBlock = sig.include ? `
    <div class="sig-block">
      <div class="sig-title">Digital Signature</div>
      <table class="sig-table">
        <tr>
          <td>
            <div class="sig-line"></div>
            <div class="sig-name">${sig.name}</div>
            <div class="sig-role">${sig.title}</div>
          </td>
          <td>
            <div class="sig-field"><span class="sig-label">Date:</span> ${sig.date}</div>
            <div class="sig-field"><span class="sig-label">Signed:</span> ${new Date().toLocaleString()}</div>
          </td>
        </tr>
      </table>
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; background: #fff; color: #1a1a2e; padding: 56px 72px; }
  .doc-header { border-bottom: 3px double #1a3057; padding-bottom: 18px; margin-bottom: 24px; }
  .brand { font-family: Arial, sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; margin-bottom: 14px; }
  .brand span { color: #1a3057; }
  .doc-title { font-size: 26px; font-weight: bold; color: #0f172a; line-height: 1.25; margin-bottom: 8px; }
  .doc-type-badge { display: inline-block; font-size: 10px; font-family: Arial, sans-serif; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #3b82f6; border: 1px solid #bfdbfe; border-radius: 12px; padding: 2px 10px; margin-right: 8px; }
  .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; font-family: Arial, sans-serif; }
  .meta-key { padding: 6px 10px; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; background: #f8fafc; border: 1px solid #e2e8f0; width: 28%; }
  .meta-val { padding: 6px 10px; color: #334155; border: 1px solid #e2e8f0; }
  .section { margin: 24px 0; }
  .section-title { font-family: Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; }
  .content { font-size: 12px; line-height: 1.85; color: #334155; }
  .sig-block { margin-top: 56px; border-top: 2px solid #1a3057; padding-top: 18px; }
  .sig-title { font-family: Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a3057; margin-bottom: 16px; }
  .sig-table { width: 100%; font-family: Arial, sans-serif; font-size: 11px; }
  .sig-table td { vertical-align: bottom; padding-right: 40px; }
  .sig-line { border-bottom: 1px solid #0f172a; width: 220px; height: 32px; margin-bottom: 6px; }
  .sig-name { font-weight: 700; font-size: 13px; color: #0f172a; }
  .sig-role { color: #475569; font-size: 11px; margin-top: 2px; }
  .sig-field { margin-bottom: 6px; color: #334155; }
  .sig-label { font-weight: 700; color: #475569; }
  .doc-footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-family: Arial, sans-serif; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
  @page { margin: 0; }
</style>
</head>
<body>
  <div class="doc-header">
    <div class="brand"><span>DIVAD</span> TECHNOLOGY GROUP &nbsp;·&nbsp; Engineering Knowledge Engine</div>
    <div class="doc-title">${obj.title}</div>
    <div style="margin-top:6px">
      <span class="doc-type-badge">${obj.type.replace(/_/g, ' ')}</span>
      <span class="doc-type-badge" style="color:#475569;border-color:#e2e8f0">${obj.status.replace(/_/g, ' ')}</span>
    </div>
  </div>

  <table class="meta-table"><tbody>${metaRows}</tbody></table>

  ${contentSections.join('\n')}

  ${sigBlock}

  <div class="doc-footer">
    <span>Divad OS — Engineering Knowledge Engine &nbsp;·&nbsp; ${obj.id}</span>
    <span>Generated ${today}</span>
  </div>
</body>
</html>`
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
export default function ExportModal({ obj, onClose }: Props) {
  const [tab, setTab]     = useState<Tab>('export')
  const [format, setFormat] = useState<Format>('pdf')
  const [sig, setSig]     = useState<Sig>({
    include: false,
    name:  obj.owner ?? '',
    title: '',
    date:  new Date().toLocaleDateString('en-CA'),
  })
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; msg: string }>({ type: 'idle', msg: '' })
  const [history, setHistory] = useState<ExportRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const isElectron = typeof window !== 'undefined' && !!window.divadOS
  const html = buildDocumentHtml(obj, sig)
  const defaultName = obj.title.replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '-').slice(0, 60)

  const loadHistory = async () => {
    if (!isElectron) return
    setHistoryLoading(true)
    const records = await window.divadOS.export.history(obj.id)
    setHistory(records)
    setHistoryLoading(false)
  }

  useEffect(() => { if (tab === 'history') loadHistory() }, [tab])

  const handleExport = async () => {
    if (!isElectron) { setStatus({ type: 'error', msg: 'Export requires the desktop app.' }); return }
    setStatus({ type: 'loading', msg: format === 'pdf' ? 'Generating PDF…' : 'Building Word document…' })
    try {
      let result: ExportResult
      const sigArgs = sig.include ? { signedBy: sig.name, signedTitle: sig.title, signedAt: sig.date } : {}

      if (format === 'pdf') {
        result = await window.divadOS.export.savePdf({ html, defaultName, objectId: obj.id, objectTitle: obj.title, ...sigArgs })
      } else {
        result = await window.divadOS.export.saveDocx({ objectData: obj, signatureData: sig.include ? sig : null, defaultName, objectId: obj.id, objectTitle: obj.title })
      }

      if (result.saved) {
        setStatus({ type: 'success', msg: `Saved to ${result.filePath}` })
      } else {
        setStatus({ type: 'idle', msg: '' })
      }
    } catch (e) {
      setStatus({ type: 'error', msg: String(e) })
    }
  }

  const handlePrint = async () => {
    if (!isElectron) { window.print(); return }
    setStatus({ type: 'loading', msg: 'Opening print dialog…' })
    await window.divadOS.export.print({ html })
    setStatus({ type: 'idle', msg: '' })
  }

  const handleSend = async () => {
    if (!isElectron) return
    const body = `${obj.title}\n\nType: ${obj.type}\nStatus: ${obj.status}\nOwner: ${obj.owner ?? '—'}\n\n${obj.description ?? ''}\n\n---\nGenerated by Divad OS`
    await window.divadOS.export.send({ subject: `[Divad OS] ${obj.title}`, body, filePath: status.type === 'success' ? status.msg.replace('Saved to ', '') : undefined })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />

      <div style={{ position: 'relative', width: '92%', maxWidth: 1100, height: '88vh', display: 'flex', flexDirection: 'column', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 12, overflow: 'hidden', boxShadow: '0 32px 100px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileCheck size={16} color="#3b82f6" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Export Document</span>
            <span style={{ fontSize: 11, color: '#475569', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {obj.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: '#0d0f14', border: '1px solid #1a1e28', borderRadius: 6, padding: 2, gap: 2, marginRight: 8 }}>
              {(['export', 'history'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: tab === t ? 600 : 400, background: tab === t ? '#1a1e28' : 'transparent', color: tab === t ? '#e2e8f0' : '#475569', textTransform: 'capitalize' }}>
                  {t === 'history' ? 'Export History' : 'Format & Export'}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}><X size={16} /></button>
          </div>
        </div>

        {tab === 'export' ? (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* Left: Controls */}
            <div style={{ width: 260, borderRight: '1px solid #1a1e28', padding: '20px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0 }}>

              {/* Format */}
              <div>
                <SectionLabel>Output Format</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {([['pdf', 'PDF Document', '.pdf — Universal, print-ready'], ['docx', 'Word Document', '.docx — Editable in Microsoft Word']] as const).map(([val, label, desc]) => (
                    <button key={val} onClick={() => setFormat(val)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: format === val ? 'rgba(59,130,246,0.1)' : '#0d0f14', border: `1px solid ${format === val ? 'rgba(59,130,246,0.4)' : '#1a1e28'}`, borderRadius: 7, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: format === val ? '#3b82f6' : '#2a3042', marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: format === val ? '#e2e8f0' : '#94a3b8' }}>{label}</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Signature */}
              <div>
                <SectionLabel>Signature Block</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Include signature</span>
                  <Toggle checked={sig.include} onChange={v => setSig(s => ({ ...s, include: v }))} />
                </div>
                {sig.include && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Field label="Signed By">
                      <input value={sig.name} onChange={e => setSig(s => ({ ...s, name: e.target.value }))}
                        placeholder="Full name" style={inputStyle} />
                    </Field>
                    <Field label="Title / Role">
                      <input value={sig.title} onChange={e => setSig(s => ({ ...s, title: e.target.value }))}
                        placeholder="e.g. Chief Engineer" style={inputStyle} />
                    </Field>
                    <Field label="Date">
                      <input type="date" value={sig.date} onChange={e => setSig(s => ({ ...s, date: e.target.value }))}
                        style={inputStyle} />
                    </Field>
                  </div>
                )}
              </div>

              {/* Status */}
              {status.type !== 'idle' && (
                <div style={{ padding: '10px 12px', background: status.type === 'success' ? '#22c55e11' : status.type === 'error' ? '#ef444411' : '#3b82f611', border: `1px solid ${status.type === 'success' ? '#22c55e44' : status.type === 'error' ? '#ef444444' : '#3b82f644'}`, borderRadius: 7, fontSize: 10, color: status.type === 'success' ? '#22c55e' : status.type === 'error' ? '#fca5a5' : '#93c5fd', lineHeight: 1.5 }}>
                  {status.type === 'loading' && <Loader2 size={11} style={{ display: 'inline', marginRight: 6, animation: 'spin 1s linear infinite' }} />}
                  {status.type === 'success' && <CheckCircle size={11} style={{ display: 'inline', marginRight: 6 }} />}
                  {status.msg}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                <button onClick={handleExport} disabled={status.type === 'loading'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', background: '#3b82f6', border: 'none', borderRadius: 7, cursor: status.type === 'loading' ? 'not-allowed' : 'pointer', fontSize: 12, color: '#fff', fontWeight: 700, opacity: status.type === 'loading' ? 0.7 : 1 }}>
                  {status.type === 'loading' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={13} />}
                  Save to File
                </button>
                <button onClick={handlePrint} disabled={status.type === 'loading'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 7, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
                  <Printer size={13} /> Print
                </button>
                <button onClick={handleSend}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px', background: '#1a1e28', border: '1px solid #222736', borderRadius: 7, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
                  <Send size={13} /> Send via Email
                </button>
              </div>
            </div>

            {/* Right: Document Preview */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #1a1e28', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <FileText size={11} color="#475569" />
                <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Document Preview</span>
                <span style={{ fontSize: 10, color: '#2a3042', marginLeft: 'auto' }}>{format.toUpperCase()} · A4</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#0d0f14', display: 'flex', justifyContent: 'center' }}>
                {/* Paper simulation */}
                <div style={{ width: 680, minHeight: 960, background: '#fff', boxShadow: '0 4px 32px rgba(0,0,0,0.5)', borderRadius: 2, padding: '56px 72px', fontFamily: '"Times New Roman", Times, serif', color: '#1a1a2e', fontSize: 12, lineHeight: 1.7 }}>
                  {/* Brand header */}
                  <div style={{ borderBottom: '3px double #1a3057', paddingBottom: 18, marginBottom: 24 }}>
                    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 3, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 14 }}>
                      <span style={{ color: '#1a3057' }}>DIVAD</span> TECHNOLOGY GROUP &nbsp;·&nbsp; Engineering Knowledge Engine
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#0f172a', lineHeight: 1.3, marginBottom: 8 }}>{obj.title}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 12, padding: '2px 10px' }}>{obj.type.replace(/_/g, ' ')}</span>
                      <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 12, padding: '2px 10px' }}>{obj.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Meta table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontFamily: 'Arial, sans-serif', fontSize: 11 }}>
                    <tbody>
                      {[
                        ['Owner', obj.owner ?? '—'],
                        ['Priority', obj.priority?.toUpperCase() ?? '—'],
                        ['Revision', `v${obj.revision}`],
                        ['Created', new Date(obj.created_at).toLocaleDateString()],
                        ['Object ID', obj.id.slice(0, 16) + '…'],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ padding: '5px 10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: 9, letterSpacing: 0.5, background: '#f8fafc', border: '1px solid #e2e8f0', width: '28%' }}>{k}</td>
                          <td style={{ padding: '5px 10px', color: '#334155', border: '1px solid #e2e8f0' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Description */}
                  {obj.description && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, marginBottom: 12 }}>Description</div>
                      <div style={{ fontSize: 12, lineHeight: 1.85, color: '#334155', whiteSpace: 'pre-wrap' }}>{obj.description}</div>
                    </div>
                  )}

                  {/* Metadata content sections */}
                  {(() => {
                    const m = obj.metadata as Record<string, string>
                    const sections = [
                      ['Problem Statement', m.problem], ['Decision', m.decision],
                      ['Alternatives Considered', m.alternatives], ['Consequences', m.consequences],
                      ['Content', m.content], ['Engineering Notes', m.engineeringNotes],
                      ['Mitigation Plan', m.mitigation], ['Agenda', m.agenda],
                      ['Meeting Notes', m.notes], ['Action Items', m.actionItems],
                    ].filter(([, v]) => v) as [string, string][]
                    return sections.map(([label, value]) => (
                      <div key={label} style={{ marginBottom: 20 }}>
                        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, marginBottom: 12 }}>{label}</div>
                        <div style={{ fontSize: 12, lineHeight: 1.85, color: '#334155', whiteSpace: 'pre-wrap' }}>{value}</div>
                      </div>
                    ))
                  })()}

                  {/* Tags */}
                  {obj.tags?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, marginBottom: 10 }}>Tags</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {obj.tags.map(t => <span key={t} style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, padding: '2px 9px' }}>#{t}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Signature block */}
                  {sig.include && sig.name && (
                    <div style={{ marginTop: 56, borderTop: '2px solid #1a3057', paddingTop: 18 }}>
                      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#1a3057', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PenLine size={11} color="#1a3057" /> Digital Signature
                      </div>
                      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ borderBottom: '1px solid #0f172a', width: 220, height: 32, marginBottom: 6 }} />
                          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{sig.name}</div>
                          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#475569', marginTop: 2 }}>{sig.title || 'Title not specified'}</div>
                        </div>
                        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#334155' }}>
                          <div style={{ marginBottom: 4 }}><strong>Date:</strong> {sig.date}</div>
                          <div><strong>Signed:</strong> {new Date().toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ marginTop: 48, borderTop: '1px solid #e2e8f0', paddingTop: 10, fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Divad OS — Engineering Knowledge Engine · {obj.id.slice(0, 8)}</span>
                    <span>Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* History Tab */
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Export History — {obj.title}</div>
            {historyLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 12 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: 12, color: '#2a3042', fontStyle: 'italic' }}>No exports recorded yet for this object.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#0d0f14' }}>
                    {['Date & Time', 'Format', 'Signed By', 'File Path'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1a1e28', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #1a1e2866' }}>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={10} color="#475569" />
                          {new Date(r.exported_at).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: r.format === 'PDF' ? '#ef444411' : '#3b82f611', border: `1px solid ${r.format === 'PDF' ? '#ef444444' : '#3b82f644'}`, borderRadius: 4, color: r.format === 'PDF' ? '#fca5a5' : '#93c5fd' }}>{r.format}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                        {r.signed_by ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.signed_by}</div>
                            {r.signed_title && <div style={{ fontSize: 10, color: '#475569' }}>{r.signed_title} · {r.signed_at}</div>}
                          </div>
                        ) : <span style={{ color: '#2a3042', fontStyle: 'italic' }}>Unsigned</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#2a3042', fontFamily: 'monospace', fontSize: 10, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.file_path ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ width: 36, height: 20, borderRadius: 10, background: checked ? '#3b82f6' : '#1a1e28', border: `1px solid ${checked ? '#3b82f6' : '#222736'}`, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: checked ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px', background: '#0d0f14', border: '1px solid #222736',
  borderRadius: 5, color: '#e2e8f0', fontSize: 11, outline: 'none', boxSizing: 'border-box',
}
