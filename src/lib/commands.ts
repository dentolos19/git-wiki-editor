import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as github from "./github";
import * as utils from "./utils";

const config = vscode.workspace.getConfiguration("git-wiki-editor");

async function openWiki() {
  const username = await vscode.window.showInputBox({
    placeHolder: "Enter a GitHub username...",
  });
  if (!username) {
    return;
  }
  const repos = await github
    .getRepos(username)
    .then((repos) => repos.filter((repo) => repo.has_wiki));
  const repo = await vscode.window
    .showQuickPick(
      repos.map((repo) => {
        return {
          label: repo.name,
          description: repo.description,
          data: repo,
        };
      }),
      {
        placeHolder: "Select a wiki to open...",
      }
    )
    .then((item) => item?.data);
  if (!repo) {
    return;
  }
  const wikiBasePath = path.join(
    os.tmpdir(),
    "git-wiki-editor",
    repo.name,
    utils.generateRandomString(8)
  );
  const wikiSourcePath = path.join(wikiBasePath, "wiki");
  const wikiWorkspaceFilePath = path.join(wikiBasePath, "wiki.code-workspace");
  fs.mkdirSync(wikiSourcePath, { recursive: true });
  fs.writeFileSync(
    wikiWorkspaceFilePath,
    JSON.stringify({
      folders: [{ path: "./wiki" }],
      settings: {
        "git-wiki-editor.isWikiWorkspace": true,
        "git-wiki-editor.repoFullName": repo.full_name,
      },
    })
  );
  await vscode.commands.executeCommand(
    "vscode.openFolder",
    vscode.Uri.file(wikiWorkspaceFilePath)
  );
}

async function publishWiki() {
  const isWikiWorkspace = config.get<boolean>("isWikiWorkspace", false);
  const repoFullName = config.get<string>("repoFullName");

  if (!repoFullName || !isWikiWorkspace) {
    vscode.window.showErrorMessage("Please open a wiki first!");
    return;
  }

  const asOrphan = await vscode.window.showQuickPick([
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
  ]);

  const commitMessage = await vscode.window.showInputBox({
    placeHolder: "Enter a commit message...",
  });

  if (!commitMessage) {
    vscode.window.showErrorMessage(
      "Operation cancelled. Please enter a commit message!"
    );
    return;
  }

  if (asOrphan?.data) {
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
}

export default [
  vscode.commands.registerCommand("git-wiki-editor.openWiki", openWiki),
  vscode.commands.registerCommand("git-wiki-editor.publishWiki", publishWiki),
];