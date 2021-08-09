import React from 'react';
import { Position } from '../utils/position';
import { KeyCode, useKeyBind } from '../hooks/useKeyBind';
import { useDocumentEvent } from '../hooks/useDocumentEvent';

export interface Props {
  position: Position;
  onClose: () => void;
}

export const ContextMenu: React.FC<Props> = ({ position, onClose, children }) => {
  useKeyBind(KeyCode.Escape, onClose);
  useDocumentEvent('click', onClose);
  useDocumentEvent('contextmenu', onClose);

  return (
    <div
      className="context-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {children}
    </div>
  );
};
