import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useAppDispatch, useAppSelector } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Tag } from '../components/Tag';
import { SettingButton } from '../components/SettingButton';
import { Modal, ModalLeftPanel } from '../components/Modal';
import { Form } from '../components/input/Form';
import { TextInput } from '../components/input/TextInput';
import { PasswordInput } from '../components/input/PasswordInput';
import { User, UserService } from '../services/UserService';
import { ApiError } from '../services/ApiService';

interface ModalProps {
  onClose: () => void;
}

const EditProfileModal: React.FC<ModalProps> = ({ onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const { selectors: { currentUser }, actions: { updateCurrentUserAsync } } = useService(userStore);
  const currentUserData = useAppSelector(currentUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentUserData) {
      setUsername(currentUserData.username);
      setFirstName(currentUserData.firstName);
      setLastName(currentUserData.lastName);
    }
  }, [currentUserData]);

  return (
    <Modal onClose={onClose} shouldClose={done} title='My Profile'>
      <Form error={error} onSubmit={async () => {
        setError(undefined);
        const action = await dispatch(updateCurrentUserAsync({
          firstName,
          lastName,
          username
        }));
        switch (action.type) {
          case updateCurrentUserAsync.fulfilled.type:
            setDone(true);
            break;
          case updateCurrentUserAsync.rejected.type:
            setError((action.payload as ApiError).error);
            break;
        }
      }} submitLabel='Save'>
        <TextInput label='Username:' value={username} onChange={setUsername} id='username' />
        <TextInput label='First Name:' value={firstName} onChange={setFirstName} id='firstName' />
        <TextInput label='Last Name:' value={lastName} onChange={setLastName} id='lastName' />
      </Form>
    </Modal>
  );
};

const ChangePasswordModal: React.FC<ModalProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const userService = useService(UserService);

  return (<Modal shouldClose={done} onClose={onClose} title='Change Password'>
      <Form error={error} onSubmit={async () => {
        setError(undefined);
        if (password !== confirm) {
          setError('Make sure both passwords match');
        }
        try {
          await userService.updateCurrentUser({
            password
          });
          setDone(true);
        } catch (e) {
          setError(e.message);
        }
      }} submitLabel='Change'>
        <PasswordInput autoFocus required label='Password' value={password} onChange={setPassword} id='password' />
        <PasswordInput required label='Confirm' value={confirm} onChange={setConfirm} id='confirm' />
      </Form>
    </Modal>
  );
};

const ManageLibrariesModal: React.FC<ModalProps> = ({ onClose }) => (
  <Modal onClose={onClose} title='Libraries'>
    Sup?
  </Modal>
);

const ManageUsersModal: React.FC<ModalProps> = ({ onClose }) => {
  const userService = useService(UserService);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();

  const refreshUsers = useCallback(() => {
    userService.listUsers().then(users => {
      setUsers(users);
      setSelectedUser(users[0].id);
    });
  }, [userService]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);


  return (
    <Modal onClose={onClose} title='Users'>
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
    </Modal>
  );
};

export const SettingsPage: React.FC = () => {
  const { selectors: { currentUser }, actions: { logout } } = useService(userStore);
  const [modal, showModal] = useState<'profile' | 'password' | 'libraries' | 'users'>();
  const user = useAppSelector(currentUser);
  const dispatch = useAppDispatch();

  let Modal: React.FC<ModalProps> | undefined = undefined;
  switch (modal) {
    case undefined:
      break;
    case 'profile':
      Modal = EditProfileModal;
      break;
    case 'password':
      Modal = ChangePasswordModal;
      break;
    case 'libraries':
      Modal = ManageLibrariesModal;
      break;
    case 'users':
      Modal = ManageUsersModal;
      break;
  }
  return (
    <>
      {Modal && <Modal onClose={() => showModal(undefined)} />}
      <Layout className='settings-page'>
        <div className='top-bar'>
          <h1>Settings</h1>
        </div>
        <main>
          <Panel>
            <div className='profile-info'>
              <img src='https://i.pravatar.cc/150?img=13' alt='Profile' />
              <div className='profile-details'>
                <h2>{user?.firstName} {user?.lastName}</h2>
                <span className='subtitle'>{user?.username}</span>
                {user?.isAdmin && (
                  <Tag>admin</Tag>
                )}
              </div>
            </div>
            <div className='profile-buttons'>
              <SettingButton icon='user-edit' label='Edit Profile' onClick={() => showModal('profile')} />
              <SettingButton icon='sign-out-alt' label='Sign Out' onClick={() => {
                dispatch(logout());
              }} />
            </div>
          </Panel>
          <div className='settings'>
            <SettingButton icon='user-lock' label='Change Password' onClick={() => showModal('password')} />
            {
              user?.isAdmin && (
                <>
                  <SettingButton icon='users' label='Manage Users' onClick={() => showModal('users')} />
                  <SettingButton icon='folder' label='Manage Libraries' onClick={() => showModal('libraries')} />
                  <SettingButton disabled icon='align-justify' label='System Logs' onClick={() => undefined} />
                  <SettingButton disabled icon='sync' label='Check for Updates' onClick={() => undefined} />
                  <SettingButton disabled icon='user-shield' label='Security & Privacy' onClick={() => undefined} />
                </>
              )
            }
          </div>
        </main>
      </Layout>
    </>
  );
};
