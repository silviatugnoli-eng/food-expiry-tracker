# 🥫 Scadenze Alimenti

PWA per tenere traccia delle scadenze alimentari con OCR via Gemini API e notifiche push browser.

## Stack
- **Frontend**: React + Vite (PWA)
- **Backend**: Node.js + Express (Render)
- **Database + Auth**: Supabase
- **OCR**: Google Gemini API (gratuito)
- **Notifiche**: Web Push API

---

## Setup

### 1. Supabase
1. Vai su [supabase.com](https://supabase.com) e apri il tuo progetto
2. Vai su **SQL Editor** e incolla il contenuto di `supabase-schema.sql`
3. Vai su **Settings → API** e copia:
   - `Project URL`
   - `anon key` (per il frontend)
   - `service_role key` (per il backend — non esporla mai!)

### 2. Gemini API
1. Vai su [aistudio.google.com](https://aistudio.google.com)
2. Clicca **Get API key → Create API key**
3. Copia la chiave

### 3. VAPID keys (Web Push)
```bash
cd backend
npx web-push generate-vapid-keys
```
Copia le due chiavi generate.

### 4. Backend - file .env
Crea `backend/.env` copiando `backend/.env.example` e compila:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=service_role_key_qui
GEMINI_API_KEY=chiave_gemini_qui
VAPID_PUBLIC_KEY=chiave_pubblica_vapid
VAPID_PRIVATE_KEY=chiave_privata_vapid
VAPID_EMAIL=mailto:tua@email.com
FRONTEND_URL=https://tuo-frontend.onrender.com
```

### 5. Frontend - file .env
Crea `frontend/.env` copiando `frontend/.env.example` e compila:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=anon_key_qui
VITE_API_URL=https://tuo-backend.onrender.com
```

### 6. Avvio locale
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (altro terminale)
cd frontend && npm install && npm run dev
```

---

## Deploy su Render

### Backend (Web Service)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: aggiungi tutte le variabili del `.env`

### Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment**: aggiungi le variabili `VITE_*`

---

## Come funziona
1. Scatti una foto all'etichetta del prodotto
2. Gemini AI legge la data di scadenza
3. Il prodotto viene salvato nel tuo account
4. Ogni mattina alle 9:00 il sistema controlla le scadenze
5. Ricevi una notifica push se qualcosa scade oggi o nei prossimi 2 giorni
