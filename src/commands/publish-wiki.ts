import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import environment from "../environment";
import * as utils from "../utils";

export default async function publishWiki() {
  const isWikiWorkspace = environment.config.get<boolean>("workspace.isWikiWorkspace", false);
  const repoFullName = environment.config.get<string>("workspace.repoFullName");

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

  // gets the remote repo's full name
  const remoteRepoFullName = await utils
    .executeShellCommands(`cd ${wikiPath} && git remote -v`)
    .then(
      (result) => {
        const remoteRepoFullName = utils.matchRepoFullName(result);
        console.log(remoteRepoFullName);
        return remoteRepoFullName;
      },
      (err) => {
        console.error(err);
      }
    );

  // checks whether the local git origin matches the wiki's remote
  if (remoteRepoFullName !== repoFullName) {
    vscode.window.showErrorMessage(
      "The git origin does not match the wiki's remote."
    );
    return;
  }

  // ask user to select mode of push
  const orphanCommit = (
    await vscode.window.showQuickPick([
      {
        label: "Push as a new commit (recommended)",
        description: "Push your changes as per normal.",
        data: false,
      },
      {
        label: "Push as a orphaned commit",
        description: "Sqush all your changes including your history into one commit.",
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
      "Operation cancelled. Please enter a commit message!"
    );
    return;
  }

  // push the changes to the wiki
  utils.executeCommands(`cd ${wikiPath}`);
  if (orphanCommit) {
    // push as a orphaned commit
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
    // push as a new commit
    utils.executeCommands(
      `git add .`,
      `git commit -m "${commitMessage}"`,
      `git push origin master`
    );

    vscode.window.showInformationMessage("Wiki published!");
  }
}