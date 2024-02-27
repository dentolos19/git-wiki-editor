import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import commands from "./lib/commands";
import * as utils from "./lib/utils";

const config = vscode.workspace.getConfiguration("git-wiki-editor");

export function activate(context: vscode.ExtensionContext) {
  const isWikiWorkspace = config.get<boolean>("isWikiWorkspace", false);

  if (isWikiWorkspace) {
    if (fs.existsSync(path.join(vscode.workspace.rootPath || "", ".git"))) {
      return;
    }
    const repoFullName = config.get<string>("repoFullName");
    utils.executeCommands(
      `git init -b main`,
      `git remote add origin https://github.com/${repoFullName}.wiki.git`,
      `git pull origin master`,
      `git checkout --orphan wiki`
    );
    vscode.window.showInformationMessage("Wiki workspace initialized!");
    vscode.window.showInformationMessage(
      'Once you are done making changes, run "Git Wiki Editor: Publish Wiki" to publish your changes!'
    );
  }

  commands.forEach((command) => context.subscriptions.push(command));
}
export function deactivate() {}