import React, { useState } from 'react';
import { Entry } from '../../services/LibrariesService';
import { Panel } from '../Panel';
import { EntryIcon } from '../EntryIcon';
import { ButtonGroup } from '../ButtonGroup';
import { Button } from '../Button';
import { humanReadableDateTime } from '../../utils/humanReadableDateTime';
import { humanReadableSize } from '../../utils/humanReadableSize';
import { IconButton } from '../IconButton';
import { ContextMenu } from '../ContextMenu';

export interface Props {
  entry: Entry;
  onDownload: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export const EntryDetailsPanel: React.FC<Props> = ({ entry, onDownload, onRename, onMove, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="details-panel">
      <Panel className="info">
        <div className="preview">
          <EntryIcon entry={entry} />
        </div>
        <div className="name-actions">
          <div>
            <div className="name">{entry.name}</div>
            <div className="category">{entry.category}</div>
          </div>
          <IconButton icon="ellipsis-h" onClick={() => setShowMenu((prevState) => !prevState)} aria-label="Actions" />
        </div>
        {showMenu && (
          <ContextMenu onClose={() => setShowMenu(false)}>
            <ButtonGroup vertical>
              {entry.category !== 'Folder' && (
                <Button onClick={onDownload} icon="download">
                  Download
                </Button>
              )}
              <Button onClick={onRename} icon="pencil-alt">
                Rename
              </Button>
              <Button onClick={onMove} icon="reply">
                Move
              </Button>
              <Button onClick={onDelete} icon="trash">
                Delete
              </Button>
            </ButtonGroup>
          </ContextMenu>
        )}
      </Panel>
      <Panel className="metadata">
        <div>
          <span>Modified</span>
          <span>{humanReadableDateTime(entry.modified)}</span>
        </div>
        {entry.category !== 'Folder' && (
          <div>
            <span>Size</span>
            <span>{humanReadableSize(entry.size)}</span>
          </div>
        )}
      </Panel>
    </div>
  );
};
