import React, { useState } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { PasswordInput } from '../../components/input/PasswordInput';
import { useService } from '../../hooks/useService';
import { UserService } from '../../services/UserService';
import { useHistory } from 'react-router-dom';

export const NewUserPage: React.FC = () => {
  const userService = useService(UserService);
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(false);

  return (
    <SettingsLayout className="new-user-page">
      <h2 className="title">New User</h2>
      <Form
        onSubmit={() => {
          setError(false);
          userService
            .createUser({
              username,
              firstName,
              lastName,
              password,
            })
            .then(() => history.push('/settings/users'))
            .catch(() => setError(true));
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
            <TextInput id="username" value={username} onChange={setUsername} placeholder="Username" />
            <TextInput id="firstName" value={firstName} onChange={setFirstName} placeholder="First Name" />
            <TextInput id="lastName" value={lastName} onChange={setLastName} placeholder="Last Name" />
            <PasswordInput id="password" value={password} onChange={setPassword} />
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm Password"
            />
          </div>
        </div>
      </Form>
      {error && <p className="error">Something went wrong while creating the user.</p>}
    </SettingsLayout>
  );
};
