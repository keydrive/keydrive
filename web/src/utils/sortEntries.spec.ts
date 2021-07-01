import { Entry } from '../services/LibrariesService';
import { sortEntries } from './sortEntries';

describe('sortEntries', () => {
  it('sorts entries by name, folders before files', () => {
    const entries: Entry[] = [
      entry('aaa', false),
      entry('dir', true),
      entry('z-dir', true),
      entry('zzz', false),
      entry('BBB', false),
      entry('bbb', false),
      entry('.hidden', true),
    ];

    expect(sortEntries(entries).map((e) => e.name)).toStrictEqual([
      '.hidden',
      'dir',
      'z-dir',
      'aaa',
      'bbb',
      'BBB',
      'zzz',
    ]);
  });
});

function entry(name: string, isDir: boolean): Entry {
  return {
    name,
    category: isDir ? 'Folder' : 'Binary',
    parent: '/',
    size: 0,
    modified: '',
  };
}
