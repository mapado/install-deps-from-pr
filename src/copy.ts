import fs from 'fs-extra';
import { cwd } from './input';
import { log } from './log';

export function copyFiles(buildPath: string): Promise<void> {
  const moduleName = JSON.parse(
    fs.readFileSync(`${buildPath}/package.json`, 'utf-8'),
  ).name;

  const modulePath = `${cwd}/node_modules/${moduleName}`;

  return fs
    .ensureDir(modulePath)
    .then(() =>
      fs.ensureDir(`${modulePath}/node_modules`).then(() =>
        fs.copy(buildPath, modulePath, {
          filter: (src) => {
            const srcAppendSlash = `${src}/`;

            return (
              !srcAppendSlash.startsWith(`${buildPath}/node_modules/`) &&
              !srcAppendSlash.startsWith(`${buildPath}/.git/`)
            );
          },
        }),
      ),
    )
    .then(() => {
      log(`Copied files from ${buildPath} to ${modulePath}`);
    });
}
