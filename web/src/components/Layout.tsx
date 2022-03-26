import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../images/logo.svg';
import { Icon } from './Icon';
import { useService } from '../hooks/useService';
import { LibraryType } from '../services/LibrariesService';
import { classNames } from '../utils/classNames';
import { librariesStore } from '../store/libraries';
import { useAppSelector } from '../store';
import { IconButton } from './IconButton';

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
  const { selectors } = useService(librariesStore);
  const libraries = useAppSelector(selectors.libraries);
  const [hideSidebar, setHideSidebar] = useState(false);

  return (
    <div className={classNames('layout', className, hideSidebar && 'sidebar-hidden')}>
      <div className={classNames('sidebar', hideSidebar && 'hidden')}>
        <div className="top">
          <Link to="/" className="logo">
            <img src={logo} alt="logo" />
          </Link>
          <IconButton icon="bars" aria-label="Hide sidebar" onClick={() => setHideSidebar(true)} />
        </div>
        <div className="libraries">
          {libraries ? (
            libraries.map((library) => (
              <NavLink key={library.id} className="entry" to={`/files/${library.id}`}>
                <Icon icon={libraryIcons[library.type]} />
                {library.name}
              </NavLink>
            ))
          ) : (
            <div className="loader">
              <Icon icon="spinner" size={2} pulse />
            </div>
          )}
        </div>
        <div>
          <NavLink to="/settings" className="entry">
            <Icon icon="cog" />
            Settings
          </NavLink>
        </div>
      </div>
      <div className="content-wrapper">{children}</div>
    </div>
  );
};
