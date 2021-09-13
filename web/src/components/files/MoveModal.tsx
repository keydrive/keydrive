import React from 'react';
import { Modal } from '../Modal';

export interface Props {
  onClose: () => void;
}

export const MoveModal: React.FC<Props> = ({ onClose }) => {
  return (
    <Modal onClose={onClose} title="Move">
      This is where the file browser goes.
    </Modal>
  );
};
