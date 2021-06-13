import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { ProfileMenu } from '../components/ProfileMenu';
import { Link } from 'react-router-dom';
import { LibrariesService, Library, LibraryType } from '../services/LibrariesService';
import { useService } from '../hooks/useService';
import logo from '../images/logo.png';

const libraryIcons: Record<LibraryType, string> = {
  generic: 'folder',
  books: 'book',
  movies: 'video',
  music: 'music',
  shows: 'tv',
};

export const FilesPage: React.FC = () => {
  const librariesService = useService(LibrariesService);
  const [libraries, setLibraries] = useState<Library[]>();

  useEffect(() => {
    if (!libraries) {
      librariesService.listLibraries().then(setLibraries);
    }
  }, [libraries, librariesService]);

  return (
    <div className="files-page">
      <div className="sidebar">
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        {libraries ? (
          libraries.map((library) => (
            <div key={library.id} className="entry">
              <Icon icon={libraryIcons[library.type]} />
              {library.name}
            </div>
          ))
        ) : (
          <div className="loader">
            <Icon icon="spinner" size={2} pulse />
          </div>
        )}
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
