import { useCallback, useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { User, UserService } from '../../services/UserService';
import { Modal, ModalLeftPanel, ModalRightPanel } from '../../components/Modal';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { PasswordInput } from '../../components/input/PasswordInput';
import { errorMessage } from '../../utils/errorMessage';
import { isApiError } from '../../services/ApiService';

export interface Props {
  onClose: () => void;
}

const CreateOrEditUserForm: React.FC<{
  user?: User;
  onDone: (id: number) => void;
}> = ({ user, onDone }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const userService = useService(UserService);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
    } else {
      setName('');
      setUsername('');
      setPassword('');
      setConfirm('');
    }
  }, [user]);

  return (
    <>
      <h2>{user ? user.name : 'Add User'}</h2>
      <Form
        error={error}
        onSubmit={async () => {
          setError(undefined);
          if (password !== confirm) {
            setError('Make sure both passwords match');
            return;
          }
          try {
            if (user) {
              const updatedUser = await userService.updateUser(user.id, {
                username: username.trim(),
                name: name.trim(),
                password: password || undefined,
              });
              onDone(updatedUser.id);
            } else {
              const newUser = await userService.createUser({
                username: username.trim(),
                name: name.trim(),
                password,
              });
              onDone(newUser.id);
            }
          } catch (e) {
            if (isApiError(e) && e.error === 'Conflict') {
              setError('That username is already taken');
            } else {
              setError(errorMessage(e));
            }
          }
        }}
        submitLabel={user ? 'Save' : 'Add'}
      >
        <TextInput autoFocus required label="Username:" value={username} onChange={setUsername} id="username" />
        <TextInput required label="Name:" value={name} onChange={setName} id="name" />
        <PasswordInput required={!user} label="Password:" value={password} onChange={setPassword} id="password" />
        <PasswordInput
          required={!user || !!password}
          label="Confirm:"
          value={confirm}
          onChange={setConfirm}
          id="confirm"
        />
      </Form>
    </>
  );
};

export const ManageUsersModal: React.FC<Props> = ({ onClose }) => {
  const userService = useService(UserService);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();
  const user = users.find((u) => u.id === selectedUser);

  const refreshUsers = useCallback(
    (selectId?: number) => {
      userService.listUsers().then((usersList) => {
        setUsers(usersList);
        setSelectedUser(selectId || usersList[0].id);
      });
    },
    [userService],
  );

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <Modal panelled onClose={onClose} title="Users">
      <ModalLeftPanel
        items={users}
        selected={selectedUser}
        onSelect={setSelectedUser}
        onDelete={async (id) => {
          setSelectedUser(undefined);
          try {
            await userService.deleteUser(id);
          } catch (e) {
            alert(errorMessage(e));
          }
          refreshUsers();
        }}
        onAdd={() => {
          setSelectedUser(undefined);
        }}
      >
        {({ name, username }) => (
          <>
            <h4>{name}</h4>
            <span>{username}</span>
          </>
        )}
      </ModalLeftPanel>
      <ModalRightPanel>
        <CreateOrEditUserForm user={user} onDone={(id) => refreshUsers(id)} />
      </ModalRightPanel>
    </Modal>
  );
};
