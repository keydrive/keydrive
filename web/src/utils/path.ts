import { Entry } from '../services/LibrariesService';

export function resolvePath(entry: Entry): string;
export function resolvePath(parent: string, name: string): string;
export function resolvePath(parentOrEntry: Entry | string, name?: string): string {
  if (typeof parentOrEntry === 'string') {
    let result = parentOrEntry;
    if (!result.endsWith('/')) {
      result = `${result}/`;
    }
    if (!result.startsWith('/')) {
      result = `/${result}`;
    }
    return `${result}${name}`;
  } else {
    return `${parentOrEntry.parent}/${parentOrEntry.name}`;
  }
}
