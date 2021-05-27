import React from 'react';
import { Icon } from '../components/Icon';
import { ProfileMenu } from '../components/ProfileMenu';

const libraries = ['Libraries go here!', 'Files', 'Photos', 'Movies', 'Music', 'Downloads', 'Personal'];

export const LibrariesPage: React.FC = () => {
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
          <ProfileMenu />
        </div>
        Files go here!
      </div>
    </div>
  );
};
