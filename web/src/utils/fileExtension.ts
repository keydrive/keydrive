export function fileExtension(name: string): string {
  const parts = name.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return '';
}
