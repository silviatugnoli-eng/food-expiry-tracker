import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  // Usiamo direttamente il modello corretto senza complicazioni
  const modelName = "gemini-1.5-flash-latest";
  
  try {
    console.log(`Avvio scansione con modello: ${modelName}`);
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
    console.error(`Errore durante la scansione:`, error.message);

    // Se è un errore di quota, aspettiamo e riproviamo UNA volta
    if (error.message.includes("429") || error.message.includes("Quota")) {
      console.log("Quota superata. Attendo 35 secondi...");
      await new Promise(resolve => setTimeout(resolve, 35000));
      return scanWithRetry(imageData);
    }

    throw new Error("Errore durante l'analisi dell'immagine: " + error.message);
  }
}

export default scanWithRetry;
