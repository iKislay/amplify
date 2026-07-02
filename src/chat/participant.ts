import * as vscode from 'vscode';
import { callModel } from '../providers';
import { getWorkspaceContext, formatWorkspaceContext, getGitContext, formatGitContext } from '../context';
import { expandPrompt } from '../commands/expand';
import { DEVELOPER_CREDITS, CHAT_PARTICIPANT_ID } from '../constants';

/**
 * Registers the @amplify chat participant with all sub-commands.
 */
export function registerChatParticipant(context: vscode.ExtensionContext): void {
    const participant = vscode.chat.createChatParticipant(CHAT_PARTICIPANT_ID, handleChatRequest);
    context.subscriptions.push(participant);
}

async function handleChatRequest(
    request: vscode.ChatRequest,
    _chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    _token: vscode.CancellationToken,
): Promise<vscode.ChatResult> {
    try {
        switch (request.command) {
            case 'consult':
                await handleConsult(request.prompt, stream);
                break;
            case 'breakdown':
                await handleBreakdown(request.prompt, stream);
                break;
            case 'refine':
                await handleRefine(request.prompt, _chatContext, stream);
                break;
            case 'score':
                await handleScore(request.prompt, stream);
                break;
            default:
                await handleExpand(request.prompt, stream);
                break;
        }

        stream.markdown(DEVELOPER_CREDITS);
    } catch (err) {
        stream.markdown(`❌ Error: ${err}`);
    }

    return { metadata: { command: request.command || 'expand' } };
}

async function handleExpand(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
    const expanded = await expandPrompt(prompt);
    stream.markdown(expanded);
}

async function handleConsult(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
    const wsContext = await getWorkspaceContext();
    const contextStr = formatWorkspaceContext(wsContext);

    const consultPrompt = `You are a Senior Software Architect. The user wants to do: "${prompt}".
Based on the workspace context:
${contextStr}

Ask 3-4 highly specific technical questions that would help you write a perfect, comprehensive prompt for this task.
Focus on tech stack, patterns, architecture decisions, and specific requirements. Be concise.`;

    const questions = await callModel(consultPrompt);
    stream.markdown(`### 🤔 Consultation for your prompt\n\n${questions}\n\n*Reply with your answers to get the final architected prompt.*`);
}

async function handleBreakdown(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
    const wsContext = await getWorkspaceContext();
    const gitContext = await getGitContext();
    const contextStr = [formatWorkspaceContext(wsContext), formatGitContext(gitContext)].filter(Boolean).join('\n\n');

    const breakdownPrompt = `You are a Project Manager and Architect. The user wants to: "${prompt}".
Workspace & Git Context:
${contextStr}

Break this down into a sequence of specific, ordered tasks. For each task:
1. A clear goal statement
2. A detailed "Prompt" the user can paste into an AI assistant to implement that step
3. Success criteria

Format as a numbered list with clear sections.`;

    const breakdown = await callModel(breakdownPrompt);
    stream.markdown(`### 📋 Task Breakdown\n\n${breakdown}`);
}

async function handleRefine(
    prompt: string,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
): Promise<void> {
    // Gather previous turns for context
    const previousTurns = chatContext.history
        .map(turn => {
            if (turn instanceof vscode.ChatResponseTurn) {
                return turn.response.map(part => {
                    if (part instanceof vscode.ChatResponseMarkdownPart) {
                        return part.value.value;
                    }
                    return '';
                }).join('');
            }
            if (turn instanceof vscode.ChatRequestTurn) {
                return `User: ${turn.prompt}`;
            }
            return '';
        })
        .filter(Boolean)
        .join('\n---\n');

    const refinePrompt = `You previously generated an expanded prompt. The user wants to refine it.

Previous conversation:
${previousTurns}

User's refinement request: "${prompt}"

Generate an improved version of the expanded prompt incorporating the user's feedback. Output only the final refined prompt.`;

    const refined = await callModel(refinePrompt);
    stream.markdown(`### ✨ Refined Prompt\n\n${refined}`);
}

async function handleScore(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
    const scorePrompt = `You are a prompt quality evaluator. Rate the following prompt on these criteria (each 1-10):
1. **Specificity** - How specific and unambiguous is it?
2. **Clarity** - How clear and well-structured is it?
3. **Completeness** - Does it cover context, requirements, edge cases, and output format?
4. **Actionability** - Can an AI assistant execute this without follow-up questions?

Prompt to evaluate:
"""
${prompt}
"""

Provide:
- Scores for each criterion
- An overall score (average)
- 2-3 specific suggestions to improve the prompt
- A brief rewritten version addressing the weaknesses

Format with markdown headers and bold scores.`;

    const score = await callModel(scorePrompt);
    stream.markdown(`### 📊 Prompt Quality Score\n\n${score}`);
}
