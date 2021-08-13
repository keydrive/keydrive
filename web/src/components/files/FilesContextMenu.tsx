import React from 'react';
import { ButtonGroup } from '../ButtonGroup';
import { Button } from '../Button';
import { ContextMenu, Props as ContextMenuProps } from '../ContextMenu';
import { Entry } from '../../services/LibrariesService';

export interface Props extends ContextMenuProps {
  entry?: Entry;
  onDownload?: () => void;
  onDelete?: () => void;
  onUpload: () => void;
  onNewFolder: () => void;
}

export const FilesContextMenu: React.FC<Props> = ({ entry, onDownload, onDelete, onUpload, onNewFolder, ...props }) => (
  <ContextMenu {...props}>
    <ButtonGroup vertical>
      {entry && entry.category !== 'Folder' && (
        <Button onClick={onDownload} icon="download">
          Download
        </Button>
      )}
      {entry && (
        <Button onClick={onDelete} icon="trash">
          Delete
        </Button>
      )}
      <Button onClick={onUpload} icon="upload">
        Upload
      </Button>
      <Button onClick={onNewFolder} icon="folder-plus">
        New Folder
      </Button>
    </ButtonGroup>
  </ContextMenu>
);