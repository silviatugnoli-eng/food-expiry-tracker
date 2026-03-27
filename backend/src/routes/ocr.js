import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanWithRetry(imageData) {
  try {
    console.log("--- ISPEZIONE DATI RICEVUTI ---");
    
    // Vediamo cosa c'è dentro imageData
    if (imageData && typeof imageData === 'object') {
        console.log("Chiavi trovate nell'oggetto:", Object.keys(imageData));
    }

    // Cerchiamo la stringa base64 in tutti i posti probabili
    let base64String = "";
    if (typeof imageData === 'string') {
        base64String = imageData;
    } else if (imageData.image) {
        base64String = imageData.image;
    } else if (imageData.imageData) {
        base64String = imageData.imageData;
    } else if (imageData.data) {
        base64String = imageData.data;
    }

    if (!base64String || base64String.length < 100) {
      console.error("Dati insufficienti. Lunghezza stringa:", base64String?.length);
      throw new Error("Formato immagine non valido o stringa troppo corta");
    }

    const cleanBase64 = base64String.includes(",") ? base64String.split(",")[1] : base64String;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      "Analizza l'immagine e restituisci SOLO JSON: productName, expiryDate (AAAA-MM-DD)",
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text();
    console.log("SUCCESSO: Google ha risposto!");
    return text;

  } catch (error) {
    console.error("ERRORE DETTAGLIATO:", error.message);
    throw error;
  }
}

export default scanWithRetry;
