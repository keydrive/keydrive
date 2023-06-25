import { Injector } from './Injector';
import { LibrariesService } from './LibrariesService';

export interface UploadItem {
  libraryId: number | string;
  parent: string;
  file: File;
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

  public push(item: UploadItem): void {
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

    await this.libraries.uploadFile(next.libraryId, next.parent, next.file, (p) => {
      this.dispatchEvent(
        new UploadStatusEvent({
          currentPercent: p.percent,
          queue: this.queue,
        })
      );
    });

    this.uploadNext();
  }
}
