import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppSelector } from './store';
import { useService } from './hooks/useService';
import { userStore } from './store/user';
import { useDispatch } from 'react-redux';
import { Icon } from './components/Icon';
import { librariesStore } from './store/libraries';
import { router, unauthenticatedRouter } from './router.tsx';

export const App = () => {
  const {
    selectors: { token: getToken, currentUser: getCurrentUser },
    actions: { getCurrentUserAsync },
  } = useService(userStore);
  const {
    selectors: { libraries: getLibraries },
    actions: { getLibrariesAsync },
  } = useService(librariesStore);

  const token = useAppSelector(getToken);
  const currentUser = useAppSelector(getCurrentUser);
  const libraries = useAppSelector(getLibraries);

  const dispatch = useDispatch();

  // refresh libraries
  useEffect(() => {
    if (!libraries && token) {
      dispatch(getLibrariesAsync());
    }
  }, [dispatch, getLibrariesAsync, libraries, token]);

  // refresh user data
  useEffect(() => {
    if (token) {
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, getCurrentUserAsync, token]);

  if (!token) {
    return <RouterProvider router={unauthenticatedRouter} />;
  }

  if (!currentUser || !libraries) {
    return (
      <div className="app-loader">
        <Icon icon="spinner" size={2} pulse />
      </div>
    );
  }

  return <RouterProvider router={router} />;
};
