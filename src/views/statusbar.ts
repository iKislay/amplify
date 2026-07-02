import * as vscode from 'vscode';

/**
 * Status bar item providing quick access to Amplify expand.
 */
export class AmplifyStatusBar implements vscode.Disposable {
    private item: vscode.StatusBarItem;

    constructor() {
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.item.text = '$(zap) Amplify';
        this.item.tooltip = 'Click to expand a prompt with Amplify';
        this.item.command = 'amplify.expandPrompt';
    }

    show(): void {
        this.item.show();
    }

    hide(): void {
        this.item.hide();
    }

    dispose(): void {
        this.item.dispose();
    }

    /**
     * Temporarily update text (e.g., during processing).
     */
    setProcessing(active: boolean): void {
        if (active) {
            this.item.text = '$(loading~spin) Amplify...';
            this.item.tooltip = 'Expanding prompt...';
        } else {
            this.item.text = '$(zap) Amplify';
            this.item.tooltip = 'Click to expand a prompt with Amplify';
        }
    }
}
