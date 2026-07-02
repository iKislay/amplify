import { ModelProvider } from '../types';
import { getConfig } from '../config';
import { GROQ_API_URL } from '../constants';

/**
 * Groq cloud inference provider.
 */
export class GroqProvider implements ModelProvider {
    readonly name = 'groq';

    async isAvailable(): Promise<boolean> {
        const config = getConfig();
        return config.groqApiKey.length > 0;
    }

    async sendRequest(prompt: string): Promise<string> {
        const config = getConfig();
        if (!config.groqApiKey) {
            throw new Error('Groq API key not configured. Set amplify.groqApiKey in settings.');
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.groqApiKey}`,
            },
            body: JSON.stringify({
                model: config.groqModel,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4096,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Groq API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json() as {
            choices: Array<{ message: { content: string } }>;
        };

        return data.choices[0]?.message?.content ?? '';
    }
}
