import React from 'react';
import { Library } from '../../services/LibrariesService';
import { Panel } from '../Panel';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';

export interface Props {
  library: Library;
  onClose: () => void;
}

export const LibraryDetailsPanel: React.FC<Props> = ({ library, onClose }) => (
  <div className="details-panel library">
    <Panel className="info full">
      <div className="small-screen-actions">
        <IconButton icon="arrow-left" onClick={onClose} />
      </div>
      <div className="preview">
        <Icon icon="folder" />
      </div>
      <div className="name">{library.name}</div>
      <div className="category">Library: {library.type}</div>
    </Panel>
  </div>
);
