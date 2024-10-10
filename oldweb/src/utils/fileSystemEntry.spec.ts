import { getAllEntriesRecursive } from './fileSystemEntry';

describe('getAllEntriesRecursive', () => {
  it('skips items which are not an entry', async () => {
    const dataTransferItems = [
      {
        webkitGetAsEntry: () => null,
      },
    ];

    const result = await getAllEntriesRecursive(dataTransferItems as unknown as DataTransferItemList);
    expect(result).toStrictEqual([]);
  });

  it('returns all entries from the file tree', async () => {
    const entries = [
      mockFileEntry('/readme.txt'),
      mockDirectoryEntry('/empty', []),
      mockDirectoryEntry('/dir', [
        mockFileEntry('/dir/img.jpg'),
        mockFileEntry('/dir/yes.ico'),
        mockDirectoryEntry('/dir/deeper', [mockFileEntry('/dir/deeper/gold.txt')]),
      ]),
    ];
    const dataTransferItems = entries.map((e) => ({
      webkitGetAsEntry: () => e,
    }));

    const result = await getAllEntriesRecursive(dataTransferItems as unknown as DataTransferItemList);
    const check = result.map((e) => `${e.isFile ? 'file:' : 'dir:'}${e.fullPath}`);
    expect(check).toStrictEqual([
      'file:/readme.txt',
      'dir:/empty',
      'dir:/dir',
      'file:/dir/img.jpg',
      'file:/dir/yes.ico',
      'dir:/dir/deeper',
      'file:/dir/deeper/gold.txt',
    ]);
  });
});

function mockFileEntry(fullPath: string): FileSystemFileEntry {
  return {
    fullPath,
    name: fullPath.substring(fullPath.lastIndexOf('/') + 1),
    isFile: true,
    isDirectory: false,
    file: () => {
      throw new Error('Cannot call `file` on mock FileSystemFileEntry.');
    },
  } as unknown as FileSystemFileEntry;
}

function mockDirectoryEntry(fullPath: string, children: FileSystemEntry[]): FileSystemDirectoryEntry {
  return {
    fullPath,
    name: fullPath.substring(fullPath.lastIndexOf('/') + 1),
    isFile: false,
    isDirectory: true,
    createReader: () => {
      let read = false;
      return {
        readEntries: (success) => {
          const res = read ? [] : children;
          read = true;
          success(res);
        },
      };
    },
  } as FileSystemDirectoryEntry;
}
