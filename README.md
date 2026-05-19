# Amplify

A VS Code extension that rewrites your rough, half-formed prompts into precise, context-aware instructions before they reach your AI assistant.

---

## The Problem

AI coding assistants are only as good as the prompts they receive.

Most developers type something like "fix this function" or "write a helper for user data" and get a generic, barely useful response. The AI is not the bottleneck. The prompt is.

Amplify sits between you and your AI assistant. One keyboard shortcut, and your rough prompt gets enriched with your active code context and rewritten into something that actually gets the job done.

---

## How It Works

```
You type a rough prompt
        |
Press Ctrl + Alt + A
        |
Amplify reads your active file and selected code
        |
Sends prompt + context to the enhancement backend
        |
LLM rewrites it into a structured, high-quality prompt
        |
Enhanced prompt is placed in clipboard, ready to paste
```

No context switching. No prompt engineering by hand. Just better output.

---

## Features (Phase 1)

- **One-shortcut enhancement** -- trigger via `Ctrl+Alt+A`
- **Context-aware rewriting** -- reads active file, language, and selected code
- **Fast backend** -- TypeScript/Express server calling Groq LLM
- **Phase 1 output** -- Enhanced prompt copied to clipboard

---

## Architecture

```
+----------------------------------+
|        VS Code Extension         |
|          (TypeScript)            |
|                                  |
|  - Registers Ctrl+Alt+A          |
|  - Reads editor context          |
|  - Copies result to clipboard    |
+---------------+------------------+
                |  POST /enhance
                v
+----------------------------------+
|       Enhancement Backend        |
|      (TypeScript / Express)      |
|                                  |
|  - Validates input               |
|  - Calls Groq LLM                |
|  - Returns enhanced prompt       |
+---------------+------------------+
                |
                v
+----------------------------------+
|          LLM (Groq)              |
|                                  |
|  Model: llama-3.3-70b-versatile  |
|  Output: Enhanced prompt         |
+----------------------------------+
```

---

## Tech Stack

| Layer              | Technology             |
| ------------------ | ---------------------- |
| VS Code Extension  | TypeScript + VS Code API |
| Backend API        | TypeScript + Express   |
| LLM Provider       | Groq (llama-3.3-70b-versatile) |
| Runtime            | Node.js                |

---

## Before and After

| Raw Prompt          | Amplified Prompt |
| ------------------- | ----------------- |
| "fix this function" | "Refactor the `calculateTax()` function in `utils/finance.ts` to handle edge cases where `income` is null or negative, and add JSDoc comments" |
| "explain this"      | "Explain the `parseUserFromJSON()` function in `auth.ts`, including its parameters, return type, and any edge cases it handles" |

The difference is not magic. It is context and structure. Amplify injects both, automatically.

---

## Getting Started

### Prerequisites

- Node.js 20+
- VS Code 1.90+

### 1. Clone and setup

```bash
git clone https://github.com/yourusername/amplify
cd amplify
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm install
npm run dev
```

Backend runs on `http://localhost:8080`.

### 3. Run the extension

```bash
cd ../extension
npm install
```

Open the extension folder in VS Code and press **F5** to launch the Extension Development Host.

### 4. Use

- Open any code file in VS Code
- Select some text (or keep it empty and enter a prompt when prompted)
- Press **Ctrl+Alt+A**
- Enhanced prompt is copied to your clipboard
- Paste it into any AI assistant

---

## API

### POST /enhance

**Request:**

```json
{
  "raw_prompt": "fix this function",
  "language": "typescript",
  "filename": "auth.ts",
  "selected_code": "function getUser() { ... }"
}
```

**Response:**

```json
{
  "enhanced_prompt": "Refactor the getUser() function in auth.ts to handle..."
}
```

---

## Roadmap

- [x] Phase 1: MVP with Ctrl+Alt+A, Groq integration, clipboard output
- [ ] Phase 2: Mode selection, diff view panel, prompt history
- [ ] Phase 3: Marketplace publish, multi-file context, feedback signal

---

## License

MIT