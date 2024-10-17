import React from 'react';
import { Icon } from './Icon';
import { fileExtension } from '../utils/fileExtension';
import { Category, Entry } from '../services/LibrariesService';

export interface Props {
  entry: Entry;
}

export const EntryIcon: React.FC<Props> = ({ entry }) => {
  const icon =
    entry.category === 'Folder'
      ? 'folder'
      : extensionIcons[fileExtension(entry.name)] ||
        categoryIcons[entry.category];
  return <Icon icon={icon} />;
};

const categoryIcons: Record<Category, string> = {
  Archive: 'file-archive',
  Audio: 'file-audio',
  Binary: 'file',
  Document: 'file-alt',
  Folder: 'folder',
  Image: 'file-image',
  Video: 'file-video',
  'Source Code': 'file-code',
};

const extensionIcons: Record<string, string> = {
  csv: 'file-csv',
  doc: 'file-word',
  docx: 'file-word',
  odp: 'file-powerpoint',
  ods: 'file-excel',
  odt: 'file-word',
  pdf: 'file-pdf',
  pps: 'file-powerpoint',
  ppsx: 'file-powerpoint',
  ppt: 'file-powerpoint',
  pptx: 'file-powerpoint',
  xls: 'file-excel',
  xlsx: 'file-excel',
};
