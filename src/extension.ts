import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import cleanCacheFactory from "./commands/clean-cache";
import initializeWikiFactory from "./commands/initialize-wiki";
import openWikiFactory from "./commands/open-wiki";
import publishWikiFactory from "./commands/publish-wiki";
import { Environment } from "./environment";

const env: Environment = {
  config: vscode.workspace.getConfiguration("git-wiki-editor"),
  tempDir: path.join(os.tmpdir(), "git-wiki-editor"),
};

export function activate(context: vscode.ExtensionContext) {
  const openWiki = openWikiFactory(env);
  const initializeWiki = initializeWikiFactory(env);
  const publishWiki = publishWikiFactory(env);
  const cleanCache = cleanCacheFactory(env);
  [
    vscode.commands.registerCommand("git-wiki-editor.openWiki", openWiki),
    vscode.commands.registerCommand("git-wiki-editor.publishWiki", publishWiki),
    vscode.commands.registerCommand("git-wiki-editor.cleanCache", cleanCache),
  ].forEach((command) => context.subscriptions.push(command));
  const isWikiWorkspace = env.config.get<boolean>("isWikiWorkspace", false);
  if (isWikiWorkspace) {
    initializeWiki();
  }
}
export function deactivate() {}