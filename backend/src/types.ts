export interface EnhanceRequest {
  raw_prompt: string;
  language: string;
  filename: string;
  selected_code: string;
}

export interface EnhanceResponse {
  enhanced_prompt: string;
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}