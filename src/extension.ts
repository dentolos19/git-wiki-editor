import * as vscode from "vscode";
import cleanCache from "./commands/clean-cache";
import initializeWiki from "./commands/initialize-wiki";
import openWiki from "./commands/open-wiki";
import publishWiki from "./commands/publish-wiki";
import environment from "./environment";

export function activate(context: vscode.ExtensionContext) {
  // create commands
  [
    vscode.commands.registerCommand("git-wiki-editor.openWiki", openWiki),
    vscode.commands.registerCommand("git-wiki-editor.publishWiki", publishWiki),
    vscode.commands.registerCommand("git-wiki-editor.cleanCache", cleanCache),
  ].forEach((command) => context.subscriptions.push(command));

  // initialize wiki if the workspace is a wiki
  const isWikiWorkspace = environment.config.get<boolean>("isWikiWorkspace", false);
  if (isWikiWorkspace) {
    initializeWiki();
  }
}
export function deactivate() {}