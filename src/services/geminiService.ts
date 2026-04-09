import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DetectionResult {
  label: "Stain" | "Hole" | "Broken yarn" | "Not fabric" | "No defect detected";
  confidence: number;
  description: string;
}

export async function detectFabricDefect(base64Image: string): Promise<DetectionResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        {
          text: `Analyze this image for fabric defects. Classify it into one of these categories: "Stain", "Hole", "Broken yarn", "Not fabric", or "No defect detected". 
          Provide the result in JSON format with 'label', 'confidence' (0-1), and a brief 'description'.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
          },
          required: ["label", "confidence", "description"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as DetectionResult;
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    throw error;
  }
}
