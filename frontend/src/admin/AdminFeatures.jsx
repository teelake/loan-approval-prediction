import { useAdminData } from './AdminLayout'

export default function AdminFeatures() {
  const { metrics, loading, error } = useAdminData()
  if (loading) return <div className="admin-loading">Loading…</div>
  if (!metrics) {
    return <div className="admin-page"><div className="notice notice-error">{error || 'Metrics not available.'}</div></div>
  }

  const max = Math.max(...metrics.feature_importance.map((f) => f.importance), 0.01)

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Feature importance</h1>
          <p>How much each input contributes to the Random Forest model.</p>
        </div>
      </header>
      {error && <div className="notice notice-error">{error}</div>}
      <div className="admin-card">
        <ul className="feature-list">
          {metrics.feature_importance.map((item, index) => (
            <li key={item.feature}>
              <div className="feature-list-head">
                <span className="feature-rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="feature-name">{item.feature.replace(/_/g, ' ')}</span>
                <strong>{(item.importance * 100).toFixed(1)}%</strong>
              </div>
              <div className="bar">
                <span style={{ width: `${(item.importance / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
