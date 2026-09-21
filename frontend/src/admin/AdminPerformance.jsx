import { useAdminData } from './AdminLayout'

export default function AdminPerformance() {
  const { metrics, loading, error } = useAdminData()
  if (loading) return <div className="admin-loading">Loading…</div>
  if (!metrics) {
    return <div className="admin-page"><div className="notice notice-error">{error || 'Metrics not available.'}</div></div>
  }

  const cards = [
    { label: 'Accuracy', value: metrics.accuracy, note: 'Correct predictions overall' },
    { label: 'Precision', value: metrics.precision, note: 'Correct among predicted Approved' },
    { label: 'Recall', value: metrics.recall, note: 'Approved cases correctly found' },
    { label: 'F1-score', value: metrics.f1_score, note: 'Combined precision and recall' },
  ]

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Performance</h1>
          <p>Test-set results · train {metrics.train_size} · test {metrics.test_size} · {metrics.n_estimators} trees</p>
        </div>
      </header>
      {error && <div className="notice notice-error">{error}</div>}
      <div className="admin-kpi-grid">
        {cards.map((card) => (
          <article className="admin-kpi admin-kpi-tall" key={card.label}>
            <span>{card.label}</span>
            <strong>{(card.value * 100).toFixed(1)}%</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
