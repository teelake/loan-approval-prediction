import { Home, LayoutDashboard, LogIn, Shield, UserPlus } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import ProfileMenu from './ProfileMenu'

export default function Layout() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <div className="brand-mark">UI</div>
          <div className="brand-text">
            <span className="brand-name">University of Ibadan</span>
            <span className="brand-sub">Loan approval prediction</span>
          </div>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className="nav-item-icon">
            <Home size={16} strokeWidth={1.75} />
            Home
          </NavLink>
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <NavLink to="/admin" className="nav-cta nav-item-icon">
                  <Shield size={16} strokeWidth={1.75} />
                  Admin
                </NavLink>
              ) : (
                <NavLink to="/dashboard" className="nav-cta nav-item-icon">
                  <LayoutDashboard size={16} strokeWidth={1.75} />
                  Dashboard
                </NavLink>
              )}
              <ProfileMenu onSignOut={handleSignOut} dark />
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-item-icon">
                <LogIn size={16} strokeWidth={1.75} />
                Sign in
              </NavLink>
              <NavLink to="/register" className="nav-cta nav-item-icon">
                <UserPlus size={16} strokeWidth={1.75} />
                Register
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className={isHome ? 'page page-wide' : 'page'}>
        <Outlet />
      </main>

      <footer className="footer">
        <span>University of Ibadan · Group 6</span>
        <span>Course project · 2026</span>
      </footer>
    </div>
  )
}
