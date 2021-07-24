import React, { ReactElement, DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { Field, Props as FieldProps } from './Field';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { classNames } from '../../utils/classNames';

type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'id' | 'onChange'>;

export interface Props extends FieldProps, InputProps {
  value: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  required?: boolean;
  label?: string | ReactElement;
  iconButton?: string;
  onButtonClick?: () => void;
}

export const TextInput: React.FC<Props> = ({
  onChange,
  error,
  className,
  label,
  iconButton,
  onButtonClick,
  onFieldBlur,
  ...props
}) => (
  <Field
    id={props.id}
    error={error}
    className={classNames(className, iconButton && 'has-icon-button')}
    onFieldBlur={onFieldBlur}
  >
    {label && <label htmlFor={props.id}>{label}</label>}
    <input
      readOnly={!onChange}
      tabIndex={onChange ? undefined : -1}
      {...props}
      onChange={onChange && ((e) => onChange(e.currentTarget.value))}
    />
    {iconButton && (
      <Button onClick={onButtonClick}>
        <Icon icon={iconButton} />
      </Button>
    )}
  </Field>
);
