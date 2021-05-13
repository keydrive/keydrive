import React, { useState } from 'react';
import { TextInput } from '../components/input/TextInput';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Form } from '../components/input/Form';
import { userStore } from '../store/user';
import { useAppDispatch } from '../store';
import { useService } from '../hooks/useService';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    actions: { loginAsync },
  } = useService(userStore);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="title">Welcome to ClearCloud</div>
        <Form
          onSubmit={async () => {
            setError(false);
            const result = await dispatch(loginAsync({ username, password }));
            if (result.type !== loginAsync.fulfilled.type) {
              setError(true);
            }
          }}
          submitLabel="Log in"
        >
          <div className="input-row">
            <TextInput value={username} onChange={setUsername} placeholder="Username" autoFocus />
          </div>
          <div className="input-row password">
            <TextInput
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Password"
            />
            <Button square onClick={() => setShowPassword(!showPassword)}>
              <Icon icon={showPassword ? 'eye-slash' : 'eye'} />
            </Button>
          </div>
        </Form>
        <div className="error">{error && 'Invalid username or password.'}</div>
      </div>
    </div>
  );
};
