import React from 'react';
import { classNames } from '../utils/classNames';
import { Icon } from './Icon';

export interface Props {
  onClick?: () => void;
  square?: boolean;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<Props> = ({
  children,
  square,
  type = 'button',
  loading,
  ...props
}) => (
  <button
    className={classNames('button', square && 'square', loading && 'loading')}
    type={type}
    {...props}
  >
    <span className="content">{children}</span>
    {loading && <Icon icon="spinner" pulse className="loader" />}
  </button>
);
