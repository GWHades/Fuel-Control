import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type Summary = {
  quinzena_label: string
  ipiranga_limite: number
  gasto_ipiranga_quinzena: number
  saldo_ipiranga_quinzena: number
  percentual_usado: number
  total_gasto_quinzena: number
  total_litros_quinzena: number
  media_preco_litro_quinzena: number | null
  labels: string[]
  gastos_por_dia: number[]
  preco_litro_por_lancamento: number[]
  km_por_litro_por_lancamento: number[]
}

function alertStyle(level: 'ok' | 'warn70' | 'warn90' | 'over') {
  // Estilos simples sem depender de novas classes CSS
  const base: React.CSSProperties = { borderRadius: 14, padding: 12, border: '1px solid #e5e7eb' }
  if (level === 'ok') return { ...base, background: '#f9fafb' }
  if (level === 'warn70') return { ...base, background: '#fffbeb', border: '1px solid #fde68a' } // amarelo
  if (level === 'warn90') return { ...base, background: '#fff7ed', border: '1px solid #fdba74' } // laranja
  return { ...base, background: '#fff1f2', border: '1px solid #fecdd3' } // vermelho
}

function alertText(level: 'ok' | 'warn70' | 'warn90' | 'over', pct: number) {
  if (level === 'over') return `Limite estourado: ${pct.toFixed(2)}% do limite Ipiranga nesta quinzena.`
  if (level === 'warn90') return `Atenção: você já usou ${pct.toFixed(2)}% do limite Ipiranga (≥ 90%).`
  if (level === 'warn70') return `Alerta: você já usou ${pct.toFixed(2)}% do limite Ipiranga (≥ 70%).`
  return 'Tudo ok com o limite Ipiranga nesta quinzena.'
}

function computeLevel(pct: number): 'ok' | 'warn70' | 'warn90' | 'over' {
  if (pct >= 100) return 'over'
  if (pct >= 90) return 'warn90'
  if (pct >= 70) return 'warn70'
  return 'ok'
}

function thresholdKey(level: 'warn70' | 'warn90' | 'over', quinzena: string) {
  return `fuel_alert_${quinzena}_${level}`
}

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const progress = useMemo(() => {
    if (!data) return 0
    const pct = Number(data.percentual_usado ?? 0)
    return Math.min(100, Math.max(0, pct))
  }, [data])

  const rawPct = useMemo(() => Number(data?.percentual_usado ?? 0), [data])
  const level = useMemo(() => computeLevel(rawPct), [rawPct])

  // ALERTA AUTOMÁTICO (uma vez por quinzena por nível)
  useEffect(() => {
    if (!data) return

    // só alertar nos níveis de atenção
    if (level === 'ok') return

    const quinzena = data.quinzena_label || 'unknown'
    let key: string | null = null

    if (level === 'warn70') key = thresholdKey('warn70', quinzena)
    if (level === 'warn90') key = thresholdKey('warn90', quinzena)
    if (level === 'over') key = thresholdKey('over', quinzena)

    if (!key) return

    const already = localStorage.getItem(key)
    if (already) return

    // marca como já exibido nesta quinzena
    localStorage.setItem(key, '1')

    // alerta simples (funciona no PC e celular)
    window.alert(alertText(level, rawPct))
  }, [data, level, rawPct])

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

        {/* Banner do alerta */}
        {data && (
          <div style={{ marginTop: 12, ...alertStyle(level) }}>
            <strong>Alerta de limite</strong>
            <div className="muted" style={{ marginTop: 4 }}>
              {alertText(level, rawPct)}
            </div>
          </div>
        )}

        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="muted">Gasto Ipiranga (quinzena)</div>
            <div className="kpi">R$ {data?.gasto_ipiranga_quinzena?.toFixed(2) ?? '0,00'}</div>
            <div className="muted">
              Saldo: R$ {data?.saldo_ipiranga_quinzena?.toFixed(2) ?? '0,00'}
            </div>
            <div className="progress" style={{ marginTop: 10 }}>
              <div style={{ width: `${progress}%` }} />
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              Usado: {rawPct.toFixed(2)}%
            </div>
          </div>

          <div className="card">
            <div className="muted">Total gasto (quinzena)</div>
            <div className="kpi">R$ {data?.total_gasto_quinzena?.toFixed(2) ?? '0,00'}</div>
            <div className="muted">Litros: {data?.total_litros_quinzena?.toFixed(3) ?? '0,000'}</div>
          </div>

          <div className="card">
            <div className="muted">Preço médio/L (quinzena)</div>
            <div className="kpi">
              {data?.media_preco_litro_quinzena ? `R$ ${data.media_preco_litro_quinzena.toFixed(3)}` : '-'}
            </div>
            <div className="muted">Cálculo: total gasto ÷ total litros</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
          {error}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h3>Gastos por dia</h3>
          <Line
            data={{
              labels: data?.labels ?? [],
              datasets: [{ label: 'R$ por dia', data: data?.gastos_por_dia ?? [] }],
            }}
          />
        </div>

        <div className="card">
          <h3>Preço/L por lançamento</h3>
          <Line
            data={{
              labels: (data?.preco_litro_por_lancamento ?? []).map((_, i) => `#${i + 1}`),
              datasets: [{ label: 'R$/L', data: data?.preco_litro_por_lancamento ?? [] }],
            }}
          />
        </div>

        <div className="card">
          <h3>Km/L (aprox.) por lançamento</h3>
          <p className="muted">
            Aproximação: (km atual - km anterior) ÷ litros do lançamento.
          </p>
          <Line
            data={{
              labels: (data?.km_por_litro_por_lancamento ?? []).map((_, i) => `#${i + 1}`),
              datasets: [{ label: 'km/l', data: data?.km_por_litro_por_lancamento ?? [] }],
            }}
          />
        </div>
      </div>
    </div>
  )
}
