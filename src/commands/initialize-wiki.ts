import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Environment } from "../environment";
import * as utils from "../utils";

export default function (env: Environment) {
  return async function () {
    const isWikiWorkspace = env.config.get<boolean>("isWikiWorkspace", false);
    const repoFullName = env.config.get<string>("repoFullName");
    if (!isWikiWorkspace) {
      return;
    }
    if (!repoFullName) {
      vscode.window.showErrorMessage("Invalid wiki workspace.");
      return;
    }

    const wikiPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!wikiPath) {
      vscode.window.showErrorMessage("Unable to find the wiki path.");
      return;
    }
    if (fs.existsSync(path.join(wikiPath, ".git"))) {
      return;
    }

    utils.executeCommands(
      `cd ${wikiPath}`,
      `git clone https://github.com/${repoFullName}.wiki.git .`
    );
  };
}