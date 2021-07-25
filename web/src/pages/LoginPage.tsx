import React, { useState } from 'react';
import { TextInput } from '../components/input/TextInput';
import { Form } from '../components/input/Form';
import { userStore } from '../store/user';
import { useAppDispatch } from '../store';
import { useService } from '../hooks/useService';
import { PasswordInput } from '../components/input/PasswordInput';
import logo from '../images/logo.svg';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    actions: { loginAsync },
  } = useService(userStore);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="title">
          <img src={logo} alt="KeyDrive" />
        </div>
        <Form
          onSubmit={async () => {
            setError(false);
            const result = await dispatch(loginAsync({ username, password }));
            if (result.type !== loginAsync.fulfilled.type) {
              setError(true);
            }
          }}
          submitLabel="Log In"
          error={error && 'Invalid username or password.'}
        >
          <TextInput id="username" value={username} onChange={setUsername} placeholder="Username" autoFocus />
          <PasswordInput id="password" value={password} onChange={setPassword} placeholder="Password" />
        </Form>
      </div>
    </div>
  );
};
