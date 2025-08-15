import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import type { Environment } from "../extension";
import github from "../github";

export default async function openWiki(env: Environment) {
  // Get user's github session
  const session = await vscode.authentication.getSession("github", ["repo"], {
    createIfNone: true,
  });

  // Get user's repos via session
  github.updateToken(session?.accessToken);
  let repos = await github.getUserRepos();
  repos = repos.filter((repo) => {
    return repo.has_wiki && !repo.archived;
  });

  // Prompt user to select a wiki
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

  const wikiBasePath = path.join(env.wikiStorePath, repo.full_name);
  const wikiSourcePath = path.join(wikiBasePath, "wiki");
  const wikiWorkspacePath = path.join(wikiBasePath, "wiki.code-workspace");

  // Check if the wiki workspace already exists for that repo
  if (fs.existsSync(wikiWorkspacePath)) {
    const newWorkspace = await vscode.window.showInformationMessage(
      "Wiki workspace already exists. Open a new workspace?",
      "Yes",
      "No"
    );
    if (newWorkspace !== "Yes") {
      // Opens the existing wiki workspace
      vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(wikiWorkspacePath));
      return;
    }
    // Deletes the existing wiki workspace
    fs.rmSync(wikiBasePath, { recursive: true });
  }

  // Create a wiki workspace for that repo
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
        "wiki-editor.workspace.isWikiWorkspace": true,
        "wiki-editor.workspace.repoFullName": `${repo.full_name}.wiki`,
      },
      extensions: {
        recommendations: ["DavidAnson.vscode-markdownlint", "bierner.markdown-preview-github-styles"],
      },
    })
  );

  // Open wiki workspace
  vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(wikiWorkspacePath));
}