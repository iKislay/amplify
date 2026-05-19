import process from "process";
import { EnhanceRequest, EnhanceResponse, GroqMessage } from "./types.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an expert prompt engineer for AI coding assistants.

You will receive a rough prompt from a developer along with their file name, language, and selected code as context. Rewrite the prompt into a precise, specific, actionable instruction that will produce high-quality output from a coding AI.

Rules:
- Keep the developer's original intent intact
- Add specificity using the file name, language, and code context provided
- Structure the prompt clearly: what to do, where, and what to consider
- Do not add unnecessary explanation. Return only the enhanced prompt.`;

function buildUserMessage(req: EnhanceRequest): string {
  const parts: string[] = [];

  parts.push(`File: ${req.filename}`);
  parts.push(`Language: ${req.language}`);

  if (req.selected_code.trim()) {
    parts.push(`Selected code:\n\`\`\`${req.language}\n${req.selected_code}\n\`\`\``);
  }

  parts.push(`Developer's prompt: "${req.raw_prompt}"`);
  parts.push(
    `\nRewrite this into a precise, actionable instruction for an AI coding assistant.`
  );

  return parts.join("\n");
}

export async function enhancePrompt(
  req: EnhanceRequest
): Promise<EnhanceResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  const messages: GroqMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(req) },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from Groq API");
  }

  return { enhanced_prompt: content };
}