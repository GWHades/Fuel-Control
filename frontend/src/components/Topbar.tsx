import { Link, useLocation } from 'react-router-dom'
import { clearToken } from '../services/authStore'
import { setAuthToken } from '../services/api'

export function Topbar() {
  const loc = useLocation()

  function sair() {
    clearToken()
    setAuthToken(null)
    window.location.href = '/login'
  }

  const active = (path: string) => (loc.pathname === path ? { fontWeight: 700 } : undefined)

  return (
    <div className="topbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
        <div style={{ fontWeight: 800 }}>Fuel Control</div>

        <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/" style={active('/')}>Dashboard</Link>
          <Link to="/rapido" style={active('/rapido')}>Rápido</Link>
          <Link to="/novo" style={active('/novo')}>Novo</Link>
          <Link to="/lancamentos" style={active('/lancamentos')}>Lançamentos</Link>
        </nav>

        <div style={{ marginLeft: 'auto' }}>
          <button className="btn small secondary" onClick={sair}>Sair</button>
        </div>
      </div>
    </div>
  )
}
