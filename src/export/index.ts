import * as vscode from 'vscode';

/**
 * Export expanded prompts to various formats.
 */
export async function exportPromptCommand(): Promise<void> {
    const clipboardContent = await vscode.env.clipboard.readText();

    if (!clipboardContent) {
        vscode.window.showWarningMessage('No prompt in clipboard. Expand a prompt first.');
        return;
    }

    const choice = await vscode.window.showQuickPick(
        [
            { label: '$(file) Save as Markdown', value: 'markdown' },
            { label: '$(file) Save as .prompt.md', value: 'prompt-md' },
            { label: '$(copy) Copy as formatted', value: 'formatted' },
        ],
        { placeHolder: 'Export prompt as...' },
    );

    if (!choice) { return; }

    switch (choice.value) {
        case 'markdown':
            await saveToFile(clipboardContent, 'md');
            break;
        case 'prompt-md':
            await saveToFile(wrapAsPromptMd(clipboardContent), 'prompt.md');
            break;
        case 'formatted':
            await vscode.env.clipboard.writeText(formatPromptMarkdown(clipboardContent));
            vscode.window.showInformationMessage('Formatted prompt copied to clipboard!');
            break;
    }
}

async function saveToFile(content: string, extension: string): Promise<void> {
    const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(`amplify-prompt.${extension}`),
        filters: { 'Markdown': ['md'], 'All Files': ['*'] },
    });

    if (uri) {
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
        vscode.window.showInformationMessage(`Prompt saved to ${uri.fsPath}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
    }
}

function wrapAsPromptMd(content: string): string {
    return `---
description: Amplify-generated prompt
---

${content}
`;
}

function formatPromptMarkdown(content: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `# Amplify Prompt (${timestamp})\n\n${content}\n`;
}
