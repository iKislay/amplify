import * as vscode from 'vscode';
import { getConfig } from '../config';

/**
 * CodeLens provider that shows "Amplify" actions above functions and classes.
 */
export class AmplifyCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const config = getConfig();
        if (!config.enableCodeLens) { return []; }

        const lenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const symbolMatch = this.detectSymbol(line, document.languageId);

            if (symbolMatch) {
                const range = new vscode.Range(i, 0, i, line.length);

                lenses.push(new vscode.CodeLens(range, {
                    title: '⚡ Amplify: Expand',
                    command: 'amplify.codeLensExpand',
                    arguments: [document, range, symbolMatch],
                }));

                lenses.push(new vscode.CodeLens(range, {
                    title: '🧪 Test',
                    command: 'amplify.codeLensTest',
                    arguments: [document, range, symbolMatch],
                }));

                lenses.push(new vscode.CodeLens(range, {
                    title: '📝 Document',
                    command: 'amplify.codeLensDocument',
                    arguments: [document, range, symbolMatch],
                }));
            }
        }

        return lenses;
    }

    private detectSymbol(line: string, languageId: string): string | null {
        const trimmed = line.trim();

        // TypeScript/JavaScript patterns
        if (['typescript', 'javascript', 'typescriptreact', 'javascriptreact'].includes(languageId)) {
            const patterns = [
                /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
                /^(?:export\s+)?class\s+(\w+)/,
                /^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/,
                /^(?:export\s+)?interface\s+(\w+)/,
            ];
            for (const pattern of patterns) {
                const match = trimmed.match(pattern);
                if (match) { return match[1]; }
            }
        }

        // Python patterns
        if (languageId === 'python') {
            const patterns = [
                /^(?:async\s+)?def\s+(\w+)/,
                /^class\s+(\w+)/,
            ];
            for (const pattern of patterns) {
                const match = trimmed.match(pattern);
                if (match) { return match[1]; }
            }
        }

        // Go patterns
        if (languageId === 'go') {
            const match = trimmed.match(/^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)/);
            if (match) { return match[1]; }
        }

        // Rust patterns
        if (languageId === 'rust') {
            const patterns = [
                /^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/,
                /^(?:pub\s+)?struct\s+(\w+)/,
                /^(?:pub\s+)?impl\s+(\w+)/,
            ];
            for (const pattern of patterns) {
                const match = trimmed.match(pattern);
                if (match) { return match[1]; }
            }
        }

        return null;
    }

    refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
}

/**
 * Get the full function/class body from the document starting at the given range.
 */
export function getSymbolBody(document: vscode.TextDocument, startLine: number): string {
    const lines = document.getText().split('\n');
    let braceCount = 0;
    let started = false;
    let endLine = startLine;

    for (let i = startLine; i < lines.length; i++) {
        for (const char of lines[i]) {
            if (char === '{' || char === '(') { braceCount++; started = true; }
            if (char === '}' || char === ')') { braceCount--; }
        }
        endLine = i;
        if (started && braceCount <= 0) { break; }
        // For Python (indentation-based), stop at dedent
        if (document.languageId === 'python' && i > startLine && lines[i].trim() !== '' && !lines[i].startsWith(' ') && !lines[i].startsWith('\t')) {
            endLine = i - 1;
            break;
        }
    }

    return lines.slice(startLine, endLine + 1).join('\n');
}
