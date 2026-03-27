import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(input) {
  try {
    console.log("--- ISPEZIONE PROFONDA ---");
    
    // Se l'input è vuoto, cerchiamo di capire perché
    if (!input || Object.keys(input).length === 0) {
      console.error("ERRORE: L'input ricevuto è VUOTO. Controllare il frontend.");
      throw new Error("Nessun dato ricevuto dal frontend");
    }

    // Estraiamo la stringa base64 da qualsiasi proprietà possibile
    const base64String = input.image || input.imageData || input.data || (typeof input === 'string' ? input : "");

    if (!base64String || base64String.length < 100) {
      throw new Error("Stringa immagine mancante o troppo corta");
    }

    const cleanBase64 = base64String.includes(",") ? base64String.split(",")[1] : base64String;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Analizza l'immagine e restituisci SOLO JSON: productName, expiryDate (AAAA-MM-DD)",
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
    ]);

    console.log("SUCCESSO: Risposta ottenuta!");
    return result.response.text();

  } catch (error) {
    console.error("ERRORE OCR:", error.message);
    throw error;
  }
}

export default scanWithRetry;
