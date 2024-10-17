import { ReactNode } from 'react';
import { classNames } from '../utils/classNames';
import { Icon } from './Icon';

export interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  primary?: boolean;
  'aria-label'?: string;
  icon?: string;
}

export const Button = ({
  children,
  type = 'button',
  loading,
  primary,
  icon,
  ...props
}: Props) => (
  <button
    {...props}
    className={classNames(
      'button',
      loading && 'loading',
      primary && 'primary',
      icon && 'has-icon',
    )}
    type={type}
  >
    <span className="content">
      {icon && <Icon icon={icon} />}
      {children}
    </span>
    {loading && <Icon icon="spinner" pulse className="loader" />}
  </button>
);
