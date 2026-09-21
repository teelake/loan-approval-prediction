import { useEffect, useRef, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { useAuth } from './AuthContext'

export default function ProfileMenu({ onSignOut, dark = false }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const initials = (user?.full_name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className={`profile-menu ${dark ? 'profile-menu-dark' : ''}`} ref={ref}>
      <button
        type="button"
        className="profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Profile"
      >
        <span className="profile-avatar" aria-hidden>
          {initials || <UserRound size={16} strokeWidth={1.75} />}
        </span>
        <span className="profile-trigger-text">
          <strong>{user?.full_name?.split(' ')[0] || 'User'}</strong>
        </span>
      </button>

      {open && (
        <div className="profile-dropdown" role="menu">
          <div className="profile-dropdown-head">
            <span className="profile-avatar lg" aria-hidden>
              {initials}
            </span>
            <div>
              <strong>{user?.full_name || 'User'}</strong>
              <span>{user?.email}</span>
              {user?.matric_number && <span>{user.matric_number}</span>}
            </div>
          </div>
          <button
            type="button"
            className="profile-dropdown-item"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut?.()
            }}
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
