import React from 'react';
import { Field, Props as FieldProps } from './Field';

export interface Props extends FieldProps {
  value?: string;
  options: string[];
  onSelect: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  required?: boolean;
  label?: string;
}

export const SelectField: React.FC<Props> = ({
  onSelect,
  options,
  error,
  className,
  label,
  ...props
}) => (
  <Field id={props.id} error={error} className={className}>
    {label && <label htmlFor={props.id}>{label}</label>}
    <div className="select-field">
      {options.map((option) => (
        <div className="option" key={option} onClick={() => onSelect(option)}>
          {option}
        </div>
      ))}
    </div>
  </Field>
);
