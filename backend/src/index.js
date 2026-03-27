import express from 'express';
import cors from 'cors';
import fs from 'fs';
import scanWithRetry from './routes/ocr.js';

const app = express();
const DATA_FILE = './data.json';

// Limiti necessari ma senza esagerare per non appesantire il boot
app.use(express.json({ limit: '5mb' })); 
app.use(cors());

app.get('/api/products', (req, res) => {
  try {
    const data = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE) : '[]';
    res.json(JSON.parse(data));
  } catch (e) { res.json([]); }
});

app.post('/api/products', (req, res) => {
  const products = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];
  const newProduct = { ...req.body, id: Date.now() };
  products.push(newProduct);
  fs.writeFileSync(DATA_FILE, JSON.stringify(products));
  res.status(201).json(newProduct);
});

app.post('/api/scan', async (req, res) => {
  try {
    const result = await scanWithRetry(req.body);
    res.json({ text: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ON port ${PORT}`);
});
