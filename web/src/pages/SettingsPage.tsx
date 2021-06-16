import React from 'react';
import { Layout } from '../components/Layout';
import { Panel } from '../components/Panel';
import { useAppSelector } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Tag } from '../components/Tag';

export const SettingsPage: React.FC = () => {
  const { selectors: { currentUser } } = useService(userStore);
  const user = useAppSelector(currentUser);
  return (
    <Layout className="settings-page">
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
        </Panel>
      </main>
    </Layout>
  );
};
