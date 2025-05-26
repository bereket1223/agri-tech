import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

const chatSession = model.startChat({
  history: [],
  generationConfig: { maxOutputTokens: 1000 },
});

function formatFarmSummary(data: any): string {
  return `📅 Date: ${data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A"}
- Nitrogen: ${data.nitrogen}
- Phosphorus: ${data.phosphorus}
- Potassium: ${data.potassium}
- Temperature: ${data.temperature}°C
- Humidity: ${data.humidity}%
- pH: ${data.ph}
- Rainfall: ${data.rainfall} mm`;
}
export async function getChatResponse(message: string, farmData: any[]): Promise<string> {
  const context =formatFarmSummary(farmData);

  const prompt = `
You are an agricultural expert. Even if no farm summary is provided, give the best general advice based on the question.

Your task is to provide clear, accurate, and relevant answers to agricultural questions based strictly on the provided farm summary below. Keep responses brief and focused unless a more detailed explanation is explicitly requested by the user.

Provide clear, accurate, and practical answers to agricultural questions, tailored to the user's needs and context, while avoiding misinformation.

If the user's question is **non-agricultural**, politely inform them that you are an agricultural assistant and cannot assist with non-agricultural topics.

-------------------------
Farm Summary:
${context}
-------------------------

User Question:
${message}

Your Response:
`;

  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
}
