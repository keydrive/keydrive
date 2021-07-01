import React from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  className?: string;
}

export const Panel: React.FC<Props> = ({ children, className }) => (
  <div className={classNames('panel', className)}>{children}</div>
);
