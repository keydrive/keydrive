import React from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useAppDispatch, useAppSelector } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Tag } from '../components/Tag';
import { SettingButton } from '../components/SettingButton';
import { ChangePasswordModal } from './settings/ChangePasswordModal';
import { EditProfileModal } from './settings/EditProfileModal';
import { ManageLibrariesModal } from './settings/ManageLibrariesModal';
import { useHistory, useParams } from 'react-router-dom';

interface ModalProps {
  onClose: () => void;
}

export const SettingsPage: React.FC = () => {
  const {
    selectors: { currentUser },
    actions: { logout },
  } = useService(userStore);
  const user = useAppSelector(currentUser);
  const dispatch = useAppDispatch();
  const { setting: activeSetting } = useParams<{ setting?: string }>();
  const history = useHistory();

  let Modal: React.FC<ModalProps> | undefined = undefined;
  switch (activeSetting) {
    default:
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
      {Modal && <Modal onClose={() => history.push('/settings')} />}
      <Layout className="settings-page">
        <div className="top-bar">
          <h1>Settings</h1>
        </div>
        <main>
          <Panel>
            <div className="profile-info">
              <img src="https://i.pravatar.cc/150?img=13" alt="Profile" />
              <div className="profile-details">
                <h2>
                  {user?.firstName} {user?.lastName}
                </h2>
                <span className="subtitle">{user?.username}</span>
                {user?.isAdmin && <Tag>admin</Tag>}
              </div>
            </div>
            <div className="profile-buttons">
              <SettingButton icon="user-edit" label="Edit Profile" onClick={() => history.push('/settings/profile')} />
              <SettingButton
                icon="sign-out-alt"
                label="Sign Out"
                onClick={() => {
                  dispatch(logout());
                }}
              />
            </div>
          </Panel>
          <div className="settings">
            <SettingButton
              icon="user-lock"
              label="Change Password"
              onClick={() => history.push('/settings/password')}
            />
            {user?.isAdmin && (
              <>
                <SettingButton
                  icon="folder"
                  label="Manage Libraries"
                  onClick={() => history.push('/settings/libraries')}
                />
              </>
            )}
          </div>
        </main>
      </Layout>
    </>
  );
};
