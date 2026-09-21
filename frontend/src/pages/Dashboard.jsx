import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <>
      <section className="welcome-band">
        <p className="eyebrow">Dashboard</p>
        <h1>{user?.full_name}</h1>
        <p className="welcome-meta">
          {user?.matric_number} · {user?.faculty} · {user?.academic_level} Level
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/apply">
            New prediction
          </Link>
          <Link className="btn btn-ghost" to="/history">
            View history
          </Link>
        </div>
      </section>

      <div className="surface">
        <div className="notice notice-info" style={{ marginBottom: 0 }}>
          Use Apply to submit your academic and financial details. The system returns a
          predicted outcome and approval probability. This is not an official loan decision.
        </div>
      </div>
    </>
  )
}
