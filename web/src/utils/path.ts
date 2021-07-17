// TODO: We shouldn't need this function.
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
