import { ModelProvider } from '../types';
import { getConfig } from '../config';
import { CopilotProvider } from './copilot';
import { GroqProvider } from './groq';
import { GeminiProvider } from './gemini';

const copilotProvider = new CopilotProvider();
const groqProvider = new GroqProvider();
const geminiProvider = new GeminiProvider();

/**
 * Resolves the best available model provider with fallback chain:
 * Copilot -> configured fallback (Groq/Gemini) -> error
 */
export async function resolveProvider(): Promise<ModelProvider> {
    if (await copilotProvider.isAvailable()) {
        return copilotProvider;
    }

    const config = getConfig();

    if (config.fallbackProvider === 'groq' && await groqProvider.isAvailable()) {
        return groqProvider;
    }

    if (config.fallbackProvider === 'gemini' && await geminiProvider.isAvailable()) {
        return geminiProvider;
    }

    throw new Error(
        'No AI provider available. Ensure GitHub Copilot is active or configure a fallback provider in settings.'
    );
}

/**
 * Send a prompt to the best available provider.
 */
export async function callModel(prompt: string): Promise<string> {
    const provider = await resolveProvider();
    return provider.sendRequest(prompt);
}

export { CopilotProvider, GroqProvider, GeminiProvider };
