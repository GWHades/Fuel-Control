import { useEffect, useState } from 'react'
import { api } from '../services/api'

type Row = {
  id: number
  data_hora: string
  posto: 'IPIRANGA' | 'OUTRO'
  valor: number
  litros: number
  km_odometro: number
  preco_por_litro?: number | null
  km_rodado?: number | null
  km_por_litro_aprox?: number | null
  custo_por_km?: number | null
}

export default function Lancamentos() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await api.get('/abastecimentos?order=desc&limit=200')
      setRows(res.data)
    } catch {
      setError('Não foi possível carregar os lançamentos.')
    } finally {
      setLoading(false)
    }
  }

  async function del(id: number) {
    if (!confirm('Excluir este lançamento?')) return
    try {
      await api.delete(`/abastecimentos/${id}`)
      await load()
    } catch {
      alert('Falha ao excluir.')
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <h2>Lançamentos</h2>
          <button className="btn small secondary" onClick={load}>Atualizar</button>
        </div>

        {loading && <p className="muted">Carregando...</p>}
        {error && <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>{error}</div>}

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Posto</th>
                <th>R$</th>
                <th>L</th>
                <th>R$/L</th>
                <th>KM</th>
                <th>KM rodado</th>
                <th>KM/L</th>
                <th>R$/KM</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.data_hora).toLocaleString()}</td>
                  <td><span className={`badge ${r.posto === 'IPIRANGA' ? 'ipi' : 'outro'}`}>{r.posto}</span></td>
                  <td>{r.valor.toFixed(2)}</td>
                  <td>{Number(r.litros).toFixed(3)}</td>
                  <td>{r.preco_por_litro ? r.preco_por_litro.toFixed(3) : '-'}</td>
                  <td>{r.km_odometro}</td>
                  <td>{(r.km_rodado ?? 0) > 0 ? r.km_rodado : '-'}</td>
                  <td>{(r.km_por_litro_aprox ?? 0) > 0 ? r.km_por_litro_aprox?.toFixed(3) : '-'}</td>
                  <td>{(r.custo_por_km ?? 0) > 0 ? r.custo_por_km?.toFixed(3) : '-'}</td>
                  <td><button className="btn small" onClick={() => del(r.id)}>Excluir</button></td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={10} className="muted">Nenhum lançamento ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          Km/L e R$/Km são aproximados e dependem do lançamento anterior (ordem cronológica).
        </p>
      </div>
    </div>
  )
}
