import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';
import { getConfig } from './config';
import { copyFiles } from './copy';
import {
  PullRequest,
  downloadAndExtractPR,
  filterInvalidPullRequests,
  getPullRequest,
  getPullRequestBody,
  getPullRequestLinks,
} from './github';
import { cwd } from './input';
import { LogLevel, log } from './log';

const INSTALL_SCRIPT = 'yarn install';
const BUILD_SCRIPT = 'yarn build';

// taken from https://github.com/mapado/watch-module/blob/15a2a4c727a0beb605809490fb50a8fe799c7510/src/build.ts#L11
const execAsync = promisify(exec);

export default async function main(): Promise<void> {
  const config = await getConfig();

  const pullBody = await getPullRequestBody(config);

  if (!pullBody) {
    log('no pull request body found', LogLevel.error);

    return;
  }

  const pullRequestLinks = getPullRequestLinks(config, pullBody);

  if (!pullRequestLinks) {
    log('no pull request links found');

    return;
  }

  // get all pull request data
  const pullRequests: Array<PullRequest | null> = await Promise.all(
    pullRequestLinks.map(async (pullRequestLink) =>
      getPullRequest(config, pullRequestLink),
    ),
  );

  const validPullRequests: Array<PullRequest> =
    filterInvalidPullRequests(pullRequests);

  log(
    `Found ${validPullRequests.length} valid pull requests:${validPullRequests
      .map((pr) => `\n - ${pr?.html_url}`)
      .join('\n')}\n`,
    LogLevel.debug,
  );

  // install each pull request in a `WRITE_DIR` folder
  // for each pull request, do
  // - clone the repository
  // - checkout the branch
  // - install dependencies
  // - build
  // remove `WRITE_DIR` folder if it exists and create a `WRITE_DIR` folder.
  // if it exists, remove it
  const writeDir = `${cwd}/${config.writeDir}`;

  fs.rmSync(writeDir, { recursive: true, force: true });

  // create a new folder "writeDir"
  fs.mkdirSync(writeDir);

  await Promise.allSettled(
    validPullRequests.map(async (pullRequest): Promise<void> => {
      log(`Install pull request ${pullRequest.html_url}`);

      const { repo } = pullRequest.head;

      if (!repo) {
        throw new Error('no repo found. This should not happen.');
      }

      const owner = repo.owner.login;
      const repoName = repo.name;

      const repoWithOwner = `${owner}/${repoName}`;

      log(`Repository name is ${repoWithOwner}`, LogLevel.debug);

      const workingDir = await downloadAndExtractPR(pullRequest, writeDir);

      const installScript = INSTALL_SCRIPT;
      const buildScript = BUILD_SCRIPT;

      log(
        `${repoWithOwner}: running install script… "${installScript}"`,
        LogLevel.debug,
      );

      await execAsync(installScript, {
        maxBuffer: 1024 * 500,
        cwd: workingDir,
      });

      log(`${repoWithOwner}: install script OK`, LogLevel.debug);
      log(
        `${repoWithOwner}: running build script… "${buildScript}"`,
        LogLevel.debug,
      );

      // run scripts
      await execAsync(buildScript, {
        maxBuffer: 1024 * 500,
        cwd: workingDir,
      });

      log(`${repoWithOwner}: build script OK`, LogLevel.debug);

      // copy files to node_modules
      await copyFiles(workingDir);

      log(`${repoWithOwner}: files copied`, LogLevel.debug);
    }),
  );

  log('All dependencies installed. exiting…');
}
