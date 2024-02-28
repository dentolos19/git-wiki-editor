import * as vscode from "vscode";

export function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join("");
}

export function executeCommands(...commands: string[]) {
  let terminal = vscode.window.activeTerminal;
  if (!terminal) {
    terminal = vscode.window.createTerminal();
  }
  terminal.show();
  commands.forEach((command) => terminal?.sendText(command));
}

export function createWorkspace(
  folders: { name?: string | undefined; path: string }[],
  settings: any | undefined = undefined,
  extensionsRecommendations: string[] | undefined = undefined
) {
  return {
    folders: folders,
    extensions: {
      recommendations: extensionsRecommendations,
    },
    settings,
  };
}