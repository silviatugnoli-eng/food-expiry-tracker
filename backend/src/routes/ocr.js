import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  // LOG DI DEBUG PER VEDERE SE LA CHIAVE È CARICATA
  const key = process.env.GEMINI_API_KEY || "";
  console.log(`Debug: La chiave inizia con ${key.substring(0, 4)}...`);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Rispondi OK",
      { inlineData: { data: imageData, mimeType: "image/jpeg" } }
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Errore reale da Google:", error.message);
    throw new Error("MODELLO_NON_SUPPORTATO");
  }
}

export default scanWithRetry;
