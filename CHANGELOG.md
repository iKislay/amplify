# Changelog

## [1.0.0] - 2026-07-02

### Added
- **Deep Workspace Context** — tech stack detection, active file content, open editors, monorepo detection
- **Git-Aware Context** — branch, recent commits, staged/unstaged changes, diff included in prompts
- **Prompt Template Library** — sidebar TreeView with 8 built-in templates across 7 categories
- **CodeLens Integration** — ⚡ Expand, 🧪 Test, 📝 Document lenses on functions/classes (TS, JS, Python, Go, Rust)
- **Iterative Refinement** (`/refine`) — refine a previously expanded prompt with conversational feedback
- **Prompt Quality Scoring** (`/score`) — rate prompts on specificity, clarity, completeness, actionability
- **Export & Share** — save prompts as `.md` or `.prompt.md`, copy as formatted markdown
- **Status Bar Quick-Access** — one-click expand from status bar
- **Fallback Providers (Groq, Gemini)** — fully implemented with real API calls
- **Modular Architecture** — restructured into providers, context, commands, chat, templates, codelens, views, export modules

### Changed
- Upgraded version from 0.2.0 to 1.0.0
- Improved system prompt and context gathering
- Enhanced `/consult` and `/breakdown` with richer context

## [0.2.0] - 2025-01-XX

### Added
- `/consult` mode — asks clarifying questions
- `/breakdown` mode — multi-step task decomposition
- Basic workspace file listing context
- Developer credits in chat responses

## [0.1.1] - 2025-01-XX

### Changed
- Limited extension to prompt expansion (removed code generation)

## [0.1.0] - 2025-01-XX

### Added
- Initial release
- Basic prompt expansion command
- Chat participant with `/expand`
- Configurable system prompt
