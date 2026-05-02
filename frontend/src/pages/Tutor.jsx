import { useState, useRef, useEffect } from 'react'
import { GraduationCap, RefreshCw } from 'lucide-react'
import ChatPanel from '../components/ChatPanel'
import { tutorChat } from '../api/quantumApi'

const SUGGESTED_QUESTIONS = [
  'What is quantum superposition?',
  'Explain quantum entanglement with an example',
  'How does the Hadamard gate work?',
  "What is Grover's algorithm and its advantage?",
  'Explain quantum teleportation step by step',
  'What is decoherence and why does it matter?',
  'What are the differences between Qubits and classical bits?',
  'How does the Quantum Fourier Transform work?',
  "What is Shor's algorithm?",
  'Explain the CNOT gate intuitively',
]

const WELCOME_MSG = {
  role: 'assistant',
  content: `## 👋 Hello! I'm QuantumCopilot, your AI Quantum Tutor.

I can help you understand:
- **Quantum gates** (Hadamard, CNOT, Toffoli, etc.)
- **Quantum algorithms** (Grover, Shor, QFT, Deutsch, etc.)
- **Quantum phenomena** (superposition, entanglement, interference)
- **Qiskit concepts** and circuit design patterns
- **Noise and error correction** in quantum systems

Ask me anything about quantum computing! 🔬`,
  timestamp: Date.now(),
}

export default function Tutor() {
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')

  const buildHistory = (msgs) =>
    msgs
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }))

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text, timestamp: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const history = buildHistory(newMessages)
      const data = await tutorChat(history)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error || 'Sorry, something went wrong.',
        timestamp: Date.now(),
      }])
    } catch (e) {
      const errMsg = e?.response?.data?.detail || e.message || 'Backend unreachable.'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ ${errMsg}`,
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false) }
  }

  const handleReset = () => {
    setMessages([WELCOME_MSG])
    setTopic('')
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto h-full flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap size={28} className="text-pink-400" />
              AI Quantum Tutor
            </h1>
            <p className="text-slate-400 mt-0.5">Your intelligent guide to quantum computing concepts</p>
          </div>
          <button
            id="reset-tutor-btn"
            onClick={handleReset}
            className="btn-ghost flex items-center gap-1.5 text-sm"
          >
            <RefreshCw size={14} />
            New session
          </button>
        </div>

        <div className="flex-1 flex gap-5 min-h-0">
          {/* Sidebar: suggested questions */}
          <div className="hidden lg:flex flex-col gap-3 w-64 flex-shrink-0">
            <div className="glass-card p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Suggested Questions
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-3 py-2.5 bg-space-800/60 hover:bg-quantum-violet/10
                               border border-slate-700/50 hover:border-quantum-violet/40
                               rounded-xl text-xs text-slate-400 hover:text-slate-200
                               transition-all duration-200 leading-relaxed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona card */}
            <div className="glass-card p-4 bg-gradient-to-br from-pink-500/10 to-violet-500/5
                            border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-500
                                flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">QuantumCopilot</p>
                  <p className="text-xs text-slate-500">AI Quantum Tutor</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Powered by GPT-4o with quantum computing expertise. Always here to explain complex concepts clearly.
              </p>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 glass-card flex flex-col min-h-0">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-slate-200">Quantum Tutor Chat</span>
              <span className="ml-auto text-xs text-slate-500">
                {messages.length - 1} message{messages.length !== 2 ? 's' : ''}
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <ChatPanel
                messages={messages}
                onSend={handleSend}
                loading={loading}
                placeholder="Ask anything about quantum computing..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
