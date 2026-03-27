import express from 'express';
import cors from 'cors';
import fs from 'fs';
import scanWithRetry from './routes/ocr.js';

const app = express();
const DATA_FILE = './data.json';

// Configurazione limiti per le foto
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// --- ROTTA PER LA SCANSIONE AI ---
app.post('/api/scan', async (req, res) => {
  try {
    const result = await scanWithRetry(req.body);
    res.json({ text: result });
  } catch (error) {
    console.error("Errore AI:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- ROTTE PER IL DATABASE (Salvataggio manuale) ---
app.get('/api/products', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  const data = fs.readFileSync(DATA_FILE);
  res.json(JSON.parse(data));
});

app.post('/api/products', (req, res) => {
  const products = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];
  const newProduct = { ...req.body, id: Date.now() };
  products.push(newProduct);
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.status(404).send();
  let products = JSON.parse(fs.readFileSync(DATA_FILE));
  products = products.filter(p => p.id !== parseInt(req.params.id));
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend pronto e completo su porta ${PORT}`);
});
