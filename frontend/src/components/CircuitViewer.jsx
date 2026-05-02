import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Code2 } from 'lucide-react'

export default function CircuitViewer({ imageB64, asciiRepr, title = 'Quantum Circuit' }) {
  const [zoom, setZoom] = useState(100)
  const [showAscii, setShowAscii] = useState(false)

  if (!imageB64 && !asciiRepr) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
        <div className="text-4xl">⚛️</div>
        <p className="text-sm">Generate a circuit to visualize it here</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        <div className="flex items-center gap-1">
          {asciiRepr && (
            <button
              id="toggle-ascii-btn"
              onClick={() => setShowAscii(s => !s)}
              className={`btn-ghost text-xs flex items-center gap-1
                          ${showAscii ? 'text-quantum-cyan' : ''}`}
            >
              <Code2 size={14} />
              ASCII
            </button>
          )}
          {imageB64 && !showAscii && (
            <>
              <button
                id="zoom-out-btn"
                onClick={() => setZoom(z => Math.max(30, z - 20))}
                className="btn-ghost p-1.5"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-slate-500 w-10 text-center">{zoom}%</span>
              <button
                id="zoom-in-btn"
                onClick={() => setZoom(z => Math.min(200, z + 20))}
                className="btn-ghost p-1.5"
              >
                <ZoomIn size={14} />
              </button>
              <button
                id="zoom-reset-btn"
                onClick={() => setZoom(100)}
                className="btn-ghost p-1.5"
              >
                <RotateCcw size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Display */}
      <div className="relative overflow-auto rounded-xl bg-space-800/80 border border-slate-700/50
                      max-h-64 min-h-32">
        {showAscii ? (
          <pre className="p-4 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre overflow-x-auto">
            {asciiRepr}
          </pre>
        ) : imageB64 ? (
          <div className="flex items-center justify-center p-3">
            <img
              id="circuit-image"
              src={`data:image/png;base64,${imageB64}`}
              alt="Quantum Circuit Diagram"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
              className="max-w-none"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
