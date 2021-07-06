import { ApiService } from './ApiService';
import { Injector } from './Injector';
import { User } from './UserService';

export type LibraryType = 'generic' | 'books' | 'movies' | 'shows' | 'music';

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
  category: string;
  size: number;
}

export interface BrowseResponse {
  path: string;
  parent: string;
  folders: { path: string }[];
}

export class LibrariesService {
  public static readonly NAME = 'LibrariesService';
  private readonly api: ApiService;

  public constructor(injector: Injector) {
    this.api = injector.resolve(ApiService);
  }

  public listLibraries(): Promise<Library[]> {
    return this.api.getAllPages('/libraries/');
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

  public getEntries(libraryId: number | string, parent: string): Promise<Entry[]> {
    return this.api.jsonGet(`/libraries/${libraryId}/entries`, { parent });
  }
}
