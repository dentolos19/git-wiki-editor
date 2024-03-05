import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import cleanCache from "./commands/clean-cache";
import initializeWiki from "./commands/initialize-wiki";
import openWiki from "./commands/open-wiki";
import publishWiki from "./commands/publish-wiki";

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
  [
    vscode.commands.registerCommand("git-wiki-editor.openWiki", () =>
      openWiki(env)
    ),
    vscode.commands.registerCommand("git-wiki-editor.publishWiki", () =>
      publishWiki(env)
    ),
    vscode.commands.registerCommand("git-wiki-editor.cleanCache", () =>
      cleanCache(env)
    ),
  ].forEach((command) => context.subscriptions.push(command));

  // Check if the current workspace is a wiki workspace
  if (env.config.get<boolean>("workspace.isWikiWorkspace")) {
    initializeWiki(env);
  }
}

export function deactivate() {}