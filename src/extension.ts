import * as vscode from 'vscode';
import { COMMANDS } from './constants';
import { getConfig } from './config';
import { expandPromptCommand } from './commands';
import { registerChatParticipant } from './chat';
import { TemplateTreeProvider, useTemplateCommand } from './templates';
import { AmplifyCodeLensProvider, codeLensExpandCommand, codeLensTestCommand, codeLensDocumentCommand } from './codelens';
import { AmplifyStatusBar } from './views';
import { exportPromptCommand } from './export';

export function activate(context: vscode.ExtensionContext) {
    const config = getConfig();

    // --- Commands ---
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.EXPAND_PROMPT, expandPromptCommand),
        vscode.commands.registerCommand(COMMANDS.EXPORT_PROMPT, exportPromptCommand),
        vscode.commands.registerCommand('amplify.useTemplate', useTemplateCommand),
        vscode.commands.registerCommand('amplify.codeLensExpand', codeLensExpandCommand),
        vscode.commands.registerCommand('amplify.codeLensTest', codeLensTestCommand),
        vscode.commands.registerCommand('amplify.codeLensDocument', codeLensDocumentCommand),
    );

    // --- Chat Participant ---
    registerChatParticipant(context);

    // --- Template TreeView ---
    const templateProvider = new TemplateTreeProvider();
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('amplifyTemplates', templateProvider),
        vscode.commands.registerCommand(COMMANDS.REFRESH_TEMPLATES, () => templateProvider.refresh()),
    );

    // --- CodeLens ---
    if (config.enableCodeLens) {
        const codeLensProvider = new AmplifyCodeLensProvider();
        const supportedLanguages = [
            'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
            'python', 'go', 'rust',
        ];
        for (const lang of supportedLanguages) {
            context.subscriptions.push(
                vscode.languages.registerCodeLensProvider({ language: lang }, codeLensProvider),
            );
        }
    }

    // --- Status Bar ---
    if (config.enableStatusBar) {
        const statusBar = new AmplifyStatusBar();
        statusBar.show();
        context.subscriptions.push(statusBar);
    }
}

export function deactivate() {}
