import React, { useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { Icon } from '../../components/Icon';
import { LibrariesService, LibraryDetails } from '../../services/LibrariesService';

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
      </div>
      <div className="headers">
        <div>Name</div>
        <div>Type</div>
        <div>Root Folder</div>
      </div>
      <div className="libraries-list">
        {libraries ? (
          libraries.map((library) => (
            <div key={library.id} className="library">
              <div>{library.name}</div>
              <div>{library.type}</div>
              <div>{library.rootFolder}</div>
            </div>
          ))
        ) : (
          <div className="loader">
            <Icon icon="spinner" pulse size={2} />
          </div>
        )}
        {error && <div className="error-message">Something went wrong. Please refresh the page and try again.</div>}
      </div>
    </SettingsLayout>
  );
};
