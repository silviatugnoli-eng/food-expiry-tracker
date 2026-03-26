import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'

import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import ocrRoutes from './routes/ocr.js'
import pushRoutes from './routes/push.js'
import { checkExpiryAndNotify } from './jobs/checkExpiry.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/ocr', ocrRoutes)
app.use('/api/push', pushRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Cron: ogni giorno alle 09:00 controlla le scadenze
cron.schedule('0 9 * * *', () => {
  console.log('🕘 Controllo scadenze...')
  checkExpiryAndNotify()
})

app.listen(PORT, () => {
  console.log(`✅ Backend in ascolto su porta ${PORT}`)
})
