import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

try {
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI", error);
}

export const generateResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  if (!ai) return "AI Service not configured. Missing API Key.";

  try {
    // Construct a context-aware prompt
    const contextPrompt = `
You are the SOVR Protocol AI Assistant. You are embedded in the SOVR Unified Credit System.
Your goal is to assist users with:
1. Swapping SOVR for sFIAT (USDC) on the Credit Terminal.
2. Normalizing sFIAT into off-chain USD Credits.
3. Using the USD Gateway to process Stripe payments.

You are fast, concise, and professional. The user is currently using the app.
Current Model: gemini-2.5-flash-lite (optimized for low latency).

User Query: ${newMessage}
    `;

    // Using gemini-flash-lite-latest as requested for low latency
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: [
        ...history.map(msg => ({ 
            role: msg.role === 'user' ? 'user' : 'model', 
            parts: [{ text: msg.text }] 
        })),
        { role: 'user', parts: [{ text: contextPrompt }] }
      ],
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the neural core. Please try again.";
  }
};
