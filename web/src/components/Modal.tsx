import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

export interface Props {
  onClose: () => void;
  title: string;
}

export const Modal: React.FC<Props> = ({ children, title, onClose }) => {
  return (
    <div className="modal-wrapper" onClick={() => onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <h2>{title}</h2>
          <Button square onClick={onClose}>
            <Icon icon="times" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};
