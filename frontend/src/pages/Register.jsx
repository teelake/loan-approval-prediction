import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

const FALLBACK_FACULTIES = [
  'Agriculture and Forestry',
  'Arts',
  'Basic Medical Sciences',
  'Clinical Sciences',
  'Education',
  'Law',
  'Pharmacy',
  'Science',
  'Social Sciences',
  'Technology',
]

export default function Register() {
  const navigate = useNavigate()
  const { loginSuccess, isAuthenticated } = useAuth()
  const [faculties, setFaculties] = useState(FALLBACK_FACULTIES)
  const [levels, setLevels] = useState(['100', '200', '300', '400', '500'])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    matric_number: '',
    email: '',
    password: '',
    faculty: FALLBACK_FACULTIES[0],
    academic_level: '100',
  })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    api
      .options()
      .then((opts) => {
        if (opts.faculties?.length) {
          setFaculties(opts.faculties)
          setForm((prev) => ({ ...prev, faculty: opts.faculties[0] }))
        }
        if (opts.academic_levels?.length) setLevels(opts.academic_levels)
      })
      .catch(() => {})
  }, [])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.register(form)
      loginSuccess(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-medium" style={{ margin: '0 auto' }}>
      <div className="page-header">
        <p className="eyebrow">Account</p>
        <h1>Register</h1>
        <p>Enter your student details to create an account.</p>
      </div>
      <div className="surface">
        {error && <div className="notice notice-error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-section">
            <h2 className="form-section-title">Personal details</h2>
            <div className="grid-2">
              <div className="field">
                <label>Full name</label>
                <input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
              </div>
              <div className="field">
                <label>Matric number</label>
                <input required placeholder="UI/2021/1234" value={form.matric_number} onChange={(e) => update('matric_number', e.target.value)} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h2 className="form-section-title">Programme</h2>
            <div className="grid-2">
              <div className="field">
                <label>Faculty</label>
                <select value={form.faculty} onChange={(e) => update('faculty', e.target.value)}>
                  {faculties.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Academic level</label>
                <select value={form.academic_level} onChange={(e) => update('academic_level', e.target.value)}>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level} Level</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-ink" disabled={loading} type="submit">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
        <p className="auth-aside">
          Already registered? <Link className="link" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
