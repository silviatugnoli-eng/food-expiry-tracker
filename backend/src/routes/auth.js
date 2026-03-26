import express from 'express'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

// Registrazione
router.post('/signup', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

export default router
