import React from 'react';
import { Field, Props as FieldProps } from './Field';

export interface Props extends FieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  required?: boolean;
}

export const TextInput: React.FC<Props> = ({ type = 'text', onChange, error, className, ...props }) => (
  <Field id={props.id} error={error} className={className}>
    <input type={type} onChange={(e) => onChange(e.currentTarget.value)} {...props} />
  </Field>
);
