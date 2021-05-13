import React, { useState } from 'react';
import { useAppDispatch } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Icon } from '../components/Icon';
import { Link } from 'react-router-dom';

const libraries = ['Files', 'Photos', 'Movies', 'Music', 'Downloads', 'Personal'];

export const LibrariesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    actions: { logout },
  } = useService(userStore);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="libraries-page">
      <div className="sidebar">
        <h1>ClearCloud</h1>
        {libraries.map((name) => (
          <div key={name} className="library">
            <Icon icon="file" iconStyle="regular" />
            {name}
          </div>
        ))}
      </div>
      <div className="files-wrapper">
        <div className="top-bar">
          <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
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
              <div onClick={() => dispatch(logout())} className="entry">
                <Icon icon="power-off" />
                Log Out
              </div>
            </div>
          )}
        </div>
        <div className="files">
          <table>
            <thead>
              <tr>
                <th />
                <th>Name</th>
                <th>Date Modified</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {libraries.map((name) => (
                <tr key={name}>
                  <td className="icon">
                    <Icon icon="folder" />
                  </td>
                  <td>{name}</td>
                  <td>Not too long ago</td>
                  <td>Chonky</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
