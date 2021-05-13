import React from 'react';
import { Icon } from './Icon';

export interface Props {
  files: FileInfo[];
}

export interface FileInfo {
  name: string;
  kind: 'file' | 'folder';
  lastModified: string;
  size?: string;
}

export const FileDetails: React.FC<Props> = ({ files }) => (
  <div className="file-details">
    <div className="header" />
    <div className="header">Name</div>
    <div className="header">Date Modified</div>
    <div className="header">Size</div>
    {files.map((f) => (
      <>
        <div className="cell icon">
          <Icon icon={f.kind} />
        </div>
        <div className="cell">{f.name}</div>
        <div className="cell">{f.lastModified}</div>
        <div className="cell">{f.size}</div>
      </>
    ))}
  </div>
);
