import { argv } from './input';

export enum LogLevel {
  debug = 'debug',
  info = 'info',
  error = 'error',
}

export function log(args: unknown, level: LogLevel = LogLevel.info): void {
  if (level === LogLevel.debug && argv.verbose !== true) {
    return;
  }

  if (level === LogLevel.error) {
    console.error(args);
  } else {
    console.log(args);
  }
}
