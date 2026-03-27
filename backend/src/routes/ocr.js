import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(body) {
  console.log("--- FASE FINALE DI ANALISI ---");
  
  // Il frontend invia { image: "base64..." }
  const base64String = body.image || body.imageData || body.data;

  if (!base64String || base64String.length < 100) {
    console.log("Dati ricevuti incompleti. Lunghezza:", base64String?.length || 0);
    throw new Error("Immagine non pervenuta correttamente al server");
  }

  const cleanBase64 = base64String.includes(",") ? base64String.split(",")[1] : base64String;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    "Analizza l'immagine. Restituisci SOLO un JSON: {\"productName\": \"...\", \"expiryDate\": \"YYYY-MM-DD\"}",
    { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
  ]);

  return result.response.text();
}

export default scanWithRetry;
