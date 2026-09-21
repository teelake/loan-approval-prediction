import { useAdminData } from './AdminLayout'

export default function AdminConfusion() {
  const { metrics, loading, error } = useAdminData()
  if (loading) return <div className="admin-loading">Loading…</div>
  if (!metrics) {
    return <div className="admin-page"><div className="notice notice-error">{error || 'Metrics not available.'}</div></div>
  }

  const cm = metrics.confusion_matrix || [[0, 0], [0, 0]]
  const total = cm[0][0] + cm[0][1] + cm[1][0] + cm[1][1]
  const cells = [
    { key: 'tn', label: 'True negative', sub: 'Correctly rejected', value: cm[0][0], tone: 'good' },
    { key: 'fp', label: 'False positive', sub: 'Wrongly approved', value: cm[0][1], tone: 'warn' },
    { key: 'fn', label: 'False negative', sub: 'Wrongly rejected', value: cm[1][0], tone: 'warn' },
    { key: 'tp', label: 'True positive', sub: 'Correctly approved', value: cm[1][1], tone: 'good' },
  ]

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Confusion matrix</h1>
          <p>Correct and incorrect predictions on the test set (n = {total}).</p>
        </div>
      </header>
      {error && <div className="notice notice-error">{error}</div>}
      <div className="admin-card">
        <div className="cm-board">
          <div className="cm-corner" />
          <div className="cm-colhead">Predicted rejected</div>
          <div className="cm-colhead">Predicted approved</div>
          <div className="cm-rowhead">Actual rejected</div>
          <div className="cm-tile tone-good"><strong>{cm[0][0]}</strong><span>TN</span></div>
          <div className="cm-tile tone-warn"><strong>{cm[0][1]}</strong><span>FP</span></div>
          <div className="cm-rowhead">Actual approved</div>
          <div className="cm-tile tone-warn"><strong>{cm[1][0]}</strong><span>FN</span></div>
          <div className="cm-tile tone-good"><strong>{cm[1][1]}</strong><span>TP</span></div>
        </div>
      </div>
      <div className="admin-kpi-grid" style={{ marginTop: '1.15rem' }}>
        {cells.map((cell) => (
          <article className={`admin-kpi admin-kpi-tall tone-${cell.tone}`} key={cell.key}>
            <span>{cell.label}</span>
            <strong>{cell.value}</strong>
            <p>{cell.sub}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
