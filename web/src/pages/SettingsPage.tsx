import React from 'react';
import { ProfileMenu } from '../components/ProfileMenu';
import { Icon } from '../components/Icon';
import { Link } from 'react-router-dom';

export const SettingsPage: React.FC = () => (
  <div className="settings-page">
    <div className="sidebar">
      <Link to="/">
        <h1>ClearCloud</h1>
      </Link>
      <Link to="/settings/profile" className="entry">
        <Icon icon="address-card" />
        Profile
      </Link>
      <Link to="/settings/profile" className="entry">
        <Icon icon="users" />
        Users
      </Link>
    </div>
    <div className="files-wrapper">
      <div className="top-bar">
        <ProfileMenu />
      </div>
      Settings go here!
    </div>
  </div>
);
