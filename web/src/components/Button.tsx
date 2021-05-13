import React from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  onClick: () => void;
  square?: boolean;
}

export const Button: React.FC<Props> = ({ children, onClick, square }) => (
  <button
    className={classNames('button', square && 'square')}
    onClick={onClick}
  >
    {children}
  </button>
);
