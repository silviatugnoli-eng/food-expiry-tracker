import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  try {
    console.log("--- FASE: ESTRAZIONE E PULIZIA ---");
    
    // Se imageData è un oggetto, cerchiamo la proprietà che contiene la stringa
    let base64String = typeof imageData === 'string' ? imageData : (imageData.image || imageData.data || "");

    if (!base64String) {
      throw new Error("Dati immagine non trovati o formato non valido");
    }

    // Pulizia del prefisso Base64
    const cleanBase64 = base64String.includes(",") ? base64String.split(",")[1] : base64String;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      "Analizza l'immagine e restituisci SOLO un oggetto JSON con: productName (nome prodotto) e expiryDate (scadenza nel formato AAAA-MM-DD).",
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    const text = response.text();
    console.log("Risposta Ricevuta da Google!");
    return text;

  } catch (error) {
    console.error("ERRORE CRITICO:", error.message);
    throw new Error("Analisi fallita: " + error.message);
  }
}

export default scanWithRetry;
