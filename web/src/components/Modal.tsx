import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { classNames } from '../utils/classNames';
import { Button } from './Button';
import { Icon } from './Icon';

export interface Props {
  onClose: () => void;
  title: string;
  shouldClose?: boolean;
  panelled?: boolean;
}

export const Modal: React.FC<Props> = ({ children, title, panelled, onClose, shouldClose }) => {
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
      <div className={classNames('modal', closing && 'closing', panelled && 'panelled')}>
        <h2>{title} <Button onClick={close}><Icon icon='times' /></Button></h2>
        <div className='modal-content'>
          {children}
        </div>
      </div>
    </>
  );
};

export interface LeftPanelProps<T extends { id: number }> {
  items: T[];
  onSelect: (id: number) => void;
  selected?: number;
  onDelete: (id: number) => Promise<void>;
  onAdd: () => void;
  children: (element: T) => ReactElement;
}

export const ModalLeftPanel = <T extends { id: number }>({
                                                           items,
                                                           children,
                                                           onSelect,
                                                           selected,
                                                           onAdd,
                                                           onDelete
                                                         }: LeftPanelProps<T>): ReactElement => {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className='left panel'>
      <div className='items'>
        {items?.map(item => (
          <div key={item.id} className={classNames(`item`, item.id === selected && 'active')} onClick={() => {
            onSelect(item.id);
          }}>
            {children(item)}
          </div>
        ))}
      </div>
      <div className='actions'>
        <Button onClick={onAdd}><Icon icon='plus' /></Button>
        <Button loading={deleting} disabled={!selected} onClick={async () => {
          if (!selected) {
            return;
          }
          try {
            setDeleting(true);
            await onDelete(selected);
          } finally {
            setDeleting(false);
          }
        }}><Icon icon='minus' /></Button>
      </div>
    </div>
  );
};

export const ModalRightPanel: React.FC = ({ children }) => {
  return (
    <div className='right panel'>
      {children}
    </div>
  );
};
