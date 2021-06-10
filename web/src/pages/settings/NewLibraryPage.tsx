import React, { useState } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { TextInput } from '../../components/input/TextInput';
import { Form } from '../../components/input/Form';
import { ApiError } from '../../services/ApiService';
import { useHistory } from 'react-router-dom';
import { useService } from '../../hooks/useService';
import { LibrariesService } from '../../services/LibrariesService';

export const NewLibraryPage: React.FC = () => {
  const librariesService = useService(LibrariesService);
  const history = useHistory();

  const [name, setName] = useState('');
  const [rootFolder, setRootFolder] = useState('');
  const [error, setError] = useState<ApiError>();

  return (
    <SettingsLayout>
      <h2 className="title">Libraries / New Library</h2>
      <Form
        onSubmit={async () => {
          setError(undefined);
          await librariesService
            .createLibrary({
              name,
              rootFolder,
              type: 'generic',
            })
            .then(() => history.push('/settings/libraries'))
            .catch(setError);
        }}
        submitLabel="Create"
        error={error && 'Something went wrong while creating the library.'}
      >
        <div className="columns">
          <div>
            <label htmlFor="name">Name</label>
            <label htmlFor="rootFolder">Root Folder</label>
          </div>
          <div>
            <TextInput id="name" value={name} onChange={setName} placeholder="Name" error={error} />
            <TextInput
              id="rootFolder"
              value={rootFolder}
              onChange={setRootFolder}
              placeholder="/mnt/files"
              error={error}
            />
          </div>
        </div>
      </Form>
    </SettingsLayout>
  );
};
