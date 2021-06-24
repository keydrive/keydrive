import React, { useCallback, useEffect, useState } from 'react';
import { Modal, ModalLeftPanel, ModalRightPanel } from '../../components/Modal';
import { LibrariesService, LibraryDetails } from '../../services/LibrariesService';
import { useService } from '../../hooks/useService';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { SelectField } from '../../components/input/SelectField';

const CreateLibraryForm: React.FC<{ onDone: (id: number) => void }> = ({ onDone }) => {
  const [name, setName] = useState('');
  const [folder, setFolder] = useState('');
  const [subFolders, setSubFolders] = useState<string[]>([]);
  const librariesService = useService(LibrariesService);
  const [error, setError] = useState<string>();

  useEffect(() => {
    librariesService.getSubFolders(folder).then(setSubFolders);
  }, [folder, librariesService]);
  return (
    <>
      <h2>New Library</h2>
      <Form
        error={error}
        onSubmit={async () => {
          setError(undefined);
          try {
            const lib = await librariesService.createLibrary({
              type: 'generic',
              name: name.trim(),
              rootFolder: folder,
            });
            onDone(lib.id);
          } catch (e) {
            setError(e.description || e.message);
          }
        }}
        submitLabel="Create"
      >
        <TextInput required label="Name:" value={name} onChange={setName} id="name" />
        <TextInput required label="Folder:" value={folder} onChange={setFolder} id="name" />
        <SelectField options={subFolders} onSelect={setFolder} id="subfolders" />
      </Form>
    </>
  );
};

const EditLibraryForm: React.FC<{ library: LibraryDetails; onDone: () => void }> = ({ library, onDone }) => {
  const [name, setName] = useState('');
  const librariesService = useService(LibrariesService);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setName(library.name);
  }, [library]);
  return (
    <>
      <h2>Library: {library.name}</h2>
      <Form
        error={error}
        onSubmit={async () => {
          setError(undefined);
          try {
            await librariesService.updateLibrary(library.id, {
              name: name.trim(),
            });
            onDone();
          } catch (e) {
            setError(e.description || e.message);
          }
        }}
        submitLabel="Save"
      >
        <TextInput required label="Name:" value={name} onChange={setName} id="name" />
      </Form>
    </>
  );
};

export interface Props {
  onClose: () => void;
}

export const ManageLibrariesModal: React.FC<Props> = ({ onClose }) => {
  const [libraries, setLibraries] = useState<LibraryDetails[]>([]);
  const librariesService = useService(LibrariesService);
  const [selectedLibrary, setSelectedLibrary] = useState<number>();
  const library = libraries.find((l) => l.id === selectedLibrary);

  const refreshLibraries = useCallback(
    (showId?: number) => {
      librariesService.listLibraryDetails().then((libs) => {
        setLibraries(libs);
        setSelectedLibrary(showId || libs[0]?.id);
      });
    },
    [librariesService]
  );

  useEffect(() => refreshLibraries(), [refreshLibraries]);

  return (
    <Modal panelled onClose={onClose} title="Libraries">
      <ModalLeftPanel
        items={libraries}
        selected={selectedLibrary}
        onSelect={setSelectedLibrary}
        onDelete={async (id) => {
          await librariesService.deleteLibrary(id);
          refreshLibraries();
        }}
        onAdd={() => {
          setSelectedLibrary(undefined);
        }}
      >
        {(lib: LibraryDetails) => <span>{lib.name}</span>}
      </ModalLeftPanel>
      <ModalRightPanel>
        {library ? (
          <EditLibraryForm
            library={library}
            onDone={() => {
              refreshLibraries(library.id);
            }}
          />
        ) : (
          <CreateLibraryForm
            onDone={(id) => {
              refreshLibraries(id);
            }}
          />
        )}
      </ModalRightPanel>
    </Modal>
  );
};
