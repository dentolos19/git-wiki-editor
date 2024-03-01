import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Environment } from "../environment";
import * as github from "../github";
import * as utils from "../utils";

export default function (env: Environment) {
  return async function () {
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
      env.tempDir,
      repo.name,
      utils.generateRandomString(8)
    );
    const wikiSourcePath = path.join(wikiBasePath, "wiki");
    const wikiWorkspacePath = path.join(wikiBasePath, "wiki.code-workspace");
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
          "git-wiki-editor.isWikiWorkspace": true,
          "git-wiki-editor.repoFullName": repo.full_name,
        },
        extensions: {
          recommendations: [
            "DavidAnson.vscode-markdownlint",
            "bierner.markdown-preview-github-styles",
          ],
        },
      })
    );
    await vscode.commands.executeCommand(
      "vscode.openFolder",
      vscode.Uri.file(wikiWorkspacePath)
    );
  };
}