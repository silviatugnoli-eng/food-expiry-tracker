import express from 'express';
import cors from 'cors';
import scanWithRetry from './routes/ocr.js';

const app = express();

// AUMENTIAMO IL LIMITE QUI - Fondamentale per le foto
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

app.post('/api/scan', async (req, res) => {
  try {
    // Passiamo tutto il body alla funzione ocr
    const result = await scanWithRetry(req.body);
    res.json({ text: result });
  } catch (error) {
    console.error("Errore rotta scan:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend in ascolto su porta ${PORT}`);
});
