import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Grid2x2,
  Home,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  RefreshCw,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import ProfileMenu from '../ProfileMenu'

const AdminDataContext = createContext(null)

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be used within AdminLayout')
  return ctx
}

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', hint: 'Usage counts', icon: LayoutDashboard, group: 'reports' },
  { to: '/admin/performance', label: 'Performance', hint: 'Test metrics', icon: BarChart3, group: 'reports' },
  { to: '/admin/confusion', label: 'Confusion matrix', hint: 'Error counts', icon: Grid2x2, group: 'reports' },
  { to: '/admin/features', label: 'Feature importance', hint: 'Top variables', icon: ListOrdered, group: 'reports' },
  { to: '/admin/model', label: 'Retrain model', hint: 'Train from CSV', icon: RefreshCw, group: 'model' },
]

export default function AdminLayout() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [m, s] = await Promise.all([api.metrics(token), api.summary(token)])
      setMetrics(m)
      setSummary(s)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const onRetrain = useCallback(async () => {
    setRetraining(true)
    setError('')
    try {
      const m = await api.retrain(token)
      setMetrics(m)
      const s = await api.summary(token)
      setSummary(s)
    } catch (err) {
      setError(err.message)
    } finally {
      setRetraining(false)
    }
  }, [token])

  const value = useMemo(
    () => ({
      metrics,
      summary,
      error,
      loading,
      retraining,
      reload: load,
      retrain: onRetrain,
      setError,
    }),
    [metrics, summary, error, loading, retraining, load, onRetrain],
  )

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  const reportItems = NAV.filter((i) => i.group === 'reports')
  const modelItems = NAV.filter((i) => i.group === 'model')

  return (
    <AdminDataContext.Provider value={value}>
      <div className="admin-shell">
        <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
          <div className="admin-sidebar-brand">
            <div className="brand-mark">UI</div>
            <div>
              <strong>Admin</strong>
              <span>Loan prediction</span>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin">
            <p className="admin-nav-label">Reports</p>
            {reportItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="admin-nav-icon" aria-hidden>
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="admin-nav-copy">
                    <span className="admin-nav-title">{item.label}</span>
                    <span className="admin-nav-hint">{item.hint}</span>
                  </span>
                </NavLink>
              )
            })}
            <p className="admin-nav-label">Model</p>
            {modelItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="admin-nav-icon" aria-hidden>
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="admin-nav-copy">
                    <span className="admin-nav-title">{item.label}</span>
                    <span className="admin-nav-hint">{item.hint}</span>
                  </span>
                </NavLink>
              )
            })}
          </nav>

          <div className="admin-sidebar-foot">
            <NavLink to="/" className="admin-side-link" onClick={() => setMenuOpen(false)}>
              <Home size={16} strokeWidth={1.75} />
              Back to site
            </NavLink>
            <button type="button" className="admin-side-link" onClick={handleSignOut}>
              <LogOut size={16} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </aside>

        {menuOpen && (
          <button
            type="button"
            className="admin-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <div className="admin-main">
          <header className="admin-top">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu size={18} strokeWidth={1.75} />
              Menu
            </button>
            <div className="admin-top-actions">
              <span className="admin-pill">Admin</span>
              <ProfileMenu onSignOut={handleSignOut} />
            </div>
          </header>

          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminDataContext.Provider>
  )
}
