import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.expandPrompt', async () => {
        const editor = vscode.window.activeTextEditor;
        let selectedText = '';
        let range: vscode.Range | undefined;

        // Check if text is selected
        if (editor && !editor.selection.isEmpty) {
            range = editor.selection;
            selectedText = editor.document.getText(range);
        }

        // If no text is selected, ask the user via input box
        if (!selectedText) {
            selectedText = await vscode.window.showInputBox({
                prompt: "Enter your short prompt to expand:",
                placeHolder: "e.g. build a react login component"
            }) || '';
        }

        if (!selectedText) {
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Expanding prompt...",
            cancellable: false
        }, async (progress) => {
            try {
                const systemPrompt = vscode.workspace.getConfiguration('promptExpander').get<string>('systemPrompt') || '';
                
                // Select available chat models (filtering for common ones or just picking what's available)
                const models = await vscode.lm.selectChatModels();

                if (models.length === 0) {
                    vscode.window.showErrorMessage("No suitable language model found. Please ensure Copilot is active.");
                    return;
                }

                // Use the first available model
                const model = models[0];
                
                const messages = [
                    vscode.LanguageModelChatMessage.User(systemPrompt),
                    vscode.LanguageModelChatMessage.User(selectedText)
                ];

                const chatResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
                
                let expandedPrompt = '';
                for await (const fragment of chatResponse.text) {
                    expandedPrompt += fragment;
                }

                if (range && editor) {
                    // Replace selected text
                    await editor.edit(editBuilder => {
                        editBuilder.replace(range!, expandedPrompt);
                    });
                } else {
                    // Copy to clipboard and show notification
                    await vscode.env.clipboard.writeText(expandedPrompt);
                    vscode.window.showInformationMessage("Expanded prompt copied to clipboard!");
                }
            } catch (err) {
                vscode.window.showErrorMessage(`Error expanding prompt: ${err}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
