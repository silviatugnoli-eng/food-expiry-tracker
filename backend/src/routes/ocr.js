import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  try {
    console.log("Inizio chiamata a Google...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const prompt = "Estrai nome prodotto e scadenza (AAAA-MM-DD) in JSON: {\"productName\": \"...\", \"expiryDate\": \"...\"}";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: "image/jpeg" } }
    ]);

    return result.response.text();
  } catch (err) {
    // Non usiamo più 'error', non usiamo log complessi. Solo una stringa fissa.
    console.error("Si è verificato un errore bloccante.");
    throw new Error("ERRORE_GOOGLE_GENERICO");
  }
}

export default scanWithRetry;
