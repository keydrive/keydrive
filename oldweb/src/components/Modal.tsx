import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { classNames } from '../utils/classNames';
import { Button } from './Button';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { useMountedState } from '../hooks/useMountedState';

export interface Props {
  onClose: () => void;
  title: string;
  shouldClose?: boolean;
  panelled?: boolean;
}

export const Modal: React.FC<Props> = ({ children, title, panelled, onClose, shouldClose }) => {
  const [closing, setClosing] = useState(false);
  const mounted = useMountedState();

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(
      () => {
        if (mounted.current) {
          onClose();
        }
      },
      // NOTE: This time must match the css animation time
      400
    );
  }, [onClose, mounted]);

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
      <div aria-label="Close" className={classNames('modal-overlay', closing && 'closing')} onClick={close} />
      <div
        className={classNames(
          'modal',
          closing && 'closing',
          panelled && 'panelled',
          title.toLowerCase().replaceAll(' ', '-')
        )}
      >
        <h2>
          {title} <IconButton role="close" onClick={close} icon="times" />
        </h2>
        <div className="modal-content">{children}</div>
      </div>
    </>
  );
};

export interface LeftPanelProps<T extends { id: number }> {
  items: T[];
  onSelect: (id: number) => void;
  selected?: number;
  onDeleteLabel?: string;
  onDelete: (id: number) => Promise<void>;
  onAddLabel?: string;
  onAdd: () => void;
  children: (element: T) => ReactElement;
}

export const ModalLeftPanel = <T extends { id: number }>({
  items,
  children,
  onSelect,
  selected,
  onAddLabel,
  onAdd,
  onDeleteLabel,
  onDelete,
}: LeftPanelProps<T>): ReactElement => {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="left panel">
      <div className="items">
        {items?.map((item) => (
          <div
            key={item.id}
            className={classNames(`item`, item.id === selected && 'active')}
            onClick={() => {
              onSelect(item.id);
            }}
          >
            {children(item)}
          </div>
        ))}
      </div>
      <div className="actions">
        <Button aria-label={onAddLabel} onClick={onAdd}>
          <Icon icon="plus" />
        </Button>
        <Button
          loading={deleting}
          disabled={!selected}
          aria-label={onDeleteLabel}
          onClick={async () => {
            if (!selected) {
              return;
            }
            try {
              setDeleting(true);
              await onDelete(selected);
            } finally {
              setDeleting(false);
            }
          }}
        >
          <Icon icon="minus" />
        </Button>
      </div>
    </div>
  );
};

export const ModalRightPanel: React.FC = ({ children }) => {
  return <div className="right panel">{children}</div>;
};
