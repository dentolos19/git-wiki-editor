import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import type { Environment } from "../extension";
import { executeTerminalCommands } from "../utils";

export default function initializeWiki(env: Environment) {
	// Checks if the current workspace is a valid wiki workspace
	const isWikiWorkspace = env.configuration.get<boolean>("workspace.isWikiWorkspace");
	const repoFullName = env.configuration.get<string>("workspace.repoFullName");
	if (!isWikiWorkspace) {
		return;
	}
	if (!repoFullName) {
		vscode.window.showErrorMessage("Invalid wiki workspace!");
		return;
	}

	// Checks if the wiki is already initialized
	const wikiPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
	if (!wikiPath) {
		vscode.window.showErrorMessage("Unable to find the wiki path.");
		return;
	}
	if (fs.existsSync(path.join(wikiPath, ".git"))) {
		return;
	}

	// Initializes the wiki
	executeTerminalCommands(
		`cd ${wikiPath}`,
		`git clone https://github.com/${repoFullName}.git .`,
	);
}