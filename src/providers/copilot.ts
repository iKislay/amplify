import * as vscode from 'vscode';
import { ModelProvider } from '../types';

/**
 * Uses the VS Code Language Model API (Copilot) as primary provider.
 */
export class CopilotProvider implements ModelProvider {
    readonly name = 'copilot';

    async isAvailable(): Promise<boolean> {
        const models = await vscode.lm.selectChatModels();
        return models.length > 0;
    }

    async sendRequest(prompt: string, token?: vscode.CancellationToken): Promise<string> {
        const models = await vscode.lm.selectChatModels();
        if (models.length === 0) {
            throw new Error('No Copilot model available.');
        }

        const model = models[0];
        const messages = [vscode.LanguageModelChatMessage.User(prompt)];
        const cancellation = token ?? new vscode.CancellationTokenSource().token;
        const response = await model.sendRequest(messages, {}, cancellation);

        let result = '';
        for await (const fragment of response.text) {
            result += fragment;
        }
        return result;
    }
}
