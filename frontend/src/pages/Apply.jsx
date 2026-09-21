import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

const defaults = {
  gender: 'Male',
  age: 21,
  marital_status: 'Single',
  faculty: 'Science',
  academic_level: '300',
  residence_type: 'Off Campus',
  cgpa: 3.5,
  guardian_employment_status: 'Employed',
  guardian_monthly_income: 80000,
  other_income: 10000,
  loan_amount_requested: 150000,
  loan_term_months: 36,
  guarantor_availability: 'Yes',
}

export default function Apply() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [options, setOptions] = useState(null)
  const [form, setForm] = useState({
    ...defaults,
    faculty: user?.faculty || defaults.faculty,
    academic_level: user?.academic_level || defaults.academic_level,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.options().then(setOptions).catch(() => {})
  }, [])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        cgpa: Number(form.cgpa),
        guardian_monthly_income: Number(form.guardian_monthly_income),
        other_income: Number(form.other_income),
        loan_amount_requested: Number(form.loan_amount_requested),
        loan_term_months: Number(form.loan_term_months),
        academic_level: String(form.academic_level),
      }
      const result = await api.predict(payload, token)
      navigate('/result', { state: { result, form: payload } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const faculties = options?.faculties || [form.faculty]
  const levels = options?.academic_levels || ['100', '200', '300', '400', '500']
  const residences = options?.residence_types || ['School Hostel', 'Off Campus']
  const employment = options?.employment_statuses || ['Employed', 'Self-Employed', 'Unemployed']
  const genders = options?.genders || ['Male', 'Female']
  const marital = options?.marital_statuses || ['Single', 'Married']
  const guarantors = options?.guarantor_options || ['Yes', 'No']

  return (
    <>
      <div className="page-header">
        <p className="eyebrow">Application</p>
        <h1>Loan details</h1>
        <p>Fill in the fields below, then submit to run the prediction.</p>
      </div>
      <div className="surface">
        {error && <div className="notice notice-error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-section">
            <h2 className="form-section-title">Personal and academic</h2>
            <div className="grid-2">
              <div className="field">
                <label>Gender</label>
                <select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                  {genders.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Age</label>
                <input type="number" min={15} max={60} required value={form.age} onChange={(e) => update('age', e.target.value)} />
              </div>
              <div className="field">
                <label>Marital status</label>
                <select value={form.marital_status} onChange={(e) => update('marital_status', e.target.value)}>
                  {marital.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Residence</label>
                <select value={form.residence_type} onChange={(e) => update('residence_type', e.target.value)}>
                  {residences.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Faculty</label>
                <select value={form.faculty} onChange={(e) => update('faculty', e.target.value)}>
                  {faculties.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Academic level</label>
                <select value={form.academic_level} onChange={(e) => update('academic_level', e.target.value)}>
                  {levels.map((l) => <option key={l} value={l}>{l} Level</option>)}
                </select>
              </div>
              <div className="field">
                <label>CGPA (0.00 – 5.00)</label>
                <input type="number" step="0.01" min={0} max={5} required value={form.cgpa} onChange={(e) => update('cgpa', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h2 className="form-section-title">Financial details</h2>
            <div className="grid-2">
              <div className="field">
                <label>Guardian employment</label>
                <select value={form.guardian_employment_status} onChange={(e) => update('guardian_employment_status', e.target.value)}>
                  {employment.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Guarantor available</label>
                <select value={form.guarantor_availability} onChange={(e) => update('guarantor_availability', e.target.value)}>
                  {guarantors.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Guardian monthly income (₦)</label>
                <input type="number" min={0} required value={form.guardian_monthly_income} onChange={(e) => update('guardian_monthly_income', e.target.value)} />
              </div>
              <div className="field">
                <label>Other income (₦)</label>
                <input type="number" min={0} required value={form.other_income} onChange={(e) => update('other_income', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h2 className="form-section-title">Loan request</h2>
            <div className="grid-2">
              <div className="field">
                <label>Amount requested (₦)</label>
                <input type="number" min={1} required value={form.loan_amount_requested} onChange={(e) => update('loan_amount_requested', e.target.value)} />
              </div>
              <div className="field">
                <label>Term (months)</label>
                <input type="number" min={6} max={120} required value={form.loan_term_months} onChange={(e) => update('loan_term_months', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? 'Predicting…' : 'Submit and predict'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
