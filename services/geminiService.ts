import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedCardResponse, Rarity, MissionDifficulty, ActiveMissionData, MissionVerificationResult } from "../types";

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

/**
 * Mission System: Generate a Challenge
 */
export const generateMission = async (difficulty: MissionDifficulty, type: 'PYTHON' | 'LOGIC' | 'CRYPTO'): Promise<ActiveMissionData> => {
    const model = "gemini-2.5-flash";
    
    const systemInstruction = `
      You are the 'Mainframe Security Protocol' (主机安全协议).
      Your task is to generate a challenge for a user who is trying to hack the system to earn credits.
      
      Difficulty Levels:
      - EASY: Basic syntax, simple riddles, base64 decoding.
      - MEDIUM: Loops, string manipulation, lateral thinking logic, hex math.
      - HARD: Recursion, complex algorithms, multi-step logic, bitwise operations.

      If type is 'PYTHON': Generate a coding question. Ask the user to write a specific function.
      If type is 'LOGIC': Generate a short but tricky riddle or sequence puzzle.
      If type is 'CRYPTO': Generate a decryption task or a hash identification task.

      Output Requirements:
      - **description**: The question text shown to the user. **MUST BE IN SIMPLIFIED CHINESE**. Keep it concise, technical, and terminal-style.
      - context: The hidden solution or test case logic that you will use later to verify the user's answer (can be English or Code).
    `;
  
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a ${difficulty} difficulty ${type} challenge.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            context: { type: Type.STRING },
          },
          required: ["description", "context"]
        }
      }
    });
  
    const text = response.text;
    if (!text) throw new Error("Failed to generate mission");
    
    return JSON.parse(text) as ActiveMissionData;
};

/**
 * Mission System: Verify the Answer
 */
export const verifyMissionAnswer = async (
    originalQuestion: string, 
    context: string, 
    userAnswer: string
): Promise<MissionVerificationResult> => {
    const model = "gemini-2.5-flash";

    const systemInstruction = `
      You are a strict code compiler and logic verifier. 
      The user is trying to solve a puzzle.
      
      Input Context:
      1. Question: The challenge given.
      2. Hidden Context/Solution: The expected answer or logic provided by the system.
      3. User Answer: The code or text the user submitted.

      Task:
      Determine if the User Answer solves the Question based on the Context.
      - For Python code: It should be syntactically correct and solve the problem. Be flexible with variable names unless specified.
      - For Logic/Crypto: The answer must be precise.

      Output JSON:
      - success: boolean
      - message: A short system message in **SIMPLIFIED CHINESE**. 
        If success: e.g., "执行完毕", "访问许可", "哈希匹配成功". 
        If fail: e.g., "语法错误", "返回值无效", "拒绝访问", "逻辑不符".
    `;

    const prompt = `
      Question: ${originalQuestion}
      Hidden Context: ${context}
      User Answer: ${userAnswer}
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    success: { type: Type.BOOLEAN },
                    message: { type: Type.STRING },
                },
                required: ["success", "message"]
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("Failed to verify mission");

    return JSON.parse(text) as MissionVerificationResult;
};