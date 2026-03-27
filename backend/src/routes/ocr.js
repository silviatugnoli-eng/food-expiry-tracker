import express from 'express'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MODELS = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-2.0-flash']

async function scanWithRetry(imageData, prompt) {
  for (const modelName of MODELS) {
    try {
      console.log(`Provo con modello: ${modelName}`)
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent([prompt, imageData])
      return result
    } catch (err) {
      if (err.status === 429) {
        console.log(`${modelName} quota esaurita, aspetto 35s e provo il prossimo...`)
        await new Promise(r => setTimeout(r, 35000))
      } else {
        throw err
      }
    }
  }
  throw new Error('Tutti i modelli hanno la quota esaurita')
}

router.post('/scan', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nessuna immagine ricevuta' })
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
    const result = await scanWithRetry(imageData, prompt)
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