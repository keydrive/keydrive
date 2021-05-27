import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { useAppSelector } from './store';
import { useService } from './hooks/useService';
import { userStore } from './store/user';
import { LibrariesPage } from './pages/LibrariesPage';
import { UsersPage } from './pages/settings/UsersPage';
import { ProfilePage } from './pages/settings/ProfilePage';

export const App: React.FC = () => {
  const user = useService(userStore);
  const isLoggedIn = useAppSelector(user.selectors.isLoggedIn);

  if (!isLoggedIn) {
    return (
      <Switch>
        <Route exact path="/auth/login" component={LoginPage} />
        <Redirect to="/auth/login" />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route exact path="/" component={LibrariesPage} />
      <Redirect exact path="/settings" to="/settings/profile" />
      <Route exact path="/settings/profile" component={ProfilePage} />
      <Route exact path="/settings/users" component={UsersPage} />
      <Redirect to="/" />
    </Switch>
  );
};
