import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  try {
    console.log("--- PULIZIA DATI E INVIO A GOOGLE ---");
    
    // Rimuoviamo eventuali intestazioni data:image/jpeg;base64, se presenti
    const cleanBase64 = imageData.includes(",") ? imageData.split(",")[1] : imageData;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      "Estrai nome prodotto e scadenza. Rispondi SOLO con un oggetto JSON: {\"productName\": \"...\", \"expiryDate\": \"AAAA-MM-DD\"}",
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("ERRORE DURANTE L'INVIO A GOOGLE:", error.message);
    throw new Error("Errore elaborazione immagine");
  }
}

export default scanWithRetry;
