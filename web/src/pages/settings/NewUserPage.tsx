import React, { useState } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { PasswordInput } from '../../components/input/PasswordInput';
import { useService } from '../../hooks/useService';
import { UserService } from '../../services/UserService';
import { useHistory } from 'react-router-dom';
import { ApiError } from '../../services/ApiService';

export const NewUserPage: React.FC = () => {
  const userService = useService(UserService);
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<ApiError>();

  return (
    <SettingsLayout className="new-user-page">
      <h2 className="title">Users / New User</h2>
      <Form
        onSubmit={async () => {
          setError(undefined);

          if (password !== confirmPassword) {
            setError({
              status: 0,
              error: 'PasswordsDontMatch',
            });
            return;
          }

          await userService
            .createUser({
              username,
              firstName,
              lastName,
              password,
            })
            .then(() => history.push('/settings/users'))
            .catch(setError);
        }}
        submitLabel="Create"
      >
        <div className="columns">
          <div>
            <label htmlFor="username">Username</label>
            <label htmlFor="firstName">First Name</label>
            <label htmlFor="lastName">Last Name</label>
            <label htmlFor="password">Password</label>
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>
          <div className="inputs">
            <TextInput
              id="username"
              value={username}
              onChange={setUsername}
              placeholder="Username"
              error={error?.error === 'Conflict' || error}
            />
            <TextInput
              id="firstName"
              value={firstName}
              onChange={setFirstName}
              placeholder="First Name"
              error={error}
            />
            <TextInput id="lastName" value={lastName} onChange={setLastName} placeholder="Last Name" error={error} />
            <PasswordInput id="password" value={password} onChange={setPassword} error={error} />
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm Password"
              error={confirmPassword && password !== confirmPassword}
            />
          </div>
        </div>
      </Form>
      {error && (
        <p className="error">
          {error.error === 'Conflict'
            ? 'A user with this username already exists.'
            : error.error === 'PasswordsDontMatch'
            ? 'The passwords do not match.'
            : 'Something went wrong while creating the user.'}
        </p>
      )}
    </SettingsLayout>
  );
};
