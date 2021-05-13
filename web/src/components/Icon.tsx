import React from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  icon: string;
  className?: string;
  pulse?: boolean;
  size?: number;
}

export const Icon: React.FC<Props> = ({ icon, className, pulse, size }) => (
  <i
    className={classNames(
      `icon fas fa-${icon}`,
      pulse && 'fa-pulse',
      !!size && `fa-${size}x`,
      className
    )}
  />
);
