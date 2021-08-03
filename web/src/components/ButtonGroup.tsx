import React from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  fullWidth?: boolean;
}

export const ButtonGroup: React.FC<Props> = ({ children, fullWidth }) => (
  <div className={classNames('button-group', fullWidth && 'full-width')}>{children}</div>
);
