import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as utils from "./utils";

const config = vscode.workspace.getConfiguration("git-wiki-editor");

async function openWiki() {
  const username = await vscode.window.showInputBox({
    placeHolder: "Enter a GitHub username...",
  });
  if (!username) {
    return;
  }
  const repos = await utils
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
      }
    })
  );
  await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(wikiWorkspaceFilePath));
}

function publishWiki() {
  const isWikiWorkspace = config.get<boolean>("isWikiWorkspace", false);
  const repoFullName = config.get<string>("repoFullName");
  if (!repoFullName || !isWikiWorkspace) {
    vscode.window.showErrorMessage("Please open a wiki first!");
    return;
  }
  utils.executeCommands(
    `git branch -D main`,
    `git push origin -D master`,
    `git add .`,
    `git commit -m "Wiki"`,
    `git branch -m master`,
    `git push -f origin master`
  );
}

export default [
  vscode.commands.registerCommand("git-wiki-editor.openWiki", openWiki),
  vscode.commands.registerCommand("git-wiki-editor.publishWiki", publishWiki),
];