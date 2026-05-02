export default function MetricsCard({ icon, label, value, unit = '', color = 'indigo', subtitle }) {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      value: 'text-indigo-300',
    },
    violet: {
      bg: 'from-violet-500/10 to-violet-600/5',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
      value: 'text-violet-300',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-600/5',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      value: 'text-cyan-300',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      value: 'text-emerald-300',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      value: 'text-amber-300',
    },
    pink: {
      bg: 'from-pink-500/10 to-pink-600/5',
      border: 'border-pink-500/20',
      text: 'text-pink-400',
      value: 'text-pink-300',
    },
  }
  const c = colorMap[color] || colorMap.indigo

  return (
    <div className={`glass-card-hover p-5 bg-gradient-to-br ${c.bg} ${c.border} card-glow
                     flex flex-col gap-2 transition-transform duration-300 hover:-translate-y-1`}>
      <div className={`flex items-center gap-2 ${c.text} text-sm font-medium`}>
        {icon && <span className="text-lg">{icon}</span>}
        {label}
      </div>
      <div className={`text-3xl font-bold ${c.value}`}>
        {value !== undefined && value !== null ? value : '—'}
        {unit && <span className="text-lg font-normal ml-1 opacity-70">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  )
}
