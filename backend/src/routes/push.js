import express from 'express'
import webpush from 'web-push'
import { supabase } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// Ritorna la VAPID public key al frontend
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

// Salva subscription del browser
router.post('/subscribe', requireAuth, async (req, res) => {
  const subscription = req.body

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: req.user.id,
      subscription: JSON.stringify(subscription),
      endpoint: subscription.endpoint
    }, { onConflict: 'endpoint' })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// Rimuovi subscription
router.post('/unsubscribe', requireAuth, async (req, res) => {
  const { endpoint } = req.body

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', req.user.id)
    .eq('endpoint', endpoint)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
