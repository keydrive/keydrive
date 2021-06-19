import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useAppDispatch, useAppSelector } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Tag } from '../components/Tag';
import { SettingButton } from '../components/SettingButton';
import { Modal } from '../components/Modal';
import { Form } from '../components/input/Form';
import { TextInput } from '../components/input/TextInput';
import { PasswordInput } from '../components/input/PasswordInput';

interface ModalProps {
  onClose: () => void;
}

const EditProfileModal: React.FC<ModalProps> = ({ onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <Modal onClose={onClose} title='My Profile'>
      <Form onSubmit={() => undefined} submitLabel='Save'>
        <TextInput label='First Name:' value={firstName} onChange={setFirstName} id='firstName' />
        <TextInput label='Last Name:' value={lastName} onChange={setLastName} id='lastName' />
        <TextInput label='Email:' value={email} onChange={setEmail} id='email' />
      </Form>
    </Modal>
  );
};

const ChangePasswordModal: React.FC<ModalProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  return (<Modal onClose={onClose} title='Change Password'>
      <Form onSubmit={() => undefined} submitLabel='Change'>
        <PasswordInput label='Password' value={password} onChange={setPassword} id='password' />
        <PasswordInput label='Confirm' value={confirm} onChange={setConfirm} id='confirm' />
      </Form>
    </Modal>
  );
};

const ManageLibrariesModal: React.FC<ModalProps> = ({ onClose }) => (
  <Modal onClose={onClose} title='Libraries'>
    Sup?
  </Modal>
);

export const SettingsPage: React.FC = () => {
  const { selectors: { currentUser }, actions: { logout } } = useService(userStore);
  const [modal, showModal] = useState<'profile' | 'password' | 'libraries'>();
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
            <SettingButton icon='folder' label='Manage Libraries' onClick={() => showModal('libraries')} />
            <SettingButton disabled icon='align-justify' label='System Logs' onClick={() => undefined} />
            <SettingButton disabled icon='sync' label='Check for Updates' onClick={() => undefined} />
            <SettingButton disabled icon='user-shield' label='Security & Privacy' onClick={() => undefined} />
          </div>
        </main>
      </Layout>
    </>
  );
};
