import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Playground from './pages/Playground'
import Analyzer from './pages/Analyzer'
import Tutor from './pages/Tutor'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-space-900 bg-grid">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/tutor" element={<Tutor />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
