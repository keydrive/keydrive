import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useHistory, useParams } from 'react-router-dom';
import { useService } from '../hooks/useService';
import { Entry, LibrariesService } from '../services/LibrariesService';
import { Icon } from '../components/Icon';
import { EntryIcon } from '../components/EntryIcon';
import { humanReadableSize } from '../utils/humanReadableSize';
import { parentPath, resolvePath } from '../utils/path';
import { sortEntries } from '../utils/sortEntries';
import { humanReadableDateTime } from '../utils/humanReadableDateTime';
import { librariesStore } from '../store/libraries';
import { useAppSelector } from '../store';
import { IconButton } from '../components/IconButton';
import { Button } from '../components/Button';

export const FilesPage: React.FC = () => {
  const libraries = useService(LibrariesService);
  const { library, path } = useParams<{ library: string; path?: string }>();
  const history = useHistory();
  const [entries, setEntries] = useState<Entry[]>();
  const [selectedEntry, setSelectedEntry] = useState<Entry>();
  const [libraryName, setLibraryName] = useState<string>();
  const { selectors } = useService(librariesStore);
  const librariesList = useAppSelector(selectors.libraries);

  useEffect(() => {
    libraries
      .getEntries(library, path || '')
      .then(sortEntries)
      .then(setEntries);
  }, [libraries, library, path]);

  useEffect(() => {
    const id = parseInt(library);
    setLibraryName(librariesList?.find((l) => l.id === id)?.name);
  }, [librariesList, library]);

  useEffect(() => setSelectedEntry(undefined), [path]);

  return (
    <Layout className="files-page">
      <div className="top-bar">
        <div>
          <IconButton
            className="parent-dir"
            onClick={() => history.push(`/files/${library}${parentPath(path)}`)}
            aria-label="Parent directory"
            icon="level-up-alt"
          />
          <h1>{libraryName}</h1>
        </div>
        <div className="actions">
          <Button>
            <Icon icon="upload" /> Upload
          </Button>
          <Button>
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
                {entries.map((entry) => (
                  <tr
                    key={entry.name}
                    onDoubleClick={() => {
                      if (entry.category === 'Folder') {
                        history.push(`/files/${library}${resolvePath(entry.parent, entry.name)}`);
                      }
                    }}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="icon">
                      <EntryIcon entry={entry} />
                    </td>
                    <td>{entry.name}</td>
                    <td>{humanReadableDateTime(entry.modified)}</td>
                    <td>{entry.category === 'Folder' ? '--' : humanReadableSize(entry.size)}</td>
                    <td>{entry.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="loader">
              <Icon icon="spinner" pulse size={2} />
            </div>
          )}
        </Panel>
        {selectedEntry && <EntryDetails entry={selectedEntry} onClose={() => setSelectedEntry(undefined)} />}
      </main>
    </Layout>
  );
};

interface EntryDetailsProps {
  entry: Entry;
  onClose: () => void;
}

const EntryDetails: React.FC<EntryDetailsProps> = ({ entry, onClose }) => (
  <Panel className="details">
    <IconButton aria-label="Close details" onClick={onClose} icon="times" />
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
