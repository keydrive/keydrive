import { classNames } from '../../utils/classNames';
import { Icon } from '../Icon';
import { icons } from '../../utils/icons';
import React from 'react';

export interface Props {
  onDropEntries: (items: DataTransferItemList) => void;
  onDropFiles: (items: FileList) => void;
  onDragEnd: () => void;
}

export const DropZone = ({ onDropEntries, onDropFiles, ...props }: Props) => {
  return (
    <div
      {...props}
      className={classNames('drop-zone')}
      onDrop={(e) => {
        e.preventDefault();
        if (
          typeof DataTransferItem === 'function' &&
          typeof DataTransferItem.prototype.webkitGetAsEntry === 'function'
        ) {
          onDropEntries(e.dataTransfer.items);
        } else {
          onDropFiles(e.dataTransfer.files);
        }
      }}
      onDragLeave={props.onDragEnd}
    >
      <Icon icon={icons.upload} />
      <div className="text">Drop files to upload</div>
    </div>
  );
};
