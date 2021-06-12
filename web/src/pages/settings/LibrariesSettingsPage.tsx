import React, { useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { Icon } from '../../components/Icon';
import { LibrariesService, LibraryDetails } from '../../services/LibrariesService';
import { Modal } from '../../components/Modal';
import { ApiError } from '../../services/ApiService';
import { TextInput } from '../../components/input/TextInput';
import { Form } from '../../components/input/Form';
import { Button } from '../../components/Button';

export const LibrariesSettingsPage: React.FC = () => {
  const librariesService = useService(LibrariesService);
  const [libraries, setLibraries] = useState<LibraryDetails[]>();
  const [error, setError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    <>
      {showCreateModal && (
        <CreateLibraryModal
          onClose={() => setShowCreateModal(false)}
          onDone={() => {
            setShowCreateModal(false);
            setLibraries(undefined);
          }}
        />
      )}
      <SettingsLayout className="libraries-settings-page">
        <div className="title">
          <h2>Libraries</h2>
          <Button onClick={() => setShowCreateModal(true)} square>
            <Icon icon="plus" />
          </Button>
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
    </>
  );
};

interface ModalProps {
  onClose: () => void;
  onDone: () => void;
}

const CreateLibraryModal: React.FC<ModalProps> = ({ onClose, onDone }) => {
  const librariesService = useService(LibrariesService);
  const [name, setName] = useState('');
  const [rootFolder, setRootFolder] = useState('');
  const [error, setError] = useState<ApiError>();

  return (
    <Modal onClose={onClose} title="New Library">
      <Form
        onSubmit={async () => {
          setError(undefined);
          await librariesService
            .createLibrary({
              name,
              rootFolder,
              type: 'generic',
            })
            .then(() => onDone())
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
            <TextInput id="name" value={name} onChange={setName} placeholder="Name" error={error} autoFocus required />
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
    </Modal>
  );
};
