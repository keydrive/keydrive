import React from 'react';
import { Modal } from '../../components/Modal';

export interface Props {
  onClose: () => void;
}

export const ManageLibrariesModal: React.FC<Props> = ({ onClose }) => (
  <Modal onClose={onClose} title='Libraries'>
    Sup?
  </Modal>
);
