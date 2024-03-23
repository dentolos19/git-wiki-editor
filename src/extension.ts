import * as path from "node:path";
import * as vscode from "vscode";
import cleanCache from "./commands/clean-cache";
import initializeWiki from "./commands/initialize-wiki";
import openWiki from "./commands/open-wiki";
import publishWiki from "./commands/publish-wiki";

export type Environment = {
	configuration: vscode.WorkspaceConfiguration;
	tempStorePath: string;
	wikiStorePath: string;
};

export function activate(context: vscode.ExtensionContext) {
	// Initialize environment
	const globalStorePath = context.globalStorageUri.fsPath;
	const env: Environment = {
		configuration: vscode.workspace.getConfiguration("git-wiki-editor"),
		tempStorePath: path.join(globalStorePath, "temp"),
		wikiStorePath: path.join(globalStorePath, "wikis"),
	};

	// Initialize commands
	for (const command of [
		vscode.commands.registerCommand("git-wiki-editor.openWiki", () =>
			openWiki(env),
		),
		vscode.commands.registerCommand("git-wiki-editor.publishWiki", () =>
			publishWiki(env),
		),
		vscode.commands.registerCommand("git-wiki-editor.cleanCache", () =>
			cleanCache(env),
		),
	]) {
		context.subscriptions.push(command);
	}

	// Check if the current workspace is a wiki workspace
	if (env.configuration.get<boolean>("workspace.isWikiWorkspace")) {
		initializeWiki(env);
	}
}

export function deactivate() {}