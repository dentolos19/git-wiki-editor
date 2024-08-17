import { Octokit } from "octokit";

class GitHub {
  octokit: Octokit;

  constructor() {
    this.octokit = new Octokit();
  }

  updateToken(accessToken?: string) {
    if (accessToken) {
      this.octokit = new Octokit({
        auth: accessToken,
      });
    } else {
      this.octokit = new Octokit();
    }
  }

  async getUserRepos() {
    const user = await this.octokit.request("GET /user/repos", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return user.data as {
      name: string;
      full_name: string;
      private: boolean;
      html_url: string;
      description: string;
      fork: boolean;
      has_wiki: boolean;
      archived: boolean;
    }[];
  }
}

const github = new GitHub();

export default github;