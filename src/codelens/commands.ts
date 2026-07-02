import * as vscode from 'vscode';
import { expandPrompt } from '../commands/expand';
import { getSymbolBody } from './provider';

/**
 * CodeLens command handlers for Amplify actions on code symbols.
 */

export async function codeLensExpandCommand(
    document: vscode.TextDocument,
    range: vscode.Range,
    symbolName: string,
): Promise<void> {
    const body = getSymbolBody(document, range.start.line);
    const shorthand = `Analyze and suggest improvements for the function/class "${symbolName}":\n\`\`\`\n${body}\n\`\`\``;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Amplify: Analyzing ${symbolName}...`,
    }, async () => {
        const expanded = await expandPrompt(shorthand);
        await vscode.env.clipboard.writeText(expanded);
        vscode.window.showInformationMessage(`Analysis of "${symbolName}" copied to clipboard!`);
    });
}

export async function codeLensTestCommand(
    document: vscode.TextDocument,
    range: vscode.Range,
    symbolName: string,
): Promise<void> {
    const body = getSymbolBody(document, range.start.line);
    const filePath = vscode.workspace.asRelativePath(document.uri);
    const shorthand = `Write comprehensive unit tests for "${symbolName}" in file "${filePath}":\n\`\`\`${document.languageId}\n${body}\n\`\`\``;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Amplify: Generating test prompt for ${symbolName}...`,
    }, async () => {
        const expanded = await expandPrompt(shorthand);
        await vscode.env.clipboard.writeText(expanded);
        vscode.window.showInformationMessage(`Test prompt for "${symbolName}" copied to clipboard!`);
    });
}

export async function codeLensDocumentCommand(
    document: vscode.TextDocument,
    range: vscode.Range,
    symbolName: string,
): Promise<void> {
    const body = getSymbolBody(document, range.start.line);
    const shorthand = `Write thorough documentation for "${symbolName}":\n\`\`\`${document.languageId}\n${body}\n\`\`\``;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Amplify: Generating doc prompt for ${symbolName}...`,
    }, async () => {
        const expanded = await expandPrompt(shorthand);
        await vscode.env.clipboard.writeText(expanded);
        vscode.window.showInformationMessage(`Doc prompt for "${symbolName}" copied to clipboard!`);
    });
}
