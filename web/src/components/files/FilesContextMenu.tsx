import { ButtonGroup } from '../ButtonGroup';
import { Button } from '../Button';
import { ContextMenu, Props as ContextMenuProps } from '../ContextMenu';
import { Entry } from '../../services/LibrariesService';
import { icons } from '../../utils/icons';

export interface Props extends ContextMenuProps {
  entry?: Entry;
  onDownload?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onMove?: () => void;
  onUpload: () => void;
  onNewFolder: () => void;
}

export const FilesContextMenu = ({
  entry,
  onDownload,
  onRename,
  onMove,
  onDelete,
  onUpload,
  onNewFolder,
  ...props
}: Props) => (
  <ContextMenu {...props}>
    <ButtonGroup vertical>
      {entry && entry.category !== 'Folder' && (
        <Button onClick={onDownload} icon={icons.download}>
          Download
        </Button>
      )}
      {entry && (
        <Button onClick={onRename} icon={icons.rename}>
          Rename
        </Button>
      )}
      {entry && (
        <Button onClick={onMove} icon={icons.move}>
          Move
        </Button>
      )}
      {entry && (
        <Button onClick={onDelete} icon={icons.delete}>
          Delete
        </Button>
      )}
      <Button onClick={onUpload} icon={icons.upload}>
        Upload
      </Button>
      <Button onClick={onNewFolder} icon={icons.newFolder}>
        New Folder
      </Button>
    </ButtonGroup>
  </ContextMenu>
);
