import { useState, useEffect } from 'react'
import { addProduct } from '../lib/api.js'

export default function AddProductForm({ prefill, onAdded }) {
  const [name, setName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (prefill) {
      if (prefill.product_hint) setName(prefill.product_hint)
      if (prefill.date) setExpiryDate(prefill.date)
    }
  }, [prefill])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !expiryDate) return
    setLoading(true)
    setError('')

    const result = await addProduct({ name: name.trim(), expiry_date: expiryDate, notes })

    if (result.error) {
      setError(result.error)
    } else {
      onAdded()
    }
    setLoading(false)
  }

  return (
    <div className="add-form">
      <h2>✏️ {prefill ? 'Conferma prodotto' : 'Aggiungi prodotto'}</h2>

      {prefill && (
        <div className="scan-info">
          <strong>📷 Rilevato:</strong> {prefill.raw_text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Nome prodotto *</label>
        <input
          type="text"
          placeholder="es. Yogurt, Latte, Prosciutto..."
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <label>Data di scadenza *</label>
        <input
          type="date"
          value={expiryDate}
          onChange={e => setExpiryDate(e.target.value)}
          required
        />

        <label>Note (opzionale)</label>
        <input
          type="text"
          placeholder="es. Frigo ripiano 2"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvataggio...' : '💾 Salva prodotto'}
        </button>
      </form>
    </div>
  )
}
