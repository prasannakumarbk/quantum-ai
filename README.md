# QuantumCopilot

> AI-powered quantum computing assistant: generate circuits from natural language, simulate with noise, analyze metrics, and learn quantum computing.

---

## Quick Start

### 1. Add your Gemini API key
Edit `backend/.env`:
```
GEMINI_API_KEY=your-gemini-key-here
GEMINI_MODEL=gemini-2.0-flash-lite
```

### 2. Start everything
Double-click **`start.bat`** — or run manually:

**Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Open → **http://localhost:5173**

---

## Pages

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | Landing page with animated quantum particles |
| `/playground` | Quantum Playground | Chat → circuit generation + simulation |
| `/analyzer` | Circuit Analyzer | Paste code → metrics, histogram, optimization |
| `/tutor` | AI Quantum Tutor | Multi-turn quantum education chatbot |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /generate-circuit` | POST | NL → Qiskit circuit |
| `POST /simulate` | POST | Ideal + noisy simulation |
| `POST /analyze` | POST | Depth, gates, qubit metrics |
| `POST /optimize` | POST | Transpiler optimization L3 |
| `POST /explain` | POST | AI circuit explanation |
| `POST /explain/tutor` | POST | Quantum tutor chat |

Interactive API docs: **http://localhost:8000/docs**

---

## Project Structure

```
quantumcopilot/
├── start.bat                    # One-click launcher
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt
│   ├── .env                     # Add your API key here
│   ├── routers/
│   │   ├── generate.py          # /generate-circuit
│   │   ├── simulate.py          # /simulate
│   │   ├── analyze.py           # /analyze
│   │   ├── optimize.py          # /optimize
│   │   └── explain.py           # /explain + /explain/tutor
│   └── services/
│       ├── llm_service.py       # Gemini (Google) + demo fallback
│       └── circuit_service.py   # Qiskit utilities
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Playground.jsx
        │   ├── Analyzer.jsx
        │   └── Tutor.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ChatPanel.jsx
        │   ├── CircuitViewer.jsx
        │   ├── MetricsCard.jsx
        │   └── HistogramChart.jsx
        └── api/
            └── quantumApi.js
```
