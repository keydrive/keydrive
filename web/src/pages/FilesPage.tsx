import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { useService } from '../hooks/useService';
import { Entry, LibrariesService } from '../services/LibrariesService';
import { Icon } from '../components/Icon';
import { EntryIcon } from '../components/EntryIcon';
import { humanReadableSize } from '../utils/humanReadableSize';
import { getParent, resolvePath } from '../utils/path';
import { humanReadableDateTime } from '../utils/humanReadableDateTime';
import { librariesStore } from '../store/libraries';
import { useAppSelector } from '../store';
import { IconButton } from '../components/IconButton';
import { Button } from '../components/Button';
import { classNames } from '../utils/classNames';
import { TextInput } from '../components/input/TextInput';
import { useFileNavigator } from '../hooks/useFileNavigator';
import { ButtonGroup } from '../components/ButtonGroup';
import { Position } from '../utils/position';
import { FilesContextMenu } from '../components/files/FilesContextMenu';
import { KeyCode, useKeyBind } from '../hooks/useKeyBind';
import { LibraryDetailsPanel } from '../components/files/LibraryDetailsPanel';
import { EntryDetailsPanel } from '../components/files/EntryDetailsPanel';
import { getAllEntriesRecursive, getFsEntryFile, isDirectoryEntry, isFileEntry } from '../utils/fileSystemEntry';
import { icons } from '../utils/icons';

const FileRow = ({
  entry,
  onActivate,
  onSelect,
  selected,
  onContextMenu,
  renaming,
  onRename,
  cancelRename,
}: {
  entry: Entry;
  selected: boolean;
  onActivate: (entry: Entry) => void;
  onSelect: (entry: Entry) => void;
  onContextMenu: (e: React.MouseEvent<unknown, MouseEvent>, entry?: Entry) => void;
  renaming: boolean;
  onRename: (newName: string) => void;
  cancelRename: () => void;
}) => {
  const ref = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (selected && ref.current) {
      ref.current?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [ref, selected]);

  const [newName, setNewName] = useState(entry.name);
  useEffect(() => setNewName(entry.name), [entry.name, renaming]);

  return (
    <tr
      ref={ref}
      key={entry.name}
      onDoubleClick={() => {
        onActivate(entry);
      }}
      onClick={() => onSelect(entry)}
      className={classNames(selected && 'is-selected')}
      onContextMenu={(e) => onContextMenu(e, entry)}
    >
      <td className="icon">
        <EntryIcon entry={entry} />
      </td>
      <td>
        {renaming ? (
          <TextInput
            autoFocus
            id="new-entry-name"
            value={newName}
            onChange={setNewName}
            iconButton="check"
            onButtonClick={() => onRename(newName)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                cancelRename();
              }
              if (e.key === 'Enter') {
                onRename(newName);
              }
            }}
            onFocus={(e) => e.currentTarget.select()}
            onFieldBlur={cancelRename}
          />
        ) : (
          entry.name
        )}
      </td>
      <td>{humanReadableDateTime(entry.modified)}</td>
      <td>{entry.category === 'Folder' ? '--' : humanReadableSize(entry.size)}</td>
      <td>{entry.category}</td>
    </tr>
  );
};

export const FilesPage: React.FC = () => {
  // The dataflow in this component is as follows:
  // 1. The route changes which triggers the "loading" state
  // 2. The current directory and its entities are fetched
  // 3. If everything is okay, the "loading" state is removed
  // to navigate to another entity, ONLY change the path through the history object
  const libraries = useService(LibrariesService);
  const { library: libraryId, path: encodedPath } = useParams<{ library: string; path?: string }>();
  const path = decodeURIComponent(encodedPath || '');
  const history = useHistory();

  const [currentDir, setCurrentDir] = useState<Entry>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Current directory info and details.
  const onClickEntry = useCallback(
    async (target: string | Entry) => {
      if (typeof target === 'string') {
        history.push(`/files/${libraryId}/${encodeURIComponent(target)}`);
      } else if (target.category === 'Folder') {
        history.push(`/files/${libraryId}/${encodeURIComponent(resolvePath(target))}`);
      } else {
        await libraries.download(libraryId, resolvePath(target));
      }
    },
    [history, libraries, libraryId]
  );
  const { selectedEntry, setSelectedEntry } = useFileNavigator(entries, onClickEntry);

  // Context menu info.
  const [contextMenuEntry, setContextMenuEntry] = useState<Entry>();
  const [contextMenuPos, setContextMenuPos] = useState<Position>();

  const showContextMenu = useCallback(
    (e: React.MouseEvent<unknown, MouseEvent>, entry?: Entry) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenuPos({
        x: e.pageX ?? 0,
        y: e.pageY ?? 0,
      });
      setContextMenuEntry(entry);
      setSelectedEntry(entry);
    },
    [setSelectedEntry]
  );

  // File and folder operations.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFolderName, setNewFolderName] = useState<string>();

  useEffect(() => setSelectedEntry(undefined), [setSelectedEntry, path, libraryId]);

  // This effect triggers when the path changes. This means we should enter a loading state.
  // This function should not be called directly. Instead, call `refresh`.
  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    setSelectedEntry(undefined);
    try {
      // If the path is falsy or '/' we're at the library root, so no need for an extra call.
      const pathIsRoot = !path || path === '/';
      // noinspection ES6MissingAwait It is awaited later to run in parallel
      const getCurrentEntity = pathIsRoot ? Promise.resolve(undefined) : libraries.getEntry(libraryId, path);
      const getCurrentChildren = libraries.getEntries(libraryId, path);

      // TODO: Handle 404 on getCurrentEntity
      const newCurrentDir = await getCurrentEntity;
      const newEntries = await getCurrentChildren;
      setCurrentDir(newCurrentDir);
      setEntries(newEntries);
      return newEntries;
    } finally {
      setLoadingEntries(false);
    }
  }, [setSelectedEntry, libraryId, path, libraries]);

  const refresh = useCallback(() => {
    return loadEntries().catch((e) => {
      console.error('Error while loading entries:', e);
      return [];
    });
  }, [loadEntries]);

  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    refresh();
  }, [refresh, libraries, path]);

  useEffect(() => setHighlightedEntry(undefined), [libraryId]);

  const [renamingEntry, setRenamingEntry] = useState<Entry>();
  useKeyBind(KeyCode.F2, () => selectedEntry && setRenamingEntry(selectedEntry));
  const renameEntry = useCallback(
    async (newName: string) => {
      if (!renamingEntry) {
        return;
      }
      await libraries.moveEntry(libraryId, resolvePath(renamingEntry), resolvePath(path, newName));
      setRenamingEntry(undefined);
      const newEntries = await refresh();
      setSelectedEntry(newEntries.find((e) => e.name === newName));
    },
    [libraries, libraryId, path, refresh, renamingEntry, setSelectedEntry]
  );

  const deleteEntry = useCallback(
    async (target: Entry) => {
      await libraries.deleteEntry(libraryId, resolvePath(target));
      refresh();
      setHighlightedEntry(undefined);
    },
    [libraries, libraryId, refresh]
  );
  useKeyBind(KeyCode.Delete, () => selectedEntry && deleteEntry(selectedEntry));

  const [isUploading, setIsUploading] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      // TODO: Check for already existing file names, modal with skip/overwrite/cancel.

      let lastEntry: Entry | undefined = undefined;
      setIsUploading(true);
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

        lastEntry = await libraries.uploadFile(libraryId, path, file);
      }
      const newList = await refresh();
      setSelectedEntry(newList.find((entry) => entry.name === lastEntry?.name));
      setIsUploading(false);
    },
    [refresh, setSelectedEntry, libraries, libraryId, path]
  );
  const uploadEntries = useCallback(
    async (items: DataTransferItemList) => {
      let lastEntry: Entry | undefined = undefined;
      setIsUploading(true);

      const allEntries = await getAllEntriesRecursive(items);
      for (const entry of allEntries) {
        const entryParent = getParent(entry.fullPath);
        const parent = resolvePath(path, entryParent.substring(1));
        let newLastEntry: Entry | undefined = undefined;

        if (isFileEntry(entry)) {
          newLastEntry = await libraries.uploadFile(libraryId, parent, await getFsEntryFile(entry));
        } else if (isDirectoryEntry(entry)) {
          newLastEntry = await libraries.createFolder(libraryId, parent, entry.name);
        } else {
          console.error('Unknown entry:', entry);
        }

        if (entryParent === '/' && newLastEntry) {
          lastEntry = newLastEntry;
        }
      }

      const newList = await refresh();
      setSelectedEntry(newList.find((entry) => entry.name === lastEntry?.name));
      setIsUploading(false);
    },
    [refresh, setSelectedEntry, libraries, libraryId, path]
  );

  const createFolder = useCallback(
    async (name: string) => {
      const newEntry = await libraries.createFolder(libraryId, path, name);
      setNewFolderName(undefined);
      const newList = await refresh();
      setSelectedEntry(newList.find((e) => e.name === newEntry.name));
    },
    [refresh, libraries, libraryId, path, setSelectedEntry]
  );

  // Current library info.
  const {
    selectors: { libraryById },
  } = useService(librariesStore);
  const library = useAppSelector(libraryById(parseInt(libraryId)));

  // we can add more loading states later
  const loading = loadingEntries || isUploading;

  const [highlightedEntry, setHighlightedEntry] = useState<Entry>();
  useEffect(() => {
    if (loading) {
      // do not update while loading
      return;
    }
    if (selectedEntry) {
      setHighlightedEntry(selectedEntry);
    } else if (currentDir) {
      setHighlightedEntry(currentDir);
    } else {
      setHighlightedEntry(undefined);
    }
  }, [currentDir, selectedEntry, loading]);

  if (!library) {
    // this library does not exist!
    return <Redirect to="/" />;
  }
  return (
    <Layout className="files-page">
      <div className="top-bar">
        <div>
          <IconButton
            className="parent-dir"
            onClick={() => onClickEntry(currentDir?.parent || '')}
            aria-label="Parent directory"
            icon="level-up-alt"
            disabled={!currentDir}
          />
          <h1>
            {library.name} {loading && <Icon icon="spinner" pulse />}
          </h1>
        </div>
        <div className="actions">
          <input
            ref={fileInputRef}
            hidden
            type="file"
            onChange={(e) => uploadFiles(e.currentTarget.files)}
            multiple
            data-testid="file-input"
          />
          <ButtonGroup>
            <Button onClick={() => fileInputRef.current?.click()} icon={icons.upload}>
              Upload
            </Button>
            <Button onClick={() => setNewFolderName('New Folder')} icon={icons.newFolder}>
              New Folder
            </Button>
          </ButtonGroup>
        </div>
      </div>
      {contextMenuPos && (
        <FilesContextMenu
          position={contextMenuPos}
          entry={contextMenuEntry}
          onClose={() => {
            setContextMenuPos(undefined);
            setContextMenuEntry(undefined);
          }}
          onDownload={contextMenuEntry ? () => libraries.download(libraryId, resolvePath(contextMenuEntry)) : undefined}
          onRename={contextMenuEntry ? () => setRenamingEntry(contextMenuEntry) : undefined}
          onMove={() => console.log('TODO')}
          onDelete={contextMenuEntry ? () => deleteEntry(contextMenuEntry) : undefined}
          onUpload={() => fileInputRef.current?.click()}
          onNewFolder={() => setNewFolderName('New Folder')}
        />
      )}
      <main>
        <Panel
          className="files"
          onContextMenu={(e) => showContextMenu(e)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropping(true);
          }}
        >
          <div
            className={classNames('drop-overlay', isDropping && 'active')}
            onDrop={(e) => {
              e.preventDefault();
              setIsDropping(false);
              if (
                typeof DataTransferItem === 'function' &&
                typeof DataTransferItem.prototype.webkitGetAsEntry === 'function'
              ) {
                uploadEntries(e.dataTransfer.items);
              } else {
                uploadFiles(e.dataTransfer.files);
              }
            }}
            onDragLeave={() => setIsDropping(false)}
          >
            <Icon icon={icons.upload} />
            <div className="text">Drop files to upload</div>
          </div>
          <table className="clickable">
            <colgroup>
              <col className="icon" />
              <col />
              <col className="modified" />
              <col className="size" />
              <col className="category" />
            </colgroup>
            <thead>
              <tr>
                <th />
                <th>Name</th>
                <th>Modified</th>
                <th>Size</th>
                <th>Kind</th>
              </tr>
            </thead>
            <tbody>
              {newFolderName != null && (
                <tr>
                  <td className="icon" />
                  <td>
                    <TextInput
                      autoFocus
                      id="new-folder-name"
                      value={newFolderName}
                      onChange={setNewFolderName}
                      iconButton="folder-plus"
                      onButtonClick={() => createFolder(newFolderName)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          setNewFolderName(undefined);
                        }
                        if (e.key === 'Enter') {
                          createFolder(newFolderName).catch((err) => {
                            console.error(err);
                          });
                        }
                      }}
                      onFocus={(e) => e.currentTarget.select()}
                      onFieldBlur={() => setNewFolderName(undefined)}
                    />
                  </td>
                  <td />
                  <td />
                  <td />
                </tr>
              )}
              {entries.map((entry) => (
                <FileRow
                  key={entry.name}
                  entry={entry}
                  selected={selectedEntry?.name === entry.name}
                  onActivate={onClickEntry}
                  onSelect={setSelectedEntry}
                  onContextMenu={showContextMenu}
                  renaming={!!renamingEntry && renamingEntry.name === entry.name}
                  onRename={(newName) => renameEntry(newName)}
                  cancelRename={() => setRenamingEntry(undefined)}
                />
              ))}
            </tbody>
          </table>
        </Panel>
        {highlightedEntry ? (
          <EntryDetailsPanel
            entry={highlightedEntry}
            onDownload={() => libraries.download(libraryId, resolvePath(highlightedEntry))}
            onRename={() => setRenamingEntry(highlightedEntry)}
            onMove={() => console.log('TODO')}
            onDelete={() => deleteEntry(highlightedEntry)}
          />
        ) : (
          <LibraryDetailsPanel library={library} />
        )}
      </main>
    </Layout>
  );
};
