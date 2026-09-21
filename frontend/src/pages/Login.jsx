import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { loginSuccess, isAuthenticated, isAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
  }, [isAuthenticated, isAdmin, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login({ email, password })
      loginSuccess(data)
      navigate(data.user.is_admin ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-narrow" style={{ margin: '0 auto' }}>
      <div className="auth-card">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <p className="eyebrow">Account</p>
          <h1>Sign in</h1>
          <p>Sign in with your registered email and password.</p>
        </div>
        <div className="surface">
          {error && <div className="notice notice-error">{error}</div>}
          <form className="form-stack" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0, marginTop: '0.25rem' }}>
              <button className="btn btn-ink" style={{ width: '100%' }} disabled={loading} type="submit">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
          <p className="auth-aside">
            No account? <Link className="link" to="/register">Register</Link>
          </p>
          <p className="auth-hint">Admin demo: admin@ui.edu.ng / admin123</p>
        </div>
      </div>
    </div>
  )
}
