import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

type Abastecimento = {
  id: number
  posto: 'IPIRANGA' | 'OUTRO'
  valor: number
  litros: number
  km_odometro: number
  observacao?: string | null
  created_at: string
}

export default function Lancamentos() {
  const [items, setItems] = useState<Abastecimento[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const res = await api.get('/abastecimentos')
      // garante ordenação por km (ou data) para cálculo consistente
      const arr = (res.data as Abastecimento[]).slice().sort((a, b) => a.km_odometro - b.km_odometro)
      setItems(arr)
    } catch {
      setError('Não foi possível carregar lançamentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const computed = useMemo(() => {
    return items.map((it, idx) => {
      const prev = idx > 0 ? items[idx - 1] : null
      const dist = prev ? (it.km_odometro - prev.km_odometro) : null
      const kml = dist !== null && dist > 0 && it.litros > 0 ? dist / it.litros : null
      const precoL = it.litros > 0 ? it.valor / it.litros : null
      return { ...it, dist, kml, precoL }
    })
  }, [items])

  async function remover(id: number) {
    if (!confirm('Deseja excluir este lançamento?')) return
    try {
      await api.delete(`/abastecimentos/${id}`)
      await load()
    } catch {
      alert('Falha ao excluir.')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <h2>Lançamentos</h2>
            <p className="muted">Agora com cálculo de distância e km/l por lançamento.</p>
          </div>
          <button className="btn small secondary" onClick={load} disabled={loading}>
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        {error && (
          <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3', marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Posto</th>
                <th>R$</th>
                <th>L</th>
                <th>KM</th>
                <th>Dist.</th>
                <th>Km/L</th>
                <th>R$/L</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {computed.map((it) => (
                <tr key={it.id}>
                  <td>{new Date(it.created_at).toLocaleString()}</td>
                  <td>{it.posto}</td>
                  <td>R$ {it.valor.toFixed(2)}</td>
                  <td>{it.litros.toFixed(3)}</td>
                  <td>{it.km_odometro}</td>
                  <td>{it.dist === null ? '-' : it.dist <= 0 ? '⚠️' : it.dist}</td>
                  <td>{it.kml === null ? '-' : it.kml.toFixed(2)}</td>
                  <td>{it.precoL === null ? '-' : it.precoL.toFixed(3)}</td>
                  <td>
                    <button className="btn small secondary" onClick={() => remover(it.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {computed.length === 0 && !error && (
                <tr>
                  <td colSpan={9} className="muted">Nenhum lançamento ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          Observação: o km/l é estimado por diferença de km entre lançamentos consecutivos (ordenados por km).
        </p>
      </div>
    </div>
  )
}
