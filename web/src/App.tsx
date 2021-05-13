import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/auth/login" component={LoginPage} />
      <Redirect to="/auth/login" />
    </Switch>
  );
}
