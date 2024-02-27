import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import commands from "./lib/commands";
import * as utils from "./lib/utils";

const config = vscode.workspace.getConfiguration("git-wiki-editor");

export function activate(context: vscode.ExtensionContext) {
  const isWikiWorkspace = config.get<boolean>("isWikiWorkspace", false);

  if (isWikiWorkspace) {
    vscode.window.showInformationMessage("This is a wiki workspace!");
    if (fs.existsSync(path.join(vscode.workspace.rootPath || "", ".git"))) {
      vscode.window.showInformationMessage("There is a git repository!");
      return;
    }
    const repoFullName = config.get<string>("repoFullName");
    utils.executeCommands(
      `git init -b main`,
      `git remote add origin https://github.com/${repoFullName}.wiki.git`,
      `git pull origin master`,
      `git checkout --orphan wiki`
    );
  }

  commands.forEach((command) => context.subscriptions.push(command));
}
export function deactivate() {}