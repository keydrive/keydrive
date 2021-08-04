import React from 'react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from './Button';
import { ContextMenu, Props as ContextMenuProps } from './ContextMenu';
import { Entry } from '../services/LibrariesService';

export interface Props extends ContextMenuProps {
  entry: Entry;
  onDownload: () => void;
  onDelete: () => void;
}

export const EntryContextMenu: React.FC<Props> = ({ entry, onDownload, onDelete, ...props }) => (
  <ContextMenu {...props}>
    <ButtonGroup vertical>
      {entry.category !== 'Folder' && (
        <Button onClick={onDownload} icon="download">
          Download
        </Button>
      )}
      <Button onClick={onDelete} icon="trash">
        Delete
      </Button>
    </ButtonGroup>
  </ContextMenu>
);
