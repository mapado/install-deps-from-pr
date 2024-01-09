/* eslint-disable no-await-in-loop */
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { cwd } from './input';
import { LogLevel, log } from './log';

export type Config = {
  currentRepo: string;
  writeDir?: string;
  prDescriptionRegex: RegExp | Array<RegExp>;
  repos: Array<string>;
};

export const CONFIG_EXTENSIONS = ['.ts', '.mjs', '.js'];
export const WRITE_DIR = 'install-deps-from-pr';

async function importTypescriptConfig(filePath: string) {
  // eslint-disable-next-line global-require,import/no-dynamic-require, no-await-in-loop
  const { default: ts } = await import('typescript');

  const transpiledModule = ts.transpileModule(
    fs.readFileSync(filePath, 'utf-8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.Node16,
      },
    },
  );

  const tmpPath = path.join(os.tmpdir(), 'install-deps-from-pr');

  fs.ensureDirSync(tmpPath);

  const tmpFile = path.join(
    tmpPath,
    `${process.env.USER}-${path.basename(cwd)}.js`,
  );

  fs.writeFileSync(tmpFile, transpiledModule.outputText);

  // eslint-disable-next-line no-await-in-loop
  const importedConfig = await import(tmpFile);

  fs.remove(tmpFile);

  return importedConfig;
}

export async function getConfig(): Promise<Required<Config>> {
  let importedFile;

  // eslint-disable-next-line no-restricted-syntax
  for (const extension of CONFIG_EXTENSIONS) {
    try {
      log(
        `Trying to load config from install-deps-from-pr.config${extension}`,
        LogLevel.debug,
      );

      const filePath = `${cwd}/install-deps-from-pr.config${extension}`;

      if (!fs.existsSync(filePath)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (extension === '.ts') {
        importedFile = await importTypescriptConfig(filePath);
      } else {
        importedFile = await import(filePath);
      }

      const config = importedFile.default as Config;

      log(
        `Config is:\n=====\n${JSON.stringify(config, null, 2)}\n=====\n`,
        LogLevel.debug,
      );

      return {
        ...config,
        writeDir: config.writeDir || WRITE_DIR,
      };
    } catch (e) {
      log(`Error while loading config file: ${e}`, LogLevel.error);
      // do nothing
    }
  }

  throw new Error(
    `No config file found. Tried ${CONFIG_EXTENSIONS.join(', ')}`,
  );
}

/**
 * Find the access-token in the environment variables.
 */
export function getGithubAccessToken(): string {
  if (!process.env.GITHUB_ACCESS_TOKEN) {
    console.error(
      'no access token provided in `GITHUB_ACCESS_TOKEN` env variable. Did you encapsulate your call in `withCredentials` ?',
    );

    process.exit(1);
  }

  return process.env.GITHUB_ACCESS_TOKEN;
}

export function getBranchName(): string {
  if (!process.env.BRANCH_NAME) {
    console.error(
      'no branch name provided in `BRANCH_NAME` env variable. Are you on a github pull request job ?',
    );

    process.exit(1);
  }

  return process.env.BRANCH_NAME;
}
