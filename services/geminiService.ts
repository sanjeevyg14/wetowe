import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyBPgchl4fK3fJHnOQpRKNVAFQlQv_7gQhA' });

export const generatePackingList = async (location: string, duration: string): Promise<string[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a concise checklist of 7-10 essential packing items for a trip to ${location} for ${duration}. Return only the items as a JSON array of strings. Do not include markdown formatting like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    return ["Essential items list unavailable."];

  } catch (error) {
    console.error("Error generating packing list:", error);
     return [
      "Comfortable walking shoes",
      "Light cotton clothes",
      "Sunscreen and sunglasses",
      "Power bank",
      "Refillable water bottle",
      "Basic first aid kit",
      "Camera for memories!"
    ];
  }
};