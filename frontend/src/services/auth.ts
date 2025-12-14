import { api } from './api'

export type LoginResponse = {
  access_token: string
  token_type: string
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>(
    '/auth/login',
    { username, password },
    { headers: { 'Content-Type': 'application/json' } }
  )
  return res.data
}
