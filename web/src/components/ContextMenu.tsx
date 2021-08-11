import React, { useState } from 'react';
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

  const [offsetY, setOffsetY] = useState(0);

  return (
    <div
      ref={(ref) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.bottom + offsetY >= window.innerHeight) {
            setOffsetY(rect.height);
          } else {
            setOffsetY(0);
          }
        }
      }}
      className="context-menu"
      style={{
        left: position.x,
        top: position.y - offsetY,
      }}
    >
      {children}
    </div>
  );
};
