import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { getProducts, deleteProduct, subscribePush } from '../lib/api.js'
import Scanner from '../components/Scanner.jsx'
import AddProductForm from '../components/AddProductForm.jsx'
import ProductList from '../components/ProductList.jsx'

export default function Dashboard({ session }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'scan' | 'add'
  const [pushEnabled, setPushEnabled] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  useEffect(() => {
    loadProducts()
    checkPushStatus()
  }, [])

  async function loadProducts() {
    setLoading(true)
    const data = await getProducts()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function checkPushStatus() {
    if (!('Notification' in window)) return
    setPushEnabled(Notification.permission === 'granted')
  }

  async function enablePush() {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return alert('Permesso notifiche negato')
      await subscribePush()
      setPushEnabled(true)
      alert('✅ Notifiche attivate!')
    } catch (err) {
      console.error(err)
      alert('Errore attivazione notifiche')
    }
  }

  function handleScanDone(result) {
    setScanResult(result)
    setView('add')
  }

  function handleProductAdded() {
    loadProducts()
    setView('list')
    setScanResult(null)
  }

  async function handleDelete(id) {
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function getDaysUntil(dateStr) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(dateStr)
    expiry.setHours(0, 0, 0, 0)
    return Math.round((expiry - today) / (1000 * 60 * 60 * 24))
  }

  const expiredCount = products.filter(p => getDaysUntil(p.expiry_date) < 0).length
  const soonCount = products.filter(p => { const d = getDaysUntil(p.expiry_date); return d >= 0 && d <= 3 }).length

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-title">
          <span className="dash-icon">🥫</span>
          <h1>Scadenze</h1>
        </div>
        <div className="dash-actions">
          {!pushEnabled && (
            <button className="btn-bell" onClick={enablePush} title="Attiva notifiche">🔔</button>
          )}
          <button className="btn-logout" onClick={() => supabase.auth.signOut()} title="Esci">↩</button>
        </div>
      </header>

      {(expiredCount > 0 || soonCount > 0) && (
        <div className="alert-bar">
          {expiredCount > 0 && <span className="alert-chip expired">⚠️ {expiredCount} scadut{expiredCount === 1 ? 'o' : 'i'}</span>}
          {soonCount > 0 && <span className="alert-chip soon">📅 {soonCount} in scadenza</span>}
        </div>
      )}

      <nav className="dash-nav">
        <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>📋 Lista</button>
        <button className={view === 'scan' ? 'active' : ''} onClick={() => setView('scan')}>📷 Scansiona</button>
        <button className={view === 'add' ? 'active' : ''} onClick={() => { setScanResult(null); setView('add') }}>✏️ Aggiungi</button>
      </nav>

      <main className="dash-main">
        {view === 'list' && (
          <ProductList
            products={products}
            loading={loading}
            onDelete={handleDelete}
            getDaysUntil={getDaysUntil}
          />
        )}
        {view === 'scan' && (
          <Scanner onDone={handleScanDone} />
        )}
        {view === 'add' && (
          <AddProductForm
            prefill={scanResult}
            onAdded={handleProductAdded}
          />
        )}
      </main>
    </div>
  )
}
