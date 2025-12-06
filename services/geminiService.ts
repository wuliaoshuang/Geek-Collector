import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCardResponse, Rarity } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Step 1: Generate the card metadata (stats, lore, visual description)
 */
export const generateCardMetadata = async (): Promise<GeneratedCardResponse> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    你是一个复古未来主义科幻宇宙的“系统核心”。
    你的任务是程序化生成一个在数字废土中发现的独特“造物”或“故障实体”。
    
    基调应该是：科学的、神秘的、赛博朋克的、低保真(Lo-fi)的。
    
    输出语言要求：
    - name, type, description 必须使用 **简体中文**。
    - visualPrompt 必须使用 **英文** (English)，以便于图像生成器理解。
    
    稀有度权重 (Rarity Weights):
    - COMMON (普通): 50%
    - UNCOMMON (非凡): 30%
    - RARE (稀有): 15%
    - ANOMALY (异变): 4%
    - LEGENDARY (传说): 1%

    关于 'visualPrompt': 描述一个 1-bit 或 2-bit 像素艺术风格的物体。提及高对比度、黑白或单色、复古计算机图形风格。
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: "Generate a new artifact data log.",
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Cryptic or technical name of the item in Chinese" },
          type: { type: Type.STRING, description: "Category e.g., Module, Key, Weapon in Chinese" },
          description: { type: Type.STRING, description: "Short lore description (max 30 words) in Chinese" },
          rarity: { type: Type.STRING, enum: Object.values(Rarity) },
          stats: {
            type: Type.OBJECT,
            properties: {
              integrity: { type: Type.INTEGER, description: "0-100" },
              complexity: { type: Type.INTEGER, description: "0-100" },
              energy: { type: Type.INTEGER, description: "0-100" },
            },
            required: ["integrity", "complexity", "energy"]
          },
          visualPrompt: { type: Type.STRING, description: "Prompt for image generator in English." }
        },
        required: ["name", "type", "description", "rarity", "stats", "visualPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate card metadata");
  
  return JSON.parse(text) as GeneratedCardResponse;
};

/**
 * Step 2: Generate the image based on the visual prompt
 */
export const generateCardImage = async (visualPrompt: string): Promise<string> => {
  const model = "gemini-2.5-flash-image"; // Using the flash-image model for speed/cost in this context

  const finalPrompt = `Pixel art icon, 1-bit dithered style, pure black and white, retro interface asset. ${visualPrompt}`;

  const response = await ai.models.generateContent({
    model: model,
    contents: finalPrompt,
    config: {
      // No schema/mime for image generation call in this model for images usually
    }
  });

  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            return `data:image/png;base64,${base64EncodeString}`;
        }
    }
  }

  throw new Error("No image generated");
};