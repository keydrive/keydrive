import React, { useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { Icon } from '../../components/Icon';
import { LibrariesService, LibraryDetails } from '../../services/LibrariesService';
import { Link } from 'react-router-dom';

export const LibrariesSettingsPage: React.FC = () => {
  const librariesService = useService(LibrariesService);
  const [libraries, setLibraries] = useState<LibraryDetails[]>();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!libraries) {
      librariesService
        .listLibraryDetails()
        .then(setLibraries)
        .catch(() => {
          setError(true);
          setLibraries([]);
        });
    }
  }, [libraries, librariesService]);

  return (
    <SettingsLayout className="libraries-settings-page">
      <div className="title">
        <h2>Libraries</h2>
        <Link to="/settings/libraries/new" className="button square">
          <Icon icon="plus" />
        </Link>
      </div>
      {libraries ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Root Folder</th>
            </tr>
          </thead>
          <tbody>
            {libraries.map((library) => (
              <tr key={library.id}>
                <td>{library.name}</td>
                <td>{library.type}</td>
                <td>{library.rootFolder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="loader">
          <Icon icon="spinner" pulse size={2} />
        </div>
      )}
      {error && <div className="error-message">Something went wrong. Please refresh the page and try again.</div>}
    </SettingsLayout>
  );
};
