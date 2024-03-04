import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import environment from "../environment";
import * as github from "../github";

export default async function openWiki() {
  // ask for user's GitHub username
  let username = environment.config.get<string>("github.username");
  if (!username) {
    username = await vscode.window.showInputBox({
      placeHolder: "Enter a GitHub username...",
    });
  }
  if (!username) {
    return;
  }

  // get all user's repo and ask them to select
  const repos = await github.getRepos(username).then((repos) =>
    repos.filter((repo) => {
      // filter out repos that don't have wiki or are archived
      return repo.has_wiki && !repo.archived;
    })
  );
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

  const wikiBasePath = path.join(environment.tempDir, repo.full_name);
  const wikiSourcePath = path.join(wikiBasePath, "wiki");
  const wikiWorkspacePath = path.join(wikiBasePath, "wiki.code-workspace");

  // checks if wiki already exists
  if (fs.existsSync(wikiWorkspacePath)) {
    const newWorkspace = await vscode.window
      .showInformationMessage(
        "A wiki workspace already exists. Do you want to open it or create a new one?",
        "Open",
        "New"
      )
      .then(async (value) => {
        if (value === "New") {
          return true;
        }
        return false;
      });
    if (newWorkspace) {
      // delete existing wiki workspace
      fs.rmdirSync(wikiBasePath, { recursive: true });
    } else {
      // open existing wiki workspace
      await vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(wikiWorkspacePath)
      );
      return;
    }
  }

  // create wiki workspace
  fs.mkdirSync(wikiSourcePath, { recursive: true });
  fs.writeFileSync(
    wikiWorkspacePath,
    JSON.stringify({
      folders: [
        {
          name: "Wiki",
          path: "./wiki",
        },
      ],
      settings: {
        "git-wiki-editor.workspace.isWikiWorkspace": true,
        "git-wiki-editor.workspace.repoFullName": `${repo.full_name}.wiki`,
      },
      extensions: {
        recommendations: [
          "DavidAnson.vscode-markdownlint",
          "bierner.markdown-preview-github-styles",
        ],
      },
    })
  );

  // open wiki workspace
  await vscode.commands.executeCommand(
    "vscode.openFolder",
    vscode.Uri.file(wikiWorkspacePath)
  );
}