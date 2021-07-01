import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useHistory, useParams } from 'react-router-dom';
import { useService } from '../hooks/useService';
import { Entry, LibrariesService } from '../services/LibrariesService';
import { Icon } from '../components/Icon';
import { FileIcon } from '../components/FileIcon';

export const FilesPage: React.FC = () => {
  const libraries = useService(LibrariesService);
  const { library, path } = useParams<{ library: string; path?: string }>();
  const history = useHistory();
  const [entries, setEntries] = useState<Entry[]>();
  const [selectedEntry, setSelectedEntry] = useState<Entry>();

  useEffect(() => {
    libraries
      .getEntries(library, path || '')
      .then(sortEntries)
      .then(setEntries);
  }, [libraries, library, path]);

  return (
    <Layout className="files-page">
      <div className="top-bar" />
      <main>
        <Panel className="files">
          {entries ? (
            <table className="clickable">
              <colgroup>
                <col className="icon" />
                <col />
                <col className="modified" />
                <col className="category" />
              </colgroup>
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>Modified</th>
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
            </div>
          </Panel>
        )}
      </main>
    </Layout>
  );
};

function resolvePath(parent: string, name: string): string {
  let result = parent;
  if (!result.endsWith('/')) {
    result = `${result}/`;
  }
  return `${result}${name}`;
}

function sortEntries(entries: Entry[]): Entry[] {
  return entries.sort((a, b) => {
    if (a.category === 'Folder' && b.category !== 'Folder') {
      return -1;
    }
    if (a.category !== 'Folder' && b.category === 'Folder') {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}
