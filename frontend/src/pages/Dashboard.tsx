import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // CORREÇÃO 1: 'true' em JavaScript deve ser minúsculo
        setLoading(true); 
        
        const response = await api.get('/dashboard/summary');
        setData(response.data);
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Iniciando sistema...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CORREÇÃO 2: Verificação de existência para evitar erro de .toFixed() em nulo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase">Gasto Mensal</p>
          <p className="text-2xl font-black text-green-600">
            R$ {data?.total_mes ? data.total_mes.toFixed(2) : "0,00"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase">Quinzena Atual</p>
          <p className="text-2xl font-black text-blue-600">
            R$ {data?.total_quinzena ? data.total_quinzena.toFixed(2) : "0,00"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase">Litros (Mês)</p>
          <p className="text-2xl font-black text-orange-600">
            {data?.litros_mes ? data.litros_mes.toFixed(2) : "0"}L
          </p>
        </div>
      </div>
    </div>
  );
}
