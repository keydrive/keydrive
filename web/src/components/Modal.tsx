import React, { useCallback, useEffect, useState } from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  onClose: () => void;
  title: string;
  shouldClose?: boolean;
}

export const Modal: React.FC<Props> = ({ children, title, onClose, shouldClose }) => {
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    setClosing(true);
    // NOTE: This time must match the css animation time
    setTimeout(onClose, 400);
  }, [onClose, setClosing]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [close]);

  useEffect(() => {
    if (shouldClose) {
      close();
    }
  }, [shouldClose, close]);

  return (
    <>
      <div className={classNames('modal-overlay', closing && 'closing')} onClick={close} />
      <div className={classNames('modal', closing && 'closing')}>
        <h2>{title}</h2>
        <div className='modal-content'>
          {children}
        </div>
      </div>
    </>
  );
};
