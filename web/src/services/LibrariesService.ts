import { ApiService, isApiError } from './ApiService';
import { Injector } from './Injector';
import { User } from './UserService';

export type LibraryType = 'generic' | 'books' | 'movies' | 'shows' | 'music';

export type Category = 'Archive' | 'Audio' | 'Binary' | 'Document' | 'Folder' | 'Image' | 'Video' | 'Source Code';

export interface Library {
  id: number;
  name: string;
  canWrite: boolean;
  type: LibraryType;
}

export interface CreateLibrary {
  name: string;
  type: LibraryType;
  rootFolder: string;
}

export interface LibraryDetails extends Library {
  rootFolder: string;
  sharedWith: ShareDetails[];
}

export interface ShareDetails {
  canWrite: boolean;
  user: User;
}

export interface UpdateLibrary {
  name?: string;
}

export interface Entry {
  name: string;
  parent: string;
  modified: string;
  category: Category;
  size: number;
}

export interface BrowseResponse {
  path: string;
  parent: string;
  folders: { path: string }[];
}

export interface DownloadTokenResponse {
  token: string;
}

export class LibrariesService {
  public static readonly NAME = 'LibrariesService';
  private readonly api: ApiService;

  public constructor(injector: Injector) {
    this.api = injector.resolve(ApiService);
  }

  public listLibraries(): Promise<Library[]> {
    return this.api.getAllPages<Library>('/libraries/').then((l) => l.toSorted((a, b) => a.name.localeCompare(b.name)));
  }

  public createLibrary(library: CreateLibrary): Promise<Library> {
    return this.api.jsonPost('/libraries/', library);
  }

  public updateLibrary(id: number, updates: UpdateLibrary): Promise<Library> {
    return this.api.jsonPatch(`/libraries/${id}`, updates);
  }

  public getLibraryDetails(id: number): Promise<LibraryDetails> {
    return this.api.jsonGet(`/libraries/${id}`);
  }

  public async listLibraryDetails(): Promise<LibraryDetails[]> {
    const libraries = await this.listLibraries();
    return Promise.all(libraries.map((l) => this.getLibraryDetails(l.id)));
  }

  public deleteLibrary(id: number): Promise<void> {
    return this.api.delete(`/libraries/${id}`);
  }

  public async getSubFolders(path: string): Promise<BrowseResponse> {
    return this.api.jsonPost<{ path: string }, BrowseResponse>(`/system/browse`, {
      path,
    });
  }

  public async getEntries(libraryId: number | string, parent: string): Promise<Entry[]> {
    try {
      return await this.api.jsonGet(`/libraries/${libraryId}/entries`, { parent });
    } catch (e) {
      if (isApiError(e) && e.status === 404) {
        // TODO: Improve error handling.
        return [];
      } else {
        throw e;
      }
    }
  }

  public async getEntry(libraryId: number | string, path: string): Promise<Entry | undefined> {
    return (await this.api.jsonGet<Entry[]>(`/libraries/${libraryId}/entries`, { path }))[0];
  }

  public async deleteEntry(libraryId: number | string, path: string): Promise<void> {
    return this.api.delete(`/libraries/${libraryId}/entries`, { path });
  }

  public uploadFile(libraryId: number | string, parent: string, file: File): Promise<Entry> {
    return this.api.formPost(`/libraries/${libraryId}/entries`, {
      parent,
      name: file.name,
      data: file,
    });
  }

  public createFolder(libraryId: number | string, parent: string, name: string): Promise<Entry> {
    return this.api.formPost(`/libraries/${libraryId}/entries`, {
      parent,
      name,
    });
  }

  public async download(libraryId: string, path: string): Promise<void> {
    const response: DownloadTokenResponse = await this.api.jsonPost(`/libraries/${libraryId}/entries/download`, {
      path,
    });
    window.open(`/api/download?token=${response.token}`, '_self');
  }

  public moveEntry(libraryId: string, source: string, target: string): Promise<void> {
    return this.api.jsonPost(`/libraries/${libraryId}/entries/move`, {
      source,
      target,
    });
  }
}
