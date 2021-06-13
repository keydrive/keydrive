import React, { useRef, useState } from 'react';
import { Icon } from './Icon';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { useClickOutside } from '../hooks/useClickOutside';

export const ProfileMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    actions: { logout },
  } = useService(userStore);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setShowProfileMenu(false));

  return (
    <div className="profile-menu-wrapper" ref={ref}>
      <div
        className="profile"
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            setShowProfileMenu(!showProfileMenu);
          }
        }}
      >
        <Icon icon="user" />
      </div>
      {showProfileMenu && (
        <div className="profile-menu">
          <div className="point-wrapper">
            <div className="point" />
          </div>
          <Link to="/settings" className="entry">
            <Icon icon="cog" />
            Settings
          </Link>
          <div
            onClick={() => dispatch(logout())}
            className="entry"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                dispatch(logout());
              }
            }}
          >
            <Icon icon="power-off" />
            Log Out
          </div>
        </div>
      )}
    </div>
  );
};
