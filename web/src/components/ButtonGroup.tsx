import { ReactNode } from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  children: ReactNode[];
  fullWidth?: boolean;
  vertical?: boolean;
}

export const ButtonGroup = ({ children, fullWidth, vertical }: Props) => (
  <div
    className={classNames(
      'button-group',
      fullWidth && 'full-width',
      vertical ? 'vertical' : 'horizontal',
    )}
  >
    {children}
  </div>
);
