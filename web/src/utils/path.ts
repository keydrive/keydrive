import { Entry } from '../services/LibrariesService';

export function resolvePath(entry: Entry): string;
export function resolvePath(parent: string, name: string): string;
export function resolvePath(
  parentOrEntry: Entry | string,
  name?: string,
): string {
  const parentPath =
    typeof parentOrEntry === 'string' ? parentOrEntry : parentOrEntry.parent;
  const namePath =
    typeof parentOrEntry === 'string' ? name : parentOrEntry.name;

  let result = parentPath;
  if (!result.endsWith('/')) {
    result = `${result}/`;
  }
  if (!result.startsWith('/')) {
    result = `/${result}`;
  }
  return `${result}${namePath}`;
}

export function getParent(path: string): string {
  return path.substring(0, path.lastIndexOf('/')) || '/';
}
