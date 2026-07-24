import { Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Standard from './pages/Standard'
import Search from './pages/Search'
import Glossary from './pages/Glossary'
import Quiz from './pages/Quiz'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-liquid-abyss text-silver-mist">
      <NavBar />
      {/* key=pathname 触发路由级淡入过渡 */}
      <main key={pathname} className="page-enter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/standard" element={<Standard />} />
          <Route path="/standard/:clauseId" element={<Standard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </main>
    </div>
  )
}
