import React, { KeyboardEventHandler } from 'react';
import { Field, Props as FieldProps } from './Field';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { classNames } from '../../utils/classNames';

export interface Props extends FieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  required?: boolean;
  label?: string;
  iconButton?: string;
  onButtonClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export const TextInput: React.FC<Props> = ({
  type = 'text',
  onChange,
  error,
  className,
  label,
  iconButton,
  onButtonClick,
  onKeyDown,
  ...props
}) => (
  <Field id={props.id} error={error} className={classNames(className, iconButton && 'has-icon-button')}>
    {label && <label htmlFor={props.id}>{label}</label>}
    <input {...props} type={type} onChange={(e) => onChange(e.currentTarget.value)} onKeyDown={onKeyDown} />
    {iconButton && (
      <Button onClick={onButtonClick}>
        <Icon icon={iconButton} />
      </Button>
    )}
  </Field>
);
