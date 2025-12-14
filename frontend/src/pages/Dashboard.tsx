import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

type Summary = {
  quinzena_label: string
  ipiranga_limite: number
  gasto_ipiranga_quinzena: number
  saldo_ipiranga_quinzena: number
  percentual_usado: number
  total_gasto_quinzena: number
  total_litros_quinzena: number
  media_preco_litro_quinzena: number | null
}

function levelOf(pct: number): 'ok' | 'warn70' | 'warn90' | 'over' {
  if (pct >= 100) return 'over'
  if (pct >= 90) return 'warn90'
  if (pct >= 70) return 'warn70'
  return 'ok'
}

function levelText(level: string, pct: number) {
  if (level === 'over') return `Limite estourado: ${pct.toFixed(2)}% do limite Ipiranga nesta quinzena.`
  if (level === 'warn90') return `Atenção: ${pct.toFixed(2)}% do limite Ipiranga (≥ 90%).`
  if (level === 'warn70') return `Alerta: ${pct.toFixed(2)}% do limite Ipiranga (≥ 70%).`
  return 'Tudo ok com o limite Ipiranga nesta quinzena.'
}

function styleFor(level: string): React.CSSProperties {
  const base: React.CSSProperties = { borderRadius: 14, padding: 12, border: '1px solid #e5e7eb' }
  if (level === 'warn70') return { ...base, background: '#fffbeb', border: '1px solid #fde68a' }
  if (level === 'warn90') return { ...base, background: '#fff7ed', border: '1px solid #fdba74' }
  if (level === 'over') return { ...base, background: '#fff1f2', border: '1px solid #fecdd3' }
  return { ...base, background: '#f9fafb' }
}

function alertKey(quinzena: string, level: string) {
  return `fuel_alert_${quinzena}_${level}`
}

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ title: string; text: string } | null>(null)

  async function load() {
    setError(null)
    try {
      const res = await api.get('/dashboard/summary')
      setData(res.data)
    } catch {
      setError('Não foi possível carregar o dashboard.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const pct = useMemo(() => Number(data?.percentual_usado ?? 0), [data])
  const level = useMemo(() => levelOf(pct), [pct])
  const progress = useMemo(() => Math.min(100, Math.max(0, pct)), [pct])

  // alerta automático “cara de app” (modal + vibração) uma vez por quinzena por nível
  useEffect(() => {
    if (!data) return
    if (level === 'ok') return

    const key = alertKey(data.quinzena_label || 'unknown', level)
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')

    if (navigator.vibrate) navigator.vibrate([60, 40, 60])

    setModal({
      title: 'Alerta de limite (Ipiranga)',
      text: levelText(level, pct),
    })
  }, [data, level, pct])

  return (
    <div className="container grid">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <h2>Dashboard</h2>
            <p className="muted">
              Quinzena: <strong>{data?.quinzena_label ?? '-'}</strong> • Limite Ipiranga: R$ {data?.ipiranga_limite?.toFixed(2) ?? '0,00'}
            </p>
          </div>
          <button className="btn small secondary" onClick={load}>Atualizar</button>
        </div>

        {data && (
          <div style={{ marginTop: 12, ...styleFor(level) }}>
            <strong>Alerta de limite</strong>
            <div className="muted" style={{ marginTop: 4 }}>
              {levelText(level, pct)}
            </div>
          </div>
        )}

        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="muted">Gasto Ipiranga (quinzena)</div>
            <div className="kpi">R$ {data?.gasto_ipiranga_quinzena?.toFixed(2) ?? '0,00'}</div>
            <div className="muted">Saldo: R$ {data?.saldo_ipiranga_quinzena?.toFixed(2) ?? '0,00'}</div>

            <div className="progress" style={{ marginTop: 10 }}>
              <div style={{ width: `${progress}%` }} />
            </div>
            <div className="muted" style={{ marginTop: 6 }}>Usado: {pct.toFixed(2)}%</div>
          </div>

          <div className="card">
            <div className="muted">Total gasto (quinzena)</div>
            <div className="kpi">R$ {data?.total_gasto_quinzena?.toFixed(2) ?? '0,00'}</div>
            <div className="muted">Litros: {data?.total_litros_quinzena?.toFixed(3) ?? '0,000'}</div>
          </div>

          <div className="card">
            <div className="muted">Preço médio/L (quinzena)</div>
            <div className="kpi">{data?.media_preco_litro_quinzena ? `R$ ${data.media_preco_litro_quinzena.toFixed(3)}` : '-'}</div>
            <div className="muted">Cálculo: total gasto ÷ total litros</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
          {error}
        </div>
      )}

      {/* Modal simples */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, zIndex: 50
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: 'min(560px, 100%)' }}
          >
            <h3 style={{ marginTop: 0 }}>{modal.title}</h3>
            <p className="muted">{modal.text}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn" onClick={() => setModal(null)}>Entendi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
