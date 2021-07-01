export function resolvePath(parent: string, name: string): string {
  let result = parent;
  if (!result.endsWith('/')) {
    result = `${result}/`;
  }
  if (!result.startsWith('/')) {
    result = `/${result}`;
  }
  return `${result}${name}`;
}

export function parentPath(path?: string): string {
  if (!path || path === '/') {
    return '';
  }

  let result = path;
  if (!result.startsWith('/')) {
    result = `/${result}`;
  }
  return result.substring(0, result.lastIndexOf('/'));
}
