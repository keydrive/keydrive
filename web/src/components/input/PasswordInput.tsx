import React, { useState } from 'react';
import { Props as TextInputProps } from './TextInput';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Field } from './Field';

export type Props = Omit<TextInputProps, 'type'>;

export const PasswordInput: React.FC<Props> = ({ label, onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field className='password-input' id={props.id} error={props.error}>
      {label && <label htmlFor={props.id}>{label}</label>}
      <input type={showPassword ? 'text' : 'password'} onChange={(e) => onChange(e.currentTarget.value)} {...props} />
      <Button square onClick={() => setShowPassword(!showPassword)}>
        <Icon icon={showPassword ? 'eye-slash' : 'eye'} />
      </Button>
    </Field>
  );
};
