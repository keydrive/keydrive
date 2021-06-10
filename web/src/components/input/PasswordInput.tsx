import React, { useState } from 'react';
import { Props as TextInputProps, TextInput } from './TextInput';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Field } from './Field';

export type Props = Omit<TextInputProps, 'type'>;

export const PasswordInput: React.FC<Props> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field className="password-input" id={props.id} error={props.error}>
      <TextInput placeholder="Password" {...props} type={showPassword ? 'text' : 'password'} />
      <Button square onClick={() => setShowPassword(!showPassword)}>
        <Icon icon={showPassword ? 'eye-slash' : 'eye'} />
      </Button>
    </Field>
  );
};
