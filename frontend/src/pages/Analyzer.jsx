import { useState } from 'react'
import { BarChart3, Play, Wand2, AlertCircle, Loader2 } from 'lucide-react'
import MetricsCard from '../components/MetricsCard'
import CircuitViewer from '../components/CircuitViewer'
import HistogramChart from '../components/HistogramChart'
import { analyzeCircuit, simulateCircuit, optimizeCircuit } from '../api/quantumApi'

const SAMPLE_CIRCUITS = [
  {
    label: 'Bell State',
    code: `qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)`,
  },
  {
    label: 'GHZ (3 qubits)',
    code: `qc = QuantumCircuit(3)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(0, 2)`,
  },
  {
    label: 'QFT (3 qubits)',
    code: `qc = QuantumCircuit(3)\nqc.h(0)\nqc.cp(3.14159/2, 0, 1)\nqc.cp(3.14159/4, 0, 2)\nqc.h(1)\nqc.cp(3.14159/2, 1, 2)\nqc.h(2)\nqc.swap(0, 2)`,
  },
  {
    label: "Grover's (2 qubits)",
    code: `qc = QuantumCircuit(2)\nqc.h([0, 1])\nqc.cz(0, 1)\nqc.h([0, 1])\nqc.x([0, 1])\nqc.cz(0, 1)\nqc.x([0, 1])\nqc.h([0, 1])`,
  },
]

function Section({ title, icon, children }) {
  return (
    <div className="glass-card p-6">
      <h2 className="font-bold text-slate-200 flex items-center gap-2 mb-5 text-lg">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function Analyzer() {
  const [code, setCode] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [simResult, setSimResult] = useState(null)
  const [optResult, setOptResult] = useState(null)
  const [circuitImg, setCircuitImg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState({ analyze: false, sim: false, opt: false })

  const setL = (key, v) => setLoading(prev => ({ ...prev, [key]: v }))

  const handleAnalyze = async () => {
    if (!code.trim()) return
    setError('')
    setL('analyze', true)
    try {
      const data = await analyzeCircuit(code)
      if (data.error) { setError(data.error); return }
      setMetrics(data.metrics)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally { setL('analyze', false) }
  }

  const handleSimulate = async () => {
    if (!code.trim()) return
    setL('sim', true)
    try {
      const data = await simulateCircuit(code, 1024, true)
      setSimResult(data)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally { setL('sim', false) }
  }

  const handleOptimize = async () => {
    if (!code.trim()) return
    setL('opt', true)
    try {
      const data = await optimizeCircuit(code)
      setOptResult(data)
      setCircuitImg(data.optimized_image)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally { setL('opt', false) }
  }

  const loadSample = (sample) => {
    setCode(sample.code)
    setMetrics(null)
    setSimResult(null)
    setOptResult(null)
    setCircuitImg('')
    setError('')
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 size={28} className="text-quantum-violet" />
            Circuit Analyzer
          </h1>
          <p className="text-slate-400 mt-1">Paste Qiskit code to analyze depth, gates, simulate & optimize</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Input Column */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <Section title="Circuit Code" icon={<span className="text-quantum-cyan">⌨️</span>}>
              {/* Sample buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {SAMPLE_CIRCUITS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => loadSample(s)}
                    className="px-3 py-1.5 bg-space-800 hover:bg-quantum-violet/20 border border-slate-700
                               hover:border-quantum-violet/50 rounded-lg text-xs text-slate-400
                               hover:text-quantum-violet transition-all duration-200 font-mono"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <textarea
                id="circuit-code-input"
                className="input-field font-mono text-xs leading-relaxed resize-none h-52 mb-4"
                placeholder={`qc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)`}
                value={code}
                onChange={e => setCode(e.target.value)}
              />

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30
                                rounded-xl text-red-300 text-sm mb-3">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span className="break-all">{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  id="analyze-btn"
                  onClick={handleAnalyze}
                  disabled={!code.trim() || loading.analyze}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {loading.analyze ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                  Analyze Circuit
                </button>
                <button
                  id="simulate-analyzer-btn"
                  onClick={handleSimulate}
                  disabled={!code.trim() || loading.sim}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  {loading.sim ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  Run Simulation
                </button>
                <button
                  id="optimize-analyzer-btn"
                  onClick={handleOptimize}
                  disabled={!code.trim() || loading.opt}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  {loading.opt ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  Optimize (Level 3)
                </button>
              </div>
            </Section>
          </div>

          {/* Results Column */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Metrics */}
            {metrics && (
              <Section title="Circuit Metrics" icon="📊">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  <MetricsCard icon="⚛️" label="Qubits" value={metrics.num_qubits} color="indigo" />
                  <MetricsCard icon="📏" label="Circuit Depth" value={metrics.depth} color="violet"
                    subtitle="Critical path length" />
                  <MetricsCard icon="🔧" label="Total Gates" value={metrics.total_gates} color="cyan" />
                  <MetricsCard icon="📐" label="Width" value={metrics.width} color="amber"
                    subtitle="Qubits + clbits" />
                  <MetricsCard icon="📦" label="Classical Bits" value={metrics.num_clbits} color="emerald" />
                  <MetricsCard icon="🔢" label="Circuit Size" value={metrics.size} color="pink"
                    subtitle="Total operations" />
                </div>

                {/* Gate breakdown */}
                {metrics.gate_counts && Object.keys(metrics.gate_counts).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-3 font-semibold">Gate Breakdown</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(metrics.gate_counts).map(([gate, count]) => (
                        <span
                          key={gate}
                          className="metric-badge bg-quantum-indigo/10 border border-quantum-indigo/30 text-quantum-glow"
                        >
                          <span className="font-mono uppercase">{gate}</span>
                          <span className="text-slate-400">×{count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Simulation Results */}
            {simResult && (
              <Section title="Simulation Results" icon="🎲">
                {simResult.fidelity != null && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    <MetricsCard
                      icon="🎯"
                      label="Fidelity"
                      value={`${(simResult.fidelity * 100).toFixed(2)}`}
                      unit="%"
                      color="emerald"
                      subtitle="Ideal vs noisy"
                    />
                    <MetricsCard
                      icon="📡"
                      label="Noise Impact"
                      value={`${(100 - simResult.fidelity * 100).toFixed(2)}`}
                      unit="%"
                      color="amber"
                      subtitle="Decoherence loss"
                    />
                  </div>
                )}
                <HistogramChart
                  idealCounts={simResult.ideal_counts}
                  noisyCounts={simResult.noisy_counts}
                  title="Measurement Distribution"
                />
              </Section>
            )}

            {/* Optimization Results */}
            {optResult && (
              <Section title="Optimization Comparison" icon="⚡">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { key: 'depth', label: 'Depth', pct: optResult.comparison.depth_reduction_pct },
                    { key: 'total_gates', label: 'Gate Count', pct: optResult.comparison.gate_reduction_pct },
                    { key: 'num_qubits', label: 'Qubits', pct: 0 },
                  ].map(({ key, label, pct }) => {
                    const b = optResult.comparison.before[key]
                    const a = optResult.comparison.after[key]
                    const improved = a < b
                    return (
                      <div key={key} className="glass-card p-4 text-center">
                        <p className="text-xs text-slate-500 mb-2">{label}</p>
                        <div className="flex items-center justify-center gap-2 text-lg font-bold">
                          <span className="text-slate-400">{b}</span>
                          <span className="text-slate-600 text-sm">→</span>
                          <span className={improved ? 'text-emerald-400' : 'text-slate-300'}>{a}</span>
                        </div>
                        {pct !== 0 && (
                          <p className={`text-xs mt-1 ${improved ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {improved ? `▼ ${pct}% saved` : 'no change'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
                <CircuitViewer
                  imageB64={optResult.optimized_image}
                  asciiRepr={optResult.optimized_ascii}
                  title="Optimized Circuit"
                />
              </Section>
            )}

            {!metrics && !simResult && !optResult && (
              <div className="flex flex-col items-center justify-center h-64 glass-card text-slate-500 gap-3">
                <div className="text-5xl">📊</div>
                <p className="text-sm">Paste circuit code and click Analyze to see metrics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
