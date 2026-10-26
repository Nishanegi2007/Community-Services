import { useState } from 'react'
import { api } from '../api.js'
export default function Login({ onLogin }) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { const data = await api('/login', { method: 'POST', body: { userId, password } }); localStorage.setItem('adminToken', data.token); onLogin() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="adm-login"><form className="adm-box" onSubmit={handleSubmit}>
    <p className="adm-eyebrow">ALICE PUBLIC SCHOOL</p><h1 style={{ fontSize: '1.6rem', margin: 0 }}>Admin sign in</h1><p className="adm-muted">Sign in to manage admissions and school updates.</p>
    <label>User ID<input autoComplete="username" value={userId} onChange={e => setUserId(e.target.value)} required /></label>
    <label>Password<input autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
    {error && <div className="error" role="alert">{error}</div>}<button className="btn" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in securely'}</button>
    <a href="/">← Back to school website</a>
  </form></div>
}
