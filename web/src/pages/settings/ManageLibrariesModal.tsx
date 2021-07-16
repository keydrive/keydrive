import React, { useCallback, useEffect, useState } from 'react';
import { BrowseResponse, LibrariesService, LibraryDetails } from '../../services/LibrariesService';
import { useService } from '../../hooks/useService';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { SelectField } from '../../components/input/SelectField';
import { IconButton } from '../../components/IconButton';
import { useAppDispatch } from '../../store';
import { librariesStore } from '../../store/libraries';
import { Modal, ModalLeftPanel, ModalRightPanel } from '../../components/Modal';

const CreateLibraryForm: React.FC<{ onDone: (id: number) => void }> = ({ onDone }) => {
  const [name, setName] = useState('');
  const [folder, setFolder] = useState('');
  const [browseSet, setBrowseSet] = useState<BrowseResponse>();
  const librariesService = useService(LibrariesService);
  const [error, setError] = useState<string>();

  useEffect(() => {
    librariesService.getSubFolders(folder).then(setBrowseSet);
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
        <TextInput
          required
          label={
            <>
              <IconButton
                className="parent-dir"
                type="button"
                disabled={!browseSet || !browseSet.path || browseSet.parent === browseSet.path}
                onClick={() => {
                  if (browseSet) {
                    setFolder(browseSet.parent);
                  }
                }}
                aria-label="Parent directory"
                icon="level-up-alt"
              />{' '}
              Folder:
            </>
          }
          value={folder}
          onChange={setFolder}
          id="folder"
        />
        <SelectField options={browseSet?.folders?.map((f) => f.path) || []} onSelect={setFolder} id="subfolders" />
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
  const dispatch = useAppDispatch();
  const {
    actions: { getLibrariesAsync },
  } = useService(librariesStore);

  const refreshLibraries = useCallback(
    (showId?: number) => {
      librariesService.listLibraryDetails().then((libs) => {
        setLibraries(libs);
        setSelectedLibrary(showId || libs[0]?.id);
      });
      dispatch(getLibrariesAsync());
    },
    [dispatch, getLibrariesAsync, librariesService]
  );

  useEffect(() => refreshLibraries(), [refreshLibraries]);

  return (
    <Modal panelled onClose={onClose} title="Libraries">
      <ModalLeftPanel
        items={libraries}
        selected={selectedLibrary}
        onSelect={setSelectedLibrary}
        onDeleteLabel="Delete Library"
        onDelete={async (id) => {
          await librariesService.deleteLibrary(id);
          refreshLibraries();
        }}
        onAddLabel="Add Library"
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
