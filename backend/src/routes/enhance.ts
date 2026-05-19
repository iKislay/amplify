import { Request, Response } from "express";
import { EnhanceRequest, EnhanceResponse } from "../types.js";
import { enhancePrompt } from "../groq.js";

export async function handleEnhance(
  req: Request<unknown, unknown, EnhanceRequest>,
  res: Response<EnhanceResponse | { error: string }>
): Promise<void> {
  const { raw_prompt, language, filename, selected_code } = req.body;

  if (!raw_prompt || typeof raw_prompt !== "string") {
    res.status(400).json({ error: "raw_prompt is required" });
    return;
  }

  try {
    const result = await enhancePrompt({ raw_prompt, language, filename, selected_code });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Enhancement failed:", message);
    res.status(500).json({ error: message });
  }
}