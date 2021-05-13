import React, { useState } from 'react';
import { TextInput } from '../components/input/TextInput';
import { Button } from '../components/Button';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="title">Welcome to ClearCloud</div>
        <TextInput
          value={username}
          onChange={setUsername}
          placeholder="Username"
        />
        <TextInput
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
        />
        <Button onClick={() => console.log('TODO: log in')}>Log in</Button>
      </div>
    </div>
  );
};
