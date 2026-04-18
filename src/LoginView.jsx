import { useState } from 'react'
import { signIn } from './AuthContext'
import phlLogo from './assets/phl-ps-mark.png'
import './LoginView.css'

export default function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : err.message)
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src={phlLogo} alt="PHL Supply" />
          <div className="login-brand">
            <span>PHL</span>
            <span className="login-brand-sub">SUPPLY</span>
          </div>
        </div>
        <h1 className="login-title">Cotizador<br />Nuestros Parques</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="lf-email">Correo electrónico</label>
            <input
              id="lf-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="asesor@phlsupply.cl"
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label htmlFor="lf-password">Contraseña</label>
            <input
              id="lf-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
