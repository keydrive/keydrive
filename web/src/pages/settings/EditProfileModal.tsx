import React, { useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { userStore } from '../../store/user';
import { useAppDispatch, useAppSelector } from '../../store';
import { Modal } from '../../components/Modal';
import { Form } from '../../components/input/Form';
import { ApiError } from '../../services/ApiService';
import { TextInput } from '../../components/input/TextInput';

export interface Props {
  onClose: () => void;
}

export const EditProfileModal: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const {
    selectors: { currentUser },
    actions: { updateCurrentUserAsync },
  } = useService(userStore);
  const currentUserData = useAppSelector(currentUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentUserData) {
      setUsername(currentUserData.username);
      setName(currentUserData.name);
    }
  }, [currentUserData]);

  return (
    <Modal onClose={onClose} shouldClose={done} title="My Profile">
      <Form
        error={error}
        onSubmit={async () => {
          setError(undefined);
          const action = await dispatch(
            updateCurrentUserAsync({
              name: name.trim(),
              username: username.trim(),
            }),
          );
          switch (action.type) {
            case updateCurrentUserAsync.fulfilled.type:
              setDone(true);
              break;
            case updateCurrentUserAsync.rejected.type:
              setError((action.payload as ApiError).error);
              break;
          }
        }}
        submitLabel="Save"
      >
        <TextInput label="Username:" value={username} onChange={setUsername} id="username" />
        <TextInput label="Name:" value={name} onChange={setName} id="name" />
      </Form>
    </Modal>
  );
};
