import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
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
    // TRATTAMENTO D'URTO: Non stampiamo MAI l'oggetto error direttamente
    const msg = error.message ? String(error.message) : "Errore sconosciuto";
    console.error("Errore rilevato durante la scansione:", msg);

    if (msg.includes("429") || msg.includes("Quota")) {
      console.log("Quota superata. Attendo 35 secondi...");
      await new Promise(resolve => setTimeout(resolve, 35000));
      return scanWithRetry(imageData);
    }

    throw new Error("Analisi fallita: " + msg);
  }
}

export default scanWithRetry;
