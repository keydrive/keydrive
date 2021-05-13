import React, { InputHTMLAttributes } from 'react';

export interface Props
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
}

export const TextInput: React.FC<Props> = ({
  type = 'text',
  onChange,
  ...props
}) => (
  <input
    type={type}
    onChange={(e) => onChange(e.currentTarget.value)}
    {...props}
  />
);
