import React from 'react';
import { classNames } from '../utils/classNames';

export interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  className?: string;
}

export const Panel = ({ children, className, ...props }: Props) => (
  <div {...props} className={classNames('panel', className)}>
    {children}
  </div>
);
