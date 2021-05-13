import React from 'react';

export interface Props {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
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
