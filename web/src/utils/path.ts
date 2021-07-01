export function resolvePath(parent: string, name: string): string {
  let result = parent;
  if (!result.endsWith('/')) {
    result = `${result}/`;
  }
  return `${result}${name}`;
}

export function parentPath(path?: string): string {
  if (!path) {
    return '';
  }

  const lastSlash = path.lastIndexOf('/');
  return lastSlash >= 0 ? path.substring(0, lastSlash) : '';
}
