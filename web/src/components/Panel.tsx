import React from 'react';
import { classNames } from '../utils/classNames';

export type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Panel = React.forwardRef<HTMLDivElement, Props>(({ children, className, ...props }, ref) => (
  <div {...props} ref={ref} className={classNames('panel', className)}>
    {children}
  </div>
));
