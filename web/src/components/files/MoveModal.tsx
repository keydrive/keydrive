import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { Entry, LibrariesService } from '../../services/LibrariesService';
import { useService } from '../../hooks/useService';
import { EntryIcon } from '../EntryIcon';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { resolvePath } from '../../utils/path';
import { Icon } from '../Icon';

export interface Props {
  onClose: () => void;
  libraryId: string;
  startPath: string;
}

export const MoveModal: React.FC<Props> = ({ onClose, libraryId, startPath }) => {
  const libraries = useService(LibrariesService);
  const [path, setPath] = useState(startPath);
  const [currentDir, setCurrentDir] = useState<Entry>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      // If the path is falsy or '/' we're at the library root, so no need for an extra call.
      const pathIsRoot = !path || path === '/';
      // noinspection ES6MissingAwait It is awaited later to run in parallel
      const getCurrentEntity = pathIsRoot ? Promise.resolve(undefined) : libraries.getEntry(libraryId, path);
      const getCurrentChildren = libraries.getEntries(libraryId, path);

      const [newCurrentDir, newEntries] = await Promise.all([getCurrentEntity, getCurrentChildren]);
      setCurrentDir(newCurrentDir);
      setEntries(newEntries);
      return newEntries;
    } finally {
      setLoadingEntries(false);
    }
  }, [libraryId, path, libraries]);

  const refresh = useCallback(() => {
    return loadEntries().catch((e) => {
      console.error('Error while loading entries:', e);
      return [];
    });
  }, [loadEntries]);

  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    refresh();
  }, [refresh, libraries, path]);

  return (
    <Modal onClose={onClose} title="Move">
      <div className="current-dir">
        <IconButton
          className="parent-dir"
          aria-label="Parent directory"
          icon="level-up-alt"
          disabled={!currentDir}
          onClick={() => {
            if (currentDir) {
              setPath(currentDir.parent);
            }
          }}
        />
        <h3>
          {currentDir ? resolvePath(currentDir) : '/'} {loadingEntries && <Icon icon="spinner" pulse />}
        </h3>
      </div>
      <div className="table-wrapper">
        <table className="clickable">
          <colgroup>
            <col className="icon" />
            <col />
          </colgroup>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.name}
                onClick={() => {
                  if (entry.category === 'Folder') {
                    setPath(resolvePath(entry));
                  }
                }}
              >
                <td className="icon">
                  <EntryIcon entry={entry} />
                </td>
                <td>{entry.name}</td>
              </tr>
            ))}
            {!entries.length && (
              <tr>
                <td className="icon" />
                <td className="no-entries">No entries</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="actions">
        <Button primary>Move</Button>
      </div>
    </Modal>
  );
};
