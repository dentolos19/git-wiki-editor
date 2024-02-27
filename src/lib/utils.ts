import * as vscode from "vscode";

export type Repo = {
  name: string;
  full_name: string;
  description: string;
  has_wiki: boolean;
};

export function getRepos(username: string) {
  return fetch(`https://api.github.com/users/${username}/repos`)
    .then((res) => res.json())
    .then((repos) => repos as Repo[]);
}

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