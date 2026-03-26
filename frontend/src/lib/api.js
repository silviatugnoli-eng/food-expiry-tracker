import { supabase } from './supabase.js'

const API = import.meta.env.VITE_API_URL

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  }
}

export async function getProducts() {
  const res = await fetch(`${API}/api/products`, { headers: await authHeaders() })
  return res.json()
}

export async function addProduct(product) {
  const res = await fetch(`${API}/api/products`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(product)
  })
  return res.json()
}

export async function deleteProduct(id) {
  const res = await fetch(`${API}/api/products/${id}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })
  return res.json()
}

export async function scanImage(file) {
  const { data: { session } } = await supabase.auth.getSession()
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${API}/api/ocr/scan`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${session?.access_token}` },
    body: formData
  })
  return res.json()
}

export async function subscribePush() {
  const { publicKey } = await fetch(`${API}/api/push/vapid-public-key`).then(r => r.json())

  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  })

  const res = await fetch(`${API}/api/push/subscribe`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(sub)
  })
  return res.json()
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)))
}
