import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // 1. Register Editor Command
    let expandCommand = vscode.commands.registerCommand('amplify.expandPrompt', async () => {
        const editor = vscode.window.activeTextEditor;
        let selectedText = '';
        let range: vscode.Range | undefined;

        if (editor && !editor.selection.isEmpty) {
            range = editor.selection;
            selectedText = editor.document.getText(range);
        }

        if (!selectedText) {
            selectedText = await vscode.window.showInputBox({
                prompt: "Enter your short prompt to expand:",
                placeHolder: "e.g. build a react login component"
            }) || '';
        }

        if (!selectedText) { return; }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Expanding prompt...",
            cancellable: false
        }, async (progress) => {
            try {
                const expanded = await expandPromptLogic(selectedText);
                if (range && editor) {
                    await editor.edit(editBuilder => editBuilder.replace(range!, expanded));
                } else {
                    await vscode.env.clipboard.writeText(expanded);
                    vscode.window.showInformationMessage("Expanded prompt copied to clipboard!");
                }
            } catch (err) {
                vscode.window.showErrorMessage(`Error: ${err}`);
            }
        });
    });

    // 2. Register Chat Participant
    const amplifyChat = vscode.chat.createChatParticipant('amplify', async (request, context, stream, token) => {
        stream.markdown('✨ *Amplify is expanding your prompt...*\n\n');

        try {
            const expandedPrompt = await expandPromptLogic(request.prompt);
            stream.markdown('🚀 *Generating code from expanded prompt...*\n\n');

            const config = vscode.workspace.getConfiguration('amplify');
            const fallback = config.get<string>('fallbackProvider');

            // Try vscode.lm first
            const models = await vscode.lm.selectChatModels();
            if (models.length > 0) {
                const model = models[0];
                const messages = [vscode.LanguageModelChatMessage.User(expandedPrompt)];
                const chatResponse = await model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    stream.markdown(fragment);
                }
            } else if (fallback === 'groq' || fallback === 'gemini') {
                stream.markdown(`*Using ${fallback} fallback...*\n\n`);
                const result = await callExternalFallback(expandedPrompt, fallback, config);
                stream.markdown(result);
            } else {
                stream.markdown('❌ No AI provider available. Install GitHub Copilot or configure a fallback API key.');
            }
        } catch (err) {
            stream.markdown(`❌ Error: ${err}`);
        }

        return { metadata: { command: 'expand' } };
    });

    context.subscriptions.push(expandCommand, amplifyChat);
}

async function expandPromptLogic(shorthand: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('amplify');
    const systemPrompt = config.get<string>('systemPrompt') || '';
    const fallback = config.get<string>('fallbackProvider');

    try {
        const models = await vscode.lm.selectChatModels();
        if (models.length > 0) {
            const model = models[0];
            const messages = [
                vscode.LanguageModelChatMessage.User(systemPrompt),
                vscode.LanguageModelChatMessage.User(shorthand)
            ];
            const chatResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
            let result = '';
            for await (const fragment of chatResponse.text) { result += fragment; }
            return result;
        }
    } catch (e) {
        // Fall through to fallback
    }

    if (fallback === 'groq' || fallback === 'gemini') {
        return await callExternalFallback(`${systemPrompt}\n\nUser shorthand: ${shorthand}`, fallback, config);
    }

    throw new Error("No AI provider found. Please ensure Copilot is active or configure a fallback provider.");
}

async function callExternalFallback(prompt: string, provider: string, config: vscode.WorkspaceConfiguration): Promise<string> {
    // Basic implementation of external API calls
    if (provider === 'groq') {
        const apiKey = config.get<string>('groqApiKey');
        if (!apiKey) { throw new Error("Groq API Key is missing."); }
        // Simple mock of fetch logic for brevity in this example
        return `[Groq Expansion for: ${prompt.substring(0, 30)}...] (Note: Ensure 'node-fetch' or similar is used for real implementation)`;
    }
    if (provider === 'gemini') {
        const apiKey = config.get<string>('geminiApiKey');
        if (!apiKey) { throw new Error("Gemini API Key is missing."); }
        return `[Gemini Expansion for: ${prompt.substring(0, 30)}...]`;
    }
    return '';
}

export function deactivate() {}
