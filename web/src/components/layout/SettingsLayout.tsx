import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../Icon';
import { ProfileMenu } from '../ProfileMenu';

export const SettingsLayout: React.FC = ({ children }) => (
  <div className="settings-layout">
    <div className="sidebar">
      <Link to="/">
        <h1>ClearCloud</h1>
      </Link>
      <NavLink to="/settings/profile" className="entry">
        <Icon icon="address-card" />
        Profile
      </NavLink>
      <NavLink to="/settings/users" className="entry">
        <Icon icon="users" />
        Users
      </NavLink>
    </div>
    <div className="content-wrapper">
      <div className="top-bar">
        <ProfileMenu />
      </div>
      <main>{children}</main>
    </div>
  </div>
);
