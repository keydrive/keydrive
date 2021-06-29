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

  useEffect(() => {
    libraries.getEntries(library, path || '').then(setEntries);
  }, [libraries, library, path]);

  return (
    <Layout className="files-page">
      <div className="top-bar" />
      <main>
        <Panel>
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
                  <th>Last Modified</th>
                  <th>Kind</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(({ parent, name, category, modified }) => (
                  <tr
                    key={name}
                    onDoubleClick={() => {
                      if (category === 'Folder') {
                        history.push(`/files/${library}${resolvePath(parent, name)}`);
                      }
                    }}
                  >
                    <td className="icon">
                      {category === 'Folder' ? <Icon icon="folder" /> : <FileIcon name={name} />}
                    </td>
                    <td>{name}</td>
                    <td>{new Date(modified).toLocaleString()}</td>
                    <td>{category}</td>
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
