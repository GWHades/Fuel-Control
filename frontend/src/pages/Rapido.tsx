import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

type Posto = 'IPIRANGA' | 'OUTRO'

export default function Rapido() {
  const nav = useNavigate()
  const [posto, setPosto] = useState<Posto>('IPIRANGA')
  const [valor, setValor] = useState('')
  const [litros, setLitros] = useState('')
  const [km, setKm] = useState('')
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function salvar(continuar: boolean) {
    setErr(null)
    setMsg(null)

    const v = Number(valor.replace(',', '.'))
    const l = Number(litros.replace(',', '.'))
    const k = Number(km.replace(',', '.'))

    if (!posto) return setErr('Selecione o posto.')
    if (!v || v <= 0) return setErr('Informe um valor válido.')
    if (!l || l <= 0) return setErr('Informe litros válidos.')
    if (!k || k <= 0) return setErr('Informe a quilometragem.')

    setLoading(true)
    try {
      await api.post('/abastecimentos', {
        posto,
        valor: v,
        litros: l,
        km_odometro: k,
        observacao: obs?.trim() || null,
      })

      // feedback de app (vibração curta no celular, se disponível)
      if (navigator.vibrate) navigator.vibrate(40)

      setMsg('Salvo com sucesso.')
      if (continuar) {
        setValor('')
        setLitros('')
        setObs('')
        // mantém km para facilitar (você pode escolher apagar se preferir)
      } else {
        nav('/')
      }
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      setErr(typeof detail === 'string' ? detail : 'Falha ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 560, margin: '16px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2>Lançamento Rápido</h2>
            <p className="muted">Ideal para usar no posto pelo celular.</p>
          </div>
          <button className="btn secondary small" onClick={() => nav('/')}>Voltar</button>
        </div>

        <div className="grid" style={{ marginTop: 12 }}>
          <div>
            <label className="label">Posto</label>
            <select className="input" value={posto} onChange={e => setPosto(e.target.value as Posto)}>
              <option value="IPIRANGA">IPIRANGA</option>
              <option value="OUTRO">OUTRO</option>
            </select>
          </div>

          <div>
            <label className="label">Valor (R$)</label>
            <input
              className="input"
              value={valor}
              onChange={e => setValor(e.target.value)}
              inputMode="decimal"
              placeholder="Ex.: 150,00"
            />
          </div>

          <div>
            <label className="label">Litros</label>
            <input
              className="input"
              value={litros}
              onChange={e => setLitros(e.target.value)}
              inputMode="decimal"
              placeholder="Ex.: 28,50"
            />
          </div>

          <div>
            <label className="label">Quilometragem</label>
            <input
              className="input"
              value={km}
              onChange={e => setKm(e.target.value)}
              inputMode="numeric"
              placeholder="Ex.: 125430"
            />
          </div>

          <div>
            <label className="label">Observação (opcional)</label>
            <input
              className="input"
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Ex.: Gasolina aditivada"
            />
          </div>

          {err && (
            <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
              {err}
            </div>
          )}
          {msg && (
            <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              {msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" disabled={loading} onClick={() => salvar(false)}>
              {loading ? 'Salvando...' : 'Salvar e voltar'}
            </button>
            <button className="btn secondary" disabled={loading} onClick={() => salvar(true)}>
              {loading ? 'Salvando...' : 'Salvar e continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
