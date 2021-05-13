import React, { useState } from 'react';
import { TextInput } from '../components/input/TextInput';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="title">Welcome to ClearCloud</div>
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
        <Button onClick={() => console.log('TODO: log in')}>Log in</Button>
      </div>
    </div>
  );
};
