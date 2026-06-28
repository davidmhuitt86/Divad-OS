import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, Loader2, Trash2, Sparkles, ChevronRight } from 'lucide-react'
import { useStore } from '../store'

const CAPABILITIES = [
  { icon: '🏗️', label: 'Create objects', desc: 'Tasks, APs, documents, decisions' },
  { icon: '🔍', label: 'Search & analyze', desc: 'Query your knowledge base' },
  { icon: '⚖️', label: 'Review architecture', desc: 'Evaluate phases and milestones' },
  { icon: '📋', label: 'Engineering advice', desc: 'Best practices and guidance' },
]

export default function Assistant() {
  const { messages, agentLoading, sendMessage } = useStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  useEffect(() => { autoResize() }, [input, autoResize])

  async function handleSend() {
    const text = input.trim()
    if (!text || agentLoading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(text)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0d0f14' }}>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid #1a1e28',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(circle at 35% 35%, #60a5fa, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.35)',
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.02em' }}>Chief Engineer AI</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Your AI engineering assistant · Powered by Claude</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, padding: '4px 10px', background: '#0d2d0d', border: '1px solid #166534', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e88', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>Online</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { /* clear messages — would need store action */ }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', border: '1px solid #1a1e28', borderRadius: 8, cursor: 'pointer', color: '#475569', fontSize: 11 }}
            onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(239,68,68,0.3)'; (e.currentTarget).style.color = '#ef4444' }}
            onMouseLeave={e => { (e.currentTarget).style.borderColor = '#1a1e28'; (e.currentTarget).style.color = '#475569' }}
          >
            <Trash2 size={12} /> Clear history
          </button>
        )}
      </div>

      {/* ── Body: empty state OR messages ────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {messages.length === 0 ? (
          <EmptyState onPrompt={p => { setInput(p); textareaRef.current?.focus() }} />
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860, width: '100%', margin: '0 auto' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }} className="fade-in">
                <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', marginBottom: 2 }}>
                  {msg.role === 'user' ? 'David · ' : 'Chief Engineer AI · '}
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  fontSize: 13,
                  lineHeight: 1.7,
                  background: msg.role === 'user' ? '#1d4ed8' : '#13161e',
                  color: '#e2e8f0',
                  border: msg.role === 'user' ? 'none' : '1px solid #1a1e28',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {agentLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }} className="fade-in">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #60a5fa44, #2563eb44)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={14} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} className="animate-spin" />
                </div>
                <div style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 1s 0s ease-in-out infinite' }} />
                  <span style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 1s 0.2s ease-in-out infinite' }} />
                  <span style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 1s 0.4s ease-in-out infinite' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #1a1e28', padding: '16px 24px', flexShrink: 0, background: '#0d0f14' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 12,
            background: '#13161e', borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid #222736',
            transition: 'border-color 0.15s',
          }}
            onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.45)'}
            onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#222736'}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #60a5fa, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end', marginBottom: 1 }}>
              <Bot size={14} color="#fff" />
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask Chief Engineer AI anything… (Shift+Enter for new line)"
              rows={1}
              disabled={agentLoading}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                resize: 'none', color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
                lineHeight: 1.6, minHeight: 24, maxHeight: 200, overflowY: 'auto',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', caretColor: '#3b82f6',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || agentLoading}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: input.trim() && !agentLoading ? '#2563eb' : '#1a1e28',
                border: 'none', cursor: input.trim() && !agentLoading ? 'pointer' : 'default',
                color: input.trim() && !agentLoading ? '#fff' : '#334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s', alignSelf: 'flex-end',
              }}
            >
              <Send size={14} />
            </button>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 10, color: '#334155' }}>
            Enter to send · Shift+Enter for new line · Chief Engineer AI can make mistakes — verify important information
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  const STARTERS = [
    'Summarize the current mission status',
    'What tasks are overdue or at risk?',
    'Draft a new architecture phase for review',
    'What knowledge gaps exist in the system?',
  ]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #60a5fa, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(59,130,246,0.25)' }}>
          <Bot size={34} color="#fff" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>Chief Engineer AI</div>
        <div style={{ fontSize: 13, color: '#64748b', maxWidth: 420, lineHeight: 1.6 }}>
          Your AI engineering assistant. Ask me to create objects, analyze your knowledge base, review architecture, or answer engineering questions.
        </div>
      </div>

      {/* Capabilities grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 480 }}>
        {CAPABILITIES.map(c => (
          <div key={c.label} style={{ background: '#13161e', border: '1px solid #1a1e28', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>{c.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{c.label}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Starter prompts */}
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={10} /> Try asking
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STARTERS.map(s => (
            <button key={s} onClick={() => onPrompt(s)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 8, cursor: 'pointer', textAlign: 'left', color: '#94a3b8', fontSize: 12, transition: 'all 0.1s' }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(59,130,246,0.3)'; (e.currentTarget).style.color = '#e2e8f0' }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = '#1a1e28'; (e.currentTarget).style.color = '#94a3b8' }}
            >
              <ChevronRight size={11} style={{ color: '#3b82f6', flexShrink: 0 }} />
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
