export default function ProductList({ products, loading, onDelete, getDaysUntil }) {
  if (loading) return <div className="loading">Caricamento...</div>

  if (products.length === 0) return (
    <div className="empty-state">
      <span>🛒</span>
      <p>Nessun prodotto salvato.</p>
      <p>Scansiona un'etichetta o aggiungine uno manualmente!</p>
    </div>
  )

  function getChip(days) {
    if (days < 0) return { label: `Scaduto ${Math.abs(days)}g fa`, cls: 'chip-expired' }
    if (days === 0) return { label: 'Scade oggi!', cls: 'chip-today' }
    if (days <= 3) return { label: `Scade in ${days}g`, cls: 'chip-soon' }
    if (days <= 7) return { label: `${days} giorni`, cls: 'chip-week' }
    return { label: `${days} giorni`, cls: 'chip-ok' }
  }

  const sorted = [...products].sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))

  return (
    <div className="product-list">
      {sorted.map(p => {
        const days = getDaysUntil(p.expiry_date)
        const { label, cls } = getChip(days)
        return (
          <div key={p.id} className={`product-card ${days < 0 ? 'card-expired' : days <= 3 ? 'card-soon' : ''}`}>
            <div className="card-left">
              <span className="card-name">{p.name}</span>
              {p.notes && <span className="card-notes">{p.notes}</span>}
              <span className="card-date">
                {new Date(p.expiry_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="card-right">
              <span className={`chip ${cls}`}>{label}</span>
              <button
                className="btn-delete"
                onClick={() => onDelete(p.id)}
                title="Elimina"
              >🗑</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
