import { useRef, useState } from 'react'
import { scanImage } from '../lib/api.js'

export default function Scanner({ onDone }) {
  const fileRef = useRef()
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleScan() {
    const file = fileRef.current.files[0]
    if (!file) return

    setScanning(true)
    setError('')

    try {
      const result = await scanImage(file)
      if (result.found) {
        onDone(result)
      } else {
        setError('Nessuna data trovata. Prova con una foto più nitida o inserisci manualmente.')
      }
    } catch (err) {
      setError('Errore durante la scansione. Riprova.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="scanner">
      <h2>📷 Scansiona etichetta</h2>
      <p className="scanner-hint">Fotografa la data di scadenza sull'etichetta del prodotto</p>

      <div
        className="drop-zone"
        onClick={() => fileRef.current.click()}
      >
        {preview
          ? <img src={preview} alt="Preview" className="preview-img" />
          : <div className="drop-placeholder">
              <span className="drop-icon">📸</span>
              <span>Tocca per scattare o scegliere foto</span>
            </div>
        }
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {preview && (
        <button
          className="btn-primary"
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? '🔍 Analisi in corso...' : '🔍 Leggi scadenza'}
        </button>
      )}

      {error && <p className="error-msg">{error}</p>}

      <button className="btn-link" onClick={() => fileRef.current.click()}>
        Cambia foto
      </button>
    </div>
  )
}
