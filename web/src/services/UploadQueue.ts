import { Injector } from './Injector';
import { LibrariesService } from './LibrariesService';
import { getAllEntriesRecursive, getFsEntryFile, isDirectoryEntry, isFileEntry } from '../utils/fileSystemEntry';
import { getParent, resolvePath } from '../utils/path';

type UploadItem = UploadFile | UploadFolder;

interface BaseUploadItem {
  libraryId: number | string;
  parent: string;
}

interface UploadFile extends BaseUploadItem {
  file: File;
}

interface UploadFolder extends BaseUploadItem {
  name: string;
}

export class UploadStatusEvent extends Event {
  public constructor(public readonly status: UploadStatus) {
    super('status');
  }

  public isDone(): boolean {
    return this.status.currentPercent === 100 && this.status.queue.length === 0;
  }
}

export interface UploadStatus {
  currentPercent: number;
  queue: UploadItem[];
}

export class UploadQueue extends EventTarget {
  public static readonly NAME = 'UploadQueue';

  private readonly libraries: LibrariesService;

  private readonly queue: UploadItem[] = [];
  private uploading = false;

  public constructor(injector: Injector) {
    super();
    this.libraries = injector.resolve(LibrariesService);
  }

  public async uploadFiles(libraryId: string | number, path: string, files: FileList | null): Promise<void> {
    if (!files || files.length === 0) {
      return;
    }

    for (const file of Array.from(files)) {
      // Check if the file is actually a folder.
      // For some reason this messes up the upload.
      // The only way to check this seems to be to call the `text` or `arrayBuffer` function on the blob.
      // If that errors, it's not a file.
      if (file.size === 0 && file.type === '') {
        try {
          await file.arrayBuffer();
        } catch (e) {
          console.warn("Can't upload folders with the File API, skipping:", file.name);
          continue;
        }
      }

      this.push({ libraryId, parent: path, file });
    }
  }

  public async uploadEntries(libraryId: string | number, path: string, items: DataTransferItemList): Promise<void> {
    const allEntries = await getAllEntriesRecursive(items);
    for (const entry of allEntries) {
      const entryParent = getParent(entry.fullPath);
      const parent = resolvePath(path, entryParent.substring(1));

      if (isFileEntry(entry)) {
        this.push({ libraryId, parent, file: await getFsEntryFile(entry) });
      } else if (isDirectoryEntry(entry)) {
        this.push({ libraryId, parent, name: entry.name });
      } else {
        console.error('Unknown entry:', entry);
      }
    }
  }

  private push(item: UploadItem): void {
    this.queue.push(item);
    if (!this.uploading) {
      this.uploadNext();
    }
  }

  private async uploadNext(): Promise<void> {
    this.uploading = true;

    const next = this.queue.shift();
    if (!next) {
      this.uploading = false;
      return;
    }

    if ('file' in next) {
      await this.libraries.uploadFile(next.libraryId, next.parent, next.file, (p) => {
        this.dispatchEvent(
          new UploadStatusEvent({
            currentPercent: p.percent,
            queue: this.queue,
          })
        );
      });
    } else {
      await this.libraries.createFolder(next.libraryId, next.parent, next.name);
    }

    this.uploadNext();
  }
}
