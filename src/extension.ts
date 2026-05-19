import * as vscode from 'vscode';

const DEVELOPER_CREDITS = `
---
**Built by [Kumar Kislay](https://forg.to/@kislay)**
[X (Twitter)](https://x.com/whykislayy) | [LinkedIn](https://linkedin.com/in/kislayy)
`;

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
                const workspaceContext = await getWorkspaceContext();
                const expanded = await expandPromptLogic(selectedText, workspaceContext);
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
    const amplifyChat = vscode.chat.createChatParticipant('amplify', async (request, chatContext, stream, token) => {
        try {
            const workspaceContext = await getWorkspaceContext();
            
            if (request.command === 'consult') {
                const questions = await getConsultationQuestions(request.prompt, workspaceContext);
                stream.markdown(`### 🤔 Consultation for your prompt\n\n${questions}\n\n*Reply with your answers to get the final architected prompt.*`);
            } else if (request.command === 'breakdown') {
                const breakdown = await getTaskBreakdown(request.prompt, workspaceContext);
                stream.markdown(`### 📋 Task Breakdown\n\n${breakdown}`);
            } else {
                // Default: Expand
                const expandedPrompt = await expandPromptLogic(request.prompt, workspaceContext);
                stream.markdown(expandedPrompt);
            }
            
            stream.markdown(DEVELOPER_CREDITS);
            
        } catch (err) {
            stream.markdown(`❌ Error: ${err}`);
        }

        return { metadata: { command: request.command || 'expand' } };
    });

    context.subscriptions.push(expandCommand, amplifyChat);
}

/**
 * Summarizes the current workspace (files and directories) to provide context to the AI.
 */
async function getWorkspaceContext(): Promise<string> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) { return "No workspace folders open."; }

    const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 100);
    const fileList = files.map(f => vscode.workspace.asRelativePath(f)).join('\n');
    
    return `Current Workspace Context (top files):\n${fileList}\n`;
}

async function expandPromptLogic(shorthand: string, context: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('amplify');
    const systemPrompt = config.get<string>('systemPrompt') || '';
    
    const prompt = `${systemPrompt}\n\nWORKSPACE CONTEXT:\n${context}\n\nUSER SHORTHAND:\n${shorthand}`;
    return await callModel(prompt);
}

async function getConsultationQuestions(shorthand: string, context: string): Promise<string> {
    const prompt = `You are a Senior Software Architect. The user wants to do: "${shorthand}". 
    Based on the workspace context: ${context}, 
    Ask 3-4 highly specific technical questions that would help you write a perfect, comprehensive prompt for this task. 
    Focus on tech stack, patterns, and specific requirements. Be concise.`;
    return await callModel(prompt);
}

async function getTaskBreakdown(shorthand: string, context: string): Promise<string> {
    const prompt = `You are a Project Manager and Architect. The user wants to: "${shorthand}".
    Workspace: ${context}.
    Break this down into a sequence of specific tasks. For each task, provide a "Prompt" that the user can use to implement that specific part.
    Format as a structured list with clear goals for each step.`;
    return await callModel(prompt);
}

async function callModel(prompt: string): Promise<string> {
    const models = await vscode.lm.selectChatModels();
    if (models.length > 0) {
        const model = models[0];
        const messages = [vscode.LanguageModelChatMessage.User(prompt)];
        const chatResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
        let result = '';
        for await (const fragment of chatResponse.text) { result += fragment; }
        return result;
    }
    
    // Check for fallbacks (simple implementation for this version)
    const config = vscode.workspace.getConfiguration('amplify');
    const fallback = config.get<string>('fallbackProvider');
    if (fallback !== 'none') {
        return `[Fallback ${fallback} would process: ${prompt.substring(0, 50)}...]`;
    }

    throw new Error("No AI provider found. Please ensure Copilot is active.");
}

export function deactivate() {}
