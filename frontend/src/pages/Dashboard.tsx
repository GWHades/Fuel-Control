import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';

export function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/summary');
        setSummary(response.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando dados otimizados...</span>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Resumo de Abastecimentos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 uppercase font-semibold">Total no Mês</p>
          <p className="text-3xl font-bold text-green-600">R$ {summary?.total_mes.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 uppercase font-semibold">Total na Quinzena</p>
          <p className="text-3xl font-bold text-blue-600">R$ {summary?.total_quinzena.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 uppercase font-semibold">Litros (Mês)</p>
          <p className="text-3xl font-bold text-orange-600">{summary?.litros_mes.toFixed(2)}L</p>
        </div>
      </div>

      {/* Tabela de registros recentes - Já vem limitada do backend */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Veículo</th>
              <th className="p-4 font-semibold text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {summary?.recent_entries.map((entry: any) => (
              <tr key={entry.id} className="border-t border-gray-100">
                <td className="p-4">{new Date(entry.data_hora).toLocaleDateString()}</td>
                <td className="p-4">{entry.veiculo}</td>
                <td className="p-4 text-right">R$ {entry.valor.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
