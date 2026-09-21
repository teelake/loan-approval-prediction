import { useState } from 'react'
import {
  FileText,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
} from 'lucide-react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import ProfileMenu from './ProfileMenu'

const NAV = [
  {
    to: '/dashboard',
    end: true,
    label: 'Dashboard',
    hint: 'Your overview',
    icon: LayoutDashboard,
  },
  {
    to: '/apply',
    label: 'Apply',
    hint: 'New prediction',
    icon: FileText,
    alsoActive: ['/result'],
  },
  {
    to: '/history',
    label: 'History',
    hint: 'Past results',
    icon: History,
  },
]

export default function StudentLayout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Student'

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="brand-mark">UI</div>
          <div>
            <strong>{firstName}</strong>
            <span>Student area</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Student">
          <p className="admin-nav-label">Menu</p>
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  const extra = item.alsoActive?.includes(pathname)
                  return `admin-nav-item${isActive || extra ? ' active' : ''}`
                }}
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
            <span className="admin-pill">Student</span>
            <ProfileMenu onSignOut={handleSignOut} />
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
