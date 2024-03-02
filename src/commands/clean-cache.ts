import * as fs from "fs";
import * as vscode from "vscode";
import environment from "../environment";

export default async function cleanCache() {
  if (fs.existsSync(environment.tempDir)) {
    try {
      fs.rmdirSync(environment.tempDir, { recursive: true });
    } catch {
      vscode.window.showErrorMessage(
        "Failed to clean cache. Close any open wiki workspaces and try again."
      );
      return;
    }
    vscode.window.showInformationMessage("Cache cleaned successfully.");
  } else {
    vscode.window.showInformationMessage("Cache is already clean.");
  }
}