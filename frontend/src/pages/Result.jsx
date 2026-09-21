import { Link, useLocation, Navigate } from 'react-router-dom'

export default function Result() {
  const location = useLocation()
  const result = location.state?.result

  if (!result) return <Navigate to="/apply" replace />

  const approved = result.predicted_status === 'Approved'
  const pct = Math.round(result.approval_probability * 100)

  return (
    <div className="page-medium" style={{ margin: '0 auto' }}>
      <div className="surface">
        <div className="result-stage">
          <p className="eyebrow">Result</p>
          <h1>Prediction</h1>
          <div className="result-status">
            <span className={`badge ${approved ? 'badge-approved' : 'badge-rejected'}`}>
              {result.predicted_status}
            </span>
          </div>
          <p className="result-prob">{pct}%</p>
          <p className="result-prob-label">Approval probability</p>
          <div className="meter">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="notice notice-warn">{result.disclaimer}</div>
        <div className="cta-row" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-ink" to="/history">View history</Link>
          <Link className="btn btn-outline" to="/apply">New prediction</Link>
        </div>
      </div>
    </div>
  )
}
