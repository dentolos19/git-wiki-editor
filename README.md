<h1>
    <img src="public/icon.png" alt="Icon" height="30">
    <span>Git Wiki Editor</span>
</h1>

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/dentolos19.git-wiki-editor?logo=visual%20studio&label=marketplace)](https://marketplace.visualstudio.com/items?itemName=dentolos19.git-wiki-editor)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/dentolos19.git-wiki-editor)](https://marketplace.visualstudio.com/items?itemName=dentolos19.git-wiki-editor)

An easy way to quickly edit wikis locally inside your editor!

**What is my rationale of making this extension?** I want to edit my projects' wiki quickly and easily right inside my editor just by running commands instead of typing commands manually inside the terminal. There wasn't any specialized extensions for editing GitHub wikis and extensions like [Remote Repositories](https://marketplace.visualstudio.com/items?itemName=ms-vscode.remote-repositories) doesn't allow you to remotely access them as well. So, why not make my own extension? I thought it would be fun learning something new. 😎

## ⚒️ Usage

To get started, go check out [the wiki](https://github.com/dentolos19/git-wiki-editor/wiki) to learn how to use this extension.

## ⚙️ Features

- [x] Supports GitHub
- [x] Able to clone wiki in isolation (stored in temp folder)
- [x] Allows you to commit either as a new commit or a single (orphaned) commit

### Roadmap

- [ ] Support GitLab, CodeBerg and Azure DevOps (need help)
- [ ] Designate special repositories (e.g. `dentolos19/dentolos19`) as a hub for the user's knowledgebase

## 🧑‍💻 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) 8+
- [Visual Studio Code](https://code.visualstudio.com) 1.87+

### Installation

1. Clone the repo: `git clone https://github.com/dentolos19/git-wiki-editor.git`
2. Install dependencies: `pnpm install`
3. Open the project: `code .`
4. Run the extension: <kbd>F5</kbd>

## 💖 Credits

- Icon by [icon wind](https://flaticon.com/free-icon/path_9534017)

## 📜 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.