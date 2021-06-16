import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../images/logo.png';
import { Icon } from './Icon';
import { useService } from '../hooks/useService';
import { LibrariesService, Library, LibraryType } from '../services/LibrariesService';
import { classNames } from '../utils/classNames';

export interface Props {
  className?: string;
}

const libraryIcons: Record<LibraryType, string> = {
  generic: 'folder',
  books: 'book',
  movies: 'video',
  music: 'music',
  shows: 'tv',
};

export const Layout: React.FC<Props> = ({ children, className }) => {
  // TODO: The nav bar is flickering on navigate.
  // We probably want to move this to global state
  const librariesService = useService(LibrariesService);
  const [libraries, setLibraries] = useState<Library[]>();

  useEffect(() => {
    if (!libraries) {
      librariesService.listLibraries().then(setLibraries);
    }
  }, [libraries, librariesService]);

  return (
    <div className={classNames('layout', className)}>
      <div className="sidebar">
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        <div className="libraries">
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
        <div>
          <NavLink to="/settings/libraries" className="entry">
            <Icon icon="sitemap" />
            Libraries
          </NavLink>
          <NavLink to="/settings/profile" className="entry">
            <Icon icon="address-card" />
            Profile
          </NavLink>
          <NavLink to="/settings/users" className="entry">
            <Icon icon="users" />
            Users
          </NavLink>
          <NavLink to="/logout" className="entry">
            <Icon icon="sign-out-alt" />
            Log Out
          </NavLink>
        </div>
      </div>
      <div className="content-wrapper">{children}</div>
    </div>
  );
};
