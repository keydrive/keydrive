import React, { useState } from 'react';
import { TextInput } from '../components/input/TextInput';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { AuthService } from '../services/AuthService';
import { Form } from '../components/input/Form';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const authService = new AuthService();

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="title">Welcome to ClearCloud</div>
        <Form
          onSubmit={async () => {
            setError(false);
            return authService
              .login(username, password)
              .then(console.log)
              .catch(() => setError(true));
          }}
          submitLabel="Log in"
        >
          <div className="input-row">
            <TextInput
              value={username}
              onChange={setUsername}
              placeholder="Username"
            />
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
        {error && <p className="error">Invalid username or password.</p>}
      </div>
    </div>
  );
};
