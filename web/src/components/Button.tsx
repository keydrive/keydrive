import React from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  onClick?: () => void;
  square?: boolean;
  type?: 'button' | 'submit';
}

export const Button: React.FC<Props> = ({
  children,
  onClick,
  square,
  type = 'button',
}) => (
  <button
    className={classNames('button', square && 'square')}
    onClick={onClick}
    type={type}
  >
    {children}
  </button>
);
