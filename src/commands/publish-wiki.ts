import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import type { Environment } from "../extension";
import {
    executeShellCommands,
    executeTerminalCommands,
    matchRepoFullName,
} from "../utils";

export default async function publishWiki(env: Environment) {
	// Check if the current workspace is a valid wiki workspace
	const isWikiWorkspace = env.configuration.get<boolean>(
		"workspace.isWikiWorkspace",
		false,
	);
	const repoFullName = env.configuration.get<string>("workspace.repoFullName");
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

	// Check if the wiki is initialized
	if (!fs.existsSync(path.join(wikiPath, ".git"))) {
		vscode.window.showErrorMessage("Please initialize the wiki first!");
		return;
	}

	// Get remote repo's full name
	const remoteRepoFullName = await executeShellCommands(
		`cd ${wikiPath}`,
		"git remote -v",
	).then(
		(result) => matchRepoFullName(result),
		(_) => undefined,
	);
	if (!remoteRepoFullName) {
		vscode.window.showErrorMessage(
			"Unable to find the remote repo's full name.",
		);
		return;
	}

	// Check if the local origin matches the wiki's remote
	if (remoteRepoFullName !== repoFullName) {
		vscode.window.showErrorMessage(
			"The git origin does not match the wiki's remote.",
		);
		return;
	}

	// Ask user for the mode of commit
	const orphanCommit = (
		await vscode.window.showQuickPick([
			{
				label: "Push changes as a new commit",
				description: "Recommended",
				detail: "Push your changes as a new commit.",
				iconPath: new vscode.ThemeIcon("git-commit"),
				data: false,
			},
			{
				label: "Push changes as an orphaned commit",
				description: "Advanced",
				detail:
					"Sqush all your changes, including your previous changes, into one commit.",
				iconPath: new vscode.ThemeIcon("git-pull-request"),
				data: true,
			},
		])
	)?.data;

	// Ask user to input a commit message
	const commitMessage = await vscode.window.showInputBox({
		placeHolder: "Enter a commit message...",
	});
	if (!commitMessage) {
		vscode.window.showErrorMessage(
			"Operation cancelled! Please enter a commit message.",
		);
		return;
	}

	// Push the changes to the wiki
	executeTerminalCommands(`cd ${wikiPath}`);
	if (orphanCommit) {
		// Push changes as an orphaned commit
		executeTerminalCommands(
			"git checkout --orphan wiki",
			"git add .",
			`git commit -m "${commitMessage}"`,
			"git branch -D master",
			// `git push origin -D master`,
			"git branch -m master",
			"git push -f origin master",
		);
	} else {
		// Push changes as a new commit
		executeTerminalCommands(
			"git add .",
			`git commit -m "${commitMessage}"`,
			"git push origin master",
		);
	}

	vscode.window
		.showInformationMessage("Wiki published!", "Open Wiki")
		.then((result) => {
			if (!result) {
				return;
			}
			vscode.env.openExternal(
				vscode.Uri.parse(
					`https://github.com/${repoFullName.replace(".wiki", "")}/wiki`,
				),
			);
		});
}