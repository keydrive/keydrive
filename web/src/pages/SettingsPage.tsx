import React from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useAppDispatch, useAppSelector } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Tag } from '../components/Tag';
import { SettingButton } from '../components/SettingButton';

export const SettingsPage: React.FC = () => {
  const { selectors: { currentUser }, actions: {logout} } = useService(userStore);
  const user = useAppSelector(currentUser);
  const dispatch = useAppDispatch();
  return (
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
            <SettingButton icon='user-edit' label='Edit Profile' onClick={() => undefined} />
            <SettingButton icon='sign-out-alt' label='Sign Out' onClick={() => {
              dispatch(logout());
            }} />
          </div>
        </Panel>
        <div className='settings'>
          <SettingButton icon='user-lock' label='Change Password' onClick={() => undefined} />
          <SettingButton icon='folder' label='Manage Libraries' onClick={() => undefined} />
          <SettingButton disabled icon='align-justify' label='System Logs' onClick={() => undefined} />
          <SettingButton disabled icon='sync' label='Check for Updates' onClick={() => undefined} />
          <SettingButton disabled icon='user-shield' label='Security & Privacy' onClick={() => undefined} />
        </div>
      </main>
    </Layout>
  );
};
