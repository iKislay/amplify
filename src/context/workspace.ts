import * as vscode from 'vscode';
import { WorkspaceContext, TechStack } from '../types';

/**
 * Gathers rich workspace context including tech stack detection,
 * active editor content, and open files.
 */
export async function getWorkspaceContext(): Promise<WorkspaceContext> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
        return { files: [], techStack: emptyTechStack() };
    }

    const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 150);
    const fileList = files.map(f => vscode.workspace.asRelativePath(f));

    const techStack = await detectTechStack(fileList);
    const activeFile = vscode.window.activeTextEditor
        ? vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.uri)
        : undefined;

    let activeFileContent: string | undefined;
    if (vscode.window.activeTextEditor) {
        const doc = vscode.window.activeTextEditor.document;
        // Include first 200 lines to avoid overwhelming the context
        const endLine = Math.min(doc.lineCount, 200);
        activeFileContent = doc.getText(new vscode.Range(0, 0, endLine, 0));
    }

    const openEditors = vscode.window.tabGroups.all
        .flatMap(group => group.tabs)
        .map(tab => {
            if (tab.input instanceof vscode.TabInputText) {
                return vscode.workspace.asRelativePath(tab.input.uri);
            }
            return undefined;
        })
        .filter((f): f is string => f !== undefined);

    return { files: fileList, techStack, activeFile, activeFileContent, openEditors };
}

/**
 * Formats workspace context into a string for prompt injection.
 */
export function formatWorkspaceContext(ctx: WorkspaceContext): string {
    const parts: string[] = [];

    parts.push(`## Tech Stack`);
    parts.push(`Languages: ${ctx.techStack.languages.join(', ') || 'unknown'}`);
    parts.push(`Frameworks: ${ctx.techStack.frameworks.join(', ') || 'none detected'}`);
    if (ctx.techStack.testFramework) { parts.push(`Test Framework: ${ctx.techStack.testFramework}`); }
    if (ctx.techStack.linter) { parts.push(`Linter: ${ctx.techStack.linter}`); }
    if (ctx.techStack.packageManager) { parts.push(`Package Manager: ${ctx.techStack.packageManager}`); }
    if (ctx.techStack.isMonorepo) { parts.push(`Structure: Monorepo`); }

    parts.push(`\n## Workspace Files (${ctx.files.length} total)`);
    parts.push(ctx.files.slice(0, 50).join('\n'));
    if (ctx.files.length > 50) { parts.push(`... and ${ctx.files.length - 50} more files`); }

    if (ctx.activeFile) {
        parts.push(`\n## Active File: ${ctx.activeFile}`);
    }

    if (ctx.openEditors && ctx.openEditors.length > 0) {
        parts.push(`\n## Open Editors: ${ctx.openEditors.join(', ')}`);
    }

    if (ctx.activeFileContent) {
        parts.push(`\n## Active File Content (excerpt):\n\`\`\`\n${ctx.activeFileContent.substring(0, 3000)}\n\`\`\``);
    }

    return parts.join('\n');
}

async function detectTechStack(files: string[]): Promise<TechStack> {
    const stack: TechStack = {
        languages: [],
        frameworks: [],
        isMonorepo: false,
    };

    // Detect languages from file extensions
    const extensions = new Set(files.map(f => f.split('.').pop()?.toLowerCase()).filter(Boolean));
    const langMap: Record<string, string> = {
        ts: 'TypeScript', js: 'JavaScript', py: 'Python', rs: 'Rust',
        go: 'Go', java: 'Java', rb: 'Ruby', php: 'PHP', cs: 'C#',
        cpp: 'C++', c: 'C', swift: 'Swift', kt: 'Kotlin',
    };
    for (const ext of extensions) {
        if (ext && langMap[ext]) { stack.languages.push(langMap[ext]); }
    }

    // Detect frameworks and tools from files
    const fileSet = new Set(files.map(f => f.split('/').pop()));
    const filePathSet = new Set(files);

    // Package manager
    if (fileSet.has('pnpm-lock.yaml') || fileSet.has('pnpm-workspace.yaml')) { stack.packageManager = 'pnpm'; }
    else if (fileSet.has('yarn.lock')) { stack.packageManager = 'yarn'; }
    else if (fileSet.has('package-lock.json')) { stack.packageManager = 'npm'; }
    else if (fileSet.has('Cargo.toml')) { stack.packageManager = 'cargo'; }
    else if (fileSet.has('go.mod')) { stack.packageManager = 'go modules'; }

    // Monorepo detection
    if (fileSet.has('pnpm-workspace.yaml') || fileSet.has('lerna.json') || fileSet.has('nx.json')) {
        stack.isMonorepo = true;
    }

    // Try to read package.json for more context
    try {
        const pkgFiles = await vscode.workspace.findFiles('package.json', '**/node_modules/**', 1);
        if (pkgFiles.length > 0) {
            const content = await vscode.workspace.fs.readFile(pkgFiles[0]);
            const pkg = JSON.parse(Buffer.from(content).toString());
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

            const frameworkMap: Record<string, string> = {
                react: 'React', next: 'Next.js', vue: 'Vue', nuxt: 'Nuxt',
                svelte: 'Svelte', angular: 'Angular', express: 'Express',
                fastify: 'Fastify', nestjs: 'NestJS', '@nestjs/core': 'NestJS',
                tailwindcss: 'Tailwind CSS', prisma: 'Prisma',
            };

            for (const [dep, name] of Object.entries(frameworkMap)) {
                if (allDeps[dep]) { stack.frameworks.push(name); }
            }

            // Test frameworks
            if (allDeps['jest']) { stack.testFramework = 'Jest'; }
            else if (allDeps['vitest']) { stack.testFramework = 'Vitest'; }
            else if (allDeps['mocha']) { stack.testFramework = 'Mocha'; }

            // Linters
            if (allDeps['eslint']) { stack.linter = 'ESLint'; }
            else if (allDeps['biome'] || allDeps['@biomejs/biome']) { stack.linter = 'Biome'; }
        }
    } catch {
        // Silently continue if package.json can't be read
    }

    // Python detection
    if (fileSet.has('requirements.txt') || fileSet.has('pyproject.toml')) {
        if (filePathSet.has('manage.py')) { stack.frameworks.push('Django'); }
    }

    return stack;
}

function emptyTechStack(): TechStack {
    return { languages: [], frameworks: [], isMonorepo: false };
}
