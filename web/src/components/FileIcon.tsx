import React from 'react';
import { Icon } from './Icon';
import { fileExtension } from '../utils/fileExtension';

export interface Props {
  name: string;
}

const icons: Record<string, string> = {
  pdf: 'file-pdf',
  // Text
  adoc: 'file-alt',
  md: 'file-alt',
  txt: 'file-alt',
  // Archives
  '7z': 'file-archive',
  gz: 'file-archive',
  rar: 'file-archive',
  tar: 'file-archive',
  zip: 'file-archive',
  // Office
  doc: 'file-word',
  docx: 'file-word',
  odt: 'file-word',
  xls: 'file-excel',
  xlsx: 'file-excel',
  ods: 'file-excel',
  ppt: 'file-powerpoint',
  pptx: 'file-powerpoint',
  pps: 'file-powerpoint',
  ppsx: 'file-powerpoint',
  odp: 'file-powerpoint',
  csv: 'file-csv',
  // Audio
  aiff: 'file-audio',
  alac: 'file-audio',
  flac: 'file-audio',
  m4a: 'file-audio',
  mp3: 'file-audio',
  ogg: 'file-audio',
  wav: 'file-audio',
  // Video
  avi: 'file-video',
  mkv: 'file-video',
  mov: 'file-video',
  mp4: 'file-video',
  webm: 'file-video',
  wmv: 'file-video',
  // Pictures
  bmp: 'file-image',
  gif: 'file-image',
  jpg: 'file-image',
  jpeg: 'file-image',
  png: 'file-image',
  tiff: 'file-image',
  webp: 'file-image',
  // Code
  bat: 'file-code',
  cpp: 'file-code',
  cs: 'file-code',
  go: 'file-code',
  h: 'file-code',
  java: 'file-code',
  js: 'file-code',
  json: 'file-code',
  jsx: 'file-code',
  php: 'file-code',
  sh: 'file-code',
  ts: 'file-code',
  tsx: 'file-code',
  yml: 'file-code',
  yaml: 'file-code',
};

export const FileIcon: React.FC<Props> = ({ name }) => <Icon icon={icons[fileExtension(name)] || 'file'} />;
