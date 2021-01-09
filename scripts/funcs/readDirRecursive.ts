import * as fs from 'fs';
import * as path from 'path';

export function readDirectoryRecursive(
  dir: string,
  fileExtension: string,
  relativeDir: string,
) {
  const files = [];
  const entries: string[] = fs.readdirSync(dir, { encoding: 'utf-8' });

  for (const entry of entries) {
    const filePath = `${dir}/${entry}`;
    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) {
      files.push(
        ...readDirectoryRecursive(filePath, fileExtension, relativeDir),
      );
    } else if (stats.isFile() && entry.endsWith(fileExtension)) {
      const entityPath = path
        .relative(relativeDir, filePath)
        .replace(/\.ts$/, '');
      files.push(path.normalize(entityPath));
    }
  }
  return files;
}
