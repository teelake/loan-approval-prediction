import { useAdminData } from './AdminLayout'

export default function AdminModel() {
  const { metrics, retraining, retrain, reload, error, loading } = useAdminData()
  if (loading) return <div className="admin-loading">Loading…</div>

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Model</p>
          <h1>Retrain model</h1>
          <p>Train again from the CSV and update saved metrics.</p>
        </div>
      </header>
      {error && <div className="notice notice-error">{error}</div>}
      <div className="admin-grid-2">
        <section className="admin-card">
          <h2>Current model</h2>
          <dl className="admin-dl">
            <div><dt>Algorithm</dt><dd>Random Forest</dd></div>
            <div><dt>Trees</dt><dd>{metrics?.n_estimators ?? 300}</dd></div>
            <div><dt>Training rows</dt><dd>{metrics?.train_size ?? '—'}</dd></div>
            <div><dt>Test rows</dt><dd>{metrics?.test_size ?? '—'}</dd></div>
          </dl>
        </section>
        <section className="admin-card">
          <h2>Actions</h2>
          <p className="muted" style={{ marginBottom: '1.1rem' }}>
            Retrain loads <code>ui_student_loan_data.csv</code>, fits the model, and writes new joblib and metrics files.
          </p>
          <div className="admin-card-actions">
            <button type="button" className="btn btn-primary" onClick={retrain} disabled={retraining}>
              {retraining ? 'Training…' : 'Retrain from CSV'}
            </button>
            <button type="button" className="btn btn-outline" onClick={reload} disabled={retraining}>
              Reload metrics
            </button>
          </div>
        </section>
      </div>
      {metrics?.disclaimer && (
        <div className="notice notice-warn" style={{ marginTop: '1.15rem', marginBottom: 0 }}>
          {metrics.disclaimer}
        </div>
      )}
    </div>
  )
}
