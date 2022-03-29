import React from 'react';
import { Library } from '../../services/LibrariesService';
import { Panel } from '../Panel';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { classNames } from '../../utils/classNames';

export interface Props {
  library: Library;
  onClose: () => void;
  active?: boolean;
}

export const LibraryDetailsPanel: React.FC<Props> = ({ library, onClose, active }) => (
  <div className={classNames('details-panel library', active && 'active')}>
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
