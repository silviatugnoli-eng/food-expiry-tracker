import express from 'express'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Ordiniamo i modelli dal più leggero/probabile al più avanzato
const MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash']

async function scanWithRetry(imageData, prompt, attempt = 0) {
    const modelName = MODELS[attempt % MODELS.length];
    
    try {
        console.log(`Tentativo ${attempt + 1}: Provo con modello ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, imageData]);
        return result;

    } catch (error) {
        // Se l'errore è "Too Many Requests" (429)
        if (error.status === 429 && attempt < 3) {
            // Estraiamo il tempo di attesa o usiamo 35 secondi di default
            const waitTime = error.errorDetails?.[0]?.retryDelay 
                             ? (parseInt(error.errorDetails[0].retryDelay) + 2) * 1000 
                             : 35000;

            console.warn(`Quota superata su ${modelName}. Attendo ${waitTime/1000}s prima di riprovare...`);
            
            // ASPETTAZIONE FORZATA
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // RIPROVA (Ricorsione)
            return scanWithRetry(imageData, prompt, attempt + 1);
        }
        
        // Se l'errore è diverso o abbiamo finito i tentativi
        console.error(`Errore definitivo con ${modelName}:`, error.message);
        throw error;
    }
}

// Rotta OCR
router.post('/scan', requireAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nessuna immagine caricata' });

        const imageData = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const prompt = "Analizza questa etichetta. Estrai nome prodotto e data di scadenza (YYYY-MM-DD). Rispondi solo in JSON.";
        
        const result = await scanWithRetry(imageData, prompt);
        const text = result.response.text();
        
        res.json({ result: text });
    } catch (error) {
        res.status(500).json({ error: 'Errore durante la scansione OCR', details: error.message });
    }
});

export default router;
