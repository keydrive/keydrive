import { Injector } from './Injector';
import { LibrariesService } from './LibrariesService';

export interface UploadItem {
  libraryId: number | string;
  parent: string;
  file: File;
}

export class UploadQueue {
  public static readonly NAME = 'UploadQueue';

  private readonly libraries: LibrariesService;

  private readonly queue: UploadItem[] = [];

  public constructor(injector: Injector) {
    this.libraries = injector.resolve(LibrariesService);
  }

  public push(item: UploadItem): void {
    this.queue.push(item);
    // TODO
  }
}
