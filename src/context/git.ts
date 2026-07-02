import * as vscode from 'vscode';
import { GitContext } from '../types';

/**
 * Gathers git context: branch, recent commits, staged/unstaged changes, diff.
 */
export async function getGitContext(): Promise<GitContext | null> {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) { return null; }

    const git = gitExtension.exports.getAPI(1);
    if (!git || git.repositories.length === 0) { return null; }

    const repo = git.repositories[0];

    try {
        const branch = repo.state.HEAD?.name ?? 'detached';
        const log = await repo.log({ maxEntries: 5 });
        const recentCommits = log.map(
            (c: { hash: string; message: string }) => `${c.hash.substring(0, 7)} ${c.message}`
        );

        const stagedChanges = repo.state.indexChanges?.map(
            (c: { uri: vscode.Uri }) => vscode.workspace.asRelativePath(c.uri)
        ) ?? [];

        const unstageChanges = repo.state.workingTreeChanges?.map(
            (c: { uri: vscode.Uri }) => vscode.workspace.asRelativePath(c.uri)
        ) ?? [];

        // Get diff of staged changes
        let diff = '';
        try {
            diff = await repo.diff(true) ?? '';
            if (!diff) {
                diff = await repo.diff() ?? '';
            }
            // Limit diff size
            if (diff.length > 5000) {
                diff = diff.substring(0, 5000) + '\n... (truncated)';
            }
        } catch {
            // diff may not be available
        }

        return { branch, recentCommits, stagedChanges, unstageChanges, diff };
    } catch {
        return null;
    }
}

/**
 * Formats git context into a string for prompt injection.
 */
export function formatGitContext(ctx: GitContext | null): string {
    if (!ctx) { return ''; }

    const parts: string[] = ['## Git Context'];
    parts.push(`Branch: ${ctx.branch}`);

    if (ctx.recentCommits.length > 0) {
        parts.push(`\nRecent Commits:`);
        ctx.recentCommits.forEach(c => parts.push(`  - ${c}`));
    }

    if (ctx.stagedChanges.length > 0) {
        parts.push(`\nStaged: ${ctx.stagedChanges.join(', ')}`);
    }

    if (ctx.unstageChanges.length > 0) {
        parts.push(`\nModified: ${ctx.unstageChanges.join(', ')}`);
    }

    if (ctx.diff) {
        parts.push(`\nDiff:\n\`\`\`diff\n${ctx.diff}\n\`\`\``);
    }

    return parts.join('\n');
}
