import { Entry, LibrariesService } from '../services/LibrariesService.ts';
import { useCallback, useEffect, useState } from 'react';
import { useRequiredParam } from './useRequiredParam.ts';
import { useService } from './useService.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { resolvePath } from '../utils/path.ts';
import { useHash } from './useHash.ts';

export interface EntryData {
  loadingEntries: boolean;
  currentDir: Entry | undefined;
  entries: Entry[];

  selectedEntry: Entry | undefined;
  setSelectedEntry: (entry: Entry | undefined) => void;

  refresh: () => Promise<Entry[]>;
  activateEntry: (target: string | Entry) => void;
  downloadEntry: (target: Entry) => void;
}

export function useEntries(): EntryData {
  const libraries = useService(LibrariesService);
  const libraryId = useRequiredParam('library');
  const { path: encodedPath } = useParams<{ path: string }>();
  const path = decodeURIComponent(encodedPath ?? '');

  const navigate = useNavigate();
  const [encodedHash, setHash] = useHash();

  const [currentDir, setCurrentDir] = useState<Entry>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // TODO: Allow multiple selected entries.
  const [selectedEntry, setSelectedEntry] = useState<Entry>();

  // Set the selected entry from the hash.
  const hash = decodeURIComponent(encodedHash);
  useEffect(() => {
    setSelectedEntry(entries?.find((e) => e.name === hash));
  }, [entries, hash]);

  // Whenever the path or library changes, clear the selected entry.
  useEffect(
    () => setSelectedEntry(undefined),
    [setSelectedEntry, path, libraryId],
  );

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    setSelectedEntry(undefined);

    try {
      // If the path is falsy or '/' we're at the library root.
      const pathIsRoot = !path || path === '/';

      // Get the current directory entry, and the child entries.
      const [newCurrentDir, newEntries] = await Promise.all([
        pathIsRoot
          ? Promise.resolve(undefined) // If we are at the library root, no need for an extra call.
          : libraries.getEntry(libraryId, path),
        libraries.getEntries(libraryId, path),
      ]);

      setCurrentDir(newCurrentDir);
      setEntries(newEntries);

      return newEntries;
    } finally {
      setLoadingEntries(false);
    }
  }, [libraryId, path, libraries]);

  const refresh = useCallback(() => {
    return loadEntries().catch((e) => {
      console.error('Error while loading entries:', e);
      if (e.status === 404) {
        navigate('/files');
      }
      return [];
    });
  }, [loadEntries, navigate]);

  // Call refresh whenever it (or loadEntries) changes.
  // This effectively causes the entries to be refreshed whenever the path or library changes.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Activate an entry. For directories (string or Folder entry) this navigates to it. For files this selects them.
  const activateEntry = useCallback(
    (target: string | Entry) => {
      if (typeof target === 'string') {
        navigate(`/files/${libraryId}/${encodeURIComponent(target)}`);
      } else if (target.category === 'Folder') {
        navigate(
          `/files/${libraryId}/${encodeURIComponent(resolvePath(target))}`,
        );
      } else {
        setHash(encodeURIComponent(target.name));
        setSelectedEntry(target);
      }
    },
    [libraryId, navigate, setHash],
  );

  // Download an entry. This only works for files.
  const downloadEntry = useCallback(
    (target: Entry) => {
      if (target.category !== 'Folder') {
        libraries.download(libraryId, resolvePath(target));
      }
    },
    [libraries, libraryId],
  );

  return {
    loadingEntries,
    currentDir,
    entries,
    selectedEntry,
    setSelectedEntry,
    refresh,
    activateEntry,
    downloadEntry,
  };
}
