export type Repo = {
  name: string;
  full_name: string;
  description: string;
  has_wiki: boolean;
};

export type User = {
  login: string;
  html_url: string;
};

export function getAuthenticatedUser(token: string) {
  return fetch("https://api.github.com/user", {})
    .then((res) => res.json())
    .then((user) => user as User);
}

export function getRepos(username: string) {
  return fetch(`https://api.github.com/users/${username}/repos`, {})
    .then((res) => res.json())
    .then((repos) => repos as Repo[]);
}