import { Entry } from '../services/LibrariesService';

export function sortEntries(entries: Entry[]): Entry[] {
  return entries.sort((a, b) => {
    if (a.category === 'Folder' && b.category !== 'Folder') {
      return -1;
    }
    if (a.category !== 'Folder' && b.category === 'Folder') {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}
