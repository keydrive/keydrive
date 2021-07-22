import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useHistory, useParams } from 'react-router-dom';
import { useService } from '../hooks/useService';
import { Entry, LibrariesService, Library } from '../services/LibrariesService';
import { Icon } from '../components/Icon';
import { EntryIcon } from '../components/EntryIcon';
import { humanReadableSize } from '../utils/humanReadableSize';
import { resolvePath } from '../utils/path';
import { sortEntries } from '../utils/sortEntries';
import { humanReadableDateTime } from '../utils/humanReadableDateTime';
import { librariesStore } from '../store/libraries';
import { useAppSelector } from '../store';
import { IconButton } from '../components/IconButton';
import { Button } from '../components/Button';
import { classNames } from '../utils/classNames';
import { TextInput } from '../components/input/TextInput';
import { useFileNavigator } from '../hooks/useFileNavigator';

const FileRow = ({
  entry,
  onActivate,
  onSelect,
  selected,
}: {
  entry: Entry;
  selected: boolean;
  onActivate: (entry: Entry) => void;
  onSelect: (entry: Entry) => void;
}) => {
  const ref = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (selected && ref.current) {
      ref.current?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [ref, selected]);
  return (
    <tr
      ref={ref}
      key={entry.name}
      onDoubleClick={async () => {
        await onActivate(entry);
      }}
      onClick={() => onSelect(entry)}
      className={classNames(selected && 'is-selected')}
    >
      <td className="icon">
        <EntryIcon entry={entry} />
      </td>
      <td>{entry.name}</td>
      <td>{humanReadableDateTime(entry.modified)}</td>
      <td>{entry.category === 'Folder' ? '--' : humanReadableSize(entry.size)}</td>
      <td>{entry.category}</td>
    </tr>
  );
};

export const FilesPage: React.FC = () => {
  const libraries = useService(LibrariesService);
  const { library: libraryId, path: encodedPath } = useParams<{ library: string; path?: string }>();
  const path = decodeURIComponent(encodedPath || '');
  const history = useHistory();

  // Current directory info and details.
  const [entries, setEntries] = useState<Entry[]>();
  const [currentDir, setCurrentDir] = useState<Entry>();
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

  // Current library info.
  const {
    selectors: { libraryById },
  } = useService(librariesStore);
  const library = useAppSelector(libraryById(parseInt(libraryId)));

  // File and folder operations.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFolderName, setNewFolderName] = useState<string>();

  const refresh = useCallback(() => {
    // If the path is falsy or '/' we're at the library root, so no need for an extra call.
    const pathIsRoot = !path || path === '/';
    if (pathIsRoot) {
      setCurrentDir(undefined);
    }

    return Promise.all([
      libraries.getEntries(libraryId, path).then(sortEntries).then(setEntries),
      pathIsRoot ? undefined : libraries.getEntry(libraryId, path).then(setCurrentDir),
    ]);
  }, [libraries, libraryId, path]);

  useEffect(() => {
    refresh().catch((e) => {
      console.error(e);
    });
  }, [refresh]);

  useEffect(() => setSelectedEntry(undefined), [setSelectedEntry, path]);

  const uploadFiles = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (!files || files.length === 0) {
        return;
      }

      // TODO: Check for already existing file names, modal with skip/overwrite/cancel.

      for (const file of Array.from(files)) {
        await libraries.uploadFile(libraryId, path, file).then(refresh);
      }
    },
    [libraries, libraryId, path, refresh]
  );

  const createFolder = useCallback(
    async (name: string) => {
      await libraries.createFolder(libraryId, path, name).then(setSelectedEntry).then(refresh);
      setNewFolderName(undefined);
    },
    [libraries, libraryId, path, refresh, setSelectedEntry]
  );

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
          <h1>{library?.name}</h1>
        </div>
        <div className="actions">
          <input ref={fileInputRef} hidden type="file" onChange={uploadFiles} multiple data-testid="file-input" />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Icon icon="upload" /> Upload
          </Button>
          <Button onClick={() => setNewFolderName('New Folder')}>
            <Icon icon="folder-plus" /> New Folder
          </Button>
        </div>
      </div>
      <main>
        <Panel className="files">
          {entries ? (
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
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="loader">
              <Icon icon="spinner" pulse size={2} />
            </div>
          )}
        </Panel>
        <DetailsPanel entry={selectedEntry || currentDir} library={library} />
      </main>
    </Layout>
  );
};

const DetailsPanel: React.FC<{ entry?: Entry; library?: Library }> = ({ entry, library }) => {
  if (entry) {
    return (
      <Panel className="details">
        <div className="preview">
          <EntryIcon entry={entry} />
        </div>
        <div className="name">{entry.name}</div>
        <div className="category">{entry.category}</div>
        <div className="columns">
          <div>
            <span>Modified</span>
            <span>{humanReadableDateTime(entry.modified)}</span>
          </div>
          {entry.category !== 'Folder' && (
            <div>
              <span>Size</span>
              <span>{humanReadableSize(entry.size)}</span>
            </div>
          )}
        </div>
      </Panel>
    );
  }

  if (library) {
    return (
      <Panel className="details">
        <div className="preview">
          <Icon icon="folder" />
        </div>
        <div className="name">{library.name}</div>
        <div className="category">Library: {library.type}</div>
      </Panel>
    );
  }

  return <Panel className="details" />;
};
