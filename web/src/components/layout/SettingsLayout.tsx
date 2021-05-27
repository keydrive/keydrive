import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import { ProfileMenu } from '../ProfileMenu';
import { classNames } from '../../utils/classNames';

export interface Props {
  className?: string;
}

export const SettingsLayout: React.FC<Props> = ({ children, className }) => (
  <div className={classNames('settings-layout', className)}>
    <div className="sidebar">
      <Link to="/">
        <h1>ClearCloud</h1>
      </Link>
      <Link to="/" className="entry">
        <Icon icon="arrow-left" />
        Libraries
      </Link>
      <Link to="/settings/profile" className="entry">
        <Icon icon="address-card" />
        Profile
      </Link>
      <Link to="/settings/users" className="entry">
        <Icon icon="users" />
        Users
      </Link>
    </div>
    <div className="content-wrapper">
      <div className="top-bar">
        <ProfileMenu />
      </div>
      <main>{children}</main>
    </div>
  </div>
);
