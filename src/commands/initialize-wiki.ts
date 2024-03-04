import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import environment from "../environment";
import * as utils from "../utils";

export default async function initializeWiki() {
    // checks whether the current workspace is a valid wiki workspace
    const isWikiWorkspace = environment.config.get<boolean>("workspace.isWikiWorkspace", false);
    const repoFullName = environment.config.get<string>("workspace.repoFullName");
    if (!isWikiWorkspace) {
      return;
    }
    if (!repoFullName) {
      vscode.window.showErrorMessage("Invalid wiki workspace.");
      return;
    }

    // checks whether the wiki is already initialized
    const wikiPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!wikiPath) {
      vscode.window.showErrorMessage("Unable to find the wiki path.");
      return;
    }
    if (fs.existsSync(path.join(wikiPath, ".git"))) {
      return;
    }

    // initializes the wiki
    utils.executeCommands(
      `cd ${wikiPath}`,
      `git clone https://github.com/${repoFullName}.git .`
    );
}