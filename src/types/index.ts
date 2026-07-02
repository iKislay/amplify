import * as vscode from 'vscode';

export interface ExpandedPrompt {
    original: string;
    expanded: string;
    timestamp: number;
    score?: PromptScore;
}

export interface PromptScore {
    specificity: number;
    clarity: number;
    completeness: number;
    overall: number;
    feedback: string;
}

export interface PromptTemplate {
    id: string;
    name: string;
    category: TemplateCategory;
    description: string;
    template: string;
    icon?: string;
}

export type TemplateCategory =
    | 'api-design'
    | 'refactoring'
    | 'testing'
    | 'debugging'
    | 'migration'
    | 'documentation'
    | 'architecture'
    | 'custom';

export interface WorkspaceContext {
    files: string[];
    techStack: TechStack;
    activeFile?: string;
    activeFileContent?: string;
    openEditors?: string[];
}

export interface TechStack {
    languages: string[];
    frameworks: string[];
    testFramework?: string;
    linter?: string;
    packageManager?: string;
    isMonorepo: boolean;
}

export interface GitContext {
    branch: string;
    recentCommits: string[];
    stagedChanges: string[];
    unstageChanges: string[];
    diff: string;
}

export interface ModelProvider {
    name: string;
    sendRequest(prompt: string, token?: vscode.CancellationToken): Promise<string>;
    isAvailable(): Promise<boolean>;
}

export interface AmplifyConfig {
    systemPrompt: string;
    fallbackProvider: 'none' | 'groq' | 'gemini';
    groqApiKey: string;
    geminiApiKey: string;
    groqModel: string;
    geminiModel: string;
    enableCodeLens: boolean;
    enableStatusBar: boolean;
    templateDir?: string;
}
