import { Link, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../services/authStore'

export function Topbar() {
  const nav = useNavigate()
  const token = getToken()
  function logout() { clearToken(); nav('/login') }

  return (
    <div className="topbar">
      <div className="container">
        <div className="nav">
          <strong>Controle de Abastecimento</strong>
          {token && (
            <>
              <Link className="btn small secondary" to="/">Dashboard</Link>
              <Link className="btn small secondary" to="/novo">Novo</Link>
              <Link className="btn small secondary" to="/lancamentos">Lançamentos</Link>
              <button className="btn small" onClick={logout}>Sair</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
