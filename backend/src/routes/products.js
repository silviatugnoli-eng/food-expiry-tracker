import express from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// GET tutti i prodotti dell'utente
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', req.user.id)
    .order('expiry_date', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST nuovo prodotto
router.post('/', requireAuth, async (req, res) => {
  const { name, expiry_date, notes } = req.body
  if (!name || !expiry_date) return res.status(400).json({ error: 'name e expiry_date obbligatori' })

  const { data, error } = await supabase
    .from('products')
    .insert({ user_id: req.user.id, name, expiry_date, notes })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// DELETE prodotto
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// PATCH aggiorna prodotto
router.patch('/:id', requireAuth, async (req, res) => {
  const { name, expiry_date, notes } = req.body

  const { data, error } = await supabase
    .from('products')
    .update({ name, expiry_date, notes })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
