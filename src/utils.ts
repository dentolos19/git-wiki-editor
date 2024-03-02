import * as cp from "child_process";
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

export function executeShellCommands(command: string) {
  return new Promise<string>((resolve, reject) => {
    cp.exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve(stdout);
    });
  });
}

// example:
//   origin	https://github.com/dentolos19/git-wiki-test.wiki.git (fetch)
//   origin	https://github.com/dentolos19/git-wiki-test.wiki.git (push)
//
// output:
//   dentolos19/git-wiki-test.wiki
export function matchRepoFullName(url: string) {
  const match = url.match(/https:\/\/github\.com\/(.*\/.*)\.git \(push\)/);
  if (!match) {
    return;
  }
  return match[1];
}