import React from 'react';
import { Library } from '../../services/LibrariesService';
import { Panel } from '../Panel';
import { Icon } from '../Icon';

export interface Props {
  library: Library;
}

export const LibraryDetailsPanel: React.FC<Props> = ({ library }) => (
  <div className="details-panel library">
    <Panel className="info full">
      <div className="preview">
        <Icon icon="folder" />
      </div>
      <div className="name">{library.name}</div>
      <div className="category">Library: {library.type}</div>
    </Panel>
  </div>
);
