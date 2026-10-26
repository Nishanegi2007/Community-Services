export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function api(path, options = {}) {
  const token = localStorage.getItem('adminToken')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const request = { ...options, headers: { ...headers, ...(options.headers || {}) } }
  if (options.body && !(options.body instanceof FormData)) {
    request.headers['Content-Type'] = 'application/json'
    request.body = JSON.stringify(options.body)
  }
  const res = await fetch(`${API}/api${path}`, request)
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && token && !path.includes('/login')) {
    localStorage.removeItem('adminToken')
    window.location.reload()
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}
