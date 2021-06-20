import React, { useCallback, useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { User, UserService } from '../../services/UserService';
import { Modal, ModalLeftPanel, ModalRightPanel } from '../../components/Modal';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { PasswordInput } from '../../components/input/PasswordInput';

export interface Props {
  onClose: () => void;
}

const CreateOrEditUserForm: React.FC<{
  user?: User; onDone: (id: number) => void
}> = ({ user, onDone }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const userService = useService(UserService);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setUsername(user.username);
    }
  }, [user]);

  return (
    <>
      <h2>{user ? `${user.firstName} ${user.lastName}` : 'Add User'}</h2>
      <Form error={error} onSubmit={async () => {
        setError(undefined);
        if (password !== confirm) {
          setError('Make sure both passwords match');
          return;
        }
        try {
          if (user) {
            const updatedUser = await userService.updateUser(user.id, {
              username: username.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              password: password || undefined
            });
            onDone(updatedUser.id);
          } else {
            const newUser = await userService.createUser({
              username: username.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              password
            });
            onDone(newUser.id);
          }
        } catch (e) {
          if (e.error === 'Conflict') {
            setError('That username is already taken');
          } else {
            setError(e.message);
          }
        }
      }} submitLabel={user ? 'Save' : 'Add'}>
        <TextInput autoFocus required label='Username:' value={username} onChange={setUsername} id='username' />
        <TextInput required label='First Name:' value={firstName} onChange={setFirstName} id='firstName' />
        <TextInput required label='Last Name:' value={lastName} onChange={setLastName} id='lastName' />
        <PasswordInput required={!user} label='Password:' value={password} onChange={setPassword} id='password' />
        <PasswordInput required={!user || !!password} label='Confirm:' value={confirm} onChange={setConfirm}
                       id='confirm' />
      </Form>
    </>
  );
};

export const ManageUsersModal: React.FC<Props> = ({ onClose }) => {
  const userService = useService(UserService);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();
  const user = users.find(u => u.id === selectedUser);

  const refreshUsers = useCallback((selectId?: number) => {
    userService.listUsers().then(users => {
      setUsers(users);
      setSelectedUser(selectId || users[0].id);
    });
  }, [userService]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <Modal panelled onClose={onClose} title='Users'>
      <ModalLeftPanel items={users}
                      selected={selectedUser}
                      onSelect={setSelectedUser}
                      onDelete={async (id) => {
                        setSelectedUser(undefined);
                        try {
                          await userService.deleteUser(id);
                        } catch (e) {
                          alert(e.message);
                        }
                        await refreshUsers();
                      }}
                      onAdd={() => {
                        setSelectedUser(undefined);
                      }}>
        {(user: User) => (
          <>
            <h4>{user.firstName} {user.lastName}</h4>
            <span>{user.username}</span>
          </>
        )}
      </ModalLeftPanel>
      <ModalRightPanel>
        <CreateOrEditUserForm user={user} onDone={(id) => refreshUsers(id)} />
      </ModalRightPanel>
    </Modal>
  );
};

