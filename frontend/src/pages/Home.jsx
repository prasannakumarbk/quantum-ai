import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Atom, Zap, BarChart3, GraduationCap, ArrowRight } from 'lucide-react'

// Particle canvas animation
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`
        ctx.fill()
      })
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

const features = [
  {
    icon: <Atom size={28} className="text-quantum-indigo" />,
    title: 'Natural Language Circuits',
    desc: 'Describe any quantum circuit in plain English. GPT-4 converts it to Qiskit code instantly.',
    link: '/playground',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/20',
  },
  {
    icon: <Zap size={28} className="text-quantum-cyan" />,
    title: 'Ideal & Noisy Simulation',
    desc: 'Run circuits on Aer simulators. Compare ideal results with realistic noise models.',
    link: '/playground',
    color: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/20',
  },
  {
    icon: <BarChart3 size={28} className="text-quantum-violet" />,
    title: 'Circuit Analysis Dashboard',
    desc: 'Depth, gate count, fidelity, optimization metrics — all in one beautiful dashboard.',
    link: '/analyzer',
    color: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-500/20',
  },
  {
    icon: <GraduationCap size={28} className="text-pink-400" />,
    title: 'AI Quantum Tutor',
    desc: 'Ask anything about quantum computing. Get clear, concept-driven explanations.',
    link: '/tutor',
    color: 'from-pink-500/10 to-pink-600/5',
    border: 'border-pink-500/20',
  },
]

const quickPrompts = [
  'Generate Bell state circuit',
  'Create 3-qubit GHZ state',
  'Grover algorithm for 2 qubits',
  'Quantum Fourier Transform (3 qubits)',
  'Quantum teleportation protocol',
  'Deutsch algorithm',
]

const stats = [
  { value: '50+', label: 'Supported Gates' },
  { value: '1024', label: 'Default Shots' },
  { value: '10', label: 'Max Qubits' },
  { value: '3', label: 'Optimization Levels' },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleCanvas />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-quantum-indigo/10 border border-quantum-indigo/30 mb-8">
            <Atom size={14} className="text-quantum-indigo" />
            <span className="text-xs text-quantum-glow font-semibold tracking-wide uppercase">
              Powered by Qiskit + GPT-4
            </span>
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-quantum-indigo via-quantum-violet to-quantum-cyan
                             bg-clip-text text-transparent quantum-glow">
              Quantum Computing
            </span>
            <br />
            <span className="text-slate-100">Made Intelligent</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate quantum circuits from natural language, simulate them with realistic noise,
            analyze metrics, and learn — all powered by AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              id="cta-playground"
              to="/playground"
              className="btn-primary btn-glow flex items-center gap-2 text-base px-8 py-3"
            >
              Open Playground
              <ArrowRight size={18} />
            </Link>
            <Link
              id="cta-analyzer"
              to="/analyzer"
              className="btn-secondary flex items-center gap-2 text-base px-8 py-3"
            >
              <BarChart3 size={18} />
              Circuit Analyzer
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-16">
            {stats.map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-quantum-indigo to-quantum-violet
                                bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="pb-16">
          <h2 className="section-title text-center mb-10">Everything You Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <Link
                key={f.title}
                to={f.link}
                className={`glass-card-hover p-6 bg-gradient-to-br ${f.color} ${f.border}
                             flex flex-col gap-4 hover:-translate-y-2 transition-all duration-300 card-glow`}
              >
                <div className="p-3 w-fit rounded-xl bg-space-800/60 border border-slate-700/40">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-auto">
                  Try it <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick prompts */}
        <section className="pb-24">
          <div className="glass-card p-8">
            <h2 className="section-title mb-2">Quick Start Prompts</h2>
            <p className="text-slate-400 text-sm mb-6">Click any prompt to open it in the Playground</p>
            <div className="flex flex-wrap gap-3">
              {quickPrompts.map(p => (
                <Link
                  key={p}
                  to={`/playground?prompt=${encodeURIComponent(p)}`}
                  className="px-4 py-2.5 bg-space-800/80 hover:bg-quantum-indigo/20 border border-slate-700
                             hover:border-quantum-indigo/50 rounded-xl text-sm text-slate-300
                             hover:text-quantum-glow transition-all duration-200 font-mono"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
