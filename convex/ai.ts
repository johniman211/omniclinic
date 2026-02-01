
import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";

export const clinicalAssistant = action({
  args: {
    organizationId: v.id("organizations"),
    prompt: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Fixed: Initializing GoogleGenAI using process.env.API_KEY directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const fullPrompt = `
      You are a clinical AI assistant for OmniClinic.
      System Context: ${args.context || "No additional context"}
      User Request: ${args.prompt}
      Return response in STRICT JSON format: { "text": "your response", "tokensApprox": 0 }
    `;

    try {
      // Fixed: Use correct gemini-3 series model for clinical reasoning tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      // Fixed: Access response text property directly (not as a function)
      const text = response.text || "{}";
      
      try {
        // Attempt to parse JSON from the extracted text
        return JSON.parse(text);
      } catch (e) {
        return { text: text, tokensApprox: text.length / 4 };
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      return { error: "AI_FAILURE", message: "Failed to communicate with Gemini" };
    }
  },
});
