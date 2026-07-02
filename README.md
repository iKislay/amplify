# Amplify — Architectural Prompt Engineer

> Transform shorthand instructions into production-grade AI prompts with deep workspace awareness.

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/whykislay.amplify?label=VS%20Code%20Marketplace&color=blue)](https://marketplace.visualstudio.com/items?itemName=whykislay.amplify)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Amplify is a VS Code extension that uses AI to expand quick, shorthand instructions into highly detailed, structured prompts — complete with workspace context, tech stack detection, git-aware state, and proper architectural requirements.

Built by **[Kumar Kislay](https://forg.to/@kislay)** ([@whykislayy](https://x.com/whykislayy))

---

## Install

**[Get it from the VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=whykislay.amplify)**

Or search for `Amplify by Kislay` in the Extensions panel (`Ctrl+Shift+X`).

---

## Features

### ⚡ Expand Prompt (Command)
- Select text in your editor, or invoke the command manually
- **Keybinding:** `Ctrl+Alt+C` (Mac: `Cmd+Alt+C`)
- Expanded prompt replaces selection or copies to clipboard

### 💬 Chat Participant (`@amplify`)
Use in the VS Code Chat panel:

| Command | Description |
|---------|-------------|
| `@amplify <shorthand>` | Expand into a detailed, structured prompt |
| `@amplify /consult <shorthand>` | Ask clarifying questions before generating the prompt |
| `@amplify /breakdown <shorthand>` | Break task into ordered steps with per-step prompts |
| `@amplify /refine <feedback>` | Iteratively refine a previously expanded prompt |
| `@amplify /score <prompt>` | Score a prompt on specificity, clarity, completeness |

### 🧠 Deep Workspace Context
Amplify gathers rich context automatically:
- **Tech stack detection** — languages, frameworks, test runners, linters, package managers
- **Active editor content** — includes what you're currently working on
- **Open editors** — awareness of related files
- **Monorepo detection** — pnpm workspaces, Lerna, Nx

### 🔀 Git-Aware Prompts
Automatically includes:
- Current branch name
- Recent commits (last 5)
- Staged and unstaged changes
- Current diff (truncated for safety)

### 📋 Prompt Template Library
Sidebar panel with built-in templates organized by category:
- API Design, Refactoring, Testing, Debugging, Migration, Documentation, Architecture
- Click a template, fill in your task, then copy or expand with AI

### 🔍 CodeLens Integration
Shows actionable buttons above functions and classes:
- **⚡ Amplify: Expand** — generate improvement prompts for the symbol
- **🧪 Test** — generate test-writing prompts scoped to that function
- **📝 Document** — generate documentation prompts

Supported languages: TypeScript, JavaScript, Python, Go, Rust

### 📊 Prompt Quality Scoring
Rate any prompt on:
- Specificity (1-10)
- Clarity (1-10)
- Completeness (1-10)
- Actionability (1-10)

Get specific suggestions and a rewritten version.

### 📤 Export & Share
- Save expanded prompts as `.md` or `.prompt.md` files
- Copy as formatted markdown with timestamps

### ⚡ Status Bar Quick-Access
One-click prompt expansion from the status bar.

### 🔄 Fallback AI Providers
If GitHub Copilot is unavailable:
- **Groq** — fast inference with Llama models
- **Google Gemini** — Gemini 2.0 Flash

---

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `amplify.systemPrompt` | System prompt for expansion | (built-in architect prompt) |
| `amplify.fallbackProvider` | `none`, `groq`, or `gemini` | `none` |
| `amplify.groqApiKey` | API Key for Groq | — |
| `amplify.groqModel` | Groq model name | `llama-3.3-70b-versatile` |
| `amplify.geminiApiKey` | API Key for Gemini | — |
| `amplify.geminiModel` | Gemini model name | `gemini-2.0-flash` |
| `amplify.enableCodeLens` | Show CodeLens above functions/classes | `true` |
| `amplify.enableStatusBar` | Show status bar button | `true` |

---

## Usage Examples

### Expand from editor selection

1. Select text: `add user authentication with JWT`
2. Press `Ctrl+Alt+C`
3. The shorthand is replaced with a full architectural prompt

### Chat-based expansion

```
@amplify build a rate-limited REST API for image uploads with S3 storage
```

### Score an existing prompt

```
@amplify /score Design a user authentication system using JWT tokens with refresh token rotation, rate limiting on login attempts, and secure password hashing with bcrypt.
```

### Refine a result

```
@amplify /refine make the error handling section more specific about HTTP status codes
```

---

## Project Structure

```
src/
├── extension.ts          # Entry point — registers all features
├── config.ts             # Configuration reader
├── constants.ts          # Shared constants
├── types/                # TypeScript interfaces and types
├── providers/            # AI model providers (Copilot, Groq, Gemini)
├── context/              # Workspace and Git context gathering
├── commands/             # Command handlers (expand prompt)
├── chat/                 # Chat participant logic
├── templates/            # Prompt template library + TreeView
├── codelens/             # CodeLens provider and commands
├── views/                # Status bar and UI components
└── export/               # Export/share utilities
```

---

## Requirements

- VS Code 1.90+
- **GitHub Copilot** extension (recommended), or a configured fallback provider

---

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Lint
npm run lint

# Package VSIX
npm run package
```

---

## Contributing

```bash
git clone https://github.com/iKislay/amplify.git
cd amplify
npm install
npm run compile
```

Submit pull requests for bug fixes and feature improvements.

---

## Contact

- **Kumar Kislay**
- Website: [forg.to/@kislay](https://forg.to/@kislay)
- Twitter: [@whykislayy](https://x.com/whykislayy)
- LinkedIn: [linkedin.com/in/kislayy](https://linkedin.com/in/kislayy)

---

## License

[MIT](LICENSE)
