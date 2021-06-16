import React, { useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { Icon } from '../../components/Icon';
import { LibrariesService, LibraryDetails } from '../../services/LibrariesService';
import { Modal } from '../../components/Modal';
import { ApiError } from '../../services/ApiService';
import { TextInput } from '../../components/input/TextInput';
import { Form } from '../../components/input/Form';
import { Button } from '../../components/Button';
import { Layout } from '../../components/Layout';

export const LibrariesPage: React.FC = () => {
  const librariesService = useService(LibrariesService);
  const [libraries, setLibraries] = useState<LibraryDetails[]>();
  const [error, setError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editLibrary, setEditLibrary] = useState<LibraryDetails>();

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
      {editLibrary && (
        <EditLibraryModal
          onClose={() => setEditLibrary(undefined)}
          onDone={() => {
            setEditLibrary(undefined);
            setLibraries(undefined);
          }}
          library={editLibrary}
        />
      )}
      <Layout className="libraries-page settings-page">
        <div className="top-bar">
          <h1>Libraries</h1>
          <Button onClick={() => setShowCreateModal(true)} square>
            <Icon icon="plus" />
          </Button>
        </div>
        <main>
          {libraries ? (
            <table className="clickable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Root Folder</th>
                </tr>
              </thead>
              <tbody>
                {libraries.map((library) => (
                  <tr
                    key={library.id}
                    onClick={() => setEditLibrary(library)}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setEditLibrary(library);
                      }
                    }}
                  >
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
        </main>
      </Layout>
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

const EditLibraryModal: React.FC<ModalProps & { library: LibraryDetails }> = ({ library, onClose, onDone }) => {
  const librariesService = useService(LibrariesService);
  const [name, setName] = useState(library.name);
  const [error, setError] = useState<ApiError>();

  return (
    <Modal onClose={onClose} title={`Edit Library: ${library.name}`}>
      <Form
        onSubmit={async () => {
          setError(undefined);
          await librariesService
            .updateLibrary(library.id, {
              name,
            })
            .then(() => onDone())
            .catch(setError);
        }}
        submitLabel="Save"
        error={error && 'Something went wrong while updating the library.'}
      >
        <div className="columns">
          <div>
            <label htmlFor="name">Name</label>
          </div>
          <div>
            <TextInput id="name" value={name} onChange={setName} placeholder="Name" error={error} autoFocus required />
          </div>
        </div>
      </Form>
    </Modal>
  );
};
