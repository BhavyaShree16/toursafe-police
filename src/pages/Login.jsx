import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/login.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    console.log("LOGIN CLICKED")
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/map')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">🛡️</div>
          <div>
            <p className="login-logo-title">TourSafe</p>
            <p className="login-logo-sub">Police Dashboard</p>
          </div>
        </div>

        <h1 className="login-title">Officer Login</h1>
        <p className="login-subtitle">Sign in with your station credentials</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" name="email"
              placeholder="officer@tnpolice.gov.in"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" name="password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange} required />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="login-footer">Tamil Nadu Police · Tourist Safety Division</p>
      </div>
    </div>
  )
}