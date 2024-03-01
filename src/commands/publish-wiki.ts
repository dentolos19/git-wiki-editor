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
      vscode.window.showErrorMessage("Please open a wiki first!");
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
    if (!fs.existsSync(path.join(wikiPath, ".git"))) {
      vscode.window.showErrorMessage("Please initialize the wiki first!");
      return;
    }

    const orphanCommit = (
      await vscode.window.showQuickPick([
        {
          label: "Push as a new commit",
          description: "Push your changes as per normal.",
          data: false,
        },
        {
          label: "Push as a single commit",
          description: "Squash all your changes into a single commit.",
          data: true,
        },
      ])
    )?.data;

    const commitMessage = await vscode.window.showInputBox({
      placeHolder: "Enter a commit message...",
    });

    if (!commitMessage) {
      vscode.window.showErrorMessage(
        "Operation cancelled. Please enter a commit message!"
      );
      return;
    }

    utils.executeCommands(`cd ${wikiPath}`);
    if (orphanCommit) {
      utils.executeCommands(
        `git checkout --orphan wiki`,
        `git add .`,
        `git commit -m "${commitMessage}"`,
        `git branch -D master`,
        // `git push origin -D master`,
        `git branch -m master`,
        `git push -f origin master`
      );
    } else {
      utils.executeCommands(
        `git add .`,
        `git commit -m "${commitMessage}"`,
        `git push origin master`
      );
    }
  };
}