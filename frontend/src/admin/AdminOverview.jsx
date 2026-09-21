import { Link } from 'react-router-dom'
import { useAdminData } from './AdminLayout'

export default function AdminOverview() {
  const { summary, metrics, loading, error } = useAdminData()

  if (loading) return <div className="admin-loading">Loading…</div>

  const approved = summary?.predicted_approved ?? 0
  const rejected = summary?.predicted_rejected ?? 0
  const total = approved + rejected
  const approveRate = total ? Math.round((approved / total) * 100) : 0

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Dashboard</h1>
          <p>Application counts and current model test scores.</p>
        </div>
      </header>

      {error && <div className="notice notice-error">{error}</div>}

      <div className="admin-kpi-grid">
        <article className="admin-kpi">
          <span>Students</span>
          <strong>{summary?.students ?? 0}</strong>
        </article>
        <article className="admin-kpi">
          <span>Applications</span>
          <strong>{summary?.applications ?? 0}</strong>
        </article>
        <article className="admin-kpi">
          <span>Predicted approved</span>
          <strong>{approved}</strong>
        </article>
        <article className="admin-kpi">
          <span>Predicted rejected</span>
          <strong>{rejected}</strong>
        </article>
      </div>

      <div className="admin-grid-2">
        <section className="admin-card">
          <h2>Model summary</h2>
          <p className="muted">
            Random Forest · {metrics?.n_estimators ?? 300} trees · test set{' '}
            {metrics?.test_size ?? '—'}
          </p>
          <div className="admin-snapshot">
            <div>
              <em>{metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '—'}</em>
              <span>Accuracy</span>
            </div>
            <div>
              <em>{metrics ? `${(metrics.f1_score * 100).toFixed(1)}%` : '—'}</em>
              <span>F1-score</span>
            </div>
            <div>
              <em>{total ? `${approveRate}%` : '—'}</em>
              <span>Approved (live)</span>
            </div>
          </div>
          <div className="admin-card-actions">
            <Link className="btn btn-ink" to="/admin/performance">
              Open performance
            </Link>
            <Link className="btn btn-outline" to="/admin/model">
              Retrain model
            </Link>
          </div>
        </section>

        <section className="admin-card">
          <h2>Live predictions</h2>
          <p className="muted">Approved vs rejected from student submissions.</p>
          <div className="admin-mix">
            <div className="admin-mix-track">
              <span
                className="admin-mix-approved"
                style={{ width: total ? `${(approved / total) * 100}%` : '0%' }}
              />
            </div>
            <div className="admin-mix-legend">
              <span>
                <i className="dot approved" /> Approved {approved}
              </span>
              <span>
                <i className="dot rejected" /> Rejected {rejected}
              </span>
            </div>
          </div>
          <p className="admin-footnote">
            Demo only. Not an official NELFUND or University of Ibadan decision.
          </p>
        </section>
      </div>
    </div>
  )
}
