import React from 'react';
import { classNames } from '../utils/classNames';
import { Icon } from './Icon';

export interface Props {
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  primary?: boolean;
  'aria-label'?: string;
}

export const Button: React.FC<Props> = ({ children, type = 'button', loading, primary, ...props }) => (
  <button {...props} className={classNames('button', loading && 'loading', primary && 'primary')} type={type}>
    <span className="content">{children}</span>
    {loading && <Icon icon="spinner" pulse className="loader" />}
  </button>
);
