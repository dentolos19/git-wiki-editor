import * as cp from "child_process";
import * as vscode from "vscode";

export function executeTerminalCommands(...commands: string[]) {
  let terminal = vscode.window.activeTerminal;
  if (!terminal) {
    terminal = vscode.window.createTerminal();
  }
  terminal.show();
  commands.forEach((command) => terminal?.sendText(command));
}

export function executeShellCommands(...commands: string[]) {
  return new Promise<string>((resolve, reject) => {
    cp.exec(commands.join(" && "), (err, stdout, _) => {
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