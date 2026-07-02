import { ModelProvider } from '../types';
import { getConfig } from '../config';
import { GEMINI_API_URL } from '../constants';

/**
 * Google Gemini provider.
 */
export class GeminiProvider implements ModelProvider {
    readonly name = 'gemini';

    async isAvailable(): Promise<boolean> {
        const config = getConfig();
        return config.geminiApiKey.length > 0;
    }

    async sendRequest(prompt: string): Promise<string> {
        const config = getConfig();
        if (!config.geminiApiKey) {
            throw new Error('Gemini API key not configured. Set amplify.geminiApiKey in settings.');
        }

        const url = `${GEMINI_API_URL}/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json() as {
            candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
        };

        return data.candidates[0]?.content?.parts[0]?.text ?? '';
    }
}
