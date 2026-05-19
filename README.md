# Amplify

A VS Code extension to turn short, lazy prompts into highly detailed software engineering instructions.

## Features

### 1. Chat Participant (Modern Flow)
Open the VS Code Chat (Cmd+Shift+I or side panel) and type `@amplify` followed by your shorthand.
- **Usage**: `@amplify create a nodejs server with express`
- **How it works**: Amplify intercepts your lazy prompt, expands it using its internal expert prompt engineering logic, and then feeds that massive prompt back to the AI to stream high-quality code directly into your chat.

### 2. Editor Selection
Highlight a short instruction in any file and press `Ctrl+Alt+C` (or `Cmd+Alt+C`) to replace it with a detailed prompt.

### 3. Quick Expand
Press `Ctrl+Alt+C` with no selection to enter a prompt, which will be expanded and copied to your clipboard.

## Customization
You can customize the **System Prompt** used for expansion in the VS Code Settings under `Amplify`. This allows you to define exactly how your shorthand is transformed.

## Requirements
Requires **GitHub Copilot** or a compatible AI extension that supports the `vscode.lm` API.
