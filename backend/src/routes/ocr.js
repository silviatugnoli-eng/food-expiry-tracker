import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  // Cambiamo il nome del modello in quello base, senza "-latest"
  const modelName = "gemini-1.5-flash"; 
  
  try {
    console.log(`Tentativo con modello: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = "Analizza l'immagine. Estrai nome prodotto e scadenza (JSON: productName, expiryDate).";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: "image/jpeg" } }
    ]);

    return result.response.text();
  } catch (error) {
    // Se fallisce anche questo, proviamo il modello 8b (più leggero)
    console.error("Errore con flash, provo flash-8b...");
    try {
        const model8b = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
        const result8b = await model8b.generateContent([
          prompt,
          { inlineData: { data: imageData, mimeType: "image/jpeg" } }
        ]);
        return result8b.response.text();
    } catch (err2) {
        console.error("Fallimento totale.");
        throw new Error("MODELLO_NON_SUPPORTATO");
    }
  }
}

export default scanWithRetry;
