import { useState } from 'react';
import { Entry } from '../../services/LibrariesService';
import { Panel } from '../Panel';
import { EntryIcon } from '../EntryIcon';
import { ButtonGroup } from '../ButtonGroup';
import { Button } from '../Button';
import { humanReadableDateTime } from '../../utils/humanReadableDateTime';
import { humanReadableSize } from '../../utils/humanReadableSize';
import { IconButton } from '../IconButton';
import { ContextMenu } from '../ContextMenu';
import { icons } from '../../utils/icons';
import { classNames } from '../../utils/classNames';

export interface Props {
  entry: Entry;
  onDownload: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  active: boolean;
  onClose: () => void;
}

export const EntryDetailsPanel: React.FC<Props> = ({
  entry,
  onDownload,
  onRename,
  onMove,
  onDelete,
  active,
  onClose,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={classNames('details-panel', active && 'active')}>
      <Panel className="info">
        <div className="close-panel">
          <IconButton icon="xmark" onClick={onClose} />
        </div>
        <div className="preview">
          <EntryIcon entry={entry} />
        </div>
        <div className="name-actions">
          <div className="name-category">
            <div className="name">{entry.name}</div>
            <div className="category">{entry.category}</div>
          </div>
          <div className="actions">
            {entry.category !== 'Folder' && (
              <IconButton onClick={onDownload} icon={icons.download} aria-label="Download">
                Download
              </IconButton>
            )}
            <IconButton icon="ellipsis-h" onClick={() => setShowMenu((prevState) => !prevState)} aria-label="Actions" />
          </div>
        </div>
        {showMenu && (
          <ContextMenu onClose={() => setShowMenu(false)}>
            <ButtonGroup vertical>
              <Button onClick={onRename} icon={icons.rename}>
                Rename
              </Button>
              <Button onClick={onMove} icon={icons.move}>
                Move
              </Button>
              <Button onClick={onDelete} icon={icons.delete}>
                Delete
              </Button>
            </ButtonGroup>
          </ContextMenu>
        )}
      </Panel>
      <div className="spacer" />
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
