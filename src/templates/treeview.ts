import * as vscode from 'vscode';
import { PromptTemplate, TemplateCategory } from '../types';
import { getAllTemplates, applyTemplate } from './builtin';
import { expandPrompt } from '../commands/expand';

/**
 * TreeView data provider for the prompt template library.
 */
export class TemplateTreeProvider implements vscode.TreeDataProvider<TemplateTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<TemplateTreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: TemplateTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TemplateTreeItem): TemplateTreeItem[] {
        if (!element) {
            // Root: show categories
            return this.getCategories();
        }

        if (element.contextValue === 'category') {
            // Category: show templates in that category
            const templates = getAllTemplates().filter(t => t.category === element.categoryId);
            return templates.map(t => new TemplateTreeItem(
                `${t.icon ?? '📄'} ${t.name}`,
                t.description,
                vscode.TreeItemCollapsibleState.None,
                'template',
                undefined,
                t,
            ));
        }

        return [];
    }

    private getCategories(): TemplateTreeItem[] {
        const categoryLabels: Record<TemplateCategory, { label: string; icon: string }> = {
            'api-design': { label: 'API Design', icon: '🌐' },
            'refactoring': { label: 'Refactoring', icon: '🔧' },
            'testing': { label: 'Testing', icon: '🧪' },
            'debugging': { label: 'Debugging', icon: '🐛' },
            'migration': { label: 'Migration', icon: '🚀' },
            'documentation': { label: 'Documentation', icon: '📝' },
            'architecture': { label: 'Architecture', icon: '🏗️' },
            'custom': { label: 'Custom', icon: '⭐' },
        };

        const usedCategories = new Set(getAllTemplates().map(t => t.category));

        return Array.from(usedCategories).map(cat => {
            const info = categoryLabels[cat] || { label: cat, icon: '📁' };
            return new TemplateTreeItem(
                `${info.icon} ${info.label}`,
                undefined,
                vscode.TreeItemCollapsibleState.Collapsed,
                'category',
                cat,
            );
        });
    }
}

export class TemplateTreeItem extends vscode.TreeItem {
    constructor(
        label: string,
        description: string | undefined,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly categoryId?: TemplateCategory,
        public readonly template?: PromptTemplate,
    ) {
        super(label, collapsibleState);
        this.description = description;
        this.tooltip = description;

        if (template) {
            this.command = {
                command: 'amplify.useTemplate',
                title: 'Use Template',
                arguments: [template],
            };
        }
    }
}

/**
 * Command handler: use a template.
 */
export async function useTemplateCommand(template: PromptTemplate): Promise<void> {
    const task = await vscode.window.showInputBox({
        prompt: `${template.name} — describe your task:`,
        placeHolder: 'e.g. user authentication service',
    });

    if (!task) { return; }

    const filledPrompt = applyTemplate(template, task);

    const choice = await vscode.window.showQuickPick(
        ['Copy to Clipboard', 'Expand with AI', 'Insert in Editor'],
        { placeHolder: 'What to do with the prompt?' },
    );

    switch (choice) {
        case 'Copy to Clipboard':
            await vscode.env.clipboard.writeText(filledPrompt);
            vscode.window.showInformationMessage('Template prompt copied to clipboard!');
            break;
        case 'Expand with AI':
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Amplify: Expanding template...',
            }, async () => {
                const expanded = await expandPrompt(filledPrompt);
                await vscode.env.clipboard.writeText(expanded);
                vscode.window.showInformationMessage('Expanded template copied to clipboard!');
            });
            break;
        case 'Insert in Editor': {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await editor.edit(edit => edit.insert(editor.selection.active, filledPrompt));
            }
            break;
        }
    }
}
