import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'
import { setAuthToken } from '../services/api'
import { setToken } from '../services/authStore'

export default function Login() {
  const nav = useNavigate()

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await login(username, password)
      setToken(data.access_token)
      setAuthToken(data.access_token)
      nav('/')
    } catch (err: any) {
      // Ajuda a enxergar o erro real no Console (F12)
      console.log('LOGIN ERROR =>', err?.response?.status, err?.response?.data, err?.message)
      setError('Falha no login. Verifique usuário e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: '24px auto' }}>
        <h2>Entrar</h2>
        <p className="muted">Use o usuário admin criado pelo backend (ADMIN_USER / ADMIN_PASS).</p>

        <form onSubmit={submit} className="grid">
          <div>
            <label className="label">Usuário</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              {error}
            </div>
          )}

          <button className="btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
