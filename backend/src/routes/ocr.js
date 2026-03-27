import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  try {
    console.log("--- NUOVO TENTATIVO DEPLOY ---");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Analizza immagine e rispondi JSON: productName, expiryDate",
      { inlineData: { data: imageData, mimeType: "image/jpeg" } }
    ]);
    return result.response.text();
  } catch (error) {
    console.error("ERRORE GOOGLE:", error.message);
    throw error;
  }
}

export default scanWithRetry;
