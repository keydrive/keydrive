import React from 'react';
import { classNames } from '../utils/classNames';

export type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Panel: React.FC<Props> = ({ children, className, ...props }) => (
  <div {...props} className={classNames('panel', className)}>
    {children}
  </div>
);
