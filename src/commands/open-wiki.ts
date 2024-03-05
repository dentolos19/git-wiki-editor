import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Environment } from "../extension";
import github from "../github";

export default async function openWiki(env: Environment) {
  // get user's github session
  const session = await vscode.authentication.getSession("github", ["repo"], {
    createIfNone: true,
  });

  // get user's repos
  github.updateToken(session?.accessToken);
  let repos = await github.getUserRepos();
  repos = repos.filter((repo) => {
    return repo.has_wiki && !repo.archived;
  });

  // prompt user to select a wiki
  const repo = (
    await vscode.window.showQuickPick(
      repos.map(
        (repo) => {
          return {
            label: repo.full_name,
            detail: repo.description,
            iconPath: new vscode.ThemeIcon("github"),
            data: repo,
          };
        },
        {
          placeHolder: "Select a wiki to open...",
        }
      )
    )
  )?.data;
  if (!repo) {
    return;
  }

  const wikiBasePath = path.join(env.tempDir, repo.full_name);
  const wikiSourcePath = path.join(wikiBasePath, "wiki");
  const wikiWorkspacePath = path.join(wikiBasePath, "wiki.code-workspace");

  // check if wiki workspace already exists
  if (fs.existsSync(wikiWorkspacePath)) {
    const newWorkspace = await vscode.window.showInformationMessage(
      "Wiki workspace already exists. Open a new workspace?",
      "Yes",
      "No"
    );
    if (newWorkspace !== "Yes") {
      vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(wikiWorkspacePath)
      );
      return;
    }
    fs.rmSync(wikiBasePath, { recursive: true });
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
  vscode.commands.executeCommand(
    "vscode.openFolder",
    vscode.Uri.file(wikiWorkspacePath)
  );
}