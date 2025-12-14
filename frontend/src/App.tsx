import { Routes, Route } from 'react-router-dom'
import { Topbar } from './components/Topbar'
import { RequireAuth } from './components/RequireAuth'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Novo from './pages/Novo'
import Lancamentos from './pages/Lancamentos'
import Rapido from './pages/Rapido'

export default function App() {
  return (
    <>
      <Topbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/rapido" element={<RequireAuth><Rapido /></RequireAuth>} />
        <Route path="/novo" element={<RequireAuth><Novo /></RequireAuth>} />
        <Route path="/lancamentos" element={<RequireAuth><Lancamentos /></RequireAuth>} />
      </Routes>
    </>
  )
}
