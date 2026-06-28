import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, Loader2 } from 'lucide-react'
import { useStore } from '../../store'

export default function AgentChat() {
  const { messages, agentLoading, sendMessage } = useStore()
  const [input, setInput]   = useState('')
  const bottomRef           = useRef<HTMLDivElement>(null)
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea up to ~6 lines
  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [])

  useEffect(() => { autoResize() }, [input, autoResize])

  async function handleSend() {
    const text = input.trim()
    if (!text || agentLoading) return
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await sendMessage(text)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Bot size={13} className="text-accent-blue" />
          <span className="panel-title">Chief Engineer AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="status-dot animate-pulse-dot" />
          <span style={{ fontSize: 10, color: '#22c55e' }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="empty-state h-full flex-col gap-2">
            <Bot size={24} className="text-accent-blue/30" />
            <span style={{ fontSize: 12, color: '#64748b' }}>Chief Engineer AI ready</span>
            <span style={{ fontSize: 11, color: '#64748b', textAlign: 'center', padding: '0 16px' }}>
              Ask me to create tasks, define objectives, review architecture, or answer engineering questions.
              <br /><span style={{ fontSize: 10, color: '#475569', marginTop: 4, display: 'block' }}>Shift+Enter for new line · Enter to send</span>
            </span>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }} className="fade-in">
              <div style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: 12,
                lineHeight: 1.6,
                background: msg.role === 'user' ? '#2563eb' : '#1a1e28',
                color: '#e2e8f0',
                border: msg.role === 'user' ? 'none' : '1px solid #222736',
                /* Preserve all whitespace and newlines exactly as sent */
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
              }}>
                {msg.content}
              </div>
              <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        {agentLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }} className="fade-in">
            <Loader2 size={12} className="animate-spin" style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: 11 }}>Thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #1a1e28' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: '#1a1e28', borderRadius: 10,
          padding: '8px 10px',
          border: '1px solid #222736',
          transition: 'border-color 0.15s',
        }}
          onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.4)'}
          onBlurCapture={e => (e.currentTarget as HTMLElement).style.borderColor = '#222736'}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask me anything… (Shift+Enter for new line)"
            rows={1}
            disabled={agentLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: '#e2e8f0',
              fontSize: 12,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              minHeight: 20,
              maxHeight: 140,
              overflowY: 'auto',
              /* Textarea naturally preserves formatting — paste keeps newlines/indentation */
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              caretColor: '#3b82f6',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || agentLoading}
            style={{
              background: 'none', border: 'none', cursor: input.trim() && !agentLoading ? 'pointer' : 'default',
              color: input.trim() && !agentLoading ? '#3b82f6' : '#334155',
              display: 'flex', padding: 2, flexShrink: 0, transition: 'color 0.15s',
              alignSelf: 'flex-end', marginBottom: 1,
            }}
          >
            <Send size={13} />
          </button>
        </div>
        <div style={{ fontSize: 9, color: '#334155', marginTop: 4, textAlign: 'right' }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
