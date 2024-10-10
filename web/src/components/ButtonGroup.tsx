import React, { ReactElement } from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  children: ReactElement[];
  fullWidth?: boolean;
  vertical?: boolean;
}

export const ButtonGroup: React.FC<Props> = ({ children, fullWidth, vertical }) => (
  <div className={classNames('button-group', fullWidth && 'full-width', vertical ? 'vertical' : 'horizontal')}>
    {children}
  </div>
);
