import React, { useState } from 'react';
import { Props as TextInputProps, TextInput } from './TextInput';
import { Button } from '../Button';
import { Icon } from '../Icon';

export type Props = Omit<TextInputProps, 'type'>;

export const PasswordInput: React.FC<Props> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-input">
      <TextInput placeholder="Password" {...props} type={showPassword ? 'text' : 'password'} />
      <Button square onClick={() => setShowPassword(!showPassword)}>
        <Icon icon={showPassword ? 'eye-slash' : 'eye'} />
      </Button>
    </div>
  );
};
