import { Link, useLocation } from 'react-router-dom'
import { Atom, FlaskConical, BarChart3, GraduationCap, Zap } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home', icon: <Zap size={16} /> },
  { to: '/playground', label: 'Playground', icon: <Atom size={16} /> },
  { to: '/analyzer', label: 'Analyzer', icon: <BarChart3 size={16} /> },
  { to: '/tutor', label: 'AI Tutor', icon: <GraduationCap size={16} /> },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 backdrop-blur-xl bg-space-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-quantum-indigo to-quantum-violet
                          flex items-center justify-center shadow-lg shadow-quantum-indigo/30
                          group-hover:shadow-quantum-indigo/60 transition-all duration-300">
            <Atom size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-quantum-indigo via-quantum-violet to-quantum-cyan
                           bg-clip-text text-transparent">
            QuantumCopilot
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                id={`nav-${label.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${active
                              ? 'bg-quantum-indigo/20 text-quantum-glow border border-quantum-indigo/30'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-space-700/60'
                            }`}
              >
                {icon}
                {label}
              </Link>
            )
          })}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-space-700/60 border border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">Qiskit Ready</span>
        </div>
      </div>
    </nav>
  )
}
