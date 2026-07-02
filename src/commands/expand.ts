import * as vscode from 'vscode';
import { callModel } from '../providers';
import { getWorkspaceContext, formatWorkspaceContext, getGitContext, formatGitContext } from '../context';
import { getConfig } from '../config';

/**
 * Handles the amplify.expandPrompt command.
 * Expands selected text or input box text into a detailed prompt.
 */
export async function expandPromptCommand(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    let selectedText = '';
    let range: vscode.Range | undefined;

    if (editor && !editor.selection.isEmpty) {
        range = editor.selection;
        selectedText = editor.document.getText(range);
    }

    if (!selectedText) {
        selectedText = await vscode.window.showInputBox({
            prompt: 'Enter your short prompt to expand:',
            placeHolder: 'e.g. build a react login component',
        }) || '';
    }

    if (!selectedText) { return; }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Amplify: Expanding prompt...',
        cancellable: false,
    }, async () => {
        try {
            const expanded = await expandPrompt(selectedText);
            if (range && editor) {
                await editor.edit(editBuilder => editBuilder.replace(range!, expanded));
            } else {
                await vscode.env.clipboard.writeText(expanded);
                vscode.window.showInformationMessage('Expanded prompt copied to clipboard!');
            }
        } catch (err) {
            vscode.window.showErrorMessage(`Amplify Error: ${err}`);
        }
    });
}

/**
 * Core prompt expansion logic — used by both the command and chat participant.
 */
export async function expandPrompt(shorthand: string): Promise<string> {
    const config = getConfig();
    const wsContext = await getWorkspaceContext();
    const gitContext = await getGitContext();

    const contextStr = [
        formatWorkspaceContext(wsContext),
        formatGitContext(gitContext),
    ].filter(Boolean).join('\n\n');

    const prompt = `${config.systemPrompt}\n\nWORKSPACE CONTEXT:\n${contextStr}\n\nUSER SHORTHAND:\n${shorthand}`;
    return callModel(prompt);
}
