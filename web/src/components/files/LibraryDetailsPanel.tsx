import React from 'react';
import { Library } from '../../services/LibrariesService';
import { Panel } from '../Panel';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { classNames } from '../../utils/classNames';

export interface Props {
  library: Library;
  active: boolean;
  onClose: () => void;
}

export const LibraryDetailsPanel: React.FC<Props> = ({ library, active, onClose }) => (
  <div className={classNames('details-panel', active && 'active')}>
    <Panel className="info full">
      <div className="close-panel">
        <IconButton icon="xmark" onClick={onClose} />
      </div>
      <div className="preview">
        <Icon icon="folder" />
      </div>
      <div className="name">{library.name}</div>
      <div className="category">Library: {library.type}</div>
    </Panel>
  </div>
);
