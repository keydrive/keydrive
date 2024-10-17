import React, { ReactElement, useState } from 'react';
import { Position } from '../utils/position';
import { KeyCode, useKeyBind } from '../hooks/useKeyBind';
import { useDocumentEvent } from '../hooks/useDocumentEvent';

export interface Props {
  children?: ReactElement;
  position?: Position;
  onClose: () => void;
}

export const ContextMenu: React.FC<Props> = ({ position, onClose, children }) => {
  useKeyBind(KeyCode.Escape, onClose);
  useDocumentEvent('click', onClose);
  useDocumentEvent('contextmenu', onClose);

  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  let style: React.CSSProperties | undefined;
  if (position) {
    style = {
      left: position.x - offsetX,
      top: position.y - offsetY,
    };
  }

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

          if (rect.right + offsetX >= window.innerWidth) {
            setOffsetX(rect.width);
          } else {
            setOffsetX(0);
          }
        }
      }}
      className="context-menu"
      style={style}
    >
      {children}
    </div>
  );
};
