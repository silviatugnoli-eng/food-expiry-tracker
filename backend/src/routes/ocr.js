import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "MANCANTE");

async function scanWithRetry(imageData) {
  console.log("--- TEST DI CONNESSIONE ---");
  console.log("Chiave presente:", !!process.env.GEMINI_API_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Analizza l'immagine e restituisci JSON: productName, expiryDate";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text();
    console.log("Risposta ottenuta con successo!");
    return text;
  } catch (error) {
    console.error("DETTAGLIO ERRORE GOOGLE:", error.message);
    // Se l'errore è la regione, lo vedremo qui sotto:
    if (error.message.includes("location")) {
       return JSON.stringify({ productName: "ERRORE: REGIONE NON SUPPORTATA", expiryDate: null });
    }
    throw error;
  }
}

export default scanWithRetry;
