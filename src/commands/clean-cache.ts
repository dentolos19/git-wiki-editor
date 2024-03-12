import * as fs from "node:fs";
import * as vscode from "vscode";
import type { Environment } from "../extension";

export default function cleanCache(env: Environment) {
  if (fs.existsSync(env.tempDir)) {
    try {
      fs.rmSync(env.tempDir, { recursive: true });
      vscode.window.showInformationMessage("Cache cleaned successfully!");
    } catch {
      vscode.window.showErrorMessage(
        "Failed to clean cache! Try to close any open wiki workspaces."
      );
    }
  } else {
    vscode.window.showInformationMessage("Cache is already clean!");
  }
}