import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// NOMI MODELLI AGGIORNATI PER V1BETA
const MODELS = ['gemini-1.5-flash-latest', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-exp'];

async function scanWithRetry(imageData, modelIndex = 0) {
  const modelName = MODELS[modelIndex];
  
  try {
    console.log(`Tentativo ${modelIndex + 1}: Provo con modello ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = "Analizza l'immagine di questo prodotto alimentare. Estrai SOLAMENTE il nome del prodotto e la data di scadenza (se presente). Rispondi esclusivamente in formato JSON come questo: {\"productName\": \"nome\", \"expiryDate\": \"AAAA-MM-DD\"}. Se la data non c'è, scrivi null.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error(`Errore con ${modelName}:`, error.message);

    if (error.message.includes("429") || error.message.includes("Quota")) {
      console.log("Quota superata. Attendo 35 secondi...");
      await new Promise(resolve => setTimeout(resolve, 35000));
      return scanWithRetry(imageData, modelIndex);
    }

    if (modelIndex < MODELS.length - 1) {
      console.log("Passo al modello successivo...");
      return scanWithRetry(imageData, modelIndex + 1);
    }

    throw new Error("Tutti i modelli hanno fallito o quota esaurita.");
  }
}

export default scanWithRetry;
