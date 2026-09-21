import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-inner">
          <h1 className="home-brand">
            University of <em>Ibadan</em>
          </h1>
          <p className="home-title">Student loan approval prediction</p>
          <p className="home-lead">
            Submit your academic and financial details to get a predicted loan outcome
            (Approved or Rejected) and an approval probability.
          </p>
          <div className="home-actions">
            {isAuthenticated ? (
              <Link className="btn btn-primary" to="/apply">
                Start prediction
              </Link>
            ) : (
              <>
                <Link className="btn btn-primary" to="/register">
                  Create account
                </Link>
                <Link className="btn btn-ghost" to="/login">
                  Sign in
                </Link>
              </>
            )}
          </div>
          <p className="home-rule">
            This is a project demo. It is not an official NELFUND or University of Ibadan
            loan decision.
          </p>
        </div>
      </section>

      <section className="home-below">
        <p className="section-label">Steps</p>
        <h2 className="section-title">How to use the system</h2>
        <p className="section-copy">
          Register, submit a loan profile, and view the model prediction. Past submissions
          are stored in your history.
        </p>
        <div className="split-3">
          <article>
            <h3>1. Create an account</h3>
            <p>Register with your name, matric number, faculty, and level.</p>
          </article>
          <article>
            <h3>2. Submit details</h3>
            <p>Enter CGPA, income, guarantor status, and the loan amount requested.</p>
          </article>
          <article>
            <h3>3. View the result</h3>
            <p>See Approved or Rejected with the approval probability, then check history.</p>
          </article>
        </div>
      </section>
    </>
  )
}
