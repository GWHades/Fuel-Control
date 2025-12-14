import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

type Posto = 'IPIRANGA' | 'OUTRO'
type Abastecimento = { km_odometro: number }

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

  // ✅ auto-KM: puxa o último km registrado e preenche ao abrir a tela
  useEffect(() => {
    let mounted = true

    async function fetchLastKm() {
      try {
        // pega 1 item mais recente
        const res = await api.get('/abastecimentos', { params: { limit: 1, order: 'desc' } })
        const rows = res.data as Abastecimento[]
        if (!mounted) return

        if (rows && rows.length > 0 && rows[0].km_odometro) {
          // só preenche se o campo estiver vazio (não atrapalha se você já digitou)
          setKm((prev) => (prev?.trim() ? prev : String(rows[0].km_odometro)))
        }
      } catch {
        // silencioso: não bloqueia a tela se falhar
      }
    }

    fetchLastKm()
    return () => { mounted = false }
  }, [])

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

      if (navigator.vibrate) navigator.vibrate(40)

      setMsg('Salvo com sucesso.')
      if (continuar) {
        setValor('')
        setLitros('')
        setObs('')
        // mantém km preenchido para agilizar próximos lançamentos
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
            <p className="muted">Ideal para usar no posto pelo celular. O KM é preenchido automaticamente com o último registro.</p>
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
            <div className="muted" style={{ marginTop: 4 }}>
              Dica: se precisar, ajuste o KM manualmente antes de salvar.
            </div>
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
