import React, { ReactElement } from 'react';
import { Field, Props as FieldProps } from './Field';

export interface Props extends FieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  required?: boolean;
  label?: string | ReactElement;
}

export const TextInput: React.FC<Props> = ({ type = 'text', onChange, error, className, label, ...props }) => (
  <Field id={props.id} error={error} className={className}>
    {label && <label htmlFor={props.id}>{label}</label>}
    <input type={type} onChange={(e) => onChange(e.currentTarget.value)} {...props} />
  </Field>
);
