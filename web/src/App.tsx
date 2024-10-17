import { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { useAppSelector } from './store';
import { useService } from './hooks/useService';
import { userStore } from './store/user';
import { FilesPage } from './pages/FilesPage';
import { useDispatch } from 'react-redux';
import { Icon } from './components/Icon';
import { LogoutPage } from './pages/LogoutPage';
import { SettingsPage } from './pages/SettingsPage';
import { HomePage } from './pages/HomePage';
import { librariesStore } from './store/libraries';

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
    return (
      <Switch>
        <Route exact path="/auth/login" component={LoginPage} />
        <Redirect to="/auth/login" />
      </Switch>
    );
  }

  if (!currentUser || !libraries) {
    return (
      <div className="app-loader">
        <Icon icon="spinner" size={2} pulse />
      </div>
    );
  }

  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/files/:library/:path?" component={FilesPage} />
      <Route exact path="/logout" component={LogoutPage} />
      <Route exact path="/settings" component={SettingsPage} />
      <Route exact path="/settings/:setting" component={SettingsPage} />
      <Redirect to="/" />
    </Switch>
  );
};
