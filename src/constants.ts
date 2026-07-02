export const EXTENSION_ID = 'amplify';
export const EXTENSION_NAME = 'Amplify';

export const COMMANDS = {
    EXPAND_PROMPT: 'amplify.expandPrompt',
    SAVE_TEMPLATE: 'amplify.saveTemplate',
    EXPORT_PROMPT: 'amplify.exportPrompt',
    OPEN_WEBVIEW: 'amplify.openEditor',
    REFRESH_TEMPLATES: 'amplify.refreshTemplates',
} as const;

export const CHAT_PARTICIPANT_ID = 'amplify';

export const DEVELOPER_CREDITS = `
---
**Built by [Kumar Kislay](https://forg.to/@kislay)**
[X (Twitter)](https://x.com/whykislayy) | [LinkedIn](https://linkedin.com/in/kislayy)
`;

export const DEFAULT_SYSTEM_PROMPT =
    'You are an expert prompt engineer. Take the user\'s short shorthand instruction and expand it into a highly detailed, structured prompt for an AI coding assistant. Include sections for context, requirements, edge cases, and expected output format.';

export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
