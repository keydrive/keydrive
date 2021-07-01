import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useHistory, useParams } from 'react-router-dom';
import { useService } from '../hooks/useService';
import { Entry, LibrariesService } from '../services/LibrariesService';
import { Icon } from '../components/Icon';
import { FileIcon } from '../components/FileIcon';
import { humanReadableSize } from '../utils/humanReadableSize';
import { parentPath, resolvePath } from '../utils/path';
import { sortEntries } from '../utils/sortEntries';

export const FilesPage: React.FC = () => {
  const libraries = useService(LibrariesService);
  const { library, path } = useParams<{ library: string; path?: string }>();
  const history = useHistory();
  const [entries, setEntries] = useState<Entry[]>();
  const [selectedEntry, setSelectedEntry] = useState<Entry>();

  // TODO: Replace this with library info from global state.
  const [libraryName, setLibraryName] = useState('');
  useEffect(() => {
    libraries.getLibraryDetails(parseInt(library)).then((l) => setLibraryName(l.name));
  }, [libraries, library]);

  useEffect(() => {
    libraries
      .getEntries(library, path || '')
      .then(sortEntries)
      .then(setEntries);
  }, [libraries, library, path]);

  useEffect(() => setSelectedEntry(undefined), [path]);

  return (
    <Layout className="files-page">
      <div className="top-bar">
        <span
          className="parent-dir"
          onClick={() => {
            history.push(`/files/${library}/${parentPath(path)}`);
          }}
        >
          <Icon icon="level-up-alt" />
        </span>
        <h1>{libraryName}</h1>
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
                    onClick={() => {
                      setSelectedEntry(entry);
                    }}
                  >
                    <td className="icon">
                      {entry.category === 'Folder' ? <Icon icon="folder" /> : <FileIcon name={entry.name} />}
                    </td>
                    <td>{entry.name}</td>
                    <td>{new Date(entry.modified).toLocaleString()}</td>
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
        {selectedEntry && (
          <Panel className="details">
            <div className="preview">
              {selectedEntry.category === 'Folder' ? <Icon icon="folder" /> : <FileIcon name={selectedEntry.name} />}
            </div>
            <div className="name">{selectedEntry.name}</div>
            <div className="category">{selectedEntry.category}</div>
            <div className="columns">
              <div>
                <span>Modified</span>
                <span>{new Date(selectedEntry.modified).toLocaleString()}</span>
              </div>
              <div>
                <span>Size</span>
                <span>{humanReadableSize(selectedEntry.size)}</span>
              </div>
            </div>
          </Panel>
        )}
      </main>
    </Layout>
  );
};
