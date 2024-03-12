import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import cleanCache from "./commands/clean-cache";
import initializeWiki from "./commands/initialize-wiki";
import openWiki from "./commands/open-wiki";
import publishWiki from "./commands/publishWiki";

export type Environment = {
	config: vscode.WorkspaceConfiguration;
	tempDir: string;
};

export function activate(context: vscode.ExtensionContext) {
  // Initialize environment
  const env: Environment = {
    config: vscode.workspace.getConfiguration("git-wiki-editor"),
    tempDir: path.join(os.tmpdir(), "git-wiki-editor"),
  };

  // Initialize commands
  for (const command of [
    vscode.commands.registerCommand("git-wiki-editor.openWiki", () =>
      openWiki(env),
    ),
    vscode.commands.registerCommand("git-wiki-editor.publishWiki", () =>
      publishWiki(env),
    ),
    vscode.commands.registerCommand("git-wiki-editor.cleanCache", () =>
      cleanCache(env),
    ),
  ]) {
    context.subscriptions.push(command);
  }

  // Check if the current workspace is a wiki workspace
  if (env.config.get<boolean>("workspace.isWikiWorkspace")) {
    initializeWiki(env);
  }
}

export function deactivate() {}