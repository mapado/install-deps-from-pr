import nodeProcess from 'node:process';
import minimist from 'minimist';
import packageJson from '../package.json';

export const cwd = nodeProcess.cwd();

export const argv = minimist(process.argv.slice(2));

if (argv.version) {
  console.log(`${packageJson.name} version: ${packageJson.version}`);

  process.exit(0);
}
