import * as chalk from 'chalk';
import { join } from 'path';
import * as fs from 'fs';

export const smallerMsg = (msg: string, color: keyof chalk.Chalk = 'white') =>
  chalk.bgBlack[color as string](` ${msg} `);

export const keyPassingOrPassing = (
  key: string,
  color: keyof chalk.Chalk = 'black',
) => chalk.bgBlack.bold[color as string](` ${key.toUpperCase()} `);

export function includesFromPath(path: string, lookAhead: string) {
  return fs.readdirSync(path).includes(lookAhead);
}

let counter = 0;

export function getCoverageDir(dir = '') {
  const currentDir = dir ? join(dir, '..') : join(__dirname);
  const [file] = process.argv[1].split('/').reverse();

  const isRootWithGit =
    includesFromPath(currentDir, '.git') ||
    includesFromPath(currentDir, 'package.json') ||
    includesFromPath(currentDir, file);
  counter++;
  if (counter >= 7) {
    throw new Error(
      "Didn't find the root of your folder. Do you have a gir repository initialized?",
    );
  }
  return isRootWithGit ? currentDir : getCoverageDir(currentDir);
}
