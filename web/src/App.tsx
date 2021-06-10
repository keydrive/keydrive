import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { useAppSelector } from './store';
import { useService } from './hooks/useService';
import { userStore } from './store/user';
import { LibrariesPage } from './pages/LibrariesPage';
import { UsersPage } from './pages/settings/UsersPage';
import { ProfilePage } from './pages/settings/ProfilePage';
import { NewUserPage } from './pages/settings/NewUserPage';
import { useDispatch } from 'react-redux';
import { Icon } from './components/Icon';
import { LibrariesSettingsPage } from './pages/settings/LibrariesSettingsPage';
import { NewLibraryPage } from './pages/settings/NewLibraryPage';

export const App: React.FC = () => {
  const {
    selectors,
    actions: { getCurrentUserAsync },
  } = useService(userStore);
  const token = useAppSelector(selectors.token);
  const currentUser = useAppSelector(selectors.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, token, getCurrentUserAsync]);

  if (!token) {
    return (
      <Switch>
        <Route exact path="/auth/login" component={LoginPage} />
        <Redirect to="/auth/login" />
      </Switch>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-loader">
        <Icon icon="spinner" size={2} pulse />
      </div>
    );
  }

  return (
    <Switch>
      <Route exact path="/" component={LibrariesPage} />
      <Redirect exact path="/settings" to="/settings/profile" />
      <Route exact path="/settings/profile" component={ProfilePage} />
      <Route exact path="/settings/users" component={UsersPage} />
      <Route exact path="/settings/users/new" component={NewUserPage} />
      <Route exact path="/settings/libraries" component={LibrariesSettingsPage} />
      <Route exact path="/settings/libraries/new" component={NewLibraryPage} />
      <Redirect to="/" />
    </Switch>
  );
};
