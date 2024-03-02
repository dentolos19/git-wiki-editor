import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

const environment: {
  config: vscode.WorkspaceConfiguration;
  tempDir: string;
} = {
  config: vscode.workspace.getConfiguration("git-wiki-editor"),
  tempDir: path.join(os.tmpdir(), "git-wiki-editor"),
};

export default environment;