import express from 'express'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function scanWithRetry(model, content, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(content)
    } catch (err) {
      if (err.status === 429 && i < retries - 1) {
        const wait = (i + 1) * 10000
        console.log(`Rate limit, riprovo tra ${wait/1000}s...`)
        await new Promise(r => setTimeout(r, wait))
      } else {
        throw err
      }
    }
  }
}

router.post('/scan', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nessuna immagine ricevuta' })
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const imageData = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    }
    const prompt = `Analizza questa immagine di un prodotto alimentare.
Cerca la data di scadenza (può essere scritta come: "Scad.", "Exp.", "Best before", "Da consumarsi entro", ecc.).
Rispondi SOLO con un JSON nel formato:
{
  "found": true/false,
  "date": "YYYY-MM-DD",
  "raw_text": "testo originale trovato",
  "product_hint": "tipo di prodotto se visibile (opzionale)"
}
Se non trovi nessuna data, rispondi con found: false e date: null.`
    const result = await scanWithRetry(model, [prompt, imageData])
    const text = result.response.text().trim()
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    res.json(parsed)
  } catch (err) {
    console.error('Errore OCR:', err)
    res.status(500).json({ error: 'Errore durante la scansione', detail: err.message })
  }
})

export default router