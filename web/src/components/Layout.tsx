import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../images/logo.svg';
import { Icon } from './Icon';
import { useService } from '../hooks/useService';
import { LibraryType } from '../services/LibrariesService';
import { classNames } from '../utils/classNames';
import { librariesStore } from '../store/libraries';
import { useAppSelector } from '../store';

export interface ChildProps {
  activateSidebar: () => void;
}

export interface Props {
  className?: string;
  children: ({ activateSidebar }: ChildProps) => ReactNode;
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
  const [sidebarActive, setSidebarActive] = useState(false);

  useEffect(() => {
    setSidebarActive(false);
  }, []);

  return (
    <div className={classNames('layout', className)}>
      <div className={classNames('sidebar', sidebarActive && 'active')}>
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        <div className="libraries">
          {libraries ? (
            libraries.map((library) => (
              <NavLink
                key={library.id}
                className="entry"
                to={`/files/${library.id}`}
                onClick={() => setSidebarActive(false)}
              >
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
          <NavLink to="/settings" className="entry" onClick={() => setSidebarActive(false)}>
            <Icon icon="cog" />
            Settings
          </NavLink>
        </div>
      </div>
      <div className="content-wrapper">{children({ activateSidebar: () => setSidebarActive(true) })}</div>
    </div>
  );
};
