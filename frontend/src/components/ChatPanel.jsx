import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Send, User, Bot, Loader2 } from 'lucide-react'

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-lg text-sm" {...props}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-space-800 px-1.5 py-0.5 rounded text-quantum-cyan text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  p({ children }) { return <p className="mb-2 leading-relaxed">{children}</p> },
  ul({ children }) { return <ul className="list-disc list-inside mb-2 space-y-1 text-slate-300">{children}</ul> },
  ol({ children }) { return <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-300">{children}</ol> },
  h2({ children }) { return <h2 className="text-lg font-semibold text-quantum-glow mt-3 mb-1">{children}</h2> },
  h3({ children }) { return <h3 className="text-base font-semibold text-slate-200 mt-2 mb-1">{children}</h3> },
  strong({ children }) { return <strong className="text-slate-100 font-semibold">{children}</strong> },
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                       ${isUser
                         ? 'bg-gradient-to-br from-quantum-violet to-quantum-pink'
                         : 'bg-gradient-to-br from-quantum-indigo to-quantum-cyan'}`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm
                       ${isUser
                         ? 'bg-quantum-indigo/30 border border-quantum-indigo/40 text-slate-100 rounded-tr-sm'
                         : 'bg-space-700/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'}`}>
        {isUser
          ? <p className="leading-relaxed">{msg.content}</p>
          : <ReactMarkdown components={MarkdownComponents}>{msg.content}</ReactMarkdown>
        }
        {msg.timestamp && (
          <p className="text-xs text-slate-500 mt-1">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ChatPanel({ messages = [], onSend, loading = false, placeholder = 'Ask about quantum circuits...' }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-quantum-indigo/20 to-quantum-violet/20
                            border border-quantum-indigo/30 flex items-center justify-center">
              <Bot size={32} className="text-quantum-glow" />
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Start a conversation — ask me to generate a quantum circuit or explain a concept.
            </p>
          </div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-quantum-indigo to-quantum-cyan
                            flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-space-700/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-quantum-indigo animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-quantum-violet animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-quantum-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <textarea
            id="chat-input"
            className="flex-1 input-field resize-none min-h-[48px] max-h-32"
            placeholder={placeholder}
            value={input}
            rows={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
          />
          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 self-end"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 ml-1">Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  )
}
