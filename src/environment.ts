import * as vscode from "vscode";

export type Environment = {
    config: vscode.WorkspaceConfiguration;
    tempDir: string;
};