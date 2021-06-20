import React, { useCallback, useEffect, useState } from 'react';
import { Modal, ModalLeftPanel } from '../../components/Modal';
import { LibrariesService, LibraryDetails } from '../../services/LibrariesService';
import { useService } from '../../hooks/useService';

export interface Props {
  onClose: () => void;
}

export const ManageLibrariesModal: React.FC<Props> = ({ onClose }) => {
  const [libraries, setLibraries] = useState<LibraryDetails[]>([]);
  const librariesService = useService(LibrariesService);
  const [selectedLibrary, setSelectedLibrary] = useState<number>();
  const library = libraries.find(l => l.id === selectedLibrary);

  const refreshLibraries = useCallback(() => {
    librariesService.listLibraryDetails().then((libs) => {
      setLibraries(libs);
      setSelectedLibrary(libs[0]?.id);
    });
  }, [librariesService]);

  useEffect(() => refreshLibraries(), [refreshLibraries]);

  return (
    <Modal onClose={onClose} title='Libraries'>
      <ModalLeftPanel items={libraries}
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
        {(lib: LibraryDetails) => (
          <span>{lib.name}</span>
        )}
      </ModalLeftPanel>
    </Modal>
  );
};
