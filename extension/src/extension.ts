import * as vscode from "vscode";

const BACKEND_URL = "http://localhost:8080/enhance";

interface EnhanceRequest {
  raw_prompt: string;
  language: string;
  filename: string;
  selected_code: string;
}

interface EnhanceResponse {
  enhanced_prompt: string;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("amplify.enhance", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("No active editor found.");
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const selectedText = selection.isEmpty
      ? ""
      : document.getText(selection);
    const language = document.languageId;
    const filename = document.fileName.split(/[/\\]/).pop() ?? "unknown";

    const rawPrompt =
      selectedText.trim() ||
      (await vscode.window.showInputBox({
        prompt: "Enter your prompt to enhance:",
        placeHolder: "e.g., fix this function, explain this code, refactor...",
      })) ||
      "";

    if (!rawPrompt) {
      vscode.window.showWarningMessage("No prompt provided.");
      return;
    }

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Amplify",
        cancellable: false,
      },
      async () => {
        try {
          const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              raw_prompt: rawPrompt,
              language,
              filename,
              selected_code: selectedText,
            } satisfies EnhanceRequest),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = (await response.json()) as EnhanceResponse;
          await vscode.env.clipboard.writeText(data.enhanced_prompt);
          vscode.window.showInformationMessage("Enhanced prompt copied to clipboard!");
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          vscode.window.showErrorMessage(`Amplify failed: ${msg}`);
        }
      }
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}