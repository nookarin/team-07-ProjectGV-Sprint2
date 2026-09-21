import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

export const chatbotRouter = Router();

const MODEL_NAME = "gemini-3.6-flash";

const SYSTEM_INSTRUCTION =
  "You are an AI customer service assistant for GearVerse, a gaming gear " +
  "e-commerce website that sells gaming keyboards, mice, headsets and related " +
  "accessories. Help users find products, answer questions about shipping, " +
  "returns, warranties and payment, and recommend gaming gear based on their " +
  "needs. Keep answers friendly, concise and helpful. If you are unsure about " +
  "pricing or availability, tell the user to check the product page for the " +
  "most up-to-date information.";

function normalizeHistory(history = []) {
  return history.map((entry) => {
    if (entry.parts) {
      return { role: entry.role, parts: entry.parts };
    }
    const text = entry.text ?? entry.content ?? "";
    return { role: entry.role, parts: [{ text }] };
  });
}

chatbotRouter.post("/", async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required!",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured!",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const contents = [
      ...normalizeHistory(history),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    return res
      .status(200)
      .json({ success: true, reply: response.text });
  } catch (error) {
    console.log(error);
    next(error);
  }
});