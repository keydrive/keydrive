import React, { useState } from 'react';
import { useAppDispatch } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Icon } from '../components/Icon';
import { Link } from 'react-router-dom';
import { FileDetails, FileInfo } from '../components/FileDetails';

const libraries = ['Files', 'Photos', 'Movies', 'Music', 'Downloads', 'Personal'];

const files: FileInfo[] = [
  {
    name: 'Downloads',
    kind: 'folder',
    lastModified: 'Yesterday',
  },
  {
    name: 'Documents',
    kind: 'folder',
    lastModified: 'Yesterday',
  },
  {
    name: 'Homework.docx',
    kind: 'file',
    lastModified: '23:32',
    size: '5.2 MB',
  },
  {
    name: 'Avatar.png',
    kind: 'file',
    lastModified: '7 Days ago',
    size: '66 KB',
  },
  {
    name: 'Linkin_Park_Numb.exe',
    kind: 'file',
    lastModified: '11:15',
    size: '34 MB',
  },
];

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
        <FileDetails files={files} />
      </div>
    </div>
  );
};
