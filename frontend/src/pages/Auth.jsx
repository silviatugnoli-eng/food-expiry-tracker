import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) setMessage(error.message)
    else if (!isLogin) setMessage('Controlla la tua email per confermare la registrazione!')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🥫</div>
        <h1>Scadenze Alimenti</h1>
        <p className="auth-subtitle">Tieni traccia di cosa sta per scadere in frigo</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Attendere...' : isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <button className="btn-link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
        </button>
      </div>
    </div>
  )
}
