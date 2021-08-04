import React, { useEffect } from 'react';
import { Position } from '../utils/position';
import { KeyCode, useKeyBind } from '../hooks/useKeyBind';

export interface Props {
  position: Position;
  onClose: () => void;
}

export const ContextMenu: React.FC<Props> = ({ position, onClose, children }) => {
  useKeyBind(KeyCode.Escape, onClose);

  useEffect(() => {
    document.addEventListener('click', onClose);
    document.addEventListener('contextmenu', onClose);

    return () => {
      document.removeEventListener('click', onClose);
      document.removeEventListener('contextmenu', onClose);
    };
  }, [onClose]);

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
