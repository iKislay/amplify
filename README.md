# Amplify by Kislay

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/whykislay.amplify.svg)](https://marketplace.visualstudio.com/items?itemName=whykislay.amplify)

Extension on the Visual Studio Marketplace: https://marketplace.visualstudio.com/items?itemName=whykislay.amplify

Amplify is your Senior AI Architect inside VS Code. It doesn't just expand prompts; it understands your workspace and helps you architect your development tasks.

Built with ❤️ by **[Kumar Kislay](https://forg.to/@kislay)**.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage / Quick Start](#usage--quick-start)
- [Configuration / Settings](#configuration--settings)
- [Commands](#commands)
- [Extension API / Programmatic Usage](#extension-api--programmatic-usage)
- [Troubleshooting / Known issues](#troubleshooting--known-issues)
- [Contributing](#contributing)
- [Changelog / Release notes](#changelog--release-notes)
- [License](#license)
- [Contact / Support](#contact--support)

---

## Features

- **Workspace Awareness**: Amplify scans your project structure to ensure expanded prompts match your existing code patterns.
- **Editor Integration**: Highlight text in any file and press `Ctrl+Alt+C` (or `Cmd+Alt+C`) to replace it with a detailed prompt.
- **AI Fallbacks**: Supports GitHub Copilot (default) with optional fallbacks for Groq and Gemini.
- **Chat-driven modes**: `/expand`, `/consult`, and `/breakdown` let you choose the level of guidance and prompt detail.
- **Prompt engineering assistant**: Converts shorthand instructions into fully structured prompts suitable for AI coding assistants.

---

## Installation

### Install from the Visual Studio Marketplace

1. Open VS Code.
2. Search for **Amplify by Kislay** in the Extensions view.
3. Install the extension.

### Install from VSIX

If you have the local package file, install it with:

```bash
code --install-extension amplify-0.2.0.vsix
```

### Local development install

```bash
npm install
npm run compile
```

> Current extension version: `0.2.0`

---

## Usage / Quick Start

### Use the chat commands

Open the VS Code Chat panel and type:

- `@amplify /expand [shorthand]`
- `@amplify /consult [shorthand]`
- `@amplify /breakdown [shorthand]`

### Use the keyboard shortcut

Select text in the editor and press:

- `Ctrl+Alt+C` on Windows/Linux
- `Cmd+Alt+C` on macOS

This will run the `Expand Prompt` command.

### Example

```text
@amplify /expand build a settings page with responsive layout and theme switching
```

This produces a more detailed prompt for AI assistance.

---

## Configuration / Settings

Configure Amplify settings in `settings.json` or through the VS Code Settings UI.

- `amplify.systemPrompt` (string)
  - Default: `You are an expert prompt engineer. Take the user's short shorthand instruction and expand it into a highly detailed, structured prompt for an AI coding assistant. Include sections for context, requirements, edge cases, and expected output format.`
  - Description: The system prompt used to expand the user's input.
- `amplify.fallbackProvider` (string)
  - Enum: `none`, `groq`, `gemini`
  - Default: `none`
  - Description: Fallback AI provider if Copilot is not available.
- `amplify.groqApiKey` (string)
  - Default: `""`
  - Description: API Key for Groq fallback.
- `amplify.geminiApiKey` (string)
  - Default: `""`
  - Description: API Key for Gemini fallback.

---

## Commands

The extension contributes the following command:

- `amplify.expandPrompt` — Expand Prompt

You can run this command from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) or via the configured keybinding.

Keybindings:

- `Ctrl+Alt+C` on Windows/Linux
- `Cmd+Alt+C` on macOS

---

## Extension API / Programmatic Usage

This release does not expose a public VS Code extension API for other extensions.

If you need programmatic integration or API hooks, please open an issue in the repository.

---

## Troubleshooting / Known issues

- If commands are not available, restart VS Code after installation.
- Verify the AI extension and `vscode.lm` API support in your environment.
- If prompts are not expanding as expected, check your `amplify.systemPrompt` setting and any configured fallback provider keys.
- For `code --install-extension amplify-0.2.0.vsix`, ensure the VSIX file is present in your current working directory.

---

## Contributing

To contribute locally:

```bash
git clone https://github.com/iKislay/amplify.git
cd amplify
npm install
npm run compile
npm run lint
npm test
```

For active development, use:

```bash
npm run watch
```

Please submit pull requests for documentation updates, bug fixes, and feature improvements.

---

## Changelog / Release notes

A `CHANGELOG.md` file is not present in this repository yet.

Release notes are available via GitHub releases or by inspecting commit history.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact / Support

- Developer: **Kumar Kislay**
- Website: [https://forg.to/@kislay](https://forg.to/@kislay)
- Twitter: [@whykislayy](https://x.com/whykislayy)
- LinkedIn: [https://linkedin.com/in/kislayy](https://linkedin.com/in/kislayy)

If you need support, open an issue in the repository.
