import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Environment } from "../extension";
import {
    executeShellCommands,
    executeTerminalCommands,
    matchRepoFullName,
} from "../utils";

export default async function publishWiki(env: Environment) {
  // check if the current workspace is a valid wiki workspace
  const isWikiWorkspace = env.config.get<boolean>(
    "workspace.isWikiWorkspace",
    false
  );
  const repoFullName = env.config.get<string>("workspace.repoFullName");
  if (!isWikiWorkspace) {
    vscode.window.showErrorMessage("Please open a wiki first!");
    return;
  }
  if (!repoFullName) {
    vscode.window.showErrorMessage("Invalid wiki workspace!");
    return;
  }
  const wikiPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!wikiPath) {
    vscode.window.showErrorMessage("Unable to find the wiki path!");
    return;
  }

  // check if the wiki is initialized
  if (!fs.existsSync(path.join(wikiPath, ".git"))) {
    vscode.window.showErrorMessage("Please initialize the wiki first!");
    return;
  }

  // gets the remote repo's full name
  const remoteRepoFullName = await executeShellCommands(
    `cd ${wikiPath}`,
    `git remote -v`
  ).then(
    (result) => matchRepoFullName(result),
    (_) => undefined
  );
  if (!remoteRepoFullName) {
    vscode.window.showErrorMessage(
      "Unable to find the remote repo's full name."
    );
    return;
  }

  // checks if the local git origin matches the wiki's remote
  if (remoteRepoFullName !== repoFullName) {
    vscode.window.showErrorMessage(
      "The git origin does not match the wiki's remote."
    );
    return;
  }

  // ask for the mode of commit
  const orphanCommit = (
    await vscode.window.showQuickPick([
      {
        label: "Push as a new commit (recommended)",
        description: "Push your changes as per normal.",
        data: false,
      },
      {
        label: "Push as a orphaned commit",
        description:
          "Sqush all your changes including your history into one commit.",
        data: true,
      },
    ])
  )?.data;

  // ask user to enter a commit message
  const commitMessage = await vscode.window.showInputBox({
    placeHolder: "Enter a commit message...",
  });
  if (!commitMessage) {
    vscode.window.showErrorMessage(
      "Operation cancelled! Please enter a commit message."
    );
    return;
  }

  // push the changes to the wiki
  executeTerminalCommands(`cd ${wikiPath}`);
  if (orphanCommit) {
    // push as a orphaned commit
    executeTerminalCommands(
      `git checkout --orphan wiki`,
      `git add .`,
      `git commit -m "${commitMessage}"`,
      `git branch -D master`,
      // `git push origin -D master`,
      `git branch -m master`,
      `git push -f origin master`
    );
  } else {
    // push as a new commit
    executeTerminalCommands(
      `git add .`,
      `git commit -m "${commitMessage}"`,
      `git push origin master`
    );
  }

  vscode.window.showInformationMessage("Wiki published!");
}