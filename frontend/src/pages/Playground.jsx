import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Atom, Play, Cpu, Wand2, BookOpen, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import ChatPanel from '../components/ChatPanel'
import CircuitViewer from '../components/CircuitViewer'
import HistogramChart from '../components/HistogramChart'
import MetricsCard from '../components/MetricsCard'
import {
  generateCircuit, simulateCircuit, explainCircuit, optimizeCircuit
} from '../api/quantumApi'

const EXAMPLE_PROMPTS = [
  'Generate Bell state circuit',
  'Create 3-qubit GHZ state',
  "Grover's algorithm for 2 qubits",
  'Quantum Fourier Transform 3 qubits',
  'Quantum teleportation',
  'Deutsch algorithm',
]

function CodeBlock({ code }) {
  if (!code) return null
  return (
    <pre className="code-block text-xs leading-relaxed overflow-x-auto max-h-40">
      <code className="text-quantum-cyan">{code}</code>
    </pre>
  )
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}

export default function Playground() {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  // Circuit state
  const [circuitCode, setCircuitCode] = useState('')
  const [circuitImage, setCircuitImage] = useState('')
  const [circuitAscii, setCircuitAscii] = useState('')
  const [circuitMetrics, setCircuitMetrics] = useState(null)

  // Simulation state
  const [simResult, setSimResult] = useState(null)
  const [simLoading, setSimLoading] = useState(false)
  const [noisy, setNoisy] = useState(true)

  // Optimization state
  const [optResult, setOptResult] = useState(null)
  const [optLoading, setOptLoading] = useState(false)
  const [showOpt, setShowOpt] = useState(false)

  const [error, setError] = useState('')

  // Handle ?prompt= query param
  useEffect(() => {
    const p = searchParams.get('prompt')
    if (p) handleSend(p)
  }, []) // eslint-disable-line

  const handleSend = async (prompt) => {
    setError('')
    const userMsg = { role: 'user', content: prompt, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setChatLoading(true)

    try {
      const data = await generateCircuit(prompt)
      if (data.error) {
        setError(data.error)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ ${data.error}`,
          timestamp: Date.now(),
        }])
      } else {
        setCircuitCode(data.code)
        setCircuitImage(data.circuit_image)
        setCircuitAscii(data.circuit_ascii)
        setCircuitMetrics(data.metrics)
        setSimResult(null)
        setOptResult(null)

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Circuit generated!\n\n**Metrics:** ${data.metrics.num_qubits} qubits · depth ${data.metrics.depth} · ${data.metrics.total_gates} gates\n\nRun the simulation or analyze further using the controls below.`,
          timestamp: Date.now(),
        }])
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || 'Backend unreachable. Make sure the FastAPI server is running on port 8000.'
      setError(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${msg}`, timestamp: Date.now() }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleSimulate = async () => {
    if (!circuitCode) return
    setSimLoading(true)
    setError('')
    try {
      const data = await simulateCircuit(circuitCode, 1024, noisy)
      setSimResult(data)
      if (data.fidelity !== null) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📊 **Simulation complete!**\n\n- Fidelity (ideal vs noisy): **${(data.fidelity * 100).toFixed(2)}%**\n- Check the histogram for measurement distributions.`,
          timestamp: Date.now(),
        }])
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setSimLoading(false)
    }
  }

  const handleExplain = async () => {
    if (!circuitCode) return
    setChatLoading(true)
    try {
      const data = await explainCircuit(circuitCode)
      if (data.error) {
        setError(data.error)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ ${data.error}`,
          timestamp: Date.now(),
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.explanation,
          timestamp: Date.now(),
        }])
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setChatLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (!circuitCode) return
    setOptLoading(true)
    try {
      const data = await optimizeCircuit(circuitCode)
      setOptResult(data)
      setShowOpt(true)
      const c = data.comparison
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚡ **Optimization complete!**\n\n- Depth: ${c.before.depth} → ${c.after.depth} (${c.depth_reduction_pct}% reduction)\n- Gates: ${c.before.total_gates} → ${c.after.total_gates} (${c.gate_reduction_pct}% reduction)`,
        timestamp: Date.now(),
      }])
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setOptLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Atom size={28} className="text-quantum-indigo" />
            Quantum Playground
          </h1>
          <p className="text-slate-400 mt-1">Generate and simulate quantum circuits using natural language</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Chat */}
          <div className="flex flex-col gap-4">
            {/* Example prompts */}
            <div className="glass-card p-3">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Quick Prompts</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="px-3 py-1.5 bg-space-800 hover:bg-quantum-indigo/20 border border-slate-700
                               hover:border-quantum-indigo/50 rounded-lg text-xs text-slate-400
                               hover:text-quantum-glow transition-all duration-200 font-mono"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="glass-card flex-1 min-h-[500px] flex flex-col">
              <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-quantum-indigo animate-pulse" />
                <span className="text-sm font-semibold text-slate-200">AI Circuit Generator</span>
              </div>
              <div className="flex-1 min-h-0">
                <ChatPanel
                  messages={messages}
                  onSend={handleSend}
                  loading={chatLoading}
                  placeholder="Describe a quantum circuit... (e.g. 'Create Bell state')"
                />
              </div>
            </div>

            <ErrorBanner message={error} />
          </div>

          {/* RIGHT: Circuit + Results */}
          <div className="flex flex-col gap-4">
            {/* Circuit Visualization */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Cpu size={16} className="text-quantum-cyan" />
                  Circuit Diagram
                </h2>
                {circuitCode && (
                  <div className="flex gap-2">
                    <button
                      id="explain-btn"
                      onClick={handleExplain}
                      disabled={chatLoading}
                      className="btn-ghost text-xs flex items-center gap-1"
                    >
                      <BookOpen size={13} />
                      Explain
                    </button>
                    <button
                      id="optimize-btn"
                      onClick={handleOptimize}
                      disabled={optLoading}
                      className="btn-ghost text-xs flex items-center gap-1"
                    >
                      <Wand2 size={13} />
                      {optLoading ? 'Optimizing…' : 'Optimize'}
                    </button>
                  </div>
                )}
              </div>
              <CircuitViewer imageB64={circuitImage} asciiRepr={circuitAscii} />

              {/* Generated code */}
              {circuitCode && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-1.5 font-medium">Generated Qiskit Code</p>
                  <CodeBlock code={circuitCode} />
                </div>
              )}
            </div>

            {/* Metrics strip */}
            {circuitMetrics && (
              <div className="grid grid-cols-4 gap-3">
                <MetricsCard icon="⚛️" label="Qubits" value={circuitMetrics.num_qubits} color="indigo" />
                <MetricsCard icon="📏" label="Depth" value={circuitMetrics.depth} color="violet" />
                <MetricsCard icon="🔧" label="Gates" value={circuitMetrics.total_gates} color="cyan" />
                <MetricsCard icon="📐" label="Width" value={circuitMetrics.width} color="amber" />
              </div>
            )}

            {/* Simulation Controls */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Play size={16} className="text-emerald-400" />
                  Simulation
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400">Noisy model</span>
                  <div
                    onClick={() => setNoisy(n => !n)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200
                                ${noisy ? 'bg-quantum-indigo' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                                    ${noisy ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>

              <button
                id="run-simulation-btn"
                onClick={handleSimulate}
                disabled={!circuitCode || simLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
              >
                {simLoading
                  ? <><div className="quantum-spinner" /> Running…</>
                  : <><Play size={16} /> Run Simulation</>
                }
              </button>

              {simResult && (
                <>
                  {simResult.fidelity !== null && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-500/10
                                    border border-emerald-500/20 rounded-xl">
                      <span className="text-emerald-400 font-semibold text-sm">
                        Fidelity: {(simResult.fidelity * 100).toFixed(2)}%
                      </span>
                      <span className="text-xs text-slate-500">(ideal vs noisy)</span>
                    </div>
                  )}
                  <HistogramChart
                    idealCounts={simResult.ideal_counts}
                    noisyCounts={simResult.noisy_counts}
                  />
                </>
              )}
            </div>

            {/* Optimization Result */}
            {optResult && (
              <div className="glass-card p-5">
                <button
                  onClick={() => setShowOpt(s => !s)}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Wand2 size={16} className="text-quantum-violet" />
                    Optimization Results
                  </h2>
                  {showOpt ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>

                {showOpt && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {['depth', 'total_gates', 'num_qubits'].map(key => {
                        const b = optResult.comparison.before[key]
                        const a = optResult.comparison.after[key]
                        const improved = a < b
                        return (
                          <div key={key} className="glass-card p-3 text-center">
                            <p className="text-xs text-slate-500 capitalize mb-1">{key.replace('_', ' ')}</p>
                            <p className="text-slate-300 font-mono text-sm">
                              <span className="text-slate-400">{b}</span>
                              <span className="text-slate-600 mx-1">→</span>
                              <span className={improved ? 'text-emerald-400' : 'text-slate-300'}>{a}</span>
                            </p>
                          </div>
                        )
                      })}
                    </div>
                    <CircuitViewer
                      imageB64={optResult.optimized_image}
                      asciiRepr={optResult.optimized_ascii}
                      title="Optimized Circuit"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
