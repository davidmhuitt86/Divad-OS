import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2 } from 'lucide-react'
import { useStore } from '../../store'

export default function AgentChat() {
  const { messages, agentLoading, sendMessage } = useStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || agentLoading) return
    setInput('')
    await sendMessage(text)
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
          <span className="text-[10px] text-accent-green">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="empty-state h-full flex-col gap-2">
            <Bot size={24} className="text-accent-blue/30" />
            <span className="text-text-muted text-[12px]">Chief Engineer AI ready</span>
            <span className="text-text-muted text-[11px] text-center px-4">
              Ask me to create tasks, define objectives, review architecture, or answer engineering questions.
            </span>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex flex-col gap-1 fade-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-[12px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent-blue text-white rounded-br-sm'
                  : 'bg-surface-700 text-text-primary rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
              <div className="text-[10px] text-text-muted font-mono">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        {agentLoading && (
          <div className="flex items-center gap-2 text-text-muted fade-in">
            <Loader2 size={12} className="animate-spin text-accent-blue" />
            <span className="text-[11px]">Thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-surface-700">
        <div className="flex items-center gap-2 bg-surface-700 rounded-lg px-3 py-2 border border-surface-600 focus-within:border-accent-blue/40 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask me anything…"
            className="flex-1 bg-transparent text-[12px] text-text-primary placeholder-text-muted outline-none"
            disabled={agentLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || agentLoading}
            className="text-accent-blue disabled:text-text-muted transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
