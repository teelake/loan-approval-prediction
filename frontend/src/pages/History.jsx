import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

export default function History() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .history(token)
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">History</p>
        <h1>Past predictions</h1>
        <p>Your previous submissions and model results.</p>
      </div>
      <div className="surface surface-flush">
        {error && <div className="notice notice-error" style={{ margin: '1.25rem' }}>{error}</div>}
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <p style={{ marginBottom: '1rem' }}>No predictions yet.</p>
            <Link className="btn btn-ink" to="/apply">Submit a prediction</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Faculty</th>
                  <th>Level</th>
                  <th>CGPA</th>
                  <th>Amount</th>
                  <th>Prediction</th>
                  <th>Probability</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.application_id}>
                    <td>
                      {new Date(row.submitted_at).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>{row.faculty}</td>
                    <td>{row.academic_level}</td>
                    <td>{row.cgpa.toFixed(2)}</td>
                    <td>₦{row.loan_amount_requested.toLocaleString()}</td>
                    <td>
                      {row.predicted_status ? (
                        <span className={`badge ${row.predicted_status === 'Approved' ? 'badge-approved' : 'badge-rejected'}`}>
                          {row.predicted_status}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {row.approval_probability != null
                        ? `${Math.round(row.approval_probability * 100)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
