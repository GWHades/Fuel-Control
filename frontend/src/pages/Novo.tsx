import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Novo() {
  const nav = useNavigate()
  const [posto, setPosto] = useState<'IPIRANGA' | 'OUTRO'>('IPIRANGA')
  const [valor, setValor] = useState('')
  const [litros, setLitros] = useState('')
  const [km, setKm] = useState('')
  const [observacao, setObservacao] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const v = Number(valor.replace(',', '.'))
    const l = Number(litros.replace(',', '.'))
    const k = Number(km)

    if (!v || !l || (!Number.isFinite(k) && k !== 0)) {
      setError('Preencha valor, litros e km corretamente.')
      return
    }

    setSaving(true)
    try {
      await api.post('/abastecimentos', { posto, valor: v, litros: l, km_odometro: k, observacao: observacao || null })
      nav('/lancamentos')
    } catch {
      setError('Falha ao salvar. Verifique sua conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Novo abastecimento</h2>
        <form className="grid" onSubmit={salvar}>
          <div className="row">
            <div>
              <label className="label">Posto</label>
              <select className="input" value={posto} onChange={e => setPosto(e.target.value as any)}>
                <option value="IPIRANGA">Ipiranga</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label className="label">KM do odômetro</label>
              <input className="input" inputMode="numeric" value={km} onChange={e => setKm(e.target.value)} placeholder="Ex.: 125430" />
            </div>
          </div>

          <div className="row">
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} placeholder="Ex.: 150,00" />
            </div>
            <div>
              <label className="label">Litros</label>
              <input className="input" inputMode="decimal" value={litros} onChange={e => setLitros(e.target.value)} placeholder="Ex.: 28,50" />
            </div>
          </div>

          <div>
            <label className="label">Observação (opcional)</label>
            <input className="input" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Ex.: Gasolina aditivada" />
          </div>

          {error && <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>{error}</div>}
          <button className="btn" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </form>
      </div>
    </div>
  )
}
