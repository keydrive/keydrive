import React from 'react';
import { Entry } from '../../services/LibrariesService';
import { Panel } from '../Panel';
import { EntryIcon } from '../EntryIcon';
import { ButtonGroup } from '../ButtonGroup';
import { Button } from '../Button';
import { humanReadableDateTime } from '../../utils/humanReadableDateTime';
import { humanReadableSize } from '../../utils/humanReadableSize';

export interface Props {
  entry: Entry;
  onDownload: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const EntryDetailsPanel: React.FC<Props> = ({ entry, onDownload, onRename, onDelete }) => (
  <>
    <Panel className="info">
      <div className="preview">
        <EntryIcon entry={entry} />
      </div>
      <div className="name">{entry.name}</div>
      <div className="category">{entry.category}</div>
    </Panel>
    <Panel className="actions">
      <ButtonGroup fullWidth vertical>
        {entry.category !== 'Folder' && (
          <Button onClick={onDownload} icon="download">
            Download
          </Button>
        )}
        <Button onClick={onRename} icon="pencil-alt">
          Rename
        </Button>
        <Button onClick={onDelete} icon="trash">
          Delete
        </Button>
      </ButtonGroup>
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
  </>
);
