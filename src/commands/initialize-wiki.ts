import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Environment } from "../extension";
import { executeTerminalCommands } from "../utils";

export default function initializeWiki(env: Environment) {
  // checks if the workspace is a valid wiki workspace
  const isWikiWorkspace = env.config.get<boolean>("workspace.isWikiWorkspace");
  const repoFullName = env.config.get<string>("workspace.repoFullName");
  if (!isWikiWorkspace) {
    return;
  }
  if (!repoFullName) {
    vscode.window.showErrorMessage("Invalid wiki workspace!");
    return;
  }

  // checks if the wiki is already initialized
  const wikiPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!wikiPath) {
    vscode.window.showErrorMessage("Unable to find the wiki path.");
    return;
  }
  if (fs.existsSync(path.join(wikiPath, ".git"))) {
    return;
  }

  // initialize wiki
  executeTerminalCommands(
    `cd ${wikiPath}`,
    `git clone https://github.com/${repoFullName}.git .`
  );
}