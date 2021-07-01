const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];

export function humanReadableSize(bytes: number): string {
  let unitIndex = 0;
  let bytesLeft = bytes;

  while (bytesLeft >= 1024 && unitIndex < units.length - 1) {
    unitIndex++;
    bytesLeft /= 1024;
  }

  return `${bytesLeft.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
