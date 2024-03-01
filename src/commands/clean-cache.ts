import * as fs from "fs";
import * as vscode from "vscode";
import { Environment } from "../environment";

export default function (env: Environment) {
  return async function () {
    if (fs.existsSync(env.tempDir)) {
      try {
        fs.rmdirSync(env.tempDir, { recursive: true });
      } catch {
        vscode.window.showErrorMessage("Failed to clean cache. Close any open wiki workspaces and try again.");
        return;
      }
      vscode.window.showInformationMessage("Cache cleaned successfully.");
    } else {
      vscode.window.showInformationMessage("Cache is already clean.");
    }
  };
}