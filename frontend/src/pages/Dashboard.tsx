import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { clearToken } from '../services/authStore';

interface Summary {
  total_mes: number;
  total_quinzena: number;
  litros_mes: number;
}

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => setData(res.data))
      .catch(() => {});
  }, []);

  function logout() {
    clearToken();
    window.location.href = '/login';
  }

  if (!data) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      <p>Total do mês: R$ {data.total_mes.toFixed(2)}</p>
      <p>Total da quinzena: R$ {data.total_quinzena.toFixed(2)}</p>
      <p>Litros no mês: {data.litros_mes}</p>

      <button onClick={logout}>Sair</button>
    </div>
  );
}
