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
import { useNavigate, useParams } from 'react-router-dom';
import userPlaceholder from '../images/user_placeholder.png';
import { IconButton } from '../components/IconButton';

interface ModalProps {
  onClose: () => void;
}

export const SettingsPage = () => {
  const {
    selectors: { currentUser },
    actions: { logout },
  } = useService(userStore);
  const user = useAppSelector(currentUser);
  const dispatch = useAppDispatch();
  const { setting: activeSetting } = useParams<{ setting?: string }>();
  const navigate = useNavigate();

  let Modal: React.FC<ModalProps> | undefined = undefined;
  switch (activeSetting) {
    case 'profile':
      Modal = EditProfileModal;
      break;
    case 'password':
      Modal = ChangePasswordModal;
      break;
    case 'libraries':
      Modal = ManageLibrariesModal;
      break;
    default:
      break;
  }
  return (
    <>
      {Modal && <Modal onClose={() => navigate('/settings')} />}
      <Layout className="settings-page">
        {({ activateSidebar }) => (
          <>
            <div className="top-bar">
              <IconButton
                className="toggle-sidebar"
                onClick={activateSidebar}
                aria-label="Show sidebar"
                icon="bars"
              />
              <h1>Settings</h1>
            </div>
            <main>
              <Panel className="profile-panel">
                <div className="profile-info">
                  <img src={userPlaceholder} alt="Profile" />
                  <div className="profile-details">
                    <h2>{user?.name}</h2>
                    <span className="subtitle">{user?.username}</span>
                    {user?.isAdmin && <Tag>admin</Tag>}
                  </div>
                </div>
                <div className="profile-buttons">
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
                  icon="user-edit"
                  label="Edit Profile"
                  onClick={() => navigate('/settings/profile')}
                />
                <SettingButton
                  icon="user-lock"
                  label="Change Password"
                  onClick={() => navigate('/settings/password')}
                />
                {user?.isAdmin && (
                  <>
                    <SettingButton
                      icon="folder"
                      label="Manage Libraries"
                      onClick={() => navigate('/settings/libraries')}
                    />
                  </>
                )}
              </div>
            </main>
          </>
        )}
      </Layout>
    </>
  );
};
