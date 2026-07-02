import * as vscode from 'vscode';
import { AmplifyConfig } from './types';
import { DEFAULT_SYSTEM_PROMPT } from './constants';

export function getConfig(): AmplifyConfig {
    const config = vscode.workspace.getConfiguration('amplify');

    return {
        systemPrompt: config.get<string>('systemPrompt') || DEFAULT_SYSTEM_PROMPT,
        fallbackProvider: config.get<'none' | 'groq' | 'gemini'>('fallbackProvider') || 'none',
        groqApiKey: config.get<string>('groqApiKey') || '',
        geminiApiKey: config.get<string>('geminiApiKey') || '',
        groqModel: config.get<string>('groqModel') || 'llama-3.3-70b-versatile',
        geminiModel: config.get<string>('geminiModel') || 'gemini-2.0-flash',
        enableCodeLens: config.get<boolean>('enableCodeLens') ?? true,
        enableStatusBar: config.get<boolean>('enableStatusBar') ?? true,
        templateDir: config.get<string>('templateDir'),
    };
}
