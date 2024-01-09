import fs from 'fs-extra';
import { Octokit } from 'octokit';
import tar from 'tar';
import { Config, getBranchName, getGithubAccessToken } from './config';
import { LogLevel, log } from './log';

const PULL_REQUEST_LINK_REGEX =
  /https:\/\/github.com\/[^/]+\/[^/]+\/pull\/\d+/g;

const octokit = new Octokit({ auth: getGithubAccessToken() });

export function isAValidDependency(
  config: Config,
  owner: string,
  repo: string,
): boolean {
  return config.repos.includes(`${owner}/${repo}`);
}

export async function getPullRequestBody(
  config: Config,
): Promise<string | undefined> {
  const { data: pull } = await octokit.rest.search.issuesAndPullRequests({
    q: `is:pull-request repo:${config.currentRepo} head:${getBranchName()}`,
  });

  const pullBody = pull.items[0]?.body;

  log(`Pull request body is:\n=====\n${pullBody}\n=====\n`, LogLevel.debug);

  return pullBody;
}

export function getPullRequestLinks(
  config: Config,
  pullBody: string,
): Array<string> | undefined {
  // find in markdown the context of the block with title `### Dépendances (pull requests) :`

  const prDescriptionRegexList: Array<RegExp> = Array.isArray(
    config.prDescriptionRegex,
  )
    ? config.prDescriptionRegex
    : [config.prDescriptionRegex];

  let match;

  // eslint-disable-next-line no-restricted-syntax
  for (const prDescriptionRegex of prDescriptionRegexList) {
    match = pullBody.match(prDescriptionRegex);

    if (match) {
      break;
    }
  }

  if (!match) {
    log('no dependencies block found');

    return undefined;
  }

  const dependenciesBlock = match[1];

  // in this block, do find every github pull request linked
  return dependenciesBlock.match(PULL_REQUEST_LINK_REGEX) ?? undefined;
}

export type PullRequest = Awaited<
  ReturnType<typeof octokit.rest.pulls.get>
>['data'];

export async function getPullRequest(
  config: Config,
  pullRequestLink: string,
): Promise<PullRequest | null> {
  const [owner, repo, , pullNumber] = pullRequestLink
    .replace('https://github.com/', '')
    .split('/');

  if (!isAValidDependency(config, owner, repo)) {
    return null;
  }

  try {
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: Number(pullNumber),
    });

    return pullRequest;
  } catch (e) {
    return null;
  }
}

export function filterInvalidPullRequests(
  pullRequests: Array<PullRequest | null>,
): Array<PullRequest> {
  return pullRequests.filter((pr: PullRequest | null): pr is PullRequest => {
    if (!pr) {
      return false;
    }

    return pr.state === 'open';
  });
}

export async function downloadAndExtractPR(
  pullRequest: PullRequest,
  writeDir: string,
): Promise<string> {
  const { sha, ref: branch, repo } = pullRequest.head;

  if (!repo) {
    throw new Error('no repo found. This should not happen.');
  }

  const owner = repo.owner.login;
  const repoName = repo.name;

  const repoWithOwner = `${owner}/${repoName}`;

  const dlResponse = await octokit.rest.repos.downloadTarballArchive({
    owner,
    repo: repoName,
    ref: branch,
  });

  log(`${repoWithOwner}: tarball is downloaded`, LogLevel.debug);

  if (!(dlResponse.data instanceof ArrayBuffer)) {
    throw new Error('response is not an ArrayBuffer. This should not happen.');
  }

  // write file to disk. dlResponse.data is an ArrayBuffer
  fs.writeFileSync(
    `${writeDir}/${owner}-${repoName}.tar`,
    Buffer.from(dlResponse.data),
  );

  log(`${repoWithOwner}: file has been written to disk`, LogLevel.debug);

  // unzip file
  await tar.extract({
    file: `${writeDir}/${owner}-${repoName}.tar`,
    cwd: writeDir,
  });

  log(`${repoWithOwner}: tar file has been extracted`, LogLevel.debug);

  return `${writeDir}/${owner}-${repoName}-${sha}`;
}
