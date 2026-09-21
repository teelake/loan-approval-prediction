const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = data.detail
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(', ')
      : detail || 'Request failed'
    throw new Error(message)
  }
  return data
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/api/auth/me', { token }),
  options: () => request('/api/meta/options'),
  predict: (payload, token) =>
    request('/api/applications/predict', { method: 'POST', body: payload, token }),
  history: (token) => request('/api/applications/history', { token }),
  metrics: (token) => request('/api/admin/metrics', { token }),
  summary: (token) => request('/api/admin/summary', { token }),
  retrain: (token) => request('/api/admin/retrain', { method: 'POST', token }),
}