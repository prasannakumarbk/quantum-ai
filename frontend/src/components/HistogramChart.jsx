import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function HistogramChart({ idealCounts = {}, noisyCounts = null, title = 'Measurement Results' }) {
  if (Object.keys(idealCounts).length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Run a simulation to see the histogram
      </div>
    )
  }

  const states = [...new Set([
    ...Object.keys(idealCounts),
    ...(noisyCounts ? Object.keys(noisyCounts) : [])
  ])].sort()

  const datasets = [
    {
      label: 'Ideal',
      data: states.map(s => idealCounts[s] || 0),
      backgroundColor: 'rgba(99, 102, 241, 0.75)',
      borderColor: '#818cf8',
      borderWidth: 1,
      borderRadius: 6,
    },
  ]

  if (noisyCounts) {
    datasets.push({
      label: 'Noisy',
      data: states.map(s => noisyCounts[s] || 0),
      backgroundColor: 'rgba(245, 158, 11, 0.75)',
      borderColor: '#fcd34d',
      borderWidth: 1,
      borderRadius: 6,
    })
  }

  const chartData = {
    labels: states.map(s => `|${s}⟩`),
    datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } },
      },
      title: {
        display: !!title,
        text: title,
        color: '#f1f5f9',
        font: { family: 'Inter', size: 14, weight: 'bold' },
        padding: { bottom: 12 },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 12 } },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        beginAtZero: true,
      },
    },
  }

  return (
    <div id="histogram-chart" className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}
