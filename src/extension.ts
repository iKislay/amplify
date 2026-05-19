import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // 1. Register Editor Command (Selection/Input Box)
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

    // 2. Register Chat Participant (@amplify)
    // Now ONLY expands the prompt and returns the text.
    const amplifyChat = vscode.chat.createChatParticipant('amplify', async (request, context, stream, token) => {
        try {
            const expandedPrompt = await expandPromptLogic(request.prompt);
            
            // Just output the expanded prompt to the user
            stream.markdown(expandedPrompt);
            
        } catch (err) {
            stream.markdown(`❌ Error expanding prompt: ${err}`);
        }

        return { metadata: { command: 'expand' } };
    });

    context.subscriptions.push(expandCommand, amplifyChat);
}

/**
 * Core expansion logic using vscode.lm or fallback providers.
 */
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
    if (provider === 'groq') {
        const apiKey = config.get<string>('groqApiKey');
        if (!apiKey) { throw new Error("Groq API Key is missing."); }
        return `[Groq Expansion for: ${prompt.substring(0, 30)}...]`;
    }
    if (provider === 'gemini') {
        const apiKey = config.get<string>('geminiApiKey');
        if (!apiKey) { throw new Error("Gemini API Key is missing."); }
        return `[Gemini Expansion for: ${prompt.substring(0, 30)}...]`;
    }
    return '';
}

export function deactivate() {}
