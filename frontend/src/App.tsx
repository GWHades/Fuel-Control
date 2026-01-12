import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL as string

export const api = axios.create({
  baseURL: API_URL,
})

// CORREÇÃO DE APARECIMENTO DE DADOS: Injetar token em todas as chamadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
